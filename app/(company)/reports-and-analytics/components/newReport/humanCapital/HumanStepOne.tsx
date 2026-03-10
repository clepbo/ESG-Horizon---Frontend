"use client";

import { HardHat, ArrowDown, ArrowUp, Minus, Info } from "lucide-react";
import { ReportResponse } from "@/types/report/reportResponse";
import { cn } from "@/lib/utils";
import { formatNumberFull } from "@/lib/numberFormat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

interface HumanStepOneProps {
  reportData?: ReportResponse;
}

export default function HumanStepOne({ reportData }: HumanStepOneProps) {
  const change = reportData?.humanCapital?.changePercentage;
  const metrics = [
    {
      title: "Total TRIR",
      value: formatNumberFull(reportData?.humanCapital?.totalRecordableIncidentRatePer200kHours ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: "per 200k hours",
      change: change,
      isTrir: true,
      tooltip: "(Total Recordable Incidents × 200,000) / Total hours worked",
    },
    {
      title: "Direct TRIR",
      value: formatNumberFull(reportData?.humanCapital?.direct?.trir ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: "per 200k hours",
      tooltip: "(Direct Employee Recordable Incidents × 200,000) / Direct employee hours worked",
    },
    {
      title: "Contract TRIR",
      value: formatNumberFull(reportData?.humanCapital?.contract?.trir ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: "per 200k hours",
      tooltip: "(Contract Employee Recordable Incidents × 200,000) / Contract employee hours worked",
    },
    {
      title: "Recordable Incidents",
      value: formatNumberFull(reportData?.humanCapital?.recordableIncidents ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: "incidents",
      tooltip: "Total number of work-related injuries or illnesses",
    },
    {
      title: "Fatalities",
      value: formatNumberFull(reportData?.humanCapital?.fatalities ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: "fatalities",
      tooltip: "Total number of work-related fatalities",
    },
    {
      title: "Near Misses",
      value: formatNumberFull(reportData?.humanCapital?.nearMisses ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: "misses",
      tooltip: "Total number of near miss incidents",
    },
    {
      title: "Avg Safety Training",
      value: formatNumberFull(reportData?.humanCapital?.averageSafetyTrainingHoursPerEmployee ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: "hours/employee",
      tooltip: "Total safety training hours / Total number of employees",
    },
  ];
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="flex shrink-0 items-center justify-center rounded-lg p-2.5 bg-blue-50"
          aria-hidden
        >
          <HardHat className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" strokeWidth={2} />
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
            tooltip={card.tooltip}
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
  tooltip,
}: {
  title: string;
  value: string;
  unit: string;
  change?: number;
  isTrir?: boolean;
  tooltip?: string;
}) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

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
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-normal text-gray-700 sm:text-base">{title}</p>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none z-[100]"
                >
                  <p className="text-sm font-medium">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {change !== undefined && change !== null && (
          <div className={cn("flex items-center text-xs font-medium", colorClass)}>
            <Icon className="h-3 w-3 mr-1" />
            {formatNumberFull(Math.abs(change), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%<span className="ml-1 text-gray-400 font-normal">vs last year</span>
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
