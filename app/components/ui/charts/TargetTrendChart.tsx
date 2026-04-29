"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { formatNumberShort } from "@/lib/numberFormat";

/**
 * Reduction Targets Progress matrix — every target metric plotted as a dot
 * in a fixed-size scatter. X is % of the target period elapsed; Y is %
 * progress made toward the target. The diagonal y = x is the linear pace
 * reference: dots above are ahead of schedule, dots below are behind, dots
 * in the negative-Y band are backsliding.
 *
 * Bounded by design — one target or fifty, the chart occupies the same
 * rectangle. Print-friendly. Each dot encodes a target metric:
 *   • Color   = target identity (auto-assigned from palette)
 *   • Glyph   = metric type ("G" general, "1"/"2"/"3" scope)
 *   • Filled  = has current measurement; Hollow = committed, awaiting data
 */

// ─────────────────────── types ───────────────────────

type TargetType = "GENERAL" | "SCOPE" | "BOTH";
type EmissionScope = "SCOPE1" | "SCOPE2" | "SCOPE3";

export interface TargetLike {
  id?: number;
  name?: string;
  type?: TargetType;
  baselineYear: number;
  targetYear: number;
  generalTarget?: {
    baselineYearEmission?: number;
    targetEmission?: number;
    currentEmission?: number | null;
    reductionPercentage?: number;
  } | null;
  scopeTargets?: Array<{
    scope: EmissionScope;
    baselineYearEmission?: number;
    currentEmission?: number | null;
    targetEmission?: number;
    reductionPercentage?: number;
    baselineYear?: number | null;
    targetYear?: number | null;
  }> | null;
}

export interface TargetTrendChartProps {
  targets?: TargetLike[];
  general?: TargetLike | null;
  scope?: TargetLike | null;
  target?: TargetLike | null;
  height?: number;
}

// ─────────────────────── status model ───────────────────────

type DotStatus =
  | "committed"
  | "on-track"
  | "behind"
  | "backsliding"
  | "achieved"
  | "missed"
  | "no-baseline";

const STATUS_LABEL: Record<DotStatus, string> = {
  committed: "Committed",
  "on-track": "On track",
  behind: "Behind",
  backsliding: "Backsliding",
  achieved: "Achieved",
  missed: "Missed",
  "no-baseline": "No baseline",
};

const STATUS_TEXT: Record<DotStatus, string> = {
  committed: "text-blue-700",
  "on-track": "text-emerald-700",
  behind: "text-amber-700",
  backsliding: "text-red-700",
  achieved: "text-emerald-700",
  missed: "text-red-700",
  "no-baseline": "text-gray-600",
};

// ─────────────────────── data shape ───────────────────────

interface DotDatum {
  /** Stable key for React. */
  key: string;
  /** Position on the matrix (clamped for display). */
  x: number;
  y: number;
  /** Raw progress %, before clamping. May be > 100 or < -50. */
  rawProgress: number | null;
  /** Glyph rendered inside the dot. "G" for general, "1"/"2"/"3" for scope. */
  glyph: string;
  /** Color assigned by target identity. */
  color: string;
  /** Filled when there's a current measurement, hollow when committed-only. */
  filled: boolean;
  status: DotStatus;
  // Detail for tooltip
  targetName: string;
  metricLabel: string;
  baseline: number | null;
  current: number | null;
  target: number | null;
  baselineYear: number;
  targetYear: number;
  elapsedYears: number;
  totalYears: number;
}

// ─────────────────────── palette ───────────────────────

/**
 * Color encodes metric type (General / Scope 1/2/3), not target identity.
 * This means two General targets share the same color — disambiguate via
 * the tooltip (target name + period) or the glyph stays G/1/2/3.
 */
const GENERAL_COLOR = "#119B95"; // teal
const SCOPE_COLORS: Record<EmissionScope, string> = {
  SCOPE1: "#EF4444", // red
  SCOPE2: "#F59E0B", // amber
  SCOPE3: "#3B82F6", // blue
};

const SCOPE_GLYPH: Record<EmissionScope, string> = {
  SCOPE1: "1",
  SCOPE2: "2",
  SCOPE3: "3",
};

const SCOPE_LABEL: Record<EmissionScope, string> = {
  SCOPE1: "Scope 1",
  SCOPE2: "Scope 2",
  SCOPE3: "Scope 3",
};

const Y_MIN = -100;
const Y_MAX = 100;
const X_MIN = 0;
const X_MAX = 100;

// ─────────────────────── helpers ───────────────────────

/**
 * Strip trailing `Date.now()` timestamps that older targets carry in their
 * name (e.g. "Carbon Target 2025-2026 - 1774432382260"). The create flow no
 * longer adds these, but DB rows from before that change still have them.
 */
function cleanTargetName(raw?: string): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\s*[-–—]\s*\d{10,}\s*$/u, "").trim();
  return cleaned || raw.trim();
}

function computeProgress(baseline: number, current: number, target: number): number | null {
  const denominator = baseline - target;
  if (denominator === 0) return current <= target ? 100 : 0;
  return ((baseline - current) / denominator) * 100;
}

function computeTimeElapsed(
  baselineYear: number,
  targetYear: number,
  currentYear: number
): { elapsedYears: number; totalYears: number; pct: number } {
  const totalYears = Math.max(0, targetYear - baselineYear);
  const elapsedYears = Math.max(0, Math.min(totalYears, currentYear - baselineYear));
  const pct = totalYears > 0 ? (elapsedYears / totalYears) * 100 : 0;
  return { elapsedYears, totalYears, pct };
}

function deriveDotStatus(args: {
  hasBaseline: boolean;
  hasCurrent: boolean;
  progress: number | null;
  pastTargetYear: boolean;
  elapsedPct: number;
}): DotStatus {
  if (!args.hasBaseline) return "no-baseline";
  if (!args.hasCurrent || args.progress == null) return "committed";
  if (args.pastTargetYear) {
    return args.progress >= 100 ? "achieved" : "missed";
  }
  if (args.progress < 0) return "backsliding";
  if (args.progress >= 100) return "on-track";
  return args.progress >= args.elapsedPct ? "on-track" : "behind";
}

function clampForDisplay(value: number): number {
  if (value < Y_MIN) return Y_MIN;
  if (value > Y_MAX) return Y_MAX;
  return value;
}

function buildDot(args: {
  key: string;
  targetName: string;
  metricLabel: string;
  glyph: string;
  color: string;
  baseline: number | null | undefined;
  current: number | null | undefined;
  target: number | null | undefined;
  baselineYear: number;
  targetYear: number;
  currentYear: number;
}): DotDatum | null {
  const baseline =
    typeof args.baseline === "number" && Number.isFinite(args.baseline) ? args.baseline : null;
  const current =
    typeof args.current === "number" && Number.isFinite(args.current) ? args.current : null;
  const target =
    typeof args.target === "number" && Number.isFinite(args.target) ? args.target : null;

  const hasBaseline = baseline != null && baseline > 0;
  const hasCurrent = current != null;

  // Without a baseline, there's nothing to plot. The caller surfaces this in
  // the "issues" footer instead of as an invisible dot.
  if (!hasBaseline) return null;

  const {
    elapsedYears,
    totalYears,
    pct: elapsedPct,
  } = computeTimeElapsed(args.baselineYear, args.targetYear, args.currentYear);
  const pastTargetYear = args.currentYear > args.targetYear;

  const rawProgress =
    hasCurrent && target != null
      ? computeProgress(baseline as number, current as number, target)
      : null;

  const status = deriveDotStatus({
    hasBaseline,
    hasCurrent,
    progress: rawProgress,
    pastTargetYear,
    elapsedPct,
  });

  const x = Math.max(X_MIN, Math.min(X_MAX, elapsedPct));
  const y = clampForDisplay(rawProgress ?? 0);

  return {
    key: args.key,
    x,
    y,
    rawProgress,
    glyph: args.glyph,
    color: args.color,
    filled: hasCurrent,
    status,
    targetName: args.targetName,
    metricLabel: args.metricLabel,
    baseline,
    current,
    target,
    baselineYear: args.baselineYear,
    targetYear: args.targetYear,
    elapsedYears,
    totalYears,
  };
}

interface BuiltMatrix {
  /** Plotted dots — only metrics with a current measurement land here. */
  dots: DotDatum[];
  /** Targets per assigned color, for the legend. */
  legend: Array<{ name: string; color: string }>;
  /** Metrics with no baseline data — listed below the chart. */
  noBaselineMetrics: Array<{
    targetName: string;
    metricLabel: string;
    baselineYear: number;
  }>;
  /**
   * Metrics with baseline but no current measurement yet. Surfaced as their
   * own strip so they don't pile at (X%, 0%) on the chart and overlap each
   * other. The chart is for measured progress; commitments live alongside.
   */
  committed: Array<{
    key: string;
    targetName: string;
    metricLabel: string;
    glyph: string;
    color: string;
  }>;
}

function buildMatrix(targets: TargetLike[], currentYear: number): BuiltMatrix {
  const dots: DotDatum[] = [];
  const legend: Array<{ name: string; color: string }> = [];
  const noBaselineMetrics: BuiltMatrix["noBaselineMetrics"] = [];
  const committed: BuiltMatrix["committed"] = [];

  const route = (
    dot: DotDatum | null,
    fallback: {
      targetName: string;
      metricLabel: string;
      glyph: string;
      color: string;
      key: string;
      baselineYear: number;
    }
  ) => {
    if (!dot) {
      noBaselineMetrics.push({
        targetName: fallback.targetName,
        metricLabel: fallback.metricLabel,
        baselineYear: fallback.baselineYear,
      });
    } else if (dot.filled) {
      dots.push(dot);
    } else {
      committed.push({
        key: dot.key,
        targetName: dot.targetName,
        metricLabel: dot.metricLabel,
        glyph: dot.glyph,
        color: dot.color,
      });
    }
  };

  // Track which metric types appear so we only show relevant legend items.
  const seen = new Set<string>();

  targets.forEach((t, idx) => {
    const targetName =
      cleanTargetName(t.name) || (t.type === "SCOPE" ? "Scope target" : "Reduction target");

    if (t.generalTarget) {
      seen.add("General");
      const dot = buildDot({
        key: `g-${t.id ?? idx}`,
        targetName,
        metricLabel: "General",
        glyph: "G",
        color: GENERAL_COLOR,
        baseline: t.generalTarget.baselineYearEmission,
        current: t.generalTarget.currentEmission,
        target: t.generalTarget.targetEmission,
        baselineYear: t.baselineYear,
        targetYear: t.targetYear,
        currentYear,
      });
      route(dot, {
        key: `g-${t.id ?? idx}`,
        targetName,
        metricLabel: "General",
        glyph: "G",
        color: GENERAL_COLOR,
        baselineYear: t.baselineYear,
      });
    }

    // GENERAL targets shouldn't carry scope rows. Defensive — backend now
    // strips these but legacy DBs may still have stale rows.
    if (t.type !== "GENERAL" && t.scopeTargets?.length) {
      for (const st of t.scopeTargets) {
        const scopeLabel = SCOPE_LABEL[st.scope];
        const scopeColor = SCOPE_COLORS[st.scope];
        seen.add(scopeLabel);
        const dot = buildDot({
          key: `s-${t.id ?? idx}-${st.scope}`,
          targetName,
          metricLabel: scopeLabel,
          glyph: SCOPE_GLYPH[st.scope],
          color: scopeColor,
          baseline: st.baselineYearEmission,
          current: st.currentEmission,
          target: st.targetEmission,
          baselineYear: st.baselineYear ?? t.baselineYear,
          targetYear: st.targetYear ?? t.targetYear,
          currentYear,
        });
        route(dot, {
          key: `s-${t.id ?? idx}-${st.scope}`,
          targetName,
          metricLabel: scopeLabel,
          glyph: SCOPE_GLYPH[st.scope],
          color: scopeColor,
          baselineYear: st.baselineYear ?? t.baselineYear,
        });
      }
    }
  });

  // Legend lists only the metric types that are actually present in the data.
  const ALL_METRICS: Array<{ name: string; color: string }> = [
    { name: "General", color: GENERAL_COLOR },
    { name: "Scope 1", color: SCOPE_COLORS.SCOPE1 },
    { name: "Scope 2", color: SCOPE_COLORS.SCOPE2 },
    { name: "Scope 3", color: SCOPE_COLORS.SCOPE3 },
  ];
  for (const m of ALL_METRICS) {
    if (seen.has(m.name)) legend.push(m);
  }

  return { dots, legend, noBaselineMetrics, committed };
}

function normalizeProps(props: TargetTrendChartProps): TargetLike[] {
  if (props.targets?.length) return props.targets;
  const fallback: TargetLike[] = [];
  if (props.general) fallback.push(props.general);
  if (props.scope) fallback.push(props.scope);
  if (props.target) fallback.push(props.target);
  return fallback;
}

// ─────────────────────── presentational ───────────────────────

function MatrixDot(props: { cx?: number; cy?: number; payload?: DotDatum }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return <g />;
  const radius = 11;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={payload.filled ? payload.color : "#FFFFFF"}
        fillOpacity={payload.filled ? 1 : 1}
        stroke={payload.color}
        strokeWidth={payload.filled ? 0 : 2}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dy={4}
        fontSize={10}
        fontWeight={700}
        fill={payload.filled ? "#FFFFFF" : payload.color}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {payload.glyph}
      </text>
    </g>
  );
}

interface MatrixTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: DotDatum }>;
}

function MatrixTooltip({ active, payload }: MatrixTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  const elapsedFraction = d.totalYears > 0 ? (d.elapsedYears / d.totalYears) * 100 : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg min-w-[230px] text-xs">
      <p className="text-sm font-semibold text-gray-900">{d.targetName}</p>
      <p className="text-gray-500 mt-0.5">
        {d.metricLabel} · {d.baselineYear} → {d.targetYear}
      </p>
      <hr className="my-2 border-gray-100" />
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Time elapsed:</span>
          <span className="font-medium text-gray-800">
            {d.totalYears > 0
              ? `Year ${d.elapsedYears} of ${d.totalYears} (${elapsedFraction.toFixed(0)}%)`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Progress:</span>
          <span className={`font-semibold ${STATUS_TEXT[d.status]}`}>
            {d.rawProgress != null
              ? `${d.rawProgress < 0 ? "↑" : ""}${Math.abs(d.rawProgress).toFixed(0)}%`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status:</span>
          <span className={`font-semibold ${STATUS_TEXT[d.status]}`}>{STATUS_LABEL[d.status]}</span>
        </div>
      </div>
      <hr className="my-2 border-gray-100" />
      <div className="space-y-0.5 text-[11px] text-gray-600">
        <div className="flex justify-between">
          <span>Baseline ({d.baselineYear}):</span>
          <span>{d.baseline != null ? `${formatNumberShort(d.baseline)} tCO₂e` : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Current:</span>
          <span>
            {d.current != null
              ? `${formatNumberShort(d.current)} tCO₂e`
              : "Awaiting first measurement"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Target ({d.targetYear}):</span>
          <span>{d.target != null ? `${formatNumberShort(d.target)} tCO₂e` : "—"}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── main ───────────────────────

export default function TargetTrendChart(props: TargetTrendChartProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { dots, legend, noBaselineMetrics, committed } = useMemo(
    () => buildMatrix(normalizeProps(props), currentYear),
    [props, currentYear]
  );

  if (dots.length === 0 && committed.length === 0 && noBaselineMetrics.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-center">
        <p className="text-sm font-medium text-gray-700">No reduction targets set</p>
        <p className="text-xs text-gray-500">
          Set a target to see progress against your baseline emissions here.
        </p>
      </div>
    );
  }

  const chartHeight = props.height ?? 360;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-600">
        <span className="font-medium text-gray-700">
          On the diagonal = on track · Above = ahead · Below = behind · Below 0% = backsliding
        </span>
      </div>

      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 24, bottom: 36, left: 36 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            {/* Backsliding zone — shaded */}
            <ReferenceArea y1={Y_MIN} y2={0} fill="#FEE2E2" fillOpacity={0.45} stroke="none" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[X_MIN, X_MAX]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: "#374151", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={{ stroke: "#D1D5DB" }}
              tickLine={false}
              label={{
                value: "Time elapsed",
                position: "insideBottom",
                offset: -16,
                style: { fontSize: 11, fill: "#374151", fontWeight: 500 },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[Y_MIN, Y_MAX]}
              ticks={[-100, -50, 0, 25, 50, 75, 100]}
              tick={{ fill: "#374151", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={{ stroke: "#D1D5DB" }}
              tickLine={false}
              label={{
                value: "Reduction achieved",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: {
                  fontSize: 11,
                  fill: "#374151",
                  fontWeight: 500,
                  textAnchor: "middle",
                },
              }}
            />
            {/* ZAxis is required to render Scatter without a default size scale. */}
            <ZAxis range={[120, 120]} />
            {/* Diagonal y = x: linear pace. Above the line = ahead of plan,
             *  below = behind. This is the core analytical reference of the
             *  matrix; without it the dots have no comparative meaning. */}
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: 100, y: 100 },
              ]}
              stroke="#9CA3AF"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            {/* Baseline / 0% line — separates progress from backsliding. */}
            <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1} />
            <Tooltip
              content={<MatrixTooltip />}
              cursor={{ stroke: "#E5E7EB", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Scatter data={dots} shape={MatrixDot} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend: targets + glyph key */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11px] text-gray-600">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {legend.map((item) => (
            <span key={`${item.name}-${item.color}`} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-700">{item.name}</span>
            </span>
          ))}
        </div>
        <span className="text-gray-500">G = General · 1/2/3 = Scope</span>
      </div>

      {committed.length > 0 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
          <span className="font-semibold">Awaiting first measurement:</span>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1.5">
            {committed.map((m) => (
              <span key={m.key} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {m.glyph}
                </span>
                <span className="text-blue-900">
                  {m.targetName} · {m.metricLabel}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {noBaselineMetrics.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          <span className="font-semibold">Missing baseline emissions:</span>{" "}
          {noBaselineMetrics
            .map((m) => `${m.targetName} · ${m.metricLabel} (${m.baselineYear})`)
            .join(", ")}
          . The baseline-year assessment exists for these metrics but doesn&apos;t include their
          emissions data — update it with the missing values, or pick a different baseline year.
        </div>
      )}
    </div>
  );
}
