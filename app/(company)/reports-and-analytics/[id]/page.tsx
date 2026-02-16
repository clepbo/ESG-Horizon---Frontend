"use client";

import React from "react";
import { motion } from "framer-motion";
import NewReportSummary from "../components/newReport/NewReportSummary";

export default function ReportDetailPage() {
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
      <NewReportSummary />
    </motion.div>
  );
}
