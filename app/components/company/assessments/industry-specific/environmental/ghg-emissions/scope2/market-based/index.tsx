"use client";

import { useState } from "react";
import { ElectricityIppsForm } from "./ElectricityIpps";
import { ElectricityEACForm } from "./ElectricityEac";
import { ResidualForm } from "./Residual";
import { CoolingSteamForm } from "./CoolingSteam";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface MarketBasedFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = [
  "Purchased Electricity (IPPs)",
  "Purchased Electricity (EACs/RECs)",
  "Purchased Residual",
  "Purchased Cooling/Steam",
];

type StepKey =
  | "electricityIPP"
  | "electricityEAC"
  | "residual"
  | "coolingSteam";

export function MarketBasedForm({
  onBack,
  onContinueToNextAssessment,
}: MarketBasedFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("electricityIPP");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Market Based"
        nextAssessment="Scope3"
        onContinue={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentStep === "electricityIPP") {
    return (
      <ElectricityIppsForm
        onBack={onBack}
        onNext={() => setCurrentStep("electricityEAC")}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "electricityEAC") {
    return (
      <ElectricityEACForm
        onBack={() => setCurrentStep("electricityIPP")}
        onNext={() => setCurrentStep("residual")}
        stepIndex={2}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "residual") {
    return (
      <ResidualForm
        onBack={() => setCurrentStep("electricityEAC")}
        onNext={() => setCurrentStep("coolingSteam")}
        stepIndex={3}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "coolingSteam") {
    return (
      <CoolingSteamForm
        onBack={() => setCurrentStep("residual")}
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

  return null;
}
