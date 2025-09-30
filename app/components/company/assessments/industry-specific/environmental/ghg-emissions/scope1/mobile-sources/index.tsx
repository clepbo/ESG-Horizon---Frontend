"use client";

import { useState } from "react";
import { RoadTransport } from "./RoadTransport";
import { VehicleEquipment } from "./VehicleEquipment";
import { MarineAviation } from "./MarineAviation";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";

interface MobileSourcesFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = ["Road Transport", "Vehicle Equipment", "Marine & Aviation"];
type StepKey = "road-transport" | "vehicle-equipment" | "marine-aviation";

export function MobileSourcesForm({
  onBack,
  onContinueToNextAssessment,
}: MobileSourcesFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("road-transport");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Mobile Sources"
        sectionKey="mobileSources"
        totals={totals ?? undefined}
        nextAssessment="Process Emissions"
        onContinue={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentStep === "road-transport") {
    return (
      <RoadTransport
        onBack={onBack}
        onNext={() => setCurrentStep("vehicle-equipment")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "vehicle-equipment") {
    return (
      <VehicleEquipment
        onBack={() => setCurrentStep("road-transport")}
        onNext={() => setCurrentStep("marine-aviation")}
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
      />
    );
  }

  if (currentStep === "marine-aviation") {
    return (
      <MarineAviation
        onBack={() => setCurrentStep("vehicle-equipment")}
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
