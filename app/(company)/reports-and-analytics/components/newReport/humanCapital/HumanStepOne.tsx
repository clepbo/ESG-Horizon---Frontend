"use client";

import { HardHat, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { ReportResponse } from "@/types/report/reportResponse";
import { cn } from "@/lib/utils";

interface HumanStepOneProps {
  reportData?: ReportResponse;
}

export default function HumanStepOne({ reportData }: HumanStepOneProps) {
  const change = reportData?.humanCapital?.changePercentage;
  const metrics = [
    {
      title: "Total TRIR",
      value: reportData?.humanCapital?.totalRecordableIncidentRatePer200kHours?.toString() || "0",
      unit: "per 200k hours",
      change: change,
      isTrir: true,
    },
    {
      title: "Direct TRIR",
      value: reportData?.humanCapital?.direct?.trir?.toString() || "0",
      unit: "per 200k hours",
    },
    {
      title: "Contract TRIR",
      value: reportData?.humanCapital?.contract?.trir?.toString() || "0",
      unit: "per 200k hours",
    },
    {
      title: "Recordable Incidents",
      value: reportData?.humanCapital?.recordableIncidents?.toString() || "0",
      unit: "incidents",
    },
    {
      title: "Fatalities",
      value: reportData?.humanCapital?.fatalities?.toString() || "0",
      unit: "fatalities",
    },
    {
      title: "Near Misses",
      value: reportData?.humanCapital?.nearMisses?.toString() || "0",
      unit: "misses",
    },
    {
      title: "Avg Safety Training",
      value: reportData?.humanCapital?.averageSafetyTrainingHoursPerEmployee?.toString() || "0",
      unit: "hours/employee",
    },
  ];
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="flex shrink-0 items-center justify-center rounded-lg p-2.5"
          style={{ backgroundColor: "#f5e6d3" }}
          aria-hidden
        >
          <HardHat className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7" strokeWidth={2} />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Human Capital</h2>
          <p className="text-sm text-gray-500 sm:text-base">
            Workforce Health & Safety Performance
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {metrics.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            unit={card.unit}
            change={card.change}
            isTrir={card.isTrir}
          />
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  change,
  isTrir,
}: {
  title: string;
  value: string;
  unit: string;
  change?: number;
  isTrir?: boolean;
}) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = !change || change === 0;

  // For TRIR, increase is BAD (Red), decrease is GOOD (Green)
  const colorClass = isTrir
    ? isPositive
      ? "text-red-600"
      : isNegative
        ? "text-green-600"
        : "text-gray-500"
    : "text-gray-500";

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <div className="flex flex-col justify-between gap-1 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex justify-between items-start">
        <p className="text-sm font-normal text-gray-700 sm:text-base">{title}</p>
        {change !== undefined && change !== null && (
          <div className={cn("flex items-center text-xs font-medium", colorClass)}>
            <Icon className="h-3 w-3 mr-1" />
            {Math.abs(change)}%
            <span className="ml-1 text-gray-400 font-normal">vs last year</span>
          </div>
        )}
      </div>
      <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
        <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{value}</span>
        <span className="text-sm text-gray-400 sm:text-base">{unit}</span>
      </p>
    </div>
  );
}
