"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { EmissionInventoryWrapper } from "./components/EmissionIventory";
import { trendData } from "./components/data/trendData";
import ComparativeTrendAnalysis from "./components/charts/ComparativeTrendAnalysis";
import EmissionProgressComponent from "./components/EmissionProgressComponents";
import { emissionsData } from "./components/data/reportData";
import FullReportSummary from "./components/FullReportSummary";
import { exportPNG, generatePDF } from "./components/exportFiles";
import { motion } from "framer-motion";
import { OverallSummary } from "./components/OverallSummaryCard";
import { useParams } from "next/navigation";
import { useSingleReport } from "./components/service/useReport";
import { getReadableTopSources, transformFuelBreakdownData } from "./components/utils/getTop5Sources";

export default function FullReport() {
  const scopeKeys = ["Scope 1", "Scope 2", "Scope 3"];
  const scopeColors = ["#FF6B3D", "#3E9BFF", "#9B4DFF"];

  function exportFile(value: string) {
    if (value === "pdf") {
      generatePDF("detail");
    } else {
      exportPNG("detail");
    }
    return;
  }
 const params = useParams();
  const { data, isLoading, error } = useSingleReport(Number(params?.id));
  console.log("Report", data?.top_5_sources)
if (!data) {
    return (
      <div className="w-full grid gap-4 p-4">
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No report data found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`w-full grid gap-4`}
      id="detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      <div className={`grid w-full gap-4 lg:gap-8 rounded-lg`}>
        <div className={`flex flex-col md:flex-row justify-between w-full items-center no-export`}>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
            {" "}
            Greenhouse Gas Emissions{" "}
          </h1>
          <Select onValueChange={exportFile}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Export report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" disabled>
                Select file format
              </SelectItem>
              <SelectItem value="pdf"> PDF</SelectItem>
              <SelectItem value="csv">PNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <OverallSummary report={data}  />
      </div>
      <div className={`grid w-full gap-4 p-4 bg-white rounded-lg shadow-sm`}>
        <EmissionInventoryWrapper report={data}/>
        <hr className="text-gray-300" />
        {/* <ComparativeTrendAnalysis data={trendData} keys={scopeKeys} colors={scopeColors} />
        <hr className="text-gray-300" /> */}

        <EmissionProgressComponent
          data={emissionsData}
          title={"Scope 1: Direct Emissions"}
          total={32900}
          color={"orange-500"}
        />
        <hr className="text-gray-300" />
        <EmissionProgressComponent
          data={emissionsData}
          title={"Scope 2: Indirect Energy Emissions"}
          total={30900}
          color={"blue-500"}
        />
        <hr className="text-gray-300" />
        <EmissionProgressComponent
          data={emissionsData}
          title={"Scope 3: Value Chain Emissions"}
          total={44900}
          color={"purple-500"}
        />
      </div>
      <FullReportSummary  data={transformFuelBreakdownData(data?.top_5_sources?.breakdown)}/>
    </motion.div>
  );
}