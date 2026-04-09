"use client";

import { useState, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatNumberShort } from "@/lib/numberFormat";

/**
 * A unified "trend" view of a company's reduction targets — replaces the
 * pie / donut / gauge per-target charts that were sprinkled across the
 * dashboard, the report viewer, and the assessments KPI hub.
 *
 * Renders one line per available target (General + up to three Scope
 * targets) on a shared **date-based** X axis (Unix timestamps, formatted
 * as "Mon YYYY"). The Y axis plots **% reduction from each line's own
 * baseline** so trajectories of vastly different absolute magnitudes
 * (e.g. Scope 3 in tens of thousands vs Scope 2 in single digits) sit on
 * the same comparable 0–110% scale.
 *
 * Three special-case behaviors:
 *
 *   1. **Backsliding clamp** — when a line's actual reduction is < -100%
 *      (current > 2× baseline), it's clamped to -100% on the visual axis
 *      so it doesn't drag the entire chart's Y scale into the basement.
 *      The tooltip still shows the real percentage.
 *
 *   2. **No-baseline lines** — when baselineYearEmission == 0, normal
 *      "% reduction from baseline" math is undefined. Such lines are
 *      still rendered, but on a synthesized 0% baseline → -100% backslid
 *      scale (since any positive emission represents net new emissions
 *      above a zero baseline). Marked with `noBaseline: true` and a clear
 *      tooltip note.
 *
 *   3. **Same-year collisions are gone** — the X axis is in real dates
 *      (timestamps from `baselineDate` / `currentDate`), so a baseline
 *      assessment in March and a current assessment in December of the
 *      same year are naturally distinct points.
 *
 * Accepts data in two shapes:
 *   • `general` + `scope` — two separate Target rows (dashboard / KPI hub)
 *   • `target` — one combined Target row that has both `generalTarget` and
 *     `scopeTargets` populated (report viewer)
 *
 * Both shapes work; you can pass either or both. The component is
 * structurally typed against `TargetLike` so it accepts the slightly
 * different Target definitions in `components/types/target.ts` and
 * `types/report/reportResponse.ts` without forcing a unifying refactor.
 */

/** Minimum shape the trend chart needs from a target row. Structurally
 *  compatible with both `Target` definitions in the codebase. */
export interface TargetLike {
  baselineYear: number;
  targetYear: number;
  currentAssessmentYear?: number | null;
  /** ISO date string of the baseline assessment. When supplied, the chart
   *  uses this for the baseline X position; otherwise falls back to
   *  Jul 1 of `baselineYear`. */
  baselineDate?: string | null;
  /** ISO date string of the current assessment. When supplied, used for
   *  the current X position; otherwise falls back to Jul 1 of
   *  `currentAssessmentYear` if present, else "today". */
  currentDate?: string | null;
  generalTarget?: {
    baselineYearEmission?: number;
    targetEmission?: number;
    currentEmission?: number | null;
  } | null;
  scopeTargets?: Array<{
    scope: string;
    baselineYearEmission?: number;
    currentEmission?: number | null;
    targetEmission?: number;
    baselineYear?: number | null;
    targetYear?: number | null;
  }> | null;
}

export interface TargetTrendChartProps {
  /** General target row (type === "GENERAL"). Optional. */
  general?: TargetLike | null;
  /** Scope target row (type === "SCOPE", contains scopeTargets[]). Optional. */
  scope?: TargetLike | null;
  /** Convenience for sources that have both `generalTarget` and
   *  `scopeTargets` on a single row (e.g. the report response). When set,
   *  overrides `general` / `scope`. */
  target?: TargetLike | null;
  /** Override default chart height (px). */
  height?: number;
}

interface LineConfig {
  key: "general" | "scope1" | "scope2" | "scope3";
  label: string;
  color: string;
  /** Unix timestamp (ms) of the baseline assessment. */
  baselineTime: number;
  baseline: number;
  /** Unix timestamp (ms) of the current assessment. May be null if no
   *  current measurement exists yet (target newly created, no follow-up
   *  assessment yet). */
  currentTime: number | null;
  current: number | null;
  /** Unix timestamp (ms) of the target year — defaulted to Dec 31 of the
   *  target year, since target rows only carry a year, not a month. */
  targetTime: number;
  target: number;
  /** True when baselineYearEmission was 0/missing — normal % math is
   *  undefined; the line still renders but on a synthetic backslide scale. */
  noBaseline: boolean;
  /** True when there's no `current` measurement yet (line is just
   *  baseline → planned target, drawn dashed). */
  dashed: boolean;
}

const COLORS: Record<LineConfig["key"], string> = {
  general: "#119B95", // teal — brand
  scope1: "#EF4444", // red
  scope2: "#F59E0B", // amber — was blue, changed to avoid blue/purple blend
  scope3: "#3B82F6", // blue — was purple, swapped with S2 for max separation
};

const LABELS: Record<LineConfig["key"], string> = {
  general: "General",
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3: "Scope 3",
};

/** When backsliding exceeds this magnitude on the % axis we clamp the
 *  visible point at this value so a single wildly off-track line doesn't
 *  squash all the others into a flat band at the top of the chart. */
const BACKSLIDE_CLAMP = -100;

/* ─────────────────────── helpers ─────────────────────── */

/** Parse an ISO string (or null/undefined) into a Unix timestamp.
 *  Returns null when input can't be parsed. */
function parseDate(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Mid-year fallback (Jul 1) timestamp for a given year. Used when a
 *  target row doesn't carry an explicit baseline / current ISO date. */
function midYear(year: number): number {
  return new Date(`${year}-07-01T00:00:00Z`).getTime();
}

/** End-of-year (Dec 31) timestamp for a given year. Used for the target
 *  point because target rows only carry a year, not a month. */
function endOfYear(year: number): number {
  return new Date(`${year}-12-31T00:00:00Z`).getTime();
}

/** Format a timestamp as "Mon YYYY" for the X-axis tick labels. */
function formatMonthYear(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/* ─────────────────────── data derivation ─────────────────────── */

function buildLines(general?: TargetLike | null, scope?: TargetLike | null): LineConfig[] {
  const lines: LineConfig[] = [];

  // ── General target ──
  const g = general?.generalTarget;
  if (g && general) {
    const baseline = g.baselineYearEmission ?? 0;
    const target = g.targetEmission ?? 0;
    const current = g.currentEmission ?? null;
    // Skip only if there's NO meaningful data at all — baseline AND target
    // AND current are all zero/null. Otherwise render the line; the
    // noBaseline branch handles 0-baseline cases.
    if (baseline > 0 || target > 0 || (current ?? 0) > 0) {
      const baselineTime = parseDate(general.baselineDate) ?? midYear(general.baselineYear);
      const currentTime =
        parseDate(general.currentDate) ??
        (general.currentAssessmentYear ? midYear(general.currentAssessmentYear) : null);
      lines.push({
        key: "general",
        label: LABELS.general,
        color: COLORS.general,
        baselineTime,
        baseline,
        currentTime,
        current,
        targetTime: endOfYear(general.targetYear),
        target,
        noBaseline: baseline <= 0,
        dashed: current == null,
      });
    }
  }

  // ── Scope targets ──
  if (scope?.scopeTargets?.length) {
    for (const s of scope.scopeTargets) {
      const baseline = s.baselineYearEmission ?? 0;
      const target = s.targetEmission ?? 0;
      const current = s.currentEmission ?? null;
      // Same skip rule — only when there's truly no data
      if (baseline <= 0 && target <= 0 && (current ?? 0) <= 0) continue;

      const key =
        s.scope === "SCOPE1"
          ? "scope1"
          : s.scope === "SCOPE2"
            ? "scope2"
            : s.scope === "SCOPE3"
              ? "scope3"
              : null;
      if (!key) continue;

      const sBaselineYear = s.baselineYear ?? scope.baselineYear;
      const sTargetYear = s.targetYear ?? scope.targetYear;
      const baselineTime = parseDate(scope.baselineDate) ?? midYear(sBaselineYear);
      const currentTime =
        parseDate(scope.currentDate) ??
        (scope.currentAssessmentYear ? midYear(scope.currentAssessmentYear) : null);

      lines.push({
        key,
        label: LABELS[key],
        color: COLORS[key],
        baselineTime,
        baseline,
        currentTime,
        current,
        targetTime: endOfYear(sTargetYear),
        target,
        noBaseline: baseline <= 0,
        dashed: current == null,
      });
    }
  }

  return lines;
}

/** Convert an absolute tCO₂e value into a "% reduction from baseline"
 *  for charting. Handles three cases:
 *
 *   1. Normal baseline > 0 → standard ((baseline - value) / baseline) * 100
 *   2. noBaseline (baseline == 0) → use a synthetic scale where the value
 *      represents % growth from zero: capped at the BACKSLIDE_CLAMP because
 *      "infinite growth from zero" is mathematically undefined. The chart
 *      treats any nonzero current as "off-baseline" (clamped) and the
 *      tooltip clearly labels it as a no-baseline line.
 *   3. Backsliding (value > 2× baseline → < -100% reduction) → clamp at
 *      BACKSLIDE_CLAMP so a single wild line doesn't dwarf the chart.
 */
function toPctReduction(line: LineConfig, value: number): { pct: number; clamped: boolean } {
  if (line.noBaseline) {
    // Without a baseline, treat any positive value as backsliding from
    // a zero starting point. Clamp at BACKSLIDE_CLAMP so the line is
    // visible at the bottom of the chart.
    return value > 0 ? { pct: BACKSLIDE_CLAMP, clamped: true } : { pct: 0, clamped: false };
  }
  const raw = ((line.baseline - value) / line.baseline) * 100;
  if (raw < BACKSLIDE_CLAMP) {
    return { pct: BACKSLIDE_CLAMP, clamped: true };
  }
  return { pct: Number(raw.toFixed(2)), clamped: false };
}

/**
 * Builds the unified Recharts data array.
 *
 * Each row is keyed by a Unix timestamp (`time`). For each line, the row
 * carries:
 *   • `<key>`: the chart-visible % reduction value (clamped at -100)
 *   • `<key>_raw`: the raw absolute tCO₂e (for the tooltip)
 *   • `<key>_realPct`: the unclamped % (for the tooltip when clamped)
 *   • `<key>_noBaseline`: true if the line has no baseline (tooltip note)
 */
function buildChartData(lines: LineConfig[]): Array<Record<string, number | boolean>> {
  // Collect every distinct timestamp any line touches
  const timeSet = new Set<number>();
  for (const line of lines) {
    timeSet.add(line.baselineTime);
    if (line.currentTime != null) timeSet.add(line.currentTime);
    timeSet.add(line.targetTime);
  }

  const times = Array.from(timeSet).sort((a, b) => a - b);

  return times.map((time) => {
    const row: Record<string, number | boolean> = { time };
    for (const line of lines) {
      let absolute: number | null = null;

      if (time === line.baselineTime) {
        absolute = line.baseline;
      } else if (line.currentTime != null && time === line.currentTime) {
        absolute = line.current ?? null;
      } else if (time === line.targetTime) {
        absolute = line.target;
      }

      if (absolute != null) {
        const { pct, clamped } = toPctReduction(line, absolute);
        row[line.key] = pct;
        row[`${line.key}_raw`] = absolute;
        if (clamped) {
          // Stash the unclamped value for the tooltip
          const realPct = line.noBaseline
            ? Number.NEGATIVE_INFINITY
            : ((line.baseline - absolute) / line.baseline) * 100;
          row[`${line.key}_realPct`] = realPct;
        }
        if (line.noBaseline) row[`${line.key}_noBaseline`] = true;
      }
    }
    return row;
  });
}

/* ─────────────────────── tooltip ─────────────────────── */

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
  payload?: Record<string, number | boolean>;
}

function CustomTooltip({
  active,
  payload,
  label,
  hoveredKey,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  /** When set, only show the entry matching this dataKey — gives
   *  per-line tooltips instead of a cluttered shared crosshair. */
  hoveredKey?: string | null;
}) {
  if (!active || !payload?.length) return null;
  // Filter to non-null entries, then narrow to the hovered line if set
  let visible = payload.filter((p) => p.value != null);
  if (hoveredKey) {
    visible = visible.filter((p) => p.dataKey === hoveredKey);
  }
  if (!visible.length) return null;

  // `label` here is the timestamp from the row's `time` key
  const dateLabel = typeof label === "number" ? formatMonthYear(label) : String(label);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-700">{dateLabel}</p>
      {visible.map((entry, i) => {
        const key = entry.dataKey;
        const rawKey = key ? `${key}_raw` : null;
        const realPctKey = key ? `${key}_realPct` : null;
        const noBaselineKey = key ? `${key}_noBaseline` : null;
        const raw = rawKey && entry.payload ? entry.payload[rawKey] : null;
        const realPct = realPctKey && entry.payload ? entry.payload[realPctKey] : null;
        const noBaseline = noBaselineKey && entry.payload ? entry.payload[noBaselineKey] : false;

        // Display rules:
        //   • If the line was clamped, show the REAL % from realPct, not
        //     the visible-clamped value
        //   • Otherwise show the visible value
        //   • Positive % = reduction (good, emerald, ↓)
        //   • Negative % = backsliding (bad, red, ↑)
        const visiblePct = Number(entry.value);
        const displayPct =
          typeof realPct === "number" && Number.isFinite(realPct) ? realPct : visiblePct;
        const isReduction = displayPct > 0;
        const isBacksliding = displayPct < 0;
        const pctColor = isReduction
          ? "text-emerald-600"
          : isBacksliding
            ? "text-red-600"
            : "text-gray-900";
        const arrow = isReduction ? "↓" : isBacksliding ? "↑" : "";

        return (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2 text-xs">
              <span
                className="inline-block h-2 w-2 shrink-0 self-center rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className={`font-semibold ${pctColor}`}>
                {arrow && <span className="mr-0.5">{arrow}</span>}
                {Number.isFinite(displayPct) ? `${Math.abs(displayPct).toFixed(2)}%` : "—"}
              </span>
              {raw != null && (
                <span className="text-gray-500">
                  ({formatNumberShort(Number(raw), { maximumFractionDigits: 2 })} tCO₂e)
                </span>
              )}
            </div>
            {noBaseline && (
              <p className="ml-4 text-[10px] italic text-amber-600">
                No baseline year data — emissions tracked from 0
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── main component ─────────────────────── */

export default function TargetTrendChart({
  general,
  scope,
  target,
  height = 320,
}: TargetTrendChartProps) {
  // When `target` is provided (single combined row from the report
  // response), use it for both general and scope. Otherwise use the
  // explicit `general` / `scope` props.
  const generalSource = target ?? general ?? null;
  const scopeSource = target ?? scope ?? null;

  const lines = buildLines(generalSource, scopeSource);
  const data = buildChartData(lines);

  // All hooks MUST be called before any early return (Rules of Hooks).
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const clearHovered = useCallback(() => setHoveredKey(null), []);

  // Quarterly tick positions (Jan, Apr, Jul, Oct) spanning the full data
  // range so the X axis reads like a proper time series.
  const quarterlyTicks = useMemo(() => {
    if (data.length === 0) return [];
    const times = data.map((r) => r.time as number);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const startDate = new Date(minTime);
    const quarterMonths = [0, 3, 6, 9];
    let y = startDate.getUTCFullYear();
    let qIdx = quarterMonths.findIndex((m) => m >= startDate.getUTCMonth());
    if (qIdx === -1) {
      qIdx = 0;
      y++;
    }
    const ticks: number[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const t = Date.UTC(y, quarterMonths[qIdx], 1);
      if (t > maxTime + 90 * 86400000) break;
      if (t >= minTime - 30 * 86400000) ticks.push(t);
      qIdx++;
      if (qIdx >= 4) {
        qIdx = 0;
        y++;
      }
    }
    return ticks;
  }, [data]);

  // Empty state — after all hooks
  if (lines.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-center">
        <p className="text-sm font-medium text-gray-700">No reduction targets set</p>
        <p className="text-xs text-gray-500">
          Set a General or Scope target to see your reduction trajectory here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs font-medium text-gray-700">
        Each line shows % reduction from its own baseline (0% = baseline, 100% = fully achieved).
        Clamped at -100% when backsliding badly. Hover for absolute tCO₂e values.
      </p>
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              ticks={quarterlyTicks}
              tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: "#D1D5DB" }}
              tickFormatter={(t) => formatMonthYear(Number(t))}
            />
            <YAxis
              // Domain stays at [BACKSLIDE_CLAMP, 110]. The clamp at the
              // bottom means a single wildly off-track line never drags
              // the whole chart's scale into the basement (e.g. a line
              // with current = 500× baseline would otherwise pin every
              // other line to a flat band near the top).
              domain={[BACKSLIDE_CLAMP, 110]}
              ticks={[-100, -50, 0, 25, 50, 75, 100]}
              tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: "#D1D5DB" }}
              tickFormatter={(v) => `${v}%`}
              width={48}
              label={{
                value: "Reduction from baseline",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "#374151", fontWeight: 500, textAnchor: "middle" },
                offset: 8,
              }}
            />
            <Tooltip
              content={<CustomTooltip hoveredKey={hoveredKey} />}
              cursor={{ stroke: hoveredKey ? "#D1D5DB" : "transparent" }}
            />
            <Legend
              iconType="rect"
              iconSize={12}
              wrapperStyle={{ fontSize: 12, fontWeight: 500, color: "#374151", paddingTop: 8 }}
            />

            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                // Dim non-hovered lines so the focused one pops
                strokeWidth={hoveredKey === line.key ? 3 : hoveredKey ? 1.5 : 2.5}
                strokeOpacity={hoveredKey && hoveredKey !== line.key ? 0.3 : 1}
                strokeDasharray={line.dashed ? "5 5" : undefined}
                dot={{
                  r: 4,
                  fill: line.color,
                  strokeWidth: 0,
                  onMouseEnter: () => setHoveredKey(line.key),
                  onMouseLeave: clearHovered,
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 0,
                  onMouseEnter: () => setHoveredKey(line.key),
                  onMouseLeave: clearHovered,
                }}
                // Also detect hover on the line stroke itself (not just dots)
                onMouseEnter={() => setHoveredKey(line.key)}
                onMouseLeave={clearHovered}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
