"use client";

import { KpiCard } from "@/app/components/ui/charts/DonoughtChart";
import SpeedometerGauge from "./CustomGuageChart";
import { formatNumberWithCommas } from "../../reports-and-analytics/components/utils/helpers";

import { TargetPair } from "./services";

export type ViewMode = "general" | "scope";

export interface BaselineInfo {
  startYear: string;
  submittedAt: string | null;
  approvedAt: string | null;
}

interface PerformanceOverviewProps {
  pair: TargetPair;
  activeView: ViewMode;
  baselineInfo?: BaselineInfo | null;
}

export default function PerformanceOverview({ pair, activeView, baselineInfo }: PerformanceOverviewProps) {
  const hasGeneral = !!pair.general;
  const hasScope = !!pair.scope;

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
    return { label, description, score, baseline: bl, current: cur, target: tgt, reductionPct: st?.reductionPercentage };
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
      {/* General view — single speedometer */}
      {activeView === "general" && hasGeneral && general && (
        <div className="mt-4 flex items-center justify-center">
          <SpeedometerGauge
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

      {/* Scope view — one gauge per scope, stacked */}
      {activeView === "scope" && hasScope && (
        <div className="flex flex-col divide-y divide-gray-100">
          <p className="text-lg font-semibold text-gray-800 pb-4">Net Zero Progress (Carbon Footprint)</p>
          {scopeGaugeData.map(({ label, description, score, baseline, current, target, reductionPct }) => (
            <div key={label} className="py-6 first:pt-2">
              <p className="text-base font-semibold text-gray-700 mb-1">{label} Progress</p>
              <SpeedometerGauge
                compact
                scopeLabel={label as "Scope 1" | "Scope 2" | "Scope 3"}
                scopeDescription={description}
                score={score}
                initialEmission={formatNumberWithCommas(baseline)}
                currentEmission={formatNumberWithCommas(current)}
                targetEmission={formatNumberWithCommas(target)}
                reductionPercentage={reductionPct}
                baselineYear={scopeTarget!.baselineYear}
                currentYear={scopeTarget!.currentAssessmentYear ?? undefined}
                targetYear={scopeTarget!.targetYear}
              />
            </div>
          ))}
        </div>
      )}

      {!hasGeneral && !hasScope && (
        <div className="text-center py-8">
          <p className="text-gray-500">No target data available</p>
        </div>
      )}
    </KpiCard>
  );
}
