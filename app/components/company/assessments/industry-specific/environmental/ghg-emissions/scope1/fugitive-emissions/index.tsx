"use client";

import { useState } from "react";
import { VentingNaturalGas } from "./VentingNaturalGas";
import { HFCLeaks } from "./HFCLeaks";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAutoCreateAssessment } from "@/hooks/useAutoCreateAssessment";

interface FugitiveEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
}

const steps = ["venting-natural-gas", "hfc-leaks"] as const;
type StepKey = (typeof steps)[number];

export function FugitiveEmissionsForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
}: FugitiveEmissionsFormProps) {
  useAutoCreateAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "venting-natural-gas");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Fugitive Emissions"
        sectionKey="fugitiveEmissions"
        totals={totals ?? undefined}
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
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "hfc-leaks") {
    return (
      <HFCLeaks
        onBack={() => setCurrentStep("venting-natural-gas")}
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
}
