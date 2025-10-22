"use client";
import React from "react";
import FullReport from "../../FullReport";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { motion } from "framer-motion";
export default function pages() {


  return (
    <motion.div
      className="grid w-full gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      <BackButton />
      <FullReport />
    </motion.div>
  );
}
