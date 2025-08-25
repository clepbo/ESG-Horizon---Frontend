"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CheckCircle } from "lucide-react";
import { ElectricityHeatForm } from "./ElectricityHeat";
import { IndustrialProcessesForm } from "./IndustrialProcesses";
import { OilGasSubsidiariesForm } from "./OilGasOperations";


interface StationarySourcesFormProps {
    onBack: () => void;
}

const steps = ["Electricity & Heat", "Industrial Processes", "Oil & Gas"];
type StepKey = "electricity-heat" | "industrial-processes" | "oil-gas";

export function StationarySourcesForm({ onBack }: StationarySourcesFormProps) {
    const [currentStep, setCurrentStep] = useState<StepKey>("electricity-heat");
    const [showSuccess, setShowSuccess] = useState(false);


    if (showSuccess) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="text-center py-12 animate-in fade-in-50 duration-500">
                        <CardContent className="space-y-6">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-in zoom-in-50 duration-700" />
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-foreground">
                                    Assessment Completed!
                                </h2>
                                <p className="text-muted-foreground">
                                    You have successfully completed the
                                    assessment of this metric.
                                </p>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                                    onClick={() => setShowSuccess(false)}
                                >
                                    Continue with Assessment
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onBack}
                                    className="transition-colors bg-transparent"
                                >
                                    Return to Assessment Hub
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (currentStep === "electricity-heat") {
        return (
            <ElectricityHeatForm
                onBack={onBack}
                onNext={() => setCurrentStep("industrial-processes")}
                // currentStep={0}
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
                currentStep={1}
                stepIndex={2}
                totalSteps={steps.length}
                percent={Math.round((2 / steps.length) * 100)}
            />
        );
    }

    if (currentStep === "oil-gas") {
        return (
            <OilGasSubsidiariesForm
                onBack={() => setCurrentStep("industrial-processes")}
                onSubmit={() => setShowSuccess(true)}
                currentStep={2}
                stepIndex={3}
                totalSteps={steps.length}
                percent={Math.round((3 / steps.length) * 100)}
            />
        );
    }

    return null;
}
