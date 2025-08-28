"use client";

import { useState } from "react";
import { PurchasedElectricityForm } from "./PurchaseElectricity";
import { PurchasedCoolingForm } from "./PurchasedCooling";
import { PurchasedSteamForm } from "./PurchasedSteam";
import { PurchasedHeatingForm } from "./PurchasedHeating";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface LocationBasedFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = [
  "Purchased Electricity",
  "Purchased Cooling",
  "Purchased Steam",
  "Purchased Heating",
];
type StepKey = "electricity" | "cooling" | "steam" | "heating";

export function LocationBasedForm({
  onBack,
  onContinueToNextAssessment,
}: LocationBasedFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("electricity");
  const [showSuccess, setShowSuccess] = useState(false);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Location Based"
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
        stepIndex={1}
        totalSteps={steps.length}
        percent={Math.round(((1 - 1) / steps.length) * 100)}
      />
    );
  }

  if (currentStep === "cooling") {
    return (
      <PurchasedCoolingForm
        onBack={() => setCurrentStep("electricity")}
        onNext={() => setCurrentStep("steam")}
        stepIndex={2}
        totalSteps={steps.length}
        percent={Math.round(((2 - 1) / steps.length) * 100)}
      />
    );
  }

  if (currentStep === "steam") {
    return (
      <PurchasedSteamForm
        onBack={() => setCurrentStep("cooling")}
        onNext={() => setCurrentStep("heating")}
        stepIndex={3}
        totalSteps={steps.length}
        percent={Math.round(((3 - 1) / steps.length) * 100)}
      />
    );
  }

  if (currentStep === "heating") {
    return (
      <PurchasedHeatingForm
        onBack={() => setCurrentStep("steam")}
        onSubmit={() => setShowSuccess(true)}
        stepIndex={4}
        totalSteps={steps.length}
        percent={Math.round(((4 - 1) / steps.length) * 100)}
      />
    );
  }

  return null;
}
