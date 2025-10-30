"use client";
import React from "react";
import Report from "./components/Report";
import HeadingAndSubheading from "@/app/components/common/reports/HeadingAndSubheading";
import { motion } from "framer-motion";

export default function page() {
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
