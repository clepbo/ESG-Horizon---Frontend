"use client";

import { KpiCard } from "@/app/components/ui/charts/DonoughtChart";
import TargetTrendChart from "@/app/components/ui/charts/TargetTrendChart";
import { Target } from "@/app/(company)/components/types/target";

export type ViewMode = "general" | "scope";

export interface BaselineInfo {
  startYear: string;
  submittedAt: string | null;
  approvedAt: string | null;
}

interface PerformanceOverviewProps {
  targets: Target[];
  baselineInfo?: BaselineInfo | null;
}

/**
 * KPI hub "Reduction Targets Progress" card. Renders every target the
 * company has set as its own bullet bar, so a viewer sees their full
 * portfolio in one chart instead of just the latest General + Scope pair.
 */
export default function PerformanceOverview({
  targets,
  baselineInfo,
}: PerformanceOverviewProps) {
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

      <p className="text-lg font-semibold text-gray-800">
        Reduction Targets Progress
      </p>

      {targets.length > 0 ? (
        <TargetTrendChart targets={targets} height={360} />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No target data available</p>
        </div>
      )}
    </KpiCard>
  );
}
