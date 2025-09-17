"use client";

import { useState } from "react";
import { VentingNaturalGas } from "./VentingNaturalGas";
import { HFCLeaks } from "./HFCLeaks";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface FugitiveEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = ["venting-natural-gas", "hfc-leaks"] as const;
type StepKey = (typeof steps)[number];

export function FugitiveEmissionsForm({
  onBack,
  onContinueToNextAssessment,
}: FugitiveEmissionsFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>(
    "venting-natural-gas"
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Fugitive Emissions"
        nextAssessment="Stationary Sources"
        onContinue={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentStep === "venting-natural-gas") {
    return (
      <VentingNaturalGas
        onBack={onBack}
        onNext={() => setCurrentStep("hfc-leaks")}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "hfc-leaks") {
    return (
      <HFCLeaks
        onBack={() => setCurrentStep("venting-natural-gas")}
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
}
