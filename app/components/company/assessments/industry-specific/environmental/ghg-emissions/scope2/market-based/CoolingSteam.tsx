"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, X } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { TotalsResponse } from "@/services/assessment.service";
import { useSaveAssessment, useSubmitAssessment } from "@/services/hooks/assessment.hooks";

interface CoolingSteamFormProps {
  onBack: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
  isSubmitted: boolean;
}

const uploadFields = [
  "Supplier Contract",
  "Energy Bills / Invoices",
  "Emission Factor Certificate",
];

export function CoolingSteamForm({
  onBack,
  onSubmit,
  onBackToHub,
  stepIndex,
  totalSteps,
  isSubmitted,
}: CoolingSteamFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [energyConsumed, setEnergyConsumed] = useState("");
  const [emissionFactor, setEmissionFactor] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [errors, setErrors] = useState<{
    energyConsumed?: string;
    emissionFactor?: string;
    files?: string;
  }>({});
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment();
  const { mutate: submitAssessment } = useSubmitAssessment();

  useEffect(() => {
    const existingData = state.assessmentData.coolingSteam;
    if (existingData) {
      setEnergyConsumed(existingData.energyConsumed || "");
      setEmissionFactor(existingData.emissionFactor || "");

      setFiles(
        existingData.files ?? Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.coolingSteam]);

  const { filled, total } = useMemo(() => {
    return calculateProgress([
      energyConsumed,
      emissionFactor,
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file),
    ]);
  }, [energyConsumed, emissionFactor, files, additionalFields]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!energyConsumed || Number(energyConsumed) <= 0)
      newErrors.energyConsumed = "Energy consumed is required";
    if (!emissionFactor || Number(emissionFactor) <= 0)
      newErrors.emissionFactor = "Emission factor is required";

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
      setUploading((prev) => ({ ...prev, [field]: false })); // stop spinner
    }

    if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
  };

  const resetForm = () => {
    setEnergyConsumed("");
    setEmissionFactor("");
    setFiles(Object.fromEntries(uploadFields.map((field) => [field, null])));
    setAdditionalFields([]);
    setErrors({});
    setShowSaveSuccess(false);

    Object.values(inputRefs.current).forEach((input) => {
      if (input) input.value = "";
    });
  };

  const buildPayload = () => ({
    energyConsumed,
    emissionFactor,
    files,
    additionalFields: additionalFields as FileMetadata[],
  });

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;

    const assessmentId = state.assessmentData.assessmentId;
    if (!assessmentId) {
      toast.error("Cannot save: Assessment ID is missing.");
      return;
    }

    dispatch({ type: "UPDATE_COOLING_STEAM", payload: buildPayload() });

    const handleSubmit = () => {
      if (!validateForm()) return;

      const assessmentId = state.assessmentData.assessmentId;
      if (!assessmentId) {
        toast.error("Cannot submit: Assessment ID missing.");
        return;
      }

      dispatch({ type: "UPDATE_COOLING_STEAM", payload: buildPayload() });

      submitAssessment(
        {
          assessmentId,
          data: {
            ...state.assessmentData,
            coolingSteam: buildPayload(),
          },
        },
        {
          onSuccess: (response) => {
            onSubmit(response.totals ?? null);
            resetForm();
          },
        }
      );
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

          if (inputRefs.current[key]) {
            inputRefs.current[key]!.value = "";
          }

          if (errors.files) {
            setErrors((prev) => ({ ...prev, files: undefined }));
          }
        }
      } else {
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
          {/* Header */}
          <div className="flex items-center gap-6 mb-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2 bg-white border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div>
              <h3 className="text-2xl font-semibold text-foreground">Scope 2 – Cooling / Steam</h3>
              <p className="text-muted-foreground text-base">
                Purchased cooling or steam energy consumption and supporting documents.
              </p>
            </div>
          </div>

          <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
            <CardContent className="space-y-8">
              {/* Progress Bar */}
              <AssessmentProgressBar
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                fieldsCompleted={filled}
                totalFields={total}
                isSubmitted={isSubmitted}
              />
              {/* Energy Consumed */}
              <div>
                <Label className="text-md font-medium mb-2 block">
                  4.1 Purchased Cooling / Steam
                </Label>
                <div className="space-y-4 ml-6">
                  <Label className="text-base font-medium text-gray-900 mb-2 block">
                    Quantity consumed
                  </Label>
                  <Input
                    type="number"
                    placeholder="Enter cooling/steam energy consumed (kWh)"
                    value={energyConsumed}
                    onChange={(e) => {
                      setEnergyConsumed(e.target.value);
                      if (errors.energyConsumed)
                        setErrors({
                          ...errors,
                          energyConsumed: undefined,
                        });
                    }}
                  />
                </div>
                {errors.energyConsumed && (
                  <p className="text-sm text-red-500 mt-1">{errors.energyConsumed}</p>
                )}
              </div>

              {/* Emission Factor */}
              <div className="ml-6">
                <Label className="text-md font-medium mb-2 block">
                  Supplier-specific emission factor applied
                </Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Enter supplier-specific emission factor"
                  value={emissionFactor}
                  onChange={(e) => {
                    setEmissionFactor(e.target.value);
                    if (errors.emissionFactor)
                      setErrors({
                        ...errors,
                        emissionFactor: undefined,
                      });
                  }}
                />
                {errors.emissionFactor && (
                  <p className="text-sm text-red-500 mt-1">{errors.emissionFactor}</p>
                )}
              </div>

              {/* File Uploads */}
              <div>
                <Label className="text-md font-medium mb-2 block">
                  {stepIndex}.2 Documents / Evidence Upload
                </Label>
                <div className="ml-6">
                  {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadFields.map((field) => (
                      <div key={field} className="flex flex-col gap-2">
                        <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
                          {field}
                        </Label>
                        <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
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
                              <p className="text-sm text-[var(--color-primary)] break-words max-w-full text-center">
                                Uploaded: {files[field]!.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(field)}
                                disabled={deleting[field]} // Disable button while deleting
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
                  onClick={onBack}
                  className="cursor-pointer justify-self-start border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-green-50 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAndContinue}
                  disabled={isSaving}
                  className="justify-self-center bg-[var(--color-primary)] hover:cursor-pointer text-white hover:bg-teal-300 transition-colors"
                  aria-label="Save and continue later"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
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
                  disabled={isSaving}
                  className="cursor-pointer justify-self-end border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-teal-50 flex items-center gap-2"
                >
                  {isSaving ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const assessmentId = state.assessmentData.assessmentId;
    if (!assessmentId) {
      toast.error("Cannot submit: Assessment ID missing.");
      return;
    }

    dispatch({ type: "UPDATE_COOLING_STEAM", payload: buildPayload() });

    submitAssessment(
      {
        assessmentId,
        data: {
          ...state.assessmentData,
          coolingSteam: buildPayload(),
        },
      },
      {
        onSuccess: (response) => {
          onSubmit(response.totals ?? null);
          resetForm();
        },
      }
    );
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

        if (inputRefs.current[key]) {
          inputRefs.current[key]!.value = "";
        }

        if (errors.files) {
          setErrors((prev) => ({ ...prev, files: undefined }));
        }
      }
    } else {
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
        {/* Header */}
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Scope 2 – Cooling / Steam</h3>
            <p className="text-muted-foreground text-base">
              Purchased cooling or steam energy consumption and supporting documents.
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            {/* Progress Bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={isSubmitted}
            />
            {/* Energy Consumed */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                4.1 Purchased Cooling / Steam
              </Label>
              <div className="space-y-4 ml-6">
                <Label className="text-base font-medium text-gray-900 mb-2 block">
                  Quantity consumed
                </Label>
                <Input
                  type="number"
                  placeholder="Enter cooling/steam energy consumed (kWh)"
                  value={energyConsumed}
                  onChange={(e) => {
                    setEnergyConsumed(e.target.value);
                    if (errors.energyConsumed)
                      setErrors({
                        ...errors,
                        energyConsumed: undefined,
                      });
                  }}
                />
              </div>
              {errors.energyConsumed && (
                <p className="text-sm text-red-500 mt-1">{errors.energyConsumed}</p>
              )}
            </div>

            {/* Emission Factor */}
            <div className="ml-6">
              <Label className="text-md font-medium mb-2 block">
                Supplier-specific emission factor applied
              </Label>
              <Input
                type="number"
                step="0.0001"
                placeholder="Enter supplier-specific emission factor"
                value={emissionFactor}
                onChange={(e) => {
                  setEmissionFactor(e.target.value);
                  if (errors.emissionFactor)
                    setErrors({
                      ...errors,
                      emissionFactor: undefined,
                    });
                }}
              />
              {errors.emissionFactor && (
                <p className="text-sm text-red-500 mt-1">{errors.emissionFactor}</p>
              )}
            </div>

            {/* File Uploads */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                {stepIndex}.2 Documents / Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
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
                            <p className="text-sm text-green-600 break-words max-w-full text-center">
                              Uploaded: {files[field]!.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(field)}
                              disabled={deleting[field]} // Disable button while deleting
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
                onClick={onBack}
                className="cursor-pointer justify-self-start border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
                aria-label="Save and continue later"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
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
                disabled={isSaving}
                className="cursor-pointer justify-self-end border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                {isSaving ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
