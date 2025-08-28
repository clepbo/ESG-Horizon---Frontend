"use client";

import { useState } from "react";
import { MethaneLeaks } from "./MethaneLeaks";
import { VentingNaturalGas } from "./VentingNaturalGas";
import { IncompleteFlareCombustion } from "./IncompleteFlareCombustion";
import { HFCLeaks } from "./HFCLeaks";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";

interface FugitiveEmissionsFormProps {
    onBack: () => void;
    onContinueToNextAssessment: () => void;
}

const steps = [
    "methane-leaks",
    "venting-natural-gas",
    "flare-combustion",
    "hfc-leaks",
] as const;
type StepKey = (typeof steps)[number];

export function FugitiveEmissionsForm({
    onBack,
    onContinueToNextAssessment,
}: FugitiveEmissionsFormProps) {
    const [currentStep, setCurrentStep] = useState<StepKey>("methane-leaks");
    const [showSuccess, setShowSuccess] = useState(false);

    const totalSteps = steps.length;

    if (showSuccess) {
        return (
            <SuccessScreen
                assessmentName="Fugitive Emissions"
                nextAssessment="Stationary Sources"
                onContinue={onContinueToNextAssessment}
                onBackToHub={onBack}
            />
        );
    }

    const stepIndex = steps.indexOf(currentStep) + 1;
    const percent = Math.round((stepIndex / totalSteps) * 100);

    function onNext() {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    }

    function onBackStep() {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        } else {
            onBack();
        }
    }

    function onSubmit() {
        setShowSuccess(true);
    }

    switch (currentStep) {
        case "methane-leaks":
            return (
                <MethaneLeaks
                    onBack={onBackStep}
                    onNext={onNext}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    percent={percent}
                />
            );
        case "venting-natural-gas":
            return (
                <VentingNaturalGas
                    onBack={onBackStep}
                    onNext={onNext}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    percent={percent}
                />
            );
        case "flare-combustion":
            return (
                <IncompleteFlareCombustion
                    onBack={onBackStep}
                    onNext={onNext}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    percent={percent}
                />
            );
        case "hfc-leaks":
            return (
                <HFCLeaks
                    onBack={onBackStep}
                    onSubmit={onSubmit}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    percent={percent}
                />
            );
        default:
            return null;
    }
}
