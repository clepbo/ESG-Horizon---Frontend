"use client";
import React from "react";

import { EmissionInventoryWrapper } from "./components/EmissionIventory";
import { emissionsData } from "./components/data/reportData";
import EmissionProgressComponent from "./components/EmissionProgressComponents";
import FullReportSummary from "./components/FullReportSummary";
// import { exportPNG, generatePDF } from "./components/exportFiles";
import { motion } from "framer-motion";
import { OverallSummary } from "./components/OverallSummaryCard";
import { useParams } from "next/navigation";
import { useSingleReport } from "./components/service/useReport";
import { transformFuelBreakdownData } from "./components/utils/getTop5Sources";
import BackButton from "@/app/components/ui/reusables/BackButton";

export default function FullReport() {
  const params = useParams();
  // const { data, isLoading, error } =  useSingleReportDetail(Number(params?.id));
  const { data, isError } = useSingleReport(Number(params?.id));

  // console.log("FullReport", data);

  // if (isLoading) {
  //   return (
  //     <div className="w-full flex justify-center items-center py-12 text-gray-500">
  //       Loading report data...
  //     </div>
  //   );
  // }

  if (isError) {
    return (
      <div className="w-full flex justify-center items-center py-12 text-red-500">
        Failed to load report.
      </div>
    );
  }

  // if (!data) {
  //   return (
  //     <div className="w-full flex justify-center items-center py-12 text-gray-600">
  //       No report data found.
  //     </div>
  //   );
  // }

  const breakdown = data?.top_5_sources?.breakdown || [];
  // console.log("BDown", breakdown)

  return (
    <motion.div
      className="w-full grid gap-4"
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
      <div className="grid w-full gap-4 lg:gap-8 rounded-lg">
        <div className=" flex space-x-4">
          <BackButton />
          <span>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground ">Detailed View</h1>
          </span>
        </div>

        {/* ✅ Safely render OverallSummary */}
        <OverallSummary report={data} />
      </div>

      <div className="grid w-full gap-4 p-4 bg-white rounded-lg shadow-sm">
        <EmissionInventoryWrapper report={data} />
        <hr className="text-gray-300" />

        <EmissionProgressComponent
          data={emissionsData}
          title="Scope 1: Direct Emissions"
          total={32900}
          color="orange-500"
        />
        <hr className="text-gray-300" />

        <EmissionProgressComponent
          data={emissionsData}
          title="Scope 2: Indirect Energy Emissions"
          total={30900}
          color="blue-500"
        />
        <hr className="text-gray-300" />

        <EmissionProgressComponent
          data={emissionsData}
          title="Scope 3: Value Chain Emissions"
          total={44900}
          color="purple-500"
        />
      </div>

      {breakdown.length > 0 ? (
        <FullReportSummary data={transformFuelBreakdownData(breakdown)} />
      ) : (
        <div className="text-center text-gray-500 py-4 bg-gray-50 rounded">
          No emission source breakdown data available
        </div>
      )}
    </motion.div>
  );
}
