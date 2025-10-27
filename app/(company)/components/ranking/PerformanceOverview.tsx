"use client";

import { Plus, Edit } from "lucide-react";
import { GaugeChart, KpiCard, MiniDonutChart } from "@/app/components/ui/charts/DonoughtChart";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";

export default function PerformanceOverview() {
  return (
    <KpiCard title="Targets and Performance" className="space-y-6 w-full">
      {/* Header Buttons */}
     

      {/* Gauge */}
      {/* <GaugeChart baseline={26830} current={17425} target={11537} /> */}

      {/* Mini Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
        <MiniDonutChart label="Scope 1" percentage={61} value={16300} color="#EF4444" />
        <MiniDonutChart label="Scope 2" percentage={28} value={7500} color="#3B82F6" />
        <MiniDonutChart label="Scope 3" percentage={11} value={3030} color="#9333EA" />
      </div>
    </KpiCard>
  );
}
