import React from "react";
import { FaArrowDown } from "react-icons/fa";
import EmissionsChart from "./EmissionsChart";

export default function EnvironmentalEmissionCard() {
  return (
    <div className="rounded-md p-2 md:p-4 w-auto gap-4 border-l-4 border-l-green-600 grid shadow">
      <div className="flex items-center justify-between w-full">
        <text className=" whitespace-nowrap"> Total Emissions </text>
        <span
          className={` p-0.5 px-1 rounded-2xl bg-green-200 text-green-600 flex items-center gap-2`}
        >
          <FaArrowDown />
          0.34
        </span>
      </div>
      <div className="">
        <text className="text-2xl font-bold">
          15,000 <sub className="text-sm text-gray-400 font-normal"> tCO2e</sub>
        </text>
      </div>
      <div className="">
        <EmissionsChart />
      </div>
    </div>
  );
}
