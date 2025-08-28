"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    CloudUpload,
    ArrowLeft,
    ArrowRight,
    Save,
    CheckCircle2,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import type { AssessmentData } from "@/hooks/useAssessment";

interface VentingNaturalGasProps {
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

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const numericKeys = [
    "methane",
    "carbonDioxide",
    "ethane",
    "propane",
    "butanes",
    "wellheads",
    "nitrogen",
    "hydrogenSulfide",
    "others",
] as const;

const uploadFields = [
    "Venting event logs (time, duration, pressure)",
    "Simulation model outputs (when direct measurement missing)",
];

export function VentingNaturalGas({
    onBack,
    onNext,
    stepIndex,
    totalSteps,
    percent,
}: VentingNaturalGasProps) {
    const {
        state: { assessmentData },
        dispatch,
    } = useAssessment();

    const ventingNaturalGas =
        assessmentData.fugitiveEmissions?.ventingNaturalGas;

    const [formState, setFormState] = useState({
        volumeOfGasVented:
            ventingNaturalGas?.volumeOfGasVented?.toString() ?? "",
        methane: ventingNaturalGas?.methane?.toString() ?? "",
        carbonDioxide: ventingNaturalGas?.carbonDioxide?.toString() ?? "",
        ethane: ventingNaturalGas?.ethane?.toString() ?? "",
        propane: ventingNaturalGas?.propane?.toString() ?? "",
        butanes: ventingNaturalGas?.butanes?.toString() ?? "",
        wellheads: ventingNaturalGas?.wellheads?.toString() ?? "",
        nitrogen: ventingNaturalGas?.nitrogen?.toString() ?? "",
        hydrogenSulfide: ventingNaturalGas?.hydrogenSulfide?.toString() ?? "",
        others: ventingNaturalGas?.others?.toString() ?? "",
    });

    const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
        Object.fromEntries(uploadFields.map((field) => [field, null]))
    );

    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const existingData = assessmentData.fugitiveEmissions
            ?.ventingNaturalGas as NonNullable<
            AssessmentData["fugitiveEmissions"]
        >["ventingNaturalGas"];

        if (existingData) {
            setFormState({
                volumeOfGasVented:
                    existingData.volumeOfGasVented?.toString() ?? "",
                methane: existingData.methane?.toString() ?? "",
                carbonDioxide: existingData.carbonDioxide?.toString() ?? "",
                ethane: existingData.ethane?.toString() ?? "",
                propane: existingData.propane?.toString() ?? "",
                butanes: existingData.butanes?.toString() ?? "",
                wellheads: existingData.wellheads?.toString() ?? "",
                nitrogen: existingData.nitrogen?.toString() ?? "",
                hydrogenSulfide: existingData.hydrogenSulfide?.toString() ?? "",
                others: existingData.others?.toString() ?? "",
            });

            if (existingData.files) {
                setFiles(existingData.files);
            }
        }
    }, [assessmentData.fugitiveEmissions?.ventingNaturalGas]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^\d*\.?\d*$/.test(value)) {
            setFormState((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[name];
                    return copy;
                });
            }
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (
            !formState.volumeOfGasVented ||
            Number(formState.volumeOfGasVented) < 0
        ) {
            newErrors.volumeOfGasVented = "Value cannot be negative or empty";
        }

        numericKeys.forEach((key) => {
            const val = formState[key];
            if (val !== "") {
                const n = Number(val);
                if (isNaN(n) || n < 0 || n > 100) {
                    newErrors[key] = "Value must be between 0 and 100";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (
        field: string,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
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
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.files;
                    return newErrors;
                });
            }
        }
    };

    const handleSaveAndContinue = () => {
        if (!validateForm()) return;

        setIsSaving(true);
        const payload = {
            volumeOfGasVented: Number(formState.volumeOfGasVented),
            methane: Number(formState.methane),
            carbonDioxide: Number(formState.carbonDioxide),
            ethane: Number(formState.ethane),
            propane: Number(formState.propane),
            butanes: Number(formState.butanes),
            wellheads: Number(formState.wellheads),
            nitrogen: Number(formState.nitrogen),
            hydrogenSulfide: Number(formState.hydrogenSulfide),
            others: Number(formState.others),
            files,
        };

        dispatch({
            type: "UPDATE_FUGITIVE_VENTING",
            payload,
        });
        dispatch({ type: "SAVE_PROGRESS" });

        setIsSaving(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleNext = () => {
        if (!validateForm()) return;

        dispatch({
            type: "UPDATE_FUGITIVE_VENTING",
            payload: {
                volumeOfGasVented: Number(formState.volumeOfGasVented),
                methane: Number(formState.methane),
                carbonDioxide: Number(formState.carbonDioxide),
                ethane: Number(formState.ethane),
                propane: Number(formState.propane),
                butanes: Number(formState.butanes),
                wellheads: Number(formState.wellheads),
                nitrogen: Number(formState.nitrogen),
                hydrogenSulfide: Number(formState.hydrogenSulfide),
                others: Number(formState.others),
                files,
            },
        });

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
                            Fugitive Emissions
                        </h3>
                        <p className="text-muted-foreground text-base">
                            Venting of Natural Gas from Wells and Processing
                            Facilities.
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
                                Venting of Natural Gas
                            </h4>
                            <p className="text-muted-foreground text-base">
                                Emissions from venting natural gas from wells
                                and processing facilities.
                            </p>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleNext();
                            }}
                            className="space-y-6"
                        >
                            {/* Volume of Gas Vented */}
                            <div>
                                <Label className="text-md font-medium mb-2 block">
                                    1.1 Venting of Natural Gas from Wells and
                                    Processing Facilities
                                </Label>
                                <div className="space-y-4 ml-6">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="volumeOfGasVented"
                                            className="text-gray-700 text-sm font-medium"
                                        >
                                            Volume of Gas Vented (m³)
                                        </Label>
                                        <Input
                                            id="volumeOfGasVented"
                                            name="volumeOfGasVented"
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={formState.volumeOfGasVented}
                                            onChange={handleChange}
                                            className={`w-full border-gray-400 rounded-lg ${
                                                errors.volumeOfGasVented
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            aria-invalid={
                                                !!errors.volumeOfGasVented
                                            }
                                            aria-describedby={
                                                errors.volumeOfGasVented
                                                    ? "volumeOfGasVented-error"
                                                    : undefined
                                            }
                                        />
                                        {errors.volumeOfGasVented && (
                                            <p
                                                className="text-red-600 text-xs mt-1"
                                                id="volumeOfGasVented-error"
                                            >
                                                {errors.volumeOfGasVented}
                                            </p>
                                        )}
                                        <p className="text-gray-600 text-xs mt-1">
                                            Provide the measured or estimated
                                            volume of gas released.
                                        </p>
                                    </div>

                                    {/* Gas composition fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                        {numericKeys
                                            .slice(0, -1)
                                            .map((field) => (
                                                <div
                                                    key={field}
                                                    className="flex flex-col"
                                                >
                                                    <Label
                                                        htmlFor={field}
                                                        className="text-gray-700 text-sm font-medium"
                                                    >
                                                        {field
                                                            .replace(
                                                                /([A-Z])/g,
                                                                " $1"
                                                            )
                                                            .replace(
                                                                /^./,
                                                                (str) =>
                                                                    str.toUpperCase()
                                                            )}{" "}
                                                        %
                                                    </Label>
                                                    <Input
                                                        id={field}
                                                        name={field}
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step="any"
                                                        value={formState[field]}
                                                        onChange={handleChange}
                                                        className={`w-full border-gray-400 rounded-lg ${
                                                            errors[field]
                                                                ? "border-red-500 focus:border-red-500"
                                                                : ""
                                                        }`}
                                                        aria-invalid={
                                                            !!errors[field]
                                                        }
                                                        aria-describedby={
                                                            errors[field]
                                                                ? `${field}-error`
                                                                : undefined
                                                        }
                                                    />
                                                    {errors[field] && (
                                                        <p
                                                            className="text-red-600 text-xs mt-1"
                                                            id={`${field}-error`}
                                                        >
                                                            {errors[field]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        {/* Others full width */}
                                        <div className="col-span-full flex flex-col">
                                            <Label
                                                htmlFor="others"
                                                className="text-gray-700 text-sm font-medium"
                                            >
                                                Others %
                                            </Label>
                                            <Input
                                                id="others"
                                                name="others"
                                                type="number"
                                                min={0}
                                                max={100}
                                                step="any"
                                                value={formState.others}
                                                onChange={handleChange}
                                                className={`w-full border-gray-400 rounded-lg ${
                                                    errors.others
                                                        ? "border-red-500 focus:border-red-500"
                                                        : ""
                                                }`}
                                                aria-invalid={!!errors.others}
                                                aria-describedby={
                                                    errors.others
                                                        ? "others-error"
                                                        : undefined
                                                }
                                            />
                                            {errors.others && (
                                                <p
                                                    className="text-red-600 text-xs mt-1"
                                                    id="others-error"
                                                >
                                                    {errors.others}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 1.2 Document/Evidence Upload */}
                            <div>
                                <Label className="text-md font-medium mb-2 block">
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
                                                <Label className="text-sm font-medium text-gray-700 mb-1 ml-1">
                                                    {field}
                                                </Label>
                                                <Card className="p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-green-500 transition-all h-full">
                                                    <Label
                                                        htmlFor={`upload-${field
                                                            .replace(/\s/g, "-")
                                                            .toLowerCase()}`}
                                                        className="cursor-pointer flex flex-col items-center gap-2"
                                                    >
                                                        <CloudUpload className="h-6 w-6 text-muted-foreground" />
                                                        <span className="text-xs text-gray-400 text-center">
                                                            Upload{" "}
                                                            {
                                                                field.split(
                                                                    " "
                                                                )[0]
                                                            }{" "}
                                                            (Max. 10MB)
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
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
