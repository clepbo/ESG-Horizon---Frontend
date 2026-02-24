"use client";

import { Button } from "@/app/components/ui/button";
import { TotalsResponse } from "@/services/assessment.service";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatNumberFull } from "@/lib/numberFormat";

interface SuccessScreenProps {
  assessmentName: string;
  type?: "assessment" | "report";
  sectionKey?: string;
  nextAssessment?: string | null;
  totals?: TotalsResponse;
  onContinue?: () => void;
  onContinueAssessment?: () => void;
  onBackToHub?: () => void;
  reportId?: string | number;
}

export function SuccessScreen({
  assessmentName,
  type,
  sectionKey,
  nextAssessment,
  totals,
  onContinue,
  onBackToHub,
  reportId,
}: SuccessScreenProps) {
  const router = useRouter();

  const handleBackToHub = () => {
    if (onBackToHub) {
      onBackToHub();
    } else {
      router.push("/assessments");
    }
  };

  const handleViewReport = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push(`/reports-and-analytics/${reportId || ""}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#3C8D84] rounded-xl shadow-2xl px-8 py-10 max-w-md w-full flex flex-col items-center relative overflow-hidden"
      >
        {/* Animated Checkmark */}
        <div className="bg-white rounded-full p-4 mb-6 h-20 w-20 flex items-center justify-center shadow-lg">
          <svg
            className="w-10 h-10 text-[#3C8D84]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4 text-center leading-tight">
          {type === "report"
            ? "Report Generated Successfully!"
            : `${assessmentName}\nAssessment Submitted!`}
        </h2>

        <p className="text-white/90 mb-6 text-center text-sm leading-relaxed">
          {type === "report"
            ? "Your assessment report has been successfully generated. You can now review the summary, explore detailed insights, or download the full report for your records."
            : `Your data for the ${assessmentName} metric has been saved successfully. Thank you for completing this step toward accurate ESG reporting.`}
        </p>

        {totals && (
          <p className="text-[#3C8D84] bg-white mb-6 text-center p-3 rounded-lg font-semibold w-full text-sm">
            Total Emissions for {assessmentName}
            <br />
            <span className="font-bold text-lg">
              {"="}
              {formatNumberFull(
                Number(
                  (sectionKey && totals?.totals?.breakdown?.[sectionKey]?.sum) ??
                    totals?.totals?.sum ??
                    0
                ),
                { minimumFractionDigits: 2 }
              )}{" "}
              tCO₂e
            </span>
          </p>
        )}

        {nextAssessment && type !== "report" && (
          <p className="text-white mb-6 text-center text-base font-medium">
            Next Assessment: {nextAssessment}
          </p>
        )}

        <div className="w-full flex flex-col gap-3">
          <Button
            className="w-full bg-white text-[#3C8D84] hover:bg-gray-100 font-bold py-3 text-base rounded-md transition-all duration-200 shadow-md"
            onClick={handleViewReport}
          >
            View &amp; Download Report
          </Button>

          <Button
            className="w-full bg-transparent border border-white text-white hover:bg-white/10 font-medium py-3 text-base rounded-md transition-all duration-200"
            variant="outline"
            onClick={handleBackToHub}
          >
            Go to Assessment Hub
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
