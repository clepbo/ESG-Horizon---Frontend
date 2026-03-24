"use client";

import { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { formatNumberShort, formatNumberFull } from "@/lib/numberFormat";
import type { Target } from "@/app/(company)/components/types/target";

interface ReductionTargetDonutProps {
  generalTarget?: Target | null;
  scopeTarget?: Target | null;
}

type ViewMode = "general" | "scope1" | "scope2" | "scope3";

const TAB_COLOR = "#119B95";

function computeReduction(
  baseline: number | undefined,
  current: number | undefined | null,
  target: number | undefined
) {
  const b = baseline || 0;
  const c = current ?? b;
  const t = target || 0;
  if (b <= 0 || b <= t) return 0;
  const totalNeeded = b - t;
  const achieved = b - c;
  return Math.min(Math.max(Math.round((achieved / totalNeeded) * 100), 0), 100);
}

export default function ReductionTargetDonut({
  generalTarget,
  scopeTarget,
}: ReductionTargetDonutProps) {
  const hasGeneral = !!generalTarget?.generalTarget;
  const hasScope = !!scopeTarget?.scopeTargets?.length;

  const [mode, setMode] = useState<ViewMode>(hasGeneral ? "general" : "scope1");

  // No targets at all
  if (!hasGeneral && !hasScope) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm h-full flex flex-col items-center justify-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Reduction Target</h3>
        <p className="text-sm text-gray-900">No targets set yet.</p>
      </div>
    );
  }

  // Build tabs
  const tabs: { key: ViewMode; label: string }[] = [];
  if (hasGeneral) tabs.push({ key: "general", label: "General" });
  if (hasScope) {
    const scopes = scopeTarget!.scopeTargets;
    if (scopes.find((s) => s.scope === "SCOPE1")) tabs.push({ key: "scope1", label: "Scope 1" });
    if (scopes.find((s) => s.scope === "SCOPE2")) tabs.push({ key: "scope2", label: "Scope 2" });
    if (scopes.find((s) => s.scope === "SCOPE3")) tabs.push({ key: "scope3", label: "Scope 3" });
  }

  // Resolve active data
  let baseline = 0;
  let current = 0;
  let targetEmission = 0;
  let reductionPct = 0;
  let baselineYear = 0;
  let targetYear = 0;
  let currentYear: number | null | undefined = null;
  const color = TAB_COLOR;

  if (mode === "general" && hasGeneral) {
    const g = generalTarget!.generalTarget!;
    baseline = g.baselineYearEmission || 0;
    current = g.currentEmission ?? baseline;
    targetEmission = g.targetEmission || 0;
    reductionPct = g.reductionPercentage || 0;
    baselineYear = generalTarget!.baselineYear;
    targetYear = generalTarget!.targetYear;
    currentYear = generalTarget!.currentAssessmentYear;
  } else if (hasScope) {
    const scopeKey = mode.toUpperCase().replace("SCOPE", "SCOPE") as "SCOPE1" | "SCOPE2" | "SCOPE3";
    const s = scopeTarget!.scopeTargets.find((t) => t.scope === scopeKey);
    if (s) {
      baseline = s.baselineYearEmission || 0;
      current = s.currentEmission ?? baseline;
      targetEmission = s.targetEmission || 0;
      reductionPct = s.reductionPercentage || 0;
    }
    baselineYear = scopeTarget!.baselineYear;
    targetYear = scopeTarget!.targetYear;
    currentYear = scopeTarget!.currentAssessmentYear;
  }

  const achieved = computeReduction(baseline, current, targetEmission);
  const donutData = [
    { value: achieved },
    { value: 100 - achieved },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-900">
          {targetYear} Reduction Target
        </h3>
      </div>

      {/* Tabs — only show if more than one option */}
      {tabs.length > 1 && (
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-2 self-start">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === tab.key
                  ? "text-white"
                  : "text-gray-900 hover:bg-gray-200"
              }`}
              style={mode === tab.key ? { backgroundColor: TAB_COLOR } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Donut */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <PieChart width={180} height={180}>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              <Cell fill={color} />
              <Cell fill="#E5E7EB" />
            </Pie>
          </PieChart>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{achieved}%</span>
            <span className="text-[10px] text-gray-900 text-center leading-tight">
              Reduction Achieved
            </span>
            <span className="text-[9px] text-gray-700">
              Target: {reductionPct}% by {targetYear}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mt-2">
        <StatRow
          label={`Baseline (${baselineYear}):`}
          value={`${formatNumberShort(baseline)} tCO₂e`}
          tooltip={`${formatNumberFull(baseline)} tCO₂e`}
        />
        <StatRow
          label={`Current${currentYear ? ` (${currentYear})` : ""}:`}
          value={`${formatNumberShort(current)} tCO₂e`}
          tooltip={`${formatNumberFull(current)} tCO₂e`}
        />
        <StatRow
          label={`Target (${targetYear}):`}
          value={`${formatNumberShort(targetEmission)} tCO₂e`}
          tooltip={`${formatNumberFull(targetEmission)} tCO₂e`}
        />
      </div>
    </div>
  );
}

function StatRow({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-900">{label}</span>
      <span className="font-semibold text-gray-900" title={tooltip}>{value}</span>
    </div>
  );
}
