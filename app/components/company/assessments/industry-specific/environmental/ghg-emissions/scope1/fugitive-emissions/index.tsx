"use client";

import { useState } from "react";
import { MethaneLeaks } from "./MethaneLeaks";
import { VentingNaturalGas } from "./VentingNaturalGas";
import { IncompleteFlareCombustion } from "./IncompleteFlareCombustion";
import { HFCLeaks } from "./HFCLeaks";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface FugitiveEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = [
  "methane-leaks",
  "venting-natural-gas",
  "flare-combustion",
  "hfc-leaks",
] as const;
type StepKey = (typeof steps)[number];

export function FugitiveEmissionsForm({
  onBack,
  onContinueToNextAssessment,
}: FugitiveEmissionsFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("methane-leaks");
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

  if (currentStep === "methane-leaks") {
    return (
      <MethaneLeaks
        onBack={onBack}
        onNext={() => setCurrentStep("venting-natural-gas")}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }
  if (currentStep === "venting-natural-gas") {
    return (
      <VentingNaturalGas
        onBack={onBack}
        onNext={() => setCurrentStep("flare-combustion")}
        stepIndex={2}
        totalSteps={steps.length}
      />
    );
  }
  if (currentStep === "flare-combustion") {
    return (
      <IncompleteFlareCombustion
        onBack={onBack}
        onNext={() => setCurrentStep("hfc-leaks")}
        stepIndex={3}
        totalSteps={steps.length}
      />
    );
  }
  if (currentStep === "hfc-leaks") {
    return (
      <HFCLeaks
        onBack={() => setCurrentStep("flare-combustion")}
        onSubmit={() => {
          setShowSuccess(true);
          setIsSubmitted(true);
        }}
        stepIndex={4}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
      />
    );
  }
}
