"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight, X } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress, computeProgressPercent, normalizeFiles } from "@/lib/utils";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { ScopeInput } from "@/app/components/company/assessments/ScopeInput";

interface CO2ReleaseProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Clinker production records",
  "Lab chemical analysis of limestone",
  "Kiln operation logs",
];

export function CementManufacturing({ onBack, onNext, stepIndex, totalSteps }: CO2ReleaseProps) {
  const { state, dispatch } = useAssessment();

  // ✅ Integrate the hook
  const {
    rawValue: cementQuantity,
    displayValue: cementQuantityDisplay,
    handleChange: handleCementChange,
    setRawValue: setCementRaw,
  } = useFormattedNumber("0");

  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    cementQuantity?: string;
    files?: string;
  }>({});

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow(
    "ghg-process-emissions-cement-manufacturing"
  );

  const formRef = useRef<HTMLDivElement>(null);

  // Check if this is an assigned task
  const isAssignedTask = state.isAssignedTask || false;

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData = state.assessmentData.processEmissions?.cementManufacturing;
    if (existingData) {
      setCementRaw(existingData.cementQuantity?.toString() || "0");
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.processEmissions?.cementManufacturing, setCementRaw]);

  const { filled, total } = useMemo(() => {
    const hasFiles = Object.values(files).some(Boolean) || additionalFields.some((f) => f.file);
    return calculateProgress([Number(cementQuantity) > 0, hasFiles]);
  }, [cementQuantity, files, additionalFields]);

  const validateForm = () => {
    const newErrors: {
      cementQuantity?: string;
      files?: string;
    } = {};
    if (Number(cementQuantity) <= 0) {
      newErrors.cementQuantity = "Please enter a positive quantity of cement produced";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploading((prev) => ({ ...prev, [field]: true }));
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
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
    if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
  };

  const handleSaveAndContinue = async () => {
    const assessmentId = state.assessmentId;

    const progressPercent = computeProgressPercent({
      stepIndex,
      totalSteps,
      fieldsCompleted: filled,
      totalFields: total,
    });

    const payload = {
      cementQuantity: Number(cementQuantity),
      files,
      additionalFields: normalizeFiles(additionalFields),
      progressPercent,
    };

    dispatch({
      type: "UPDATE_PROCESS_CEMENT_MANUFACTURING",
      payload,
    });

    try {
      await saveNow("environment.ghg.processEmissions.cementManufacturing", payload);
      if (!assessmentId) toast.success("Saved!");

      if (isAssignedTask) {
        dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
        onBack();
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save");
    }
  };

  const handleNext = () => {
    if (!validateForm()) return;
    dispatch({
      type: "UPDATE_PROCESS_CEMENT_MANUFACTURING",
      payload: {
        cementQuantity: Number(cementQuantity),
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });
    onNext();
  };
  const handlePrevious = () => {
    dispatch({
      type: "UPDATE_PROCESS_CEMENT_MANUFACTURING",
      payload: {
        cementQuantity: Number(cementQuantity),
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });
    onBack();
  };

  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };

  const handleRemoveFile = async (key: string) => {
    const file = files[key];
    if (file?.publicId) {
      try {
        setDeleting((prev) => ({ ...prev, [key]: true }));
        await uploadService.deleteImage(file.publicId);
        toast.success("File deleted successfully");
      } catch (err) {
        toast.error("Failed to delete file");
        console.error(err);
      } finally {
        setDeleting((prev) => ({ ...prev, [key]: false }));
        setFiles((prev) => ({
          ...prev,
          [key]: null,
        }));
        if (inputRefs.current[key]) inputRefs.current[key]!.value = "";
        if (errors.files) {
          setErrors((prev) => ({ ...prev, files: undefined }));
        }
      }
    } else {
      setFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
      if (inputRefs.current[key]) inputRefs.current[key]!.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6" ref={formRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-primary text-primary hover:bg-green-50"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Process Emissions</h3>
            <p className="text-sm text-gray-600">
              Greenhouse gases released during industrial or chemical processes, not from fuel
              combustion.
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

            {/* Cement Quantity */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-4 block">
                1.1 Cement Manufacturing <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-6 ml-6">
                <div className="space-y-4">
                  {/* <Label htmlFor="cement-quantity" className="text-sm font-medium text-gray-700">
                    Quantity of Cement Produced (Tonnes)
                  </Label> */}
                  {/* <Input
                    id="cement-quantity"
                    type="text"
                    placeholder="Enter quantity of cement produced"
                    value={cementQuantityDisplay}
                    onChange={(e) => handleCementChange(e.target.value)}
                    className={`w-full border-gray-400 ${
                      errors.cementQuantity ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.cementQuantity ? "cement-quantity-error" : undefined}
                  /> */}
                  <ScopeInput
                    category="cement"
                    formattedValue={{
                      rawValue: cementQuantity,
                      displayValue: cementQuantityDisplay,
                      handleChange: handleCementChange,
                      setRawValue: setCementRaw,
                    }}
                    label="Quantity of Cement Produced (Tonnes)"
                    placeholder="Enter quantity of cement produced"
                    required
                    error={errors.cementQuantity}
                    showEmissionFactor={true}
                    onErrorClear={() =>
                      setErrors((prev) => ({ ...prev, cementQuantity: undefined }))
                    }
                  />
                  {errors.cementQuantity && (
                    <p id="cement-quantity-error" className="text-sm text-red-500">
                      {errors.cementQuantity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-4 block">
                1.2 Document/Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border hover:border-solid hover:border-primary transition-all">
                        <Label
                          htmlFor={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <CloudUpload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-gray-400 text-center">
                            Upload {field} (Max. 10MB)
                          </span>
                        </Label>
                        <Input
                          id={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
                          type="file"
                          ref={(el) => {
                            inputRefs.current[field] = el;
                          }}
                          className="hidden"
                          onChange={(e) => handleFileChange(field, e)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          aria-label={`Upload ${field}`}
                        />
                        {uploading[field] ? (
                          <div className="flex items-center gap-2 mt-2 text-gray-500">
                            <LoadingSpinner size="sm" /> Uploading...
                          </div>
                        ) : deleting[field] ? (
                          <div className="flex items-center gap-2 mt-2 text-red-500">
                            <LoadingSpinner size="sm" /> Deleting...
                          </div>
                        ) : files[field] ? (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-sm text-green-600 wrap-break-word max-w-full text-center">
                              Uploaded: {files[field]!.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(field)}
                              disabled={deleting[field]}
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
                  onFieldsChange={handleAdditionalFieldsChange}
                  initialData={additionalFields}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="justify-self-start border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isActionLoading}
                className="justify-self-center bg-primary text-white hover:bg-primary transition-colors"
                aria-label="Save and continue later"
              >
                {isActionLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save & Continue Later
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={isActionLoading}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Next step"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
