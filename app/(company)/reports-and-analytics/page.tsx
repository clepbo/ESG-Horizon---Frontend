"use client";
import React from "react";
import Report from "./components/Report";
import HeadingAndSubheading from "@/app/components/common/reports/HeadingAndSubheading";
import { motion } from "framer-motion";
import { useReport } from "./components/service/useReport";
import ReportEmptyState from "./components/ReportEmptyState";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

export default function Page() {
  const report = useReport();

  if (report.isLoading) {
    return <LoadingSpinner />;
  }
  if (report.error) {
    return <div className="text-center my-20 text-gray-500">Error loading reports.</div>;
  }
  if (!report?.data || report.data.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <motion.div
      // className="grid gap-2 "
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      <HeadingAndSubheading
        heading="Reports"
        subheading="Access comprehensive insights into your company’s ESG performance"
      />
      <Report />
    </motion.div>
  );
}
