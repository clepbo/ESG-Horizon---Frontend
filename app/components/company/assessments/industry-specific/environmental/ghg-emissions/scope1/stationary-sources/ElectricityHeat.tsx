"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
    ArrowLeft,
    Save,
    CheckCircle2,
    CloudUpload,
    ArrowRight,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface ElectricityHeatFormProps {
    onBack: () => void;
    onNext: () => void;
    stepIndex: number;
    totalSteps: number;
    percent: number;
}

interface FileMetadata {
    name: string;
    size: number;
    lastModified: number;
}

const uploadFields = [
    "Gas supply invoices from suppliers",
    "Calibrated gas meter readings (scm or scf logs)",
    "Turbine operation logs (hours, efficiency)",
    "Fuel purchase receipts for diesel generators",
    "Generator capacity certificates (kVA rating)",
    "On-site storage/fuel tank logs",
];

export function ElectricityHeatForm({
    onBack,
    onNext,
    stepIndex,
    totalSteps,
    percent,
}: ElectricityHeatFormProps) {
    const { state, dispatch } = useAssessment();
    const [dieselFuelType, setDieselFuelType] = useState(
        "Diesel (Automotive Gas Oil - AGO)"
    );
    const [dieselVolume, setDieselVolume] = useState("");
    const [gasFuelType, setGasFuelType] = useState("Natural Gas");
    const [gasVolume, setGasVolume] = useState("");
    const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
        Object.fromEntries(uploadFields.map((field) => [field, null]))
    );
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<{
        dieselVolume?: string;
        gasVolume?: string;
        files?: string;
    }>({});

    useEffect(() => {
        const existingData =
            state.assessmentData.stationarySources?.electricityHeat ||
            JSON.parse(
                localStorage.getItem("stationarySources.electricityHeat") ||
                    "{}"
            );
        if (existingData) {
            setDieselFuelType(
                existingData.dieselFuelType ||
                    "Diesel (Automotive Gas Oil - AGO)"
            );
            setDieselVolume(existingData.dieselVolume || "");
            setGasFuelType(existingData.gasFuelType || "Natural Gas");
            setGasVolume(existingData.gasVolume || "");
            setFiles(
                existingData.files ||
                    Object.fromEntries(
                        uploadFields.map((field) => [field, null])
                    )
            );
        }
    }, [state.assessmentData.stationarySources?.electricityHeat]);

    const validateForm = () => {
        const newErrors: {
            dieselVolume?: string;
            gasVolume?: string;
            files?: string;
        } = {};
        if (!dieselVolume && !gasVolume) {
            newErrors.dieselVolume = "At least one volume field must be filled";
            newErrors.gasVolume = "At least one volume field must be filled";
        }
        if (
            dieselVolume &&
            (isNaN(Number(dieselVolume)) || Number(dieselVolume) < 0)
        ) {
            newErrors.dieselVolume = "Please enter a valid positive number";
        }
        if (gasVolume && (isNaN(Number(gasVolume)) || Number(gasVolume) < 0)) {
            newErrors.gasVolume = "Please enter a valid positive number";
        }
        if (!Object.values(files).some((file) => file !== null)) {
            newErrors.files = "Please upload at least one document";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (
        field: string,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    files: `File "${field}" exceeds 10MB limit`,
                }));
                return;
            }
            setFiles((prev) => ({
                ...prev,
                [field]: {
                    name: file.name,
                    size: file.size,
                    lastModified: file.lastModified,
                },
            }));
            if (errors.files) {
                setErrors((prev) => ({ ...prev, files: undefined }));
            }
        }
    };

    const handleSaveAndContinue = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        const payload = {
            dieselFuelType,
            dieselVolume,
            gasFuelType,
            gasVolume,
            files,
        };
        dispatch({
            type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
            payload,
        });
        dispatch({ type: "SAVE_PROGRESS" });
        localStorage.setItem(
            "stationarySources.electricityHeat",
            JSON.stringify(payload)
        );
        setIsSaving(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleNext = () => {
        if (!validateForm()) return;
        dispatch({
            type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
            payload: {
                dieselFuelType,
                dieselVolume,
                gasFuelType,
                gasVolume,
                files,
            },
        });
        localStorage.setItem(
            "stationarySources.electricityHeat",
            JSON.stringify({
                dieselFuelType,
                dieselVolume,
                gasFuelType,
                gasVolume,
                files,
            })
        );
        onNext();
    };

    return (
        <div className="min-h-screen bg-green-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-6 mb-4">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
                        aria-label="Go back to previous step"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h3 className="text-2xl font-semibold text-foreground">
                            Stationary Sources
                        </h3>
                        <p className="text-muted-foreground text-base">
                            Emissions from fixed facilities or equipment, such
                            as power plants or boilers
                        </p>
                    </div>
                </div>

                <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
                    <CardContent className="space-y-8">
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

                        <div>
                            <h4 className="text-xl font-medium text-foreground">
                                Electricity and Heat Generation
                            </h4>
                            <p className="text-muted-foreground text-base">
                                Emissions from producing electricity or heat,
                                whether for your own use or for sale to others.
                            </p>
                        </div>

                        {/* 1.1 Diesel-Powered Generators */}
                        <div>
                            <Label className="text-md font-medium mb-2 block">
                                1.1 Diesel-Powered Generators
                            </Label>
                            <div className="space-y-2 ml-6">
                                <Label>Type of Fuel</Label>
                                <RadioGroup
                                    value={dieselFuelType}
                                    onValueChange={setDieselFuelType}
                                    className="flex items-center space-x-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2 mb-5">
                                        <RadioGroupItem
                                            className="border border-gray-400"
                                            value="Diesel (Automotive Gas Oil - AGO)"
                                            id="diesel-ago"
                                            checked={
                                                dieselFuelType ===
                                                "Diesel (Automotive Gas Oil - AGO)"
                                            }
                                        />
                                        <Label
                                            htmlFor="diesel-ago"
                                            className="text-gray-700"
                                        >
                                            Diesel (Automotive Gas Oil - AGO)
                                        </Label>
                                    </div>
                                </RadioGroup>
                                <Label htmlFor="diesel-volume">
                                    Volume of Diesel Consumed (Litres)
                                </Label>
                                <Input
                                    id="diesel-volume"
                                    type="number"
                                    placeholder="Enter volume in litres"
                                    value={dieselVolume}
                                    onChange={(e) => {
                                        setDieselVolume(e.target.value);
                                        if (errors.dieselVolume) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                dieselVolume: undefined,
                                            }));
                                        }
                                    }}
                                    className={`w-full border-gray-400 ${
                                        errors.dieselVolume
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                    }`}
                                    aria-describedby={
                                        errors.dieselVolume
                                            ? "diesel-volume-error"
                                            : undefined
                                    }
                                />
                                {errors.dieselVolume && (
                                    <p
                                        id="diesel-volume-error"
                                        className="text-sm text-red-500"
                                    >
                                        {errors.dieselVolume}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 1.2 Gas-Fired Turbines */}
                        <div>
                            <Label className="text-md font-medium mb-2 block">
                                1.2 Gas-Fired Turbines
                            </Label>
                            <div className="space-y-2 ml-6">
                                <Label>Type of Fuel</Label>
                                <RadioGroup
                                    value={gasFuelType}
                                    onValueChange={setGasFuelType}
                                    className="flex items-center space-x-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2 mb-5">
                                        <RadioGroupItem
                                            className="border border-gray-400"
                                            value="Natural Gas"
                                            id="natural-gas"
                                            checked={
                                                gasFuelType === "Natural Gas"
                                            }
                                        />
                                        <Label
                                            htmlFor="natural-gas"
                                            className="text-gray-700"
                                        >
                                            Natural Gas
                                        </Label>
                                    </div>
                                </RadioGroup>
                                <Label htmlFor="gas-volume" className="mt-2">
                                    Volume of Gas Consumed (m³)
                                </Label>
                                <Input
                                    id="gas-volume"
                                    type="number"
                                    placeholder="Enter volume in cubic meters"
                                    value={gasVolume}
                                    onChange={(e) => {
                                        setGasVolume(e.target.value);
                                        if (errors.gasVolume) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                gasVolume: undefined,
                                            }));
                                        }
                                    }}
                                    className={`w-full border-gray-400 ${
                                        errors.gasVolume
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                    }`}
                                    aria-describedby={
                                        errors.gasVolume
                                            ? "gas-volume-error"
                                            : undefined
                                    }
                                />
                                {errors.gasVolume && (
                                    <p
                                        id="gas-volume-error"
                                        className="text-sm text-red-500"
                                    >
                                        {errors.gasVolume}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 1.3 Document/Evidence Upload */}
                        <div>
                            <Label className="text-md font-medium mb-2 block">
                                1.3 Document/Evidence Upload
                            </Label>
                            <div className="ml-6">
                                {errors.files && (
                                    <p className="text-sm text-red-500">
                                        {errors.files}
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {uploadFields.map((field) => (
                                        <div
                                            key={field}
                                            className="flex flex-col gap-2"
                                        >
                                            <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
                                                {field}
                                            </Label>
                                            <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all">
                                                <Label
                                                    htmlFor={`upload-${field
                                                        .replace(/\s/g, "-")
                                                        .toLowerCase()}`}
                                                    className="cursor-pointer flex flex-col items-center gap-2"
                                                >
                                                    <CloudUpload className="h-6 w-6 text-muted-foreground" />
                                                    <span className="text-xs text-gray-400 text-center">
                                                        Upload {field} (Max.
                                                        10MB)
                                                    </span>
                                                </Label>
                                                <Input
                                                    id={`upload-${field
                                                        .replace(/\s/g, "-")
                                                        .toLowerCase()}`}
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            field,
                                                            e
                                                        )
                                                    }
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    aria-label={`Upload ${field}`}
                                                />
                                                {files[field] && (
                                                    <p className="text-sm text-green-600 mt-2 text-center">
                                                        Uploaded:{" "}
                                                        {files[field]!.name}
                                                    </p>
                                                )}
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-8">
                            <Button
                                variant="outline"
                                onClick={onBack}
                                className="justify-self-start hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                aria-label="Previous step"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSaveAndContinue}
                                disabled={isSaving}
                                className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
                                aria-label="Save and continue later"
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
                                variant="outline"
                                onClick={handleNext}
                                disabled={isSaving}
                                className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                aria-label="Next step"
                            >
                                Next
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
