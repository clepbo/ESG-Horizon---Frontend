import { ScopeTargetDonutChart } from "@/app/components/ui/charts/DonoughtChart";
import React from "react";

interface ReductionTargetByScopeProps {
  scope1percentage: number;
  scope1value: number;
  scope2percentage: number;
  scope2value: number;
  scope3percentage: number;
  scope3value: number;
}

export default function ReductionTargetByScope({
  scope1percentage,
  scope1value,
  scope2percentage,
  scope2value,
  scope3percentage,
  scope3value,
}: ReductionTargetByScopeProps) {
  return (
    <div className="flex flex-col gap-2 py-3">
      <ScopeTargetDonutChart
        label="Scope 1"
        percentage={scope1percentage}
        value={scope1value}
        color="#EF4444"
      />
      <ScopeTargetDonutChart
        label="Scope 2"
        percentage={scope2percentage}
        value={scope2value}
        color="#3B82F6"
      />
      <ScopeTargetDonutChart
        label="Scope 3"
        percentage={scope3percentage}
        value={scope3value}
        color="#9333EA"
      />
    </div>
  );
}
