import React from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { formatNumberFull } from "@/lib/numberFormat";

export interface ReductionTargetProps {
  percentage: number;
  targetValue: number;
  currentYear: number;
  targetYear: number;
  baselineEmission: number;
  baselineYear?: number;
  currentEmission: number;
  general?: GeneralTarget;
}

export interface GeneralTarget {
  baselineYearEmission: number;
  currentEmission: number;
  reductionPercentage: number;
  targetEmission: number;
}

export default function ReductionTarget({
  percentage,
  targetValue,
  currentYear,
  targetYear,
  baselineEmission,
  baselineYear,
  currentEmission,
}: ReductionTargetProps) {
  const safeBaseline = baselineEmission ?? 0;
  const safeCurrent = currentEmission ?? 0;
  const safeTarget = targetValue ?? 0;

  const achievedPercentage =
    safeBaseline > 0
      ? Math.min(100, Math.max(0, ((safeBaseline - safeCurrent) / safeBaseline) * 100))
      : 0;

  return (
    <div className="p-2 flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center min-h-[240px]">
        <div className="w-48 h-48">
          <CircularProgressbarWithChildren
            value={achievedPercentage}
            strokeWidth={10}
            styles={{
              path: {
                stroke: "#109b95",
                strokeLinecap: "round",
                transition: "stroke-dashoffset 0.5s ease 0s",
              },
              trail: {
                stroke: "#f1f1f1",
              },
            }}
          >
            <div className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-3xl font-bold text-gray-800">
                {formatNumberFull(achievedPercentage, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">
                Reduction Achieved
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                Target: {formatNumberFull(percentage, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% by {targetYear}
              </span>
            </div>
          </CircularProgressbarWithChildren>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto p-4 border-t border-gray-50">
        <div className="flex justify-between items-center text-base">
          <span className="text-gray-500">Baseline{baselineYear ? ` (${baselineYear})` : ""}:</span>
          <span className="font-bold text-gray-700">{formatNumberFigures(safeBaseline)} tCO₂e</span>
        </div>

        <div className="flex justify-between items-center text-base">
          <span className="text-gray-500">Current ({currentYear}):</span>
          <span className="font-bold text-gray-700">{formatNumberFigures(safeCurrent)} tCO₂e</span>
        </div>

        <div className="flex justify-between items-center text-base">
          <span className="text-gray-500">Target ({targetYear}):</span>
          <span className="font-bold text-gray-700">{formatNumberFigures(safeTarget)} tCO₂e</span>
        </div>
      </div>
    </div>
  );
}
