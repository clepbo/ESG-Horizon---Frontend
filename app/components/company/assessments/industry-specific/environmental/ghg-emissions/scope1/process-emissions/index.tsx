"use client";

import { useState } from "react";
import { CementManufacturing } from "./CementManufacturing";
import { GasFlaring } from "./GasFlaring";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAutoCreateAssessment } from "@/hooks/useAutoCreateAssessment";

interface ProcessEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
}

const steps = ["Cement Manufacturing", "Gas Flaring"];

type StepKey = "cement-manufacturing" | "gas-flaring";

export function ProcessEmissionsForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
}: ProcessEmissionsFormProps) {
  useAutoCreateAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "cement-manufacturing");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Process Emissions"
        sectionKey="processEmissions"
        totals={totals ?? undefined}
        nextAssessment="Fugitive Emissions"
        onContinue={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentStep === "cement-manufacturing") {
    return (
      <CementManufacturing
        onBack={onBack}
        onNext={() => setCurrentStep("gas-flaring")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "gas-flaring") {
    return (
      <GasFlaring
        onBack={() => setCurrentStep("cement-manufacturing")}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
          setIsSubmitted(true);
        }}
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
      />
    );
  }
  return null;
}
