"use client";

import { useState } from "react";
import { PurchasedElectricityForm } from "./PurchaseElectricity";
import { PurchasedCoolingForm } from "./PurchasedCooling";
import { PurchasedSteamForm } from "./PurchasedSteam";
import { PurchasedHeatingForm } from "./PurchasedHeating";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAutoCreateAssessment } from "@/hooks/useAutoCreateAssessment";

interface LocationBasedFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
}

const steps = [
  "Purchased Electricity",
  "Purchased Cooling",
  "Purchased Steam",
  "Purchased Heating",
];
type StepKey = "electricity" | "cooling" | "steam" | "heating";

export function LocationBasedForm({ onBack, onContinueToNextAssessment, initialStep }: LocationBasedFormProps) {
  useAutoCreateAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "electricity");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Location Based"
        sectionKey="locationBased"
        totals={totals ?? undefined}
        nextAssessment="Market Based"
        onContinue={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentStep === "electricity") {
    return (
      <PurchasedElectricityForm
        onBack={onBack}
        onNext={() => setCurrentStep("cooling")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "cooling") {
    return (
      <PurchasedCoolingForm
        onBack={() => setCurrentStep("electricity")}
        onNext={() => setCurrentStep("steam")}
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "steam") {
    return (
      <PurchasedSteamForm
        onBack={() => setCurrentStep("cooling")}
        onNext={() => setCurrentStep("heating")}
        onBackToHub={onBack}
        stepIndex={3}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "heating") {
    return (
      <PurchasedHeatingForm
        onBack={() => setCurrentStep("steam")}
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
