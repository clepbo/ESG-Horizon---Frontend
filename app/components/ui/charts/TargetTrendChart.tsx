"use client";

import { useState, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatNumberShort } from "@/lib/numberFormat";

/**
 * Unified target-progress chart with two toggleable views:
 *
 *   1. **Progress** (default) — bullet-style horizontal bars showing how
 *      far each target has progressed toward its goal. Instant "are we
 *      on track?" read. Best when there are few assessment data points.
 *
 *   2. **Trajectory** — time-series line chart (Baseline → Current →
 *      Target) on a date X axis. Becomes richer as more assessments are
 *      filed over time.
 *
 * Both views use the same metric: **% progress toward target**
 *   progress = (baseline - current) / (baseline - target) × 100
 *     0%   = at baseline (haven't started)
 *     100% = hit the target exactly
 *     >100% = exceeded the target
 *     <0%  = backsliding (current > baseline)
 */

// ─────────────────────── types ───────────────────────

export interface TargetLike {
  baselineYear: number;
  targetYear: number;
  currentAssessmentYear?: number | null;
  baselineDate?: string | null;
  currentDate?: string | null;
  generalTarget?: {
    baselineYearEmission?: number;
    targetEmission?: number;
    currentEmission?: number | null;
    reductionPercentage?: number;
  } | null;
  scopeTargets?: Array<{
    scope: string;
    baselineYearEmission?: number;
    currentEmission?: number | null;
    targetEmission?: number;
    reductionPercentage?: number;
    baselineYear?: number | null;
    targetYear?: number | null;
  }> | null;
}

export interface TargetTrendChartProps {
  general?: TargetLike | null;
  scope?: TargetLike | null;
  target?: TargetLike | null;
  height?: number;
}

// ─────────────────────── constants ───────────────────────

type LineKey = "general" | "scope1" | "scope2" | "scope3";

const COLORS: Record<LineKey, string> = {
  general: "#119B95",
  scope1: "#EF4444",
  scope2: "#F59E0B",
  scope3: "#3B82F6",
};

const LABELS: Record<LineKey, string> = {
  general: "General",
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3: "Scope 3",
};

const BACKSLIDE_CLAMP = -100;
const EXCEED_CLAMP = 150;

// ─────────────────────── data model ───────────────────────

interface TargetLine {
  key: LineKey;
  label: string;
  color: string;
  baseline: number;
  current: number | null;
  target: number;
  /** % progress toward goal (unclamped). null when math is undefined. */
  progress: number | null;
  /** Clamped version for display on the chart axis. */
  progressClamped: number;
  noBaseline: boolean;
  dashed: boolean;
  // Date-based positions for the trajectory view
  baselineTime: number;
  currentTime: number | null;
  targetTime: number;
}

// ─────────────────────── helpers ───────────────────────

function parseDate(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function midYear(year: number): number {
  return new Date(`${year}-07-01T00:00:00Z`).getTime();
}

function endOfYear(year: number): number {
  return new Date(`${year}-12-31T00:00:00Z`).getTime();
}

function formatMonthYear(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/** Compute % progress toward target. 0% = at baseline, 100% = at target. */
function computeProgress(baseline: number, current: number, target: number): number | null {
  const denominator = baseline - target;
  if (denominator === 0) return current <= target ? 100 : 0;
  return ((baseline - current) / denominator) * 100;
}

function clamp(value: number): { clamped: number; wasClamped: boolean } {
  if (value < BACKSLIDE_CLAMP) return { clamped: BACKSLIDE_CLAMP, wasClamped: true };
  if (value > EXCEED_CLAMP) return { clamped: EXCEED_CLAMP, wasClamped: true };
  return { clamped: Number(value.toFixed(1)), wasClamped: false };
}

/** Pick a bar color based on progress value. */
function progressColor(pct: number | null): string {
  if (pct == null || pct < 0) return "#EF4444"; // red — backsliding
  if (pct < 50) return "#F59E0B"; // amber — behind
  if (pct < 100) return "#3B82F6"; // blue — on track
  return "#10B981"; // green — at or exceeded target
}

// ─────────────────────── data derivation ───────────────────────

function buildLines(general?: TargetLike | null, scope?: TargetLike | null): TargetLine[] {
  const lines: TargetLine[] = [];

  const g = general?.generalTarget;
  if (g && general) {
    const baseline = g.baselineYearEmission ?? 0;
    const target = g.targetEmission ?? 0;
    const current = g.currentEmission ?? null;
    if (baseline > 0 || target > 0 || (current ?? 0) > 0) {
      const raw =
        baseline > 0 && current != null ? computeProgress(baseline, current, target) : null;
      const { clamped } = raw != null ? clamp(raw) : { clamped: 0 };
      lines.push({
        key: "general",
        label: LABELS.general,
        color: COLORS.general,
        baseline,
        current,
        target,
        progress: raw,
        progressClamped: clamped,
        noBaseline: baseline <= 0,
        dashed: current == null,
        baselineTime: parseDate(general.baselineDate) ?? midYear(general.baselineYear),
        currentTime:
          parseDate(general.currentDate) ??
          (general.currentAssessmentYear ? midYear(general.currentAssessmentYear) : null),
        targetTime: endOfYear(general.targetYear),
      });
    }
  }

  if (scope?.scopeTargets?.length) {
    for (const s of scope.scopeTargets) {
      const baseline = s.baselineYearEmission ?? 0;
      const target = s.targetEmission ?? 0;
      const current = s.currentEmission ?? null;
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

      const raw =
        baseline > 0 && current != null ? computeProgress(baseline, current, target) : null;
      const { clamped } = raw != null ? clamp(raw) : { clamped: 0 };
      const sBaselineYear = s.baselineYear ?? scope.baselineYear;
      const sTargetYear = s.targetYear ?? scope.targetYear;

      lines.push({
        key,
        label: LABELS[key],
        color: COLORS[key],
        baseline,
        current,
        target,
        progress: raw,
        progressClamped: clamped,
        noBaseline: baseline <= 0,
        dashed: current == null,
        baselineTime: parseDate(scope.baselineDate) ?? midYear(sBaselineYear),
        currentTime:
          parseDate(scope.currentDate) ??
          (scope.currentAssessmentYear ? midYear(scope.currentAssessmentYear) : null),
        targetTime: endOfYear(sTargetYear),
      });
    }
  }

  // Ensure consistent order: General → Scope 1 → Scope 2 → Scope 3
  const ORDER: LineKey[] = ["general", "scope1", "scope2", "scope3"];
  lines.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

  return lines;
}

// ─────────────────────── BULLET CHART VIEW ───────────────────────

interface BulletTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: TargetLine }>;
}

function BulletTooltip({ active, payload }: BulletTooltipProps) {
  if (!active || !payload?.length) return null;
  const line = payload[0]?.payload;
  if (!line) return null;

  const pct = line.progress;
  const isReduction = pct != null && pct > 0;
  const isBacksliding = pct != null && pct < 0;
  const pctColor = isReduction
    ? "text-emerald-600"
    : isBacksliding
      ? "text-red-600"
      : "text-gray-900";
  const arrow = isReduction ? "↓" : isBacksliding ? "↑" : "";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg min-w-[200px]">
      <p className="mb-2 text-sm font-semibold text-gray-800">{line.label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Baseline:</span>
          <span className="font-medium text-gray-800">
            {formatNumberShort(line.baseline)} tCO₂e
          </span>
        </div>
        {line.current != null && (
          <div className="flex justify-between">
            <span className="text-gray-500">Current:</span>
            <span className="font-medium text-gray-800">
              {formatNumberShort(line.current)} tCO₂e
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Target:</span>
          <span className="font-medium text-gray-800">{formatNumberShort(line.target)} tCO₂e</span>
        </div>
        <hr className="my-1 border-gray-100" />
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Progress:</span>
          <span className={`font-semibold ${pctColor}`}>
            {pct != null ? (
              <>
                {arrow && <span className="mr-0.5">{arrow}</span>}
                {Math.abs(pct).toFixed(1)}%
              </>
            ) : (
              "—"
            )}
          </span>
        </div>
        {line.noBaseline && (
          <p className="text-[10px] italic text-amber-600 mt-1">
            No baseline year data — emissions tracked from 0
          </p>
        )}
      </div>
    </div>
  );
}

function BulletView({ lines, height }: { lines: TargetLine[]; height: number }) {
  return (
    <div className="w-full">
      <div className="overflow-hidden" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={lines}
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              domain={[
                Math.min(BACKSLIDE_CLAMP, ...lines.map((l) => l.progressClamped)),
                Math.max(EXCEED_CLAMP, ...lines.map((l) => l.progressClamped)),
              ]}
              ticks={[-100, -50, 0, 25, 50, 75, 100, 150]}
              tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={{ stroke: "#D1D5DB" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={70}
              tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            {/* Target achieved line at 100% — no label (the 100% tick
              on the X axis is enough; the old "Target" label was bleeding
              above the chart bounds). */}
            <ReferenceLine x={100} stroke="#374151" strokeWidth={2} strokeDasharray="4 4" />
            {/* Baseline reference at 0% */}
            <ReferenceLine x={0} stroke="#9CA3AF" strokeWidth={1} />
            <Tooltip content={<BulletTooltip />} cursor={{ fill: "transparent" }} />
            <Bar
              dataKey="progressClamped"
              radius={[0, 4, 4, 0]}
              maxBarSize={32}
              isAnimationActive={false}
            >
              {lines.map((line) => (
                <Cell key={line.key} fill={progressColor(line.progress)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap items-center gap-4 mt-2 ml-1 text-xs text-gray-600">
        {[
          { color: "#10B981", label: "Exceeded / On target" },
          { color: "#3B82F6", label: "On track (50–99%)" },
          { color: "#F59E0B", label: "Behind (0–49%)" },
          { color: "#EF4444", label: "Backsliding" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-4 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────── TRAJECTORY CHART VIEW ───────────────────────

interface TrajectoryTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
    payload?: Record<string, number | boolean>;
  }>;
  label?: number;
  hoveredKey?: string | null;
}

function TrajectoryTooltip({ active, payload, label, hoveredKey }: TrajectoryTooltipProps) {
  if (!active || !payload?.length) return null;
  let visible = payload.filter((p) => p.value != null);
  if (hoveredKey) visible = visible.filter((p) => p.dataKey === hoveredKey);
  if (!visible.length) return null;

  const dateLabel = typeof label === "number" ? formatMonthYear(label) : "";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-700">{dateLabel}</p>
      {visible.map((entry, i) => {
        const rawKey = `${entry.dataKey}_raw`;
        const realPctKey = `${entry.dataKey}_realPct`;
        const noBaselineKey = `${entry.dataKey}_noBaseline`;
        const raw = entry.payload?.[rawKey] as number | undefined;
        const realPct = entry.payload?.[realPctKey] as number | undefined;
        const noBaseline = entry.payload?.[noBaselineKey] as boolean | undefined;

        const displayPct =
          realPct != null && Number.isFinite(realPct) ? realPct : Number(entry.value);
        const isUp = displayPct > 0;
        const isDown = displayPct < 0;
        const color = isUp ? "text-emerald-600" : isDown ? "text-red-600" : "text-gray-900";
        const arrow = isUp ? "↑" : isDown ? "↓" : "";

        return (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2 text-xs">
              <span
                className="inline-block h-2 w-2 shrink-0 self-center rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className={`font-semibold ${color}`}>
                {arrow && <span className="mr-0.5">{arrow}</span>}
                {Number.isFinite(displayPct) ? `${Math.abs(displayPct).toFixed(1)}%` : "—"}
              </span>
              {raw != null && (
                <span className="text-gray-500">({formatNumberShort(raw)} tCO₂e)</span>
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

function TrajectoryView({ lines, height }: { lines: TargetLine[]; height: number }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const clearHovered = useCallback(() => setHoveredKey(null), []);

  // Build chart data — one row per distinct timestamp
  const data = useMemo(() => {
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
        if (time === line.baselineTime) absolute = line.baseline;
        else if (line.currentTime != null && time === line.currentTime) absolute = line.current;
        else if (time === line.targetTime) absolute = line.target;

        if (absolute != null && line.baseline > 0) {
          const raw = computeProgress(line.baseline, absolute, line.target);
          if (raw != null) {
            const { clamped, wasClamped } = clamp(raw);
            row[line.key] = clamped;
            row[`${line.key}_raw`] = absolute;
            if (wasClamped) row[`${line.key}_realPct`] = raw;
          }
        } else if (absolute != null && line.noBaseline) {
          row[line.key] = absolute > 0 ? BACKSLIDE_CLAMP : 0;
          row[`${line.key}_raw`] = absolute;
          row[`${line.key}_noBaseline`] = true;
        }
      }
      return row;
    });
  }, [lines]);

  // Quarterly ticks
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

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
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
            domain={[BACKSLIDE_CLAMP, EXCEED_CLAMP]}
            ticks={[-100, -50, 0, 25, 50, 75, 100, 150]}
            tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#D1D5DB" }}
            tickFormatter={(v) => `${v}%`}
            width={48}
            label={{
              value: "Progress toward target",
              angle: -90,
              position: "insideLeft",
              style: {
                fontSize: 11,
                fill: "#374151",
                fontWeight: 500,
                textAnchor: "middle",
              },
              offset: 8,
            }}
          />
          {/* 100% = target achieved reference line */}
          <ReferenceLine y={100} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1.5} />
          <Tooltip
            content={<TrajectoryTooltip hoveredKey={hoveredKey} />}
            cursor={{
              stroke: hoveredKey ? "#D1D5DB" : "transparent",
            }}
          />
          <Legend
            iconType="rect"
            iconSize={12}
            wrapperStyle={{
              fontSize: 12,
              fontWeight: 500,
              color: "#374151",
              paddingTop: 8,
            }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
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
              onMouseEnter={() => setHoveredKey(line.key)}
              onMouseLeave={clearHovered}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────── MAIN COMPONENT ───────────────────────

type ViewMode = "progress" | "trajectory";

export default function TargetTrendChart({
  general,
  scope,
  target,
  height = 320,
}: TargetTrendChartProps) {
  const generalSource = target ?? general ?? null;
  const scopeSource = target ?? scope ?? null;
  const lines = buildLines(generalSource, scopeSource);
  const [view, setView] = useState<ViewMode>("progress");

  if (lines.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-center">
        <p className="text-sm font-medium text-gray-700">No reduction targets set</p>
        <p className="text-xs text-gray-500">
          Set a General or Scope target to see your reduction progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Header: caption + view toggle */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs font-medium text-gray-700 max-w-md">
          {view === "progress"
            ? "Each bar shows progress toward its own reduction target (0% = at baseline, 100% = target achieved)."
            : "Each line tracks progress over time. Dashed lines have no current measurement yet."}
        </p>
        <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5 shrink-0">
          {(
            [
              { key: "progress" as const, label: "Progress" },
              { key: "trajectory" as const, label: "Trajectory" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                view === tab.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {view === "progress" ? (
        <BulletView lines={lines} height={height} />
      ) : (
        <TrajectoryView lines={lines} height={height} />
      )}
    </div>
  );
}
