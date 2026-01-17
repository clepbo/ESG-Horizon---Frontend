import React from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

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
    <div className="p-2">
      <CircularProgressbarWithChildren
        value={achievedPercentage}
        styles={{
          path: {
            stroke: "#10b981",
            strokeLinecap: "round",
          },
          trail: {
            stroke: "#f0f0f0",
          },
        }}
      >
        <div className="text-2xl font-bold flex flex-col items-center justify-center">
          <strong>{`${formatNumberFigures(achievedPercentage)}%`}</strong>
          <span className="text-sm">Reduction achieved</span>
          <span className="font-normal text-xs">
            Target: {formatNumberFigures(percentage)}% by {targetYear}
          </span>
        </div>
      </CircularProgressbarWithChildren>

      <div className="flex flex-col gap-2 mt-4 p-4">
        <div className="flex justify-between">
          <span className="text-sm font-thin">
            Baseline{baselineYear ? ` (${baselineYear})` : ""}:
          </span>
          <span className="text-sm font-semibold">{formatNumberFigures(safeBaseline)} tCO₂e</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-thin">Current ({currentYear}):</span>
          <span className="text-sm font-semibold">{formatNumberFigures(safeCurrent)} tCO₂e</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-thin">Target ({targetYear}):</span>
          <span className="text-sm font-semibold">{formatNumberFigures(safeTarget)} tCO₂e</span>
        </div>
      </div>
    </div>
  );
}
