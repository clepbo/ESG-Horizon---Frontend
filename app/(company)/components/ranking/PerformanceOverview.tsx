"use client";

import { KpiCard, MiniDonutChart } from "@/app/components/ui/charts/DonoughtChart";
import SpeedometerGauge from "./CustomGuageChart";
import { useGetLatestTarget } from "./services";
import { useAuth } from "@/context/AuthContext";
import { formatNumberWithCommas } from "../../reports-and-analytics/components/utils/helpers";
import { useEffect, useState } from "react";
import { Target, TargetType } from "../types/target";

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

  return (
    <KpiCard title="Targets and Performance" className="space-y-6 w-full">
      {/* General Target Display */}
      {isGeneralTarget && general && (
        <div className="flex items-center justify-center">
          <SpeedometerGauge
            score={120}
            initialEmission={formatNumberWithCommas(general.baselineYearEmission ?? 0) ?? 0}
            currentEmission={formatNumberWithCommas(general.currentEmission ?? 0) ?? 0}
            targetEmission={formatNumberWithCommas(general.targetEmission) ?? 0}
          />
        </div>
      )}

      {/* Scope Targets Display */}
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

      {/* Fallback when no target data */}
      {!target && (
        <div className="text-center py-8">
          <p className="text-gray-500">No target data available</p>
        </div>
      )}
    </KpiCard>
  );
}
