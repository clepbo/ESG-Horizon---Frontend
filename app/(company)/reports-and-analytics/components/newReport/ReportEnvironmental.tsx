
import React from "react";
import { FaLeaf } from "react-icons/fa";
import EnvironmentalEmissionCard from "./environmental/EnvironmentalEmissionCard";

export default function ReportEnvironmental() {
  return (
    <div className="flex flex-col gap-4 lg:gap-10">
      <div className="flex items-center gap-2">
        <span className="p-2 bg-[#dff9e6]">
          <FaLeaf className="text-primary rounded" />
        </span>
        <div className="flex flex-col">
          <h6 className="text-sm"> Greenhouse Gas Emissions </h6>
          <text className="text-xs text-gray-600">Scope 1, 2, and 3 emissions performance against targets </text>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <EnvironmentalEmissionCard />
      </div>
    </div>
  );
}
