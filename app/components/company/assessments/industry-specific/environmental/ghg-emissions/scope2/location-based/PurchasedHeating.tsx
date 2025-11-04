"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, X } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { TotalsResponse } from "@/services/assessment.service";
import { useSaveAssessment, useSubmitAssessment } from "@/services/hooks/assessment.hooks";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
interface PurchasedHeatingFormProps {
  onBack: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
  isSubmitted: boolean;
}

const uploadFields = [
  "Invoices/receipts for heating services",
  "Metered heating records",
  "Supplier contracts",
  "Certification of refrigerant type (R-134a, R-410A, etc.).",
];

export function PurchasedHeatingForm({
  onBack,
  onSubmit,
  onBackToHub,
  stepIndex,
  totalSteps,
  isSubmitted,
}: PurchasedHeatingFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [heatingPurchased, setHeatingPurchased] = useState("");

  // Use the formatted number hook for heating consumed
  const {
    rawValue: heatingConsumedRaw,
    displayValue: heatingConsumedDisplay,
    handleChange: handleHeatingConsumedChange,
    setRawValue: setHeatingConsumedRaw,
  } = useFormattedNumber("");

  const [supplierName, setSupplierName] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [errors, setErrors] = useState<{
    heatingPurchased?: string;
    heatingConsumed?: string;
    supplierName?: string;
    files?: string;
  }>({});

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment();
  const { mutate: submitAssessment, isPending: isSubmitting } = useSubmitAssessment();

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const isPending = isSaving || isSubmitting;

  useEffect(() => {
    const existingData = state.assessmentData.heating;

    if (existingData) {
      setHeatingPurchased(existingData.heatingPurchased || "");

      // Initialize with existing data using the formatted number hook
      if (existingData.heatingConsumed) {
        setHeatingConsumedRaw(existingData.heatingConsumed);
      } else {
        setHeatingConsumedRaw("");
      }

      setSupplierName(existingData.supplierName || "");
      setFiles(
        existingData.files ?? Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.heating, setHeatingConsumedRaw]);

  const { total, filled } = calculateProgress([
    heatingPurchased,
    heatingConsumedRaw,
    supplierName,
    Object.values(files).some(Boolean) || additionalFields.some((field) => field.file),
  ]);

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
    const assessmentId = state.assessmentData.assessmentId;
    if (!assessmentId) {
      toast.error("Cannot save: Assessment ID missing.");
      return;
    }

    dispatch({
      type: "UPDATE_HEATING",
      payload: {
        heatingPurchased,
        heatingConsumed: heatingConsumedRaw,
        supplierName,
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });

    saveAssessment(
      {
        assessmentId,
        data: {
          ...state.assessmentData,
          heating: {
            heatingPurchased,
            heatingConsumed: heatingConsumedRaw,
            supplierName,
            files,
            additionalFields: additionalFields as FileMetadata[],
          },
          lastSavedForm: "ghg-location-based-heating",
        },
      },
      {
        onSuccess: () => {
          setShowSaveSuccess(true);
          toast.success("Heating data saved.");
          onBackToHub();
        },
      }
    );
  };

  const handleSubmit = () => {
    const assessmentId = state.assessmentData.assessmentId;
    if (!assessmentId) {
      toast.error("Cannot submit: Assessment ID missing.");
      return;
    }

    dispatch({
      type: "UPDATE_HEATING",
      payload: {
        heatingPurchased,
        heatingConsumed: heatingConsumedRaw,
        supplierName,
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });

    submitAssessment(
      {
        assessmentId,
        data: {
          ...state.assessmentData,
          heating: {
            heatingPurchased,
            heatingConsumed: heatingConsumedRaw,
            supplierName,
            files,
            additionalFields: additionalFields as FileMetadata[],
          },
          lastSavedForm: "ghg-location-based-electricity",
        },
      },
      {
        onSuccess: (res) => {
          toast.success("Assessment submitted successfully!");
          onSubmit(res.totals ?? null);
        },
      }
    );
  };
  const handlePrevious = () => {
    const assessmentId = state.assessmentData.assessmentId;
    if (!assessmentId) {
      toast.error("Cannot submit: Assessment ID missing.");
      return;
    }

    dispatch({
      type: "UPDATE_HEATING",
      payload: {
        heatingPurchased,
        heatingConsumed: heatingConsumedRaw,
        supplierName,
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });

    onBack();
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
    <div className="min-h-screen bg-green-50 p-6" ref={formRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
            <h3 className="text-2xl font-semibold text-foreground">Scope 2 – Heating</h3>
            <p className="text-muted-foreground text-base">
              Purchased heating energy consumption and supporting evidence.
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
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">
                Section {stepIndex} of {totalSteps}
              </span>
            </div>

            {/* 4.1 Purchased Heating */}
            <div className="ml-6">
              <Label className="text-md font-medium mb-2 block">4.1 Purchased Heating</Label>
              <RadioGroup
                value={heatingPurchased}
                onValueChange={(val) => {
                  setHeatingPurchased(val);
                  if (errors.heatingPurchased) {
                    setErrors((prev) => ({
                      ...prev,
                      heatingPurchased: undefined,
                    }));
                  }
                }}
                className={`mt-2 ${errors.heatingPurchased ? "border-red-500 p-2 rounded" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
              {errors.heatingPurchased && (
                <p className="text-sm text-red-500 mt-1">{errors.heatingPurchased}</p>
              )}
            </div>

            <div className="ml-6">
              <div className="space-y-2">
                <Label htmlFor="heating-consumed">
                  If yes, what was the total heating energy consumed in Gigajoules (GJ)
                </Label>
                <Input
                  id="heating-consumed"
                  type="text" // Changed from "number" to "text" to display formatted value
                  placeholder="Enter heating energy in GJ"
                  value={heatingConsumedDisplay} // Use the formatted display value
                  onChange={(e) => {
                    handleHeatingConsumedChange(e.target.value); // Use the hook's handler
                    if (errors.heatingConsumed) {
                      setErrors((prev) => ({
                        ...prev,
                        heatingConsumed: undefined,
                      }));
                    }
                  }}
                  className={`w-full border-gray-400 ${
                    errors.heatingConsumed ? "border-red-500" : ""
                  }`}
                />
                {errors.heatingConsumed && (
                  <p className="text-sm text-red-500 mt-1">{errors.heatingConsumed}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Enter supplier name"
                  value={supplierName}
                  onChange={(e) => {
                    setSupplierName(e.target.value);
                    if (errors.supplierName) {
                      setErrors((prev) => ({
                        ...prev,
                        supplierName: undefined,
                      }));
                    }
                  }}
                  className={`w-full border-gray-400 ${
                    errors.supplierName ? "border-red-500" : ""
                  }`}
                />
                {errors.supplierName && (
                  <p className="text-sm text-red-500 mt-1">{errors.supplierName}</p>
                )}
              </div>
            </div>

            {/* 4.2 File Uploads */}
            <div>
              <Label className="text-md font-medium mb-2 block">4.2 Document/Evidence Upload</Label>
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
                onClick={handlePrevious}
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
                disabled={isPending}
                className="cursor-pointer justify-self-end border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
