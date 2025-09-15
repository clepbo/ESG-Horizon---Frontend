"use client";

import { useState } from "react";
import { CO2Release } from "./CO2Release";
import { FertilizerEmissions } from "./FertilizerEmissions";
import { GasFlaring } from "./GasFlaring";
import { EntericFermentation } from "./EntericFermentation";
import { MethaneNitrousOxide } from "./MethaneNitrousOxide";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface ProcessEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = [
  "CO₂ Release",
  "Fertilizer Emissions",
  "Gas Flaring",
  "Enteric Fermentation",
  "Methane & N₂O",
];

type StepKey =
  | "co2-release"
  | "fertilizer-emissions"
  | "gas-flaring"
  | "enteric-fermentation"
  | "methane-nitrous-oxide";

export function ProcessEmissionsForm({
  onBack,
  onContinueToNextAssessment,
}: ProcessEmissionsFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("co2-release");
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

  if (currentStep === "co2-release") {
    return (
      <CO2Release
        onBack={onBack}
        onNext={() => setCurrentStep("fertilizer-emissions")}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "fertilizer-emissions") {
    return (
      <FertilizerEmissions
        onBack={() => setCurrentStep("co2-release")}
        onNext={() => setCurrentStep("gas-flaring")}
        stepIndex={2}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "gas-flaring") {
    return (
      <GasFlaring
        onBack={() => setCurrentStep("fertilizer-emissions")}
        onNext={() => setCurrentStep("enteric-fermentation")}
        stepIndex={3}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "enteric-fermentation") {
    return (
      <EntericFermentation
        onBack={() => setCurrentStep("gas-flaring")}
        onNext={() => setCurrentStep("methane-nitrous-oxide")}
        stepIndex={4}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "methane-nitrous-oxide") {
    return (
      <MethaneNitrousOxide
        onBack={() => setCurrentStep("enteric-fermentation")}
        onSubmit={() => {
          setShowSuccess(true);
          setIsSubmitted(true);
        }}
        stepIndex={5}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
      />
    );
  }

  return null;
}
