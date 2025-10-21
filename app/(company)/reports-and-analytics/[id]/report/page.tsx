"use client";
import React from "react";
import FullReport from "../../FullReport";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useSingleReport } from "../../components/service/useReport";
export default function pages() {

   const params = useParams();
    const { data, isLoading, error } = useSingleReport(Number(params?.id));
    console.log("REPOTR", data)
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
