"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, CloudUpload, X } from "lucide-react";
import { AssessmentData, FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { useSaveAssessment } from "@/services/hooks/assessment.hooks";
import { useFormattedNumber } from "@/hooks/useNumberFormater";

interface PurchasedElectricityFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Electricity bills/invoices from Elect. Distr. Companies",
  "Smart meter or sub-meter readings",
  "Utility contracts or purchase agreements",
];

export function PurchasedElectricityForm({
  onBack,
  onNext,
  onBackToHub,
  stepIndex,
  totalSteps,
}: PurchasedElectricityFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Use formatted number hook for electricity consumed
  const electricityConsumed = useFormattedNumber("");
  const [supplier, setSupplier] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    electricityConsumed?: string;
    supplier?: string;
    files?: string;
  }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment();

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData = state.assessmentData?.electricity as NonNullable<
      AssessmentData["electricity"]
    >;

    if (existingData) {
      // Initialize the hook with saved value
      electricityConsumed.setRawValue(existingData.electricityConsumed?.toString() ?? "");
      setSupplier(existingData.supplier ?? "");
      setFiles(
        existingData.files ?? Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData?.electricity, electricityConsumed]);

  const { filled, total } = useMemo(() => {
    return calculateProgress([
      electricityConsumed.rawValue,
      supplier,
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file),
    ]);
  }, [electricityConsumed.rawValue, supplier, files, additionalFields]);

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

  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };

  const handleElectricityConsumedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    electricityConsumed.handleChange(value);

    // Clear error if present
    if (errors.electricityConsumed) {
      setErrors((prev) => ({
        ...prev,
        electricityConsumed: undefined,
      }));
    }
  };

  const handleSaveAndContinue = () => {
    const assessmentId = state.assessmentData.assessmentId;
    if (!assessmentId) {
      toast.error("Cannot save: Assessment ID missing.");
      return;
    }

    dispatch({
      type: "UPDATE_ELECTRICITY",
      payload: {
        electricityConsumed: electricityConsumed.rawValue,
        supplier,
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });

    saveAssessment(
      {
        assessmentId,
        data: {
          ...state.assessmentData,
          electricity: {
            electricityConsumed: electricityConsumed.rawValue,
            supplier,
            files,
            additionalFields: additionalFields as FileMetadata[],
          },
          lastSavedForm: "ghg-location-based-electricity",
        },
      },
      {
        onSuccess: () => {
          setShowSaveSuccess(true);
          toast.success("Electricity data saved.");
          onBackToHub();
        },
      }
    );
  };

  const handleNext = () => {
    dispatch({
      type: "UPDATE_ELECTRICITY",
      payload: {
        electricityConsumed: electricityConsumed.rawValue,
        supplier,
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });

    onNext();
  };
  const handlePrevious = () => {
    dispatch({
      type: "UPDATE_ELECTRICITY",
      payload: {
        electricityConsumed: electricityConsumed.rawValue,
        supplier,
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
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Purchased Electricity (Scope 2)
            </h3>
            <p className="text-muted-foreground text-base">
              Report emissions from purchased electricity, based on local grid or supplier emission
              factors.
            </p>
          </div>
        </div>

        <Card className="bg-gray-50 pt-6">
          <CardContent className="space-y-8">
            {/* Overall Assessment Progress */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Electricity Consumed */}
            <div>
              <Label className="text-md font-semibold mb-2 block">1.1 Purchased Electricity</Label>
              <div className="space-y-4 ml-6">
                <Label>Total Electricity Consumed (kwh)</Label>
                <Input
                  type="text" // Changed from "number" to "text" to display formatted value
                  placeholder="Enter total electricity consumed in kWh"
                  value={electricityConsumed.displayValue} // Use displayValue for formatted display
                  onChange={handleElectricityConsumedChange}
                  className={`w-full border-gray-400 ${
                    errors.electricityConsumed ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.electricityConsumed && (
                <p className="text-sm text-red-500 mt-1">{errors.electricityConsumed}</p>
              )}
            </div>

            {/* Electricity Supplier */}
            <div className="space-y-4 ml-6">
              <Label>Electricity Supplier</Label>
              <Input
                placeholder="Enter supplier name"
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value);
                  if (errors.supplier)
                    setErrors((prev) => ({
                      ...prev,
                      supplier: undefined,
                    }));
                }}
                className={`w-full border-gray-400 ${errors.supplier ? "border-red-500" : ""}`}
              />
              {errors.supplier && <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>}
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                1.2 Documents / Evidence Upload
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

            {/* Nav Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="cursor-pointer justify-self-start border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
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
                onClick={handleNext}
                disabled={isSaving}
                className="cursor-pointer justify-self-end border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
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
