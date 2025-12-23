"use client";
import React from "react";
import { motion } from "framer-motion";
// import { useParams } from "next/navigation";
import NewReportSummary from "../components/newReport/NewReportSummary";

export default function Pages() {
  // const params = useParams();
  // const { data, isLoading, error } = useSingleReport(Number(params?.id));

  // Proper logging

  // if (isLoading) {
  //   return (
  //     <React.Suspense fallback={<div>Loading...</div>}>
  //       <ReportSummarySkeleton />
  //     </React.Suspense>
  //   );
  // }

  // if (error) {
  //   return <div>Error loading report</div>;
  // }

  // if (!data) {
  //   return <div>No report data found</div>;
  // }

  // Use the actual data from your API response
  return (
    <motion.div
      className="grid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      {/* <ReportSummary reportData={data} /> */}
      <NewReportSummary />
    </motion.div>
  );
}
