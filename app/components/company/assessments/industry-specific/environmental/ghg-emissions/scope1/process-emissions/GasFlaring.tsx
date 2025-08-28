"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    ArrowLeft,
    Save,
    CheckCircle2,
    CloudUpload,
    ArrowRight,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import type { AssessmentData } from "@/hooks/useAssessment";

interface GasFlaringProps {
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
    "Flare gas meter logs",
    "Gas composition analysis reports",
    "Flare efficiency studies or default values",
    "Regulatory submissions",
];

interface GasFlaringData {
    gasVolume?: number;
    carbonContent?: number;
    files?: { [key: string]: FileMetadata | null };
}

export function GasFlaring({
    onBack,
    onNext,
    stepIndex,
    totalSteps,
    percent,
}: GasFlaringProps) {
    const { state, dispatch } = useAssessment();
    const [gasVolume, setGasVolume] = useState<number>(0);
    const [carbonContent, setCarbonContent] = useState<number>(0);
    const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
        Object.fromEntries(uploadFields.map((field) => [field, null]))
    );
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<{
        gasVolume?: string;
        carbonContent?: string;
        files?: string;
    }>({});

    // useEffect(() => {
    //     const existingData = (state.assessmentData.processEmissions
    //         ?.gasFlaring ?? {}) as GasFlaringData;
    //     setGasVolume(existingData.gasVolume ?? 0);
    //     setCarbonContent(existingData.carbonContent ?? 0);
    //     setFiles(
    //         existingData.files ??
    //             Object.fromEntries(uploadFields.map((field) => [field, null]))
    //     );
    // }, [state.assessmentData.processEmissions?.gasFlaring]);

    useEffect(() => {
        const existingData = state.assessmentData.processEmissions
            ?.gasFlaring as NonNullable<
            AssessmentData["processEmissions"]
        >["gasFlaring"];
        if (existingData) {
            setGasVolume(existingData.gasVolume ?? 0);
            setCarbonContent(existingData.carbonContent ?? 0);
            setFiles(
                existingData.files ??
                    Object.fromEntries(
                        uploadFields.map((field) => [field, null])
                    )
            );
        }
    }, [state.assessmentData.processEmissions?.gasFlaring]);

    const validateForm = () => {
        const newErrors: {
            gasVolume?: string;
            carbonContent?: string;
            files?: string;
        } = {};
        if (gasVolume <= 0) {
            newErrors.gasVolume =
                "Please enter a positive volume of gas flared";
        }
        if (carbonContent <= 0 || carbonContent > 100) {
            newErrors.carbonContent = "Please enter a valid percentage (0-100)";
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
            setErrors((prev) => ({ ...prev, files: undefined }));
        }
    };

    const handleSaveAndContinue = () => {
        if (!validateForm()) return;
        setIsSaving(true);
        dispatch({
            type: "UPDATE_PROCESS_GAS_FLARING",
            payload: { gasVolume, carbonContent, files },
        });
        dispatch({ type: "SAVE_PROGRESS" });
        setIsSaving(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleNext = () => {
        if (!validateForm()) return;
        handleSaveAndContinue();
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
                        <h3 className="text-2xl font-bold text-foreground">
                            Process Emissions
                        </h3>
                        <p className="text-muted-foreground text-base">
                            Greenhouse gases released during industrial or
                            chemical processes, not from fuel combustion.
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
                            <Label className="text-md font-semibold mb-2 block">
                                1.1 Gas Flaring
                            </Label>
                            <div className="space-y-4 ml-6">
                                <div className="space-y-2">
                                    <Label htmlFor="gas-volume">
                                        Volume of Gas Flared (m³)
                                    </Label>
                                    <Input
                                        id="gas-volume"
                                        type="number"
                                        placeholder="Enter volume of gas flared"
                                        value={gasVolume || ""}
                                        onChange={(e) => {
                                            setGasVolume(
                                                Number(e.target.value)
                                            );
                                            setErrors((prev) => ({
                                                ...prev,
                                                gasVolume: undefined,
                                            }));
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
                                <div className="space-y-2">
                                    <Label htmlFor="carbon-content">
                                        Carbon Content/Composition (% by volume)
                                    </Label>
                                    <Input
                                        id="carbon-content"
                                        type="number"
                                        placeholder="Enter carbon content percentage"
                                        value={carbonContent || ""}
                                        onChange={(e) => {
                                            setCarbonContent(
                                                Number(e.target.value)
                                            );
                                            setErrors((prev) => ({
                                                ...prev,
                                                carbonContent: undefined,
                                            }));
                                        }}
                                        className={`w-full border-gray-400 ${
                                            errors.carbonContent
                                                ? "border-red-500 focus:border-red-500"
                                                : ""
                                        }`}
                                        aria-describedby={
                                            errors.carbonContent
                                                ? "carbon-content-error"
                                                : undefined
                                        }
                                    />
                                    {errors.carbonContent && (
                                        <p
                                            id="carbon-content-error"
                                            className="text-sm text-red-500"
                                        >
                                            {errors.carbonContent}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Label className="text-md font-semibold mb-2 block">
                                1.2 Document/Evidence Upload
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
                                            <Label className="text-sm font-medium mb-1 ml-1">
                                                {field}
                                            </Label>
                                            <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
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
                                                    <p className="text-sm text-green-600 mt-2 text-center truncate">
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
