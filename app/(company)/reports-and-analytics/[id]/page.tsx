"use client";
import React from "react";
import ReportSummary from "../components/ReportSummary";
import ReportSummarySkeleton from "../components/skeleton/ReportSummarySkeleton";
import { motion } from "framer-motion";
import { useSingleReport } from "../components/service/useReport";
import { useParams } from "next/navigation";

export default function Pages() {
  const loading = false;

  const params = useParams();
  const data = useSingleReport(Number(params?.id));

  console.log(`Single Report Data, ${data.data}`);

  if (loading) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ReportSummarySkeleton />
      </React.Suspense>
    );
  }

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
      <ReportSummary
        reportingPeriod="January 2021 - June 2021"
        subsidiary="Dangote Sugar"
        status="In Progress"
        progress={70}
        totalEmissions={26230}
        scope1={16300}
        scope2={7500}
        scope3={3030}
      />
    </motion.div>
  );
}
