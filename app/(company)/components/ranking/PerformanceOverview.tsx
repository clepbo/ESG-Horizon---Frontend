"use client";

import { KpiCard } from "@/app/components/ui/charts/DonoughtChart";
import TargetTrendChart from "@/app/components/ui/charts/TargetTrendChart";

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

/**
 * KPI hub "Net Zero Progress" card. Replaces the previous Highcharts
 * speedometer gauge + tab switcher with a single TargetTrendChart that
 * shows General + every Scope target on one shared year axis. Users no
 * longer need to flip between tabs to compare trajectories.
 */
export default function PerformanceOverview({ pair, baselineInfo }: PerformanceOverviewProps) {
  const hasGeneral = !!pair.general;
  const hasScope = !!pair.scope;

  return (
    <KpiCard className="space-y-6 w-full">
      {baselineInfo && (baselineInfo.submittedAt || baselineInfo.approvedAt) && (
        <p className="text-xs text-gray-500">
          Baseline assessment ({baselineInfo.startYear})
          {baselineInfo.submittedAt && (
            <>
              {" "}
              &middot; Submitted:{" "}
              {new Date(baselineInfo.submittedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </>
          )}
          {baselineInfo.approvedAt && (
            <>
              {" "}
              &middot;{" "}
              <span className="text-green-600">
                Approved:{" "}
                {new Date(baselineInfo.approvedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </p>
      )}

      <p className="text-lg font-semibold text-gray-800">Net Zero Progress (Carbon Footprint)</p>

      {hasGeneral || hasScope ? (
        <TargetTrendChart general={pair.general} scope={pair.scope} height={360} />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No target data available</p>
        </div>
      )}
    </KpiCard>
  );
}
