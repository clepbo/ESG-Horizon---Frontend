import { ScopeTargetDonutChart } from "@/app/components/ui/charts/DonoughtChart";
import React from "react";

interface ReductionTargetByScopeProps {
  scope1percentage: number;
  scope1value: number;
  scope1targetYear?: number | null;
  scope2percentage: number;
  scope2value: number;
  scope2targetYear?: number | null;
  scope3percentage: number;
  scope3value: number;
  scope3targetYear?: number | null;
}

export default function ReductionTargetByScope({
  scope1percentage,
  scope1value,
  scope1targetYear,
  scope2percentage,
  scope2value,
  scope2targetYear,
  scope3percentage,
  scope3value,
  scope3targetYear,
}: ReductionTargetByScopeProps) {
  return (
    <div className="flex flex-row flex-wrap gap-4 py-3 justify-center">
      <ScopeTargetDonutChart
        label="Scope 1"
        percentage={scope1percentage}
        value={scope1value}
        color="#EF4444"
        targetYear={scope1targetYear}
      />
      <ScopeTargetDonutChart
        label="Scope 2"
        percentage={scope2percentage}
        value={scope2value}
        color="#3B82F6"
        targetYear={scope2targetYear}
      />
      <ScopeTargetDonutChart
        label="Scope 3"
        percentage={scope3percentage}
        value={scope3value}
        color="#9333EA"
        targetYear={scope3targetYear}
      />
    </div>
  );
}
