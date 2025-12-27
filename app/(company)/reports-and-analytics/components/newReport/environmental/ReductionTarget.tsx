import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import React from "react";


export default function ReductionTarget() {
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
          <strong className="text-2xl">66%</strong>
          <span className=""> Reduction target achieved</span>
          <span className="font-normal text-xs"> Target: 50% by 2030 </span>
        </div>
      </CircularProgressbarWithChildren>
      <div className="flex flex-col gap-2 mt-4  p-4">
        <div className="flex w-full items-center justify-between">
          <span className="font-thin text-sm"> Baseline (2024): </span>
          <span className=" text-sm  font-semibold"> 23,4004 tCO2e </span>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="font-thin text-sm"> Current (2025): </span>
          <span className=" text-sm font-semibold"> 20,4004 tCO2e </span>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="font-thin text-sm"> Target (2030): </span>
          <span className=" text-sm font-semibold">10,050 tCO2e </span>
        </div>
      </div>
    </div>
  );
}
