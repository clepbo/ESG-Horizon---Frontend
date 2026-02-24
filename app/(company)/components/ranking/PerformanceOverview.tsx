"use client";

import { KpiCard, MiniDonutChart } from "@/app/components/ui/charts/DonoughtChart";
import SpeedometerGauge from "./CustomGuageChart";
import { useGetLatestTarget } from "./services";
import { useAuth } from "@/context/AuthContext";
import { formatNumberWithCommas } from "../../reports-and-analytics/components/utils/helpers";
import { useEffect, useState } from "react";
import { Target, TargetType } from "../types/target";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";

export default function PerformanceOverview() {
  const [target, setTarget] = useState<Target | null>(null);
  const { user } = useAuth();
  const companyId = user?.company?.id;

  const latestTarget = useGetLatestTarget(companyId);

  useEffect(() => {
    if (latestTarget?.data) {
      setTarget(latestTarget.data);
    }
  }, [latestTarget?.data]); // Added dependency array

  // Helper function to check if it's a general target
  const isGeneralTarget = target?.type === TargetType.GENERAL;

  // Helper function to check if it's a scope target
  const isScopeTarget = target?.type === TargetType.SCOPE;

  const general = target?.generalTarget;
  const scopeTargets = target?.scopeTargets || [];

  // Find individual scope targets for the charts
  const scope1Target = scopeTargets.find((st: { scope: string }) => st.scope === "SCOPE1");
  const scope2Target = scopeTargets.find((st: { scope: string }) => st.scope === "SCOPE2");
  const scope3Target = scopeTargets.find((st: { scope: string }) => st.scope === "SCOPE3");

  // Compute ESG score from actual target data instead of hardcoded value
  const score = general
    ? Math.round(((general.currentEmission ?? 0) / (general.baselineYearEmission || 1)) * 200)
    : 0;

  if (latestTarget.isLoading) {
    return <CardSkeleton />;
  }

  const isTargt = target ? target.name.length > 3 : undefined;
  return (
    <KpiCard title="Targets and Performance" isTarget={isTargt} className="space-y-6 w-full">
      {/* General Target Display — speedometer only */}
      {isGeneralTarget && general && (
        <div className="mt-4 flex items-center justify-center">
          <SpeedometerGauge
            score={score}
            initialEmission={formatNumberWithCommas(general?.baselineYearEmission ?? 0) ?? 0}
            currentEmission={formatNumberWithCommas(general?.currentEmission ?? 0) ?? 0}
            targetEmission={formatNumberWithCommas(general?.targetEmission) ?? 0}
          />
        </div>
      )}

      {/* Scope Targets Display — 3 donut charts only */}
      {isScopeTarget && scopeTargets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
          <MiniDonutChart
            label="Scope 1"
            percentage={scope1Target?.reductionPercentage || 0}
            value={scope1Target?.currentEmission || 0}
            color="#EF4444"
          />
          <MiniDonutChart
            label="Scope 2"
            percentage={scope2Target?.reductionPercentage || 0}
            value={scope2Target?.currentEmission || 0}
            color="#3B82F6"
          />
          <MiniDonutChart
            label="Scope 3"
            percentage={scope3Target?.reductionPercentage || 0}
            value={scope3Target?.currentEmission || 0}
            color="#9333EA"
          />
        </div>
      )}

      {!target && (
        <div className="text-center py-8">
          <p className="text-gray-500">No target data available</p>
        </div>
      )}
    </KpiCard>
  );
}
