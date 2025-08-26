"use client";

import { useState } from "react";
import { ElectricityHeatForm } from "./ElectricityHeat";
import { IndustrialProcessesForm } from "./IndustrialProcesses";
import { OilGasOperations } from "./OilGasOperations";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface StationarySourcesFormProps {
    onBack: () => void;
    onContinueToNextAssessment: () => void;
}

const steps = ["Electricity & Heat", "Industrial Processes", "Oil & Gas"];
type StepKey = "electricity-heat" | "industrial-processes" | "oil-gas";


export function StationarySourcesForm({ onBack, onContinueToNextAssessment }: StationarySourcesFormProps) {
    const [currentStep, setCurrentStep] = useState<StepKey>("electricity-heat");
    const [showSuccess, setShowSuccess] = useState(false);


    if (showSuccess) {
        return (
            <SuccessScreen
                assessmentName="Stationary Sources"
                nextAssessment="Mobile Sources"
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
                totalSteps={steps.length}
                percent={Math.round((1 / steps.length) * 100)}
            />
        );
    }

    if (currentStep === "industrial-processes") {
        return (
            <IndustrialProcessesForm
                onBack={() => setCurrentStep("electricity-heat")}
                onNext={() => setCurrentStep("oil-gas")}
                stepIndex={2}
                totalSteps={steps.length}
                percent={Math.round((2 / steps.length) * 100)}
            />
        );
    }

    if (currentStep === "oil-gas") {
        return (
            <OilGasOperations
                onBack={() => setCurrentStep("industrial-processes")}
                onSubmit={() => setShowSuccess(true)}
                stepIndex={3}
                totalSteps={steps.length}
                percent={Math.round((3 / steps.length) * 100)}
            />
        );
    }

    return null;
}
