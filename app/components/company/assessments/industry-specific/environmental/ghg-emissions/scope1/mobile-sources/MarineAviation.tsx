"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, X } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import {
    getFuelOptions,
    unitOptions,
    type FuelOption,
} from "@/lib/fuelDataFile";
import {
    AddSource,
    SourceData,
} from "@/app/components/company/assessments/AddSource";
import {
    AdditionalFileUpload,
    FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { TotalsResponse } from "@/services/assessment.service";
import {
    useSaveAssessment,
    useSubmitAssessment,
} from "@/services/hooks/assessment.hooks";

interface MarineAviationProps {
    onBack: () => void;
    onSubmit: (totals: TotalsResponse | null) => void;
    onBackToHub: () => void;
    stepIndex: number;
    totalSteps: number;
    isSubmitted: boolean;
}

const uploadFields = [
    "Vessel logbooks (fuel bunkered per trip)",
    "Supplier invoices (MGO/Jet A-1)",
    "Aviation fuel receipts",
    "Flight logs (distance, refueling events)",
];

export function MarineAviation({
    onBack,
    onSubmit,
    onBackToHub,
    stepIndex,
    totalSteps,
    isSubmitted,
}: MarineAviationProps) {
    const { state, dispatch } = useAssessment();
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
        Object.fromEntries(uploadFields.map((field) => [field, null]))
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{
        air?: string;
        marine?: string;
        files?: string;
    }>({});

    const airOptions = useMemo(() => getFuelOptions("air"), []);
    const marineOptions = useMemo(() => getFuelOptions("marine"), []);

    const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment();
    const { mutate: submitAssessment, isPending: isSubmitting } =
        useSubmitAssessment();

    const getInitialSources = (
        existingSources: SourceData[] | undefined,
        fuelOptions: FuelOption[]
    ) => {
        if (existingSources && existingSources.length > 0) {
            return existingSources;
        }
        const defaultFuel = fuelOptions[0] || {
            value: "",
            emissionFactor: 0,
            source: "N/A",
        };
        return [
            {
                id: "initial-" + Date.now().toString(),
                fuelType: defaultFuel.value,
                volume: "",
                unit: unitOptions[0]?.value || "",
                emissionFactor: defaultFuel.emissionFactor,
                source: defaultFuel.source,
            },
        ];
    };

    const [air, setAir] = useState<SourceData[]>(() =>
        getInitialSources(
            state.assessmentData.mobileSources?.marineAviation?.air,
            airOptions
        )
    );

    const [marine, setMarine] = useState<SourceData[]>(() =>
        getInitialSources(
            state.assessmentData.mobileSources?.marineAviation?.marine,
            marineOptions
        )
    );

    useEffect(() => {
        const existingData = state.assessmentData.mobileSources?.marineAviation;
        if (existingData) {
            setAir(existingData.air || getInitialSources([], airOptions));
            setMarine(
                existingData.marine || getInitialSources([], marineOptions)
            );
            setFiles(
                existingData.files ||
                    Object.fromEntries(
                        uploadFields.map((field) => [field, null])
                    )
            );
            setAdditionalFields(existingData.additionalFields || []);
        }
    }, [
        state.assessmentData.mobileSources?.marineAviation,
        airOptions,
        marineOptions,
    ]);

    const { filled, total } = useMemo(() => {
        const hasAirData = air.some(
            (s) => s.volume && parseFloat(s.volume.toString()) > 0
        );
        const hasMarineData = marine.some(
            (s) => s.volume && parseFloat(s.volume.toString()) > 0
        );
        const hasAdditionalFields = additionalFields.length > 0;
        const hasFileUploaded = Object.values(files).some(Boolean);
        const progressChecks = [
            hasAirData,
            hasMarineData,
            hasFileUploaded || hasAdditionalFields,
        ];

        return calculateProgress(progressChecks);
    }, [air, marine, files, additionalFields]);

    const validateForm = () => {
        const newErrors: {
            air?: string;
            marine?: string;
            files?: string;
        } = {};

        const hasValidAir = air.some((s) => s.volume && Number(s.volume) > 0);
        const hasValidMarine = marine.some(
            (s) => s.volume && Number(s.volume) > 0
        );

        if (!hasValidAir) {
            newErrors.air =
                "Please add at least one fuel source with a positive volume for air.";
        }

        if (!hasValidMarine) {
            newErrors.marine =
                "Please add at least one fuel source with a positive volume for marine.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = async (
        field: string,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                files: `File "${field}" exceeds 10MB limit`,
            }));
            return;
        }

        try {
            setUploading((prev) => ({ ...prev, [field]: true })); // start spinner

            const uploaded = await uploadService.uploadImage(file);

            if (uploaded?.url) {
                setFiles((prev) => ({
                    ...prev,
                    [field]: {
                        name: file.name,
                        size: file.size,
                        lastModified: file.lastModified,
                        url: uploaded.url,
                        publicId: uploaded.publicId,
                    },
                }));

                toast.success(`${file.name} uploaded successfully`);
            } else {
                toast.error("Failed to upload file");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error uploading file");
        } finally {
            setUploading((prev) => ({ ...prev, [field]: false })); // stop spinner
        }

        if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
    };

    const handleAdditionalFieldsChange = (fields: FileData[]) => {
        setAdditionalFields(fields);
    };

    const handleSaveAndContinue = () => {
        const { assessmentId } = state.assessmentData;

        if (!assessmentId) {
            toast.error("Cannot save: Assessment ID is missing.");
            return;
        }

        const payload = {
            air,
            marine,
            files,
            additionalFields: additionalFields as FileMetadata[],
        };

        dispatch({ type: "UPDATE_MOBILE_MARINE_AVIATION", payload });

        saveAssessment(
            {
                assessmentId,
                data: {
                    ...state.assessmentData,
                    mobileSources: {
                        ...state.assessmentData.mobileSources,
                        marineAviation: payload,
                    },
                },
            },
            {
                onSuccess: () => {
                    setAir([]);
                    setMarine([]);
                    setFiles(
                        Object.fromEntries(uploadFields.map((f) => [f, null]))
                    );
                    setAdditionalFields([]);

                    onBackToHub();
                },
            }
        );
    };

    const handleSubmit = () => {
        const { assessmentId } = state.assessmentData;

        if (!assessmentId) {
            toast.error("Cannot submit: Assessment ID is missing.");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix validation errors before submitting.");
            return;
        }

        const payload = {
            air,
            marine,
            files,
            additionalFields: additionalFields as FileMetadata[],
        };

        dispatch({ type: "UPDATE_MOBILE_MARINE_AVIATION", payload });

        submitAssessment(
            {
                assessmentId,
                data: {
                    ...state.assessmentData,
                    mobileSources: {
                        ...state.assessmentData.mobileSources,
                        marineAviation: payload,
                    },
                },
            },
            {
                onSuccess: (res) => {
                    onSubmit(res.totals ?? null);
                },
            }
        );
    };

    const handleRemoveFile = async (key: string) => {
        const file = files[key];
        if (file?.publicId) {
            try {
                // Start the deleting state for this specific file
                setDeleting((prev) => ({ ...prev, [key]: true }));

                await uploadService.deleteImage(file.publicId);
                toast.success("File deleted successfully");
            } catch (err) {
                toast.error("Failed to delete file");
                console.error(err);
            } finally {
                // Stop the deleting state regardless of success or failure
                setDeleting((prev) => ({ ...prev, [key]: false }));

                // Always remove the file from local state and clear the input field
                setFiles((prev) => ({
                    ...prev,
                    [key]: null,
                }));

                if (inputRefs.current[key]) {
                    inputRefs.current[key]!.value = "";
                }

                if (errors.files) {
                    setErrors((prev) => ({ ...prev, files: undefined }));
                }
            }
        } else {
            // If there is no publicId, just remove the file from the local state
            setFiles((prev) => ({
                ...prev,
                [key]: null,
            }));
            if (inputRefs.current[key]) {
                inputRefs.current[key]!.value = "";
            }
        }
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
                            Mobile Sources
                        </h3>
                        <p className="text-muted-foreground text-base">
                            Emissions from moving equipment or vehicles, such as
                            trucks, ships, or planes.
                        </p>
                    </div>
                </div>

                <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
                    <CardContent className="space-y-8">
                        <AssessmentProgressBar
                            stepIndex={stepIndex}
                            totalSteps={totalSteps}
                            fieldsCompleted={filled}
                            totalFields={total}
                            isSubmitted={isSubmitted}
                        />

                        <div>
                            <h4 className="text-xl font-medium text-foreground">
                                Marine and Aviation
                            </h4>
                            <p className="text-muted-foreground text-base">
                                Emissions from ships, boats, aircraft, and
                                related subsidiaries for transport or industrial
                                use.
                            </p>
                        </div>

                        {/* 1.1 Helicopters */}
                        <div>
                            <Label className="text-md font-semibold mb-2 block">
                                1.1 Helicopters Used for Transporting Personnel
                                and Equipment to Offshore Oil Platforms
                            </Label>
                            <div className="space-y-4 ml-6">
                                <AddSource
                                    title="Fuel Sources"
                                    fuelTypeOptions={airOptions}
                                    unitOptions={unitOptions}
                                    sources={air}
                                    onSourcesChange={setAir}
                                    volumeLabel="Volume of Fuel Consumed"
                                    volumePlaceholder="Enter volume consumed"
                                    error={errors.air}
                                />
                            </div>
                        </div>

                        {/* 1.2 Company-owned Boats and Vessels */}
                        <div>
                            <Label className="text-md font-semibold mb-2 block">
                                1.2 Company-owned Boats and Vessels for
                                Transport in the Niger Delta and Offshore
                                Subsidiaries
                            </Label>
                            <div className="space-y-4 ml-6">
                                <AddSource
                                    title="Fuel Sources"
                                    fuelTypeOptions={airOptions}
                                    unitOptions={unitOptions}
                                    sources={marine}
                                    onSourcesChange={setMarine}
                                    volumeLabel="Volume of Fuel Consumed"
                                    volumePlaceholder="Enter volume consumed"
                                    error={errors.marine}
                                />
                            </div>
                        </div>

                        {/* 1.3 Document/Evidence Upload */}
                        <div>
                            <Label className="text-md font-semibold mb-2 block">
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
                                            <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
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
                                                    ref={(el) => {
                                                        inputRefs.current[
                                                            field
                                                        ] = el;
                                                    }}
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
                                                {uploading[field] ? (
                                                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                                                        <LoadingSpinner size="sm" />{" "}
                                                        Uploading...
                                                    </div>
                                                ) : deleting[field] ? (
                                                    <div className="flex items-center gap-2 mt-2 text-red-500">
                                                        <LoadingSpinner size="sm" />{" "}
                                                        Deleting...
                                                    </div>
                                                ) : files[field] ? (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <p className="text-sm text-green-600 break-words max-w-full text-center">
                                                            Uploaded:{" "}
                                                            {files[field]!.name}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveFile(
                                                                    field
                                                                )
                                                            }
                                                            disabled={
                                                                deleting[field]
                                                            } // Disable button while deleting
                                                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                                                            aria-label={`Remove ${field}`}
                                                        >
                                                            <X />
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6">
                                <AdditionalFileUpload
                                    onFieldsChange={
                                        handleAdditionalFieldsChange
                                    }
                                    initialData={additionalFields}
                                />
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
                                onClick={handleSubmit}
                                disabled={isSaving || isSubmitting}
                                className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                aria-label="Submit assessment"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
