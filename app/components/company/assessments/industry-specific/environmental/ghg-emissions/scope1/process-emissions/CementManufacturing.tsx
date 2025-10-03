"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
    X,
} from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import {
    AdditionalFileUpload,
    FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useSaveAssessment } from "@/services/hooks/assessment.hooks";

interface CO2ReleaseProps {
    onBack: () => void;
    onNext: () => void;
    onBackToHub: () => void;
    stepIndex: number;
    totalSteps: number;
}

const uploadFields = [
    "Clinker production records",
    "Lab chemical analysis of limestone",
    "Kiln operation logs",
];

export function CementManufacturing({
    onBack,
    onNext,
    onBackToHub,
    stepIndex,
    totalSteps,
}: CO2ReleaseProps) {
    const { state, dispatch } = useAssessment();
    const [cementQuantity, setCementQuantity] = useState<number>(0);
    const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
        Object.fromEntries(uploadFields.map((field) => [field, null]))
    );
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<{
        cementQuantity?: string;
        calciumOxide?: string;
        magnesiumOxide?: string;
        files?: string;
    }>({});
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

    const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment();

    useEffect(() => {
        const existingData =
            state.assessmentData.processEmissions?.cementManufacturing;
        if (existingData) {
            setCementQuantity(existingData.cementQuantity);
            setFiles(
                existingData.files ||
                    Object.fromEntries(
                        uploadFields.map((field) => [field, null])
                    )
            );
            setAdditionalFields(existingData.additionalFields || []);
        }
    }, [state.assessmentData.processEmissions?.cementManufacturing]);

    const { filled, total } = useMemo(() => {
        const hasFiles =
            Object.values(files).some(Boolean) ||
            additionalFields.some((field) => field.file);
        return calculateProgress([cementQuantity > 0, hasFiles]);
    }, [cementQuantity, files, additionalFields]);

    const validateForm = () => {
        const newErrors: {
            cementQuantity?: string;
            files?: string;
        } = {};
        if (cementQuantity <= 0) {
            newErrors.cementQuantity =
                "Please enter a positive quantity of cement produced";
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

    const handleSaveAndContinue = () => {
        const { assessmentId } = state.assessmentData;
        if (!assessmentId) {
            toast.error("Assessment ID missing");
            return;
        }

        const payload = {
            cementQuantity,
            files,
            additionalFields: additionalFields as FileMetadata[],
        };

        dispatch({ type: "UPDATE_PROCESS_CEMENT_MANUFACTURING", payload });

        saveAssessment(
            {
                assessmentId,
                data: {
                    ...state.assessmentData,
                    processEmissions: {
                        ...state.assessmentData.processEmissions,
                        cementManufacturing: payload,
                    },
                },
            },
            {
                onSuccess: () => {
                    setCementQuantity(0);
                    setFiles(
                        Object.fromEntries(uploadFields.map((f) => [f, null]))
                    );
                    setAdditionalFields([]);
                    setShowSaveSuccess(true);
                    onBackToHub();
                },
            }
        );
    };

    const handleNext = () => {
        if (!validateForm()) return;
        dispatch({
            type: "UPDATE_PROCESS_CEMENT_MANUFACTURING",
            payload: {
                cementQuantity,
                files,
                additionalFields: additionalFields as FileMetadata[],
            },
        });
        onNext();
    };

    const handleAdditionalFieldsChange = (fields: FileData[]) => {
        setAdditionalFields(fields);
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
                        <h3 className="text-xl font-semibold text-gray-900">
                            Process Emissions
                        </h3>
                        <p className="text-sm text-gray-600">
                            Greenhouse gases released during industrial or
                            chemical processes, not from fuel combustion.
                        </p>
                    </div>
                </div>
                <Card className="bg-gray-50 mt-6 mb-8 pt-6">
                    <CardContent className="space-y-8">
                        <AssessmentProgressBar
                            stepIndex={stepIndex}
                            totalSteps={totalSteps}
                            fieldsCompleted={filled}
                            totalFields={total}
                            isSubmitted={false}
                        />
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-4 block">
                                1.1 Cement Manufacturing
                            </Label>
                            <div className="space-y-6 ml-6">
                                <div className="space-y-4">
                                    <Label
                                        htmlFor="cement-quantity"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Quantity of Cement Produced (Tonnes)
                                    </Label>
                                    <Input
                                        id="cement-quantity"
                                        type="number"
                                        placeholder="Enter quantity of cement produced"
                                        value={cementQuantity || ""}
                                        onChange={(e) => {
                                            setCementQuantity(
                                                Number(e.target.value)
                                            );
                                            setErrors((prev) => ({
                                                ...prev,
                                                cementQuantity: undefined,
                                            }));
                                        }}
                                        className={`w-full border-gray-400 ${
                                            errors.cementQuantity
                                                ? "border-red-500 focus:border-red-500"
                                                : ""
                                        }`}
                                        aria-describedby={
                                            errors.cementQuantity
                                                ? "cement-quantity-error"
                                                : undefined
                                        }
                                    />
                                    {errors.cementQuantity && (
                                        <p
                                            id="cement-quantity-error"
                                            className="text-sm text-red-500"
                                        >
                                            {errors.cementQuantity}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-4 block">
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
                                className="justify-self-start border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                aria-label="Previous step"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSaveAndContinue}
                                disabled={isSaving}
                                className="justify-self-center bg-green-500 text-white hover:bg-green-600 transition-colors"
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
                                className="justify-self-end border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
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
