"use client";

import { useState } from "react";
import { CementManufacturing } from "./CementManufacturing";
import { GasFlaring } from "./GasFlaring";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface ProcessEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = ["Cement Manufacturing", "Gas Flaring"];

type StepKey = "cement-manufacturing" | "gas-flaring";

export function ProcessEmissionsForm({
  onBack,
  onContinueToNextAssessment,
}: ProcessEmissionsFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>(
    "cement-manufacturing"
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Process Emissions"
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
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "gas-flaring") {
    return (
      <GasFlaring
        onBack={() => setCurrentStep("cement-manufacturing")}
        onSubmit={() => {
          setShowSuccess(true);
          setIsSubmitted(true);
        }}
        stepIndex={2}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
      />
    );
  }
  return null;
}
