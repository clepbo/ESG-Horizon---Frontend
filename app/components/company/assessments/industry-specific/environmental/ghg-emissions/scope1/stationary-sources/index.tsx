"use client";

import { useState } from "react";
import { ElectricityHeatForm } from "./ElectricityHeat";
import { IndustrialProcessesForm } from "./IndustrialProcesses";
import { OilGasOperations } from "./OilGasOperations";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";

interface StationarySourcesFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  onBackToHub: () => void;
  initialStep?: StepKey;
}

const steps = ["Electricity & Heat", "Industrial Processes", "Oil & Gas"];
type StepKey = "electricity-heat" | "industrial-processes" | "oil-gas";

export function StationarySourcesForm({
  onBack,
  onContinueToNextAssessment,
  onBackToHub,
  initialStep,
}: StationarySourcesFormProps) {
  const { state } = useAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "electricity-heat");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Stationary Sources"
        sectionKey="stationarySources"
        nextAssessment="Mobile Sources"
        totals={totals ?? undefined}
        onContinue={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentStep === "electricity-heat") {
    return (
      <ElectricityHeatForm
        onBack={onBack}
        onNext={() => setCurrentStep("industrial-processes")}
        stepIndex={1}
        onBackToHub={onBackToHub}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "industrial-processes") {
    return (
      <IndustrialProcessesForm
        onBack={() => setCurrentStep("electricity-heat")}
        onNext={() => setCurrentStep("oil-gas")}
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "oil-gas") {
    return (
      <OilGasOperations
        onBack={() => setCurrentStep("industrial-processes")}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
          setIsSubmitted(true);
        }}
        onBackToHub={onBack}
        stepIndex={3}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
      />
    );
  }

  return null;
}
