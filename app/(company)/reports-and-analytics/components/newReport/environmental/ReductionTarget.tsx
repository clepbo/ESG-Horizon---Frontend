import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import React from "react";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

interface ReductionTargetProps {
  percentage: number;
  targetValue: number;
  baseline: number;
  targetYear: number;
  baselineYear?: number;
  currentYear?: number;
  currentValue?: number;
}
export default function ReductionTarget({
  targetValue,
  baseline,
  targetYear,
  baselineYear,
  currentYear,
  currentValue,
}: ReductionTargetProps) {
  return (
    <div className="p-2">
      <CircularProgressbarWithChildren
        value={66}
        styles={{
          path: {
            stroke: "#10b981", // Green color for progress
            strokeLinecap: "round",
          },
          // Customize the background circle
          trail: {
            stroke: "#f0f0f0", // Light gray for empty portion
          },
        }}
      >
        {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}

        <div
          style={{ fontSize: 12, marginTop: -5 }}
          className="text-2xl font-bold flex flex-col items-center justify-center"
        >
          <strong className="text-2xl">{`${formatNumberFigures(targetValue)}%`} </strong>
          <span className=""> Reduction target achieved</span>
          <span className="font-normal text-xs">
            {" "}
            Target: {`${formatNumberFigures(targetValue)}%`} by {targetYear}{" "}
          </span>
        </div>
      </CircularProgressbarWithChildren>
      <div className="flex flex-col gap-2 mt-4  p-4">
        <div className="flex w-full items-center justify-between">
          <span className="font-thin text-sm"> Baseline ({baselineYear}): </span>
          <span className=" text-sm  font-semibold"> {formatNumberFigures(baseline)} tCO2e </span>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="font-thin text-sm"> Current ({currentYear}): </span>
          <span className=" text-sm font-semibold">
            {" "}
            {formatNumberFigures(currentValue || 0)} tCO2e{" "}
          </span>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="font-thin text-sm"> Target ({targetYear}): </span>
          <span className=" text-sm font-semibold">
            {" "}
            {formatNumberFigures(targetValue || 0)} tCO2e{" "}
          </span>
        </div>
      </div>
    </div>
  );
}
