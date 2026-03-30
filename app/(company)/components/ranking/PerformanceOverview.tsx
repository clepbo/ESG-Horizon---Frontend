"use client";

import { useState } from "react";
import { KpiCard } from "@/app/components/ui/charts/DonoughtChart";
import SpeedometerGauge from "./CustomGuageChart";
import { formatNumberWithCommas } from "../../reports-and-analytics/components/utils/helpers";

import { TargetPair } from "./services";

// ViewMode kept for backwards compatibility if referenced elsewhere
export type ViewMode = "general" | "scope";

export interface BaselineInfo {
  startYear: string;
  submittedAt: string | null;
  approvedAt: string | null;
}

interface PerformanceOverviewProps {
  pair: TargetPair;
  baselineInfo?: BaselineInfo | null;
}

const TAB_COLOR = "#119B95";

export default function PerformanceOverview({ pair, baselineInfo }: PerformanceOverviewProps) {
  const hasGeneral = !!pair.general;
  const hasScope = !!pair.scope;

  // Build available tabs dynamically
  const tabs: { key: string; label: string }[] = [];
  if (hasGeneral) tabs.push({ key: "general", label: "General" });
  if (hasScope) {
    const scopes = pair.scope!.scopeTargets ?? [];
    if (scopes.find((s) => s.scope === "SCOPE1")) tabs.push({ key: "scope1", label: "Scope 1" });
    if (scopes.find((s) => s.scope === "SCOPE2")) tabs.push({ key: "scope2", label: "Scope 2" });
    if (scopes.find((s) => s.scope === "SCOPE3")) tabs.push({ key: "scope3", label: "Scope 3" });
  }

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.key ?? "general");

  const generalTarget = pair.general;
  const scopeTarget = pair.scope;

  // ── General gauge data ──────────────────────────────────────────────────
  const general = generalTarget?.generalTarget;

  const baselineEmission = general?.baselineYearEmission ?? 0;
  const currentEmission = general?.currentEmission || baselineEmission;
  const targetEmission = general?.targetEmission ?? 0;
  const reductionGap = baselineEmission - targetEmission;
  const generalScore =
    general && reductionGap > 0
      ? Math.min(100, Math.max(0, Math.round(((baselineEmission - currentEmission) / reductionGap) * 100)))
      : 0;

  // ── Scope gauge data ─────────────────────────────────────────────────────
  const scopeTargets = scopeTarget?.scopeTargets ?? [];
  const s1 = scopeTargets.find((s) => s.scope === "SCOPE1");
  const s2 = scopeTargets.find((s) => s.scope === "SCOPE2");
  const s3 = scopeTargets.find((s) => s.scope === "SCOPE3");

  const scopeGaugeData = [
    { label: "Scope 1", description: "Direct emissions from owned or controlled sources", target: s1 },
    { label: "Scope 2", description: "Indirect emissions from purchased energy", target: s2 },
    { label: "Scope 3", description: "All other indirect emissions in the value chain", target: s3 },
  ].map(({ label, description, target: st }) => {
    const bl = st?.baselineYearEmission ?? 0;
    const cur = st?.currentEmission || bl;
    const tgt = st?.targetEmission ?? 0;
    const gap = bl - tgt;
    const score = gap > 0
      ? Math.min(100, Math.max(0, Math.round(((bl - cur) / gap) * 100)))
      : 0;
    return { label, description, score, baseline: bl, current: cur, target: tgt, reductionPct: st?.reductionPercentage, baselineYear: st?.baselineYear, targetYear: st?.targetYear };
  });

  return (
    <KpiCard className="space-y-6 w-full">
      {baselineInfo && (baselineInfo.submittedAt || baselineInfo.approvedAt) && (
        <p className="text-xs text-gray-500">
          Baseline assessment ({baselineInfo.startYear})
          {baselineInfo.submittedAt && <> &middot; Submitted: {new Date(baselineInfo.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>}
          {baselineInfo.approvedAt && <> &middot; <span className="text-green-600">Approved: {new Date(baselineInfo.approvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></>}
        </p>
      )}
      {/* Tab bar */}
      {tabs.length > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-800">Net Zero Progress (Carbon Footprint)</p>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-white"
                    : "text-gray-900 hover:bg-gray-200"
                }`}
                style={activeTab === tab.key ? { backgroundColor: TAB_COLOR } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tabs.length === 1 && (
        <p className="text-lg font-semibold text-gray-800">Net Zero Progress (Carbon Footprint)</p>
      )}

      {/* General gauge */}
      {activeTab === "general" && hasGeneral && general && (
        <div className="flex items-center justify-center">
          <SpeedometerGauge
            compact
            score={generalScore}
            initialEmission={formatNumberWithCommas(general.baselineYearEmission ?? 0)}
            currentEmission={formatNumberWithCommas(general.currentEmission ?? 0)}
            targetEmission={formatNumberWithCommas(general.targetEmission)}
            reductionPercentage={general.reductionPercentage}
            baselineYear={generalTarget!.baselineYear}
            currentYear={generalTarget!.currentAssessmentYear ?? undefined}
            targetYear={generalTarget!.targetYear}
          />
        </div>
      )}

      {/* Scope gauges */}
      {activeTab.startsWith("scope") && hasScope && (() => {
        const activeData = scopeGaugeData.find(
          (d) => d.label.toLowerCase().replace(" ", "") === activeTab
        );
        if (!activeData) return null;
        return (
          <div className="flex items-center justify-center">
            <SpeedometerGauge
              compact
              scopeLabel={activeData.label as "Scope 1" | "Scope 2" | "Scope 3"}
              scopeDescription={activeData.description}
              score={activeData.score}
              initialEmission={formatNumberWithCommas(activeData.baseline)}
              currentEmission={formatNumberWithCommas(activeData.current)}
              targetEmission={formatNumberWithCommas(activeData.target)}
              reductionPercentage={activeData.reductionPct}
              baselineYear={activeData.baselineYear ?? scopeTarget!.baselineYear}
              currentYear={scopeTarget!.currentAssessmentYear ?? undefined}
              targetYear={activeData.targetYear ?? scopeTarget!.targetYear}
            />
          </div>
        );
      })()}

      {!hasGeneral && !hasScope && (
        <div className="text-center py-8">
          <p className="text-gray-500">No target data available</p>
        </div>
      )}
    </KpiCard>
  );
}
