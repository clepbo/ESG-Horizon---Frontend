"use client";

import { Button } from "@/app/components/ui/button";
import { TotalsResponse } from "@/services/assessment.service";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessScreenProps {
  assessmentName: string;
  type?: "assessment" | "report";
  sectionKey?: string;
  nextAssessment: string | null;
  totals?: TotalsResponse;
  onContinue: () => void;
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
}: SuccessScreenProps) {
  const router = useRouter();
  const handleBackToHub = () => {
    router.push("/assessments/new-assessment");
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-primary)]  rounded-xl shadow-2xl px-8 py-10 max-w-md w-full flex flex-col items-center animate-fade-in-slow">
        <CheckCircle className="h-16 w-16 text-white mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {type === "report"
            ? "Report Generated Successfully!"
            : `${assessmentName} Assessment Submitted!`}
        </h2>
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
        <p className="text-white mb-4 text-center">
          {assessmentName.toLowerCase() === "report"
            ? "Your assessment report has been successfully generated. You can now review the summary, explore detailed insights, or download the full report for your records."
            : `Your data for the ${assessmentName} metric has been saved successfully. Thank you for completing this step toward accurate ESG reporting.`}
        </p>
        {nextAssessment && (
          <p className="text-white font-semibold mb-6 text-center">
            Next Assessment: {nextAssessment}
          </p>
        )}
        <div className="w-full flex flex-col gap-3">
          <Button
            className="w-full bg-white text-black font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-gray-200 hover:cursor-pointer"
            onClick={onContinue}
          >
            {nextAssessment ? "Continue to the next assessment" : "View Report"}
          </Button>
          <Button
            className="w-full bg-[var(--color-primary)]  hover:bg-teal-600 border border-white text-white font-semibold py-3 rounded-lg transition-all duration-300  hover:border-green-200 hover:cursor-pointer"
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
