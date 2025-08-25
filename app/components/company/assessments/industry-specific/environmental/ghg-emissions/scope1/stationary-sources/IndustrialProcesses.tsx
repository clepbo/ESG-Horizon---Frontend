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
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { ProgressIndicator } from "@/app/components/ui/progress-indicator";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface IndustrialProcessesFormProps {
    onBack: () => void;
    onNext: () => void;
    currentStep: number;
    stepIndex: number;
    totalSteps: number;
    percent: number;
}

const steps = ["Electricity & Heat", "Industrial Processes", "Oil & Gas"];
const fuelTypes = [
    "Natural Gas",
    "Diesel",
    "Heavy Fuel Oil",
    "Coal",
    "Biomass",
    "LPG",
];

export function IndustrialProcessesForm({
    onBack,
    onNext,
    stepIndex,
    totalSteps,
    percent,
}: IndustrialProcessesFormProps) {
    const { state, dispatch } = useAssessment();
    const [selectedFuelType, setSelectedFuelType] = useState("");
    const [otherFuelType, setOtherFuelType] = useState("");
    const [fuelVolume, setFuelVolume] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<{
        fuelType?: string;
        fuelVolume?: string;
        otherFuelType?: string;
    }>({});

    useEffect(() => {
        const existingData =
            state.assessmentData.stationarySources?.industrialProcesses ||
            JSON.parse(
                localStorage.getItem("stationarySources.industrialProcesses") ||
                    "{}"
            );
        if (existingData) {
            setSelectedFuelType(existingData.selectedFuelType || "");
            setOtherFuelType(existingData.otherFuelType || "");
            setFuelVolume(existingData.fuelVolume || "");
        }
    }, [state.assessmentData.stationarySources?.industrialProcesses]);

    const validateForm = () => {
        const newErrors: {
            fuelType?: string;
            fuelVolume?: string;
            otherFuelType?: string;
        } = {};
        if (!selectedFuelType) {
            newErrors.fuelType = "Please select a fuel type";
        }
        if (selectedFuelType === "other" && !otherFuelType) {
            newErrors.otherFuelType = "Please specify the fuel type";
        }
        if (!fuelVolume) {
            newErrors.fuelVolume = "Please enter the fuel volume";
        } else if (isNaN(Number(fuelVolume)) || Number(fuelVolume) < 0) {
            newErrors.fuelVolume = "Please enter a valid positive number";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAndContinue = () => {
        if (!validateForm()) return;

        setIsSaving(true);
        const payload = { selectedFuelType, otherFuelType, fuelVolume };
        dispatch({
            type: "UPDATE_STATIONARY_INDUSTRIAL",
            payload,
        });
        dispatch({ type: "SAVE_PROGRESS" });
        localStorage.setItem(
            "stationarySources.industrialProcesses",
            JSON.stringify(payload)
        );
        setIsSaving(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleNext = () => {
        if (!validateForm()) return;
        dispatch({
            type: "UPDATE_STATIONARY_INDUSTRIAL",
            payload: { selectedFuelType, otherFuelType, fuelVolume },
        });
        localStorage.setItem(
            "stationarySources.industrialProcesses",
            JSON.stringify({ selectedFuelType, otherFuelType, fuelVolume })
        );
        onNext();
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex items-center gap-2 bg-transparent"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">
                            Section {stepIndex} of {totalSteps}
                        </span>
                        <span className="text-sm font-medium text-gray-500">
                            {percent}% complete
                        </span>
                    </div>
                    <div className="w-full h-3 bg-green-300 rounded-lg">
                        <div
                            className="h-3 bg-green-800 rounded transition-all duration-300"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Industrial Processes
                    </h1>
                    <p className="text-muted-foreground">
                        Specify boiler and furnace fuel types and consumption
                        volumes
                    </p>
                    {state.lastSaved && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Last saved: {state.lastSaved.toLocaleString()}
                        </p>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Boiler & Furnace Fuel Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Select Fuel Type</Label>
                            <RadioGroup
                                value={selectedFuelType}
                                onValueChange={(value) => {
                                    setSelectedFuelType(value);
                                    if (errors.fuelType)
                                        setErrors((prev) => ({
                                            ...prev,
                                            fuelType: undefined,
                                        }));
                                }}
                                className={
                                    errors.fuelType
                                        ? "border-red-500 p-2 rounded"
                                        : ""
                                }
                            >
                                {fuelTypes.map((fuel) => (
                                    <div
                                        key={fuel}
                                        className="flex items-center space-x-2"
                                    >
                                        <RadioGroupItem
                                            value={fuel}
                                            id={fuel}
                                        />
                                        <Label htmlFor={fuel}>{fuel}</Label>
                                    </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="other" />
                                    <Label htmlFor="other">Other</Label>
                                </div>
                            </RadioGroup>
                            {errors.fuelType && (
                                <p className="text-sm text-red-500">
                                    {errors.fuelType}
                                </p>
                            )}
                        </div>

                        {selectedFuelType === "other" && (
                            <div className="space-y-2">
                                <Label htmlFor="other-fuel">
                                    Specify Other Fuel Type
                                </Label>
                                <Input
                                    id="other-fuel"
                                    placeholder="Enter fuel type"
                                    value={otherFuelType}
                                    onChange={(e) => {
                                        setOtherFuelType(e.target.value);
                                        if (errors.otherFuelType)
                                            setErrors((prev) => ({
                                                ...prev,
                                                otherFuelType: undefined,
                                            }));
                                    }}
                                    className={
                                        errors.otherFuelType
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                    }
                                />
                                {errors.otherFuelType && (
                                    <p className="text-sm text-red-500">
                                        {errors.otherFuelType}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fuel-volume">
                                Volume of Fuel Consumed (Litres)
                            </Label>
                            <Input
                                id="fuel-volume"
                                type="number"
                                placeholder="Enter volume in litres"
                                value={fuelVolume}
                                onChange={(e) => {
                                    setFuelVolume(e.target.value);
                                    if (errors.fuelVolume)
                                        setErrors((prev) => ({
                                            ...prev,
                                            fuelVolume: undefined,
                                        }));
                                }}
                                className={
                                    errors.fuelVolume
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                }
                            />
                            {errors.fuelVolume && (
                                <p className="text-sm text-red-500">
                                    {errors.fuelVolume}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4 pt-6">
                            <Button variant="outline" onClick={onBack}>
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSaveAndContinue}
                                disabled={isSaving}
                                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
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
                                className="bg-green-600 hover:bg-green-700 text-white"
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
