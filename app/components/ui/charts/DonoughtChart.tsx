"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Slim wrapper card used by the KPIs hub. The previous file in this
 * location also exported MiniDonutChart, ScopeTargetDonutChart, GaugeChart,
 * and RechartsGaugeChart, but those were all per-target reduction-target
 * visualisations that have been replaced by the unified TargetTrendChart
 * (see app/components/ui/charts/TargetTrendChart.tsx). Only KpiCard
 * survived the migration.
 */
interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  isTarget?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, children, className }) => {
  return (
    <div className={cn("w-full rounded-lg bg-white p-6 shadow-sm", className)}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
};
