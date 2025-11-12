"use client";

import { KpiCard, MiniDonutChart } from "@/app/components/ui/charts/DonoughtChart";
import SpeedometerGauge from "./CustomGuageChart";

export default function PerformanceOverview() {
  return (
    <KpiCard title="Targets and Performance" className="space-y-6 w-full">
      <div className="flex items-center justify-center">
        <SpeedometerGauge score={120} initialEmission="2,30900 C002te" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
        <MiniDonutChart label="Scope 1" percentage={61} value={16300} color="#EF4444" />
        <MiniDonutChart label="Scope 2" percentage={28} value={7500} color="#3B82F6" />
        <MiniDonutChart label="Scope 3" percentage={11} value={3030} color="#9333EA" />
      </div>
    </KpiCard>
  );
}
