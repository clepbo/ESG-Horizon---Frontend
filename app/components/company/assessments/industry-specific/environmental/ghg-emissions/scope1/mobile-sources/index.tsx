"use client";

import { useState } from "react";
import { RoadTransport } from "./RoadTransport";
import { VehicleEquipment } from "./VehicleEquipment";
import { MarineAviation } from "./MarineAviation";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface MobileSourcesFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
}

const steps = ["Road Transport", "Vehicle Equipment", "Marine & Aviation"];
type StepKey = "road-transport" | "vehicle-equipment" | "marine-aviation";

export function MobileSourcesForm({ onBack, onContinueToNextAssessment }: MobileSourcesFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("road-transport");
  const [showSuccess, setShowSuccess] = useState(false);

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Mobile Sources"
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
        stepIndex={1}
        totalSteps={steps.length}
        percent={Math.round((1 / steps.length) * 100)}
      />
    );
  }

  if (currentStep === "vehicle-equipment") {
    return (
      <VehicleEquipment
        onBack={() => setCurrentStep("road-transport")}
        onNext={() => setCurrentStep("marine-aviation")}
        stepIndex={2}
        totalSteps={steps.length}
        percent={Math.round((2 / steps.length) * 100)}
      />
    );
  }

  if (currentStep === "marine-aviation") {
    return (
      <MarineAviation
        onBack={() => setCurrentStep("vehicle-equipment")}
        onSubmit={() => setShowSuccess(true)}
        stepIndex={3}
        totalSteps={steps.length}
        percent={Math.round((3 / steps.length) * 100)}
      />
    );
  }

  return null;
}