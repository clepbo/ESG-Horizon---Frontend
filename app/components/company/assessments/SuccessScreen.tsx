"use client";

import { Button } from "@/app/components/ui/button";
import { TotalsResponse } from "@/services/assessment.service";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
  onContinueAssessment,
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
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-primary rounded-xl shadow-2xl px-8 py-10 max-w-md w-full flex flex-col items-center animate-fade-in-slow">
        <CheckCircle className="h-16 w-16 text-white mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {type === "report" ? "Report Generated Successfully!" : `${assessmentName} Submitted!`}
        </h2>

        <p className="text-white mb-4 text-center">
          {type === "report"
            ? "Your assessment report has been successfully generated. You can now review the summary, explore detailed insights, or download the full report for your records."
            : `Your data for the ${assessmentName} metric has been saved successfully. Thank you for completing this step toward accurate ESG reporting.`}
        </p>

        {totals && (
          <p className="text-teal-700 bg-white mb-4 text-center p-3 rounded-lg font-semibold">
            Total Emissions for {assessmentName}
            <br />
            <span className="font-bold">
              {"="}
              {(sectionKey && totals?.totals?.breakdown?.[sectionKey]?.sum) ??
                totals?.totals?.sum ??
                0}{" "}
              tCO₂e
            </span>
          </p>
        )}

        {nextAssessment && type !== "report" && (
          <p className="text-white mb-6 text-center font-medium">
            Next Assessment: {nextAssessment}
          </p>
        )}

        <div className="w-full flex flex-col gap-3">
          {type !== "report" && (
            <Button
              className="w-full bg-white text-black font-semibold py-3 rounded-sm transition-all duration-300 hover:bg-gray-200 hover:cursor-pointer"
              onClick={handleViewReport}
            >
              View &amp; Download Report
            </Button>
          )}

          {type === "report" && (
            <Button
              className="w-full bg-white text-black font-semibold py-3 rounded-sm transition-all duration-300 hover:bg-gray-200 hover:cursor-pointer"
              onClick={handleViewReport}
            >
              View &amp; Download Report
            </Button>
          )}

          {onContinueAssessment && type !== "report" && (
            <Button
              className="w-full bg-primary hover:bg-teal-600 border border-white text-white font-semibold py-3 rounded-sm transition-all duration-300 hover:border-green-200 hover:cursor-pointer"
              variant="outline"
              onClick={onContinueAssessment}
            >
              Continue Assessment
            </Button>
          )}

          <Button
            className="w-full bg-primary hover:bg-teal-600 border border-white text-white font-semibold py-3 rounded-sm transition-all duration-300 hover:border-green-200 hover:cursor-pointer"
            variant="outline"
            onClick={handleBackToHub}
          >
            Go to Assessment Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
