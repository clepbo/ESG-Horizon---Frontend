"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { ProgressIndicator } from "@/app/components/ui/progress-indicator";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface ElectricityHeatFormProps {
    onBack: () => void;
    onNext: () => void;
}

const steps = ["Electricity & Heat", "Industrial Processes", "Oil & Gas"];

export function ElectricityHeatForm({
    onBack,
    onNext,
}: ElectricityHeatFormProps) {
    const { state, dispatch } = useAssessment();
    const [dieselVolume, setDieselVolume] = useState("");
    const [gasVolume, setGasVolume] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<{ diesel?: string; gas?: string }>({});

    useEffect(() => {
        const existingData =
            state.assessmentData.stationarySources?.electricityHeat;
        if (existingData) {
            setDieselVolume(existingData.dieselVolume || "");
            setGasVolume(existingData.gasVolume || "");
        }
    }, [state.assessmentData.stationarySources?.electricityHeat]);

    const validateForm = () => {
        const newErrors: { diesel?: string; gas?: string } = {};

        if (
            dieselVolume &&
            (isNaN(Number(dieselVolume)) || Number(dieselVolume) < 0)
        ) {
            newErrors.diesel = "Please enter a valid positive number";
        }

        if (gasVolume && (isNaN(Number(gasVolume)) || Number(gasVolume) < 0)) {
            newErrors.gas = "Please enter a valid positive number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAndContinue = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        setTimeout(() => {
            dispatch({
                type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
                payload: { dieselVolume, gasVolume },
            });
            dispatch({ type: "SAVE_PROGRESS" });
            setIsSaving(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        }, 1000);
    };

    const handleNext = () => {
        if (!validateForm()) return;

        dispatch({
            type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
            payload: { dieselVolume, gasVolume },
        });
        onNext();
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex items-center gap-2 bg-transparent transition-colors hover:bg-accent"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Electricity & Heat Generation
                    </h1>
                    <p className="text-muted-foreground">
                        Input data for diesel powered generators and gas fired
                        turbines
                    </p>
                    {state.lastSaved && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Last saved: {state.lastSaved.toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Progress Indicator */}
                <ProgressIndicator steps={steps} currentStep={0} />

                {/* Form */}
                <Card className="animate-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle>Fuel Consumption Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="diesel-volume">
                                Diesel Powered Generator (Litres)
                            </Label>
                            <Input
                                id="diesel-volume"
                                type="number"
                                placeholder="Enter volume in litres"
                                value={dieselVolume}
                                onChange={(e) => {
                                    setDieselVolume(e.target.value);
                                    if (errors.diesel)
                                        setErrors((prev) => ({
                                            ...prev,
                                            diesel: undefined,
                                        }));
                                }}
                                className={
                                    errors.diesel
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                }
                            />
                            {errors.diesel && (
                                <p className="text-sm text-red-500">
                                    {errors.diesel}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gas-volume">
                                Gas Fired Turbine (m³)
                            </Label>
                            <Input
                                id="gas-volume"
                                type="number"
                                placeholder="Enter volume in cubic meters"
                                value={gasVolume}
                                onChange={(e) => {
                                    setGasVolume(e.target.value);
                                    if (errors.gas)
                                        setErrors((prev) => ({
                                            ...prev,
                                            gas: undefined,
                                        }));
                                }}
                                className={
                                    errors.gas
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                }
                            />
                            {errors.gas && (
                                <p className="text-sm text-red-500">
                                    {errors.gas}
                                </p>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-6">
                            <Button
                                variant="outline"
                                onClick={onBack}
                                className="transition-colors bg-transparent"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSaveAndContinue}
                                disabled={isSaving}
                                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 transition-colors"
                            >
                                {isSaving ? (
                                    <>
                                        <LoadingSpinner
                                            size="sm"
                                            className="mr-2"
                                        />
                                        Saving...
                                    </>
                                ) : showSaveSuccess ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save & Continue Later
                                    </>
                                )}
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                                onClick={handleNext}
                                disabled={isSaving}
                            >
                                Next
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
