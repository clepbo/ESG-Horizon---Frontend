"use client";

import { useState } from "react";
import { ElectricityIppsForm } from "./ElectricityIpps";
import { ElectricityEACForm } from "./ElectricityEac";
import { ResidualForm } from "./Residual";
import { CoolingSteamForm } from "./CoolingSteam";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";

interface MarketBasedFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
}

const steps = [
  "Purchased Electricity (IPPs)",
  "Purchased Electricity (EACs/RECs)",
  "Purchased Residual",
  "Purchased Cooling/Steam",
];

type StepKey = "electricityIPP" | "electricityEAC" | "residual" | "coolingSteam";

export function MarketBasedForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
}: MarketBasedFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "electricityIPP");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Market Based"
        sectionKey="marketBased"
        totals={totals ?? undefined}
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
        onBackToHub={onBack}
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
        onBackToHub={onBack}
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
        onBackToHub={onBack}
        stepIndex={3}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "coolingSteam") {
    return (
      <CoolingSteamForm
        onBack={() => setCurrentStep("residual")}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
          setIsSubmitted(true);
        }}
        onBackToHub={onBack}
        stepIndex={4}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
      />
    );
  }

  return null;
}
