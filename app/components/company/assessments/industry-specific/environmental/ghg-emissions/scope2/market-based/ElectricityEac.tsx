"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, CloudUpload, X } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress, computeProgressPercent, normalizeFiles } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { useRouter } from "next/navigation";
import { Scope2EmissionInput } from "@/app/components/company/assessments/Scope2EmissionInput";

interface ElectricityEACFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Energy Attribute Certificates (EACs) or RECs",
  "Grid consumption invoices",
  "Contracts/purchase agreements",
];

export function ElectricityEACForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
}: ElectricityEACFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Use the formatted number hook for grid electricity
  const {
    rawValue: gridElectricityRaw,
    displayValue: gridElectricityDisplay,
    handleChange: handleGridElectricityChange,
    setRawValue: setGridElectricityRaw,
  } = useFormattedNumber("");

  const {
    rawValue: emissionFactorRaw,
    displayValue: emissionFactorDisplay,
    handleChange: handleEmissionFactorChange,
    setRawValue: setEmissionFactorRaw,
  } = useFormattedNumber("");

  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [errors, setErrors] = useState<{
    gridElectricity?: string;
    emissionFactor?: string;
    files?: string;
  }>({});
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();
  const { saveNow, isLoading: isSaving } = useAssessmentFlow(
    "ghg-scope2-market-electricityeac"
  );

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData = state.assessmentData.eac;
    if (existingData) {
      // Initialize with existing data using the formatted number hook
      if (existingData.gridElectricity) {
        setGridElectricityRaw(existingData.gridElectricity);
      } else {
        setGridElectricityRaw("");
      }
      if (existingData.emissionFactor) {
        setEmissionFactorRaw(existingData.emissionFactor);
      } else {
        setEmissionFactorRaw("");
      }
      setFiles(
        existingData.files ?? Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData, gridElectricityRaw, emissionFactorRaw, files, additionalFields]);

  const { filled, total } = useMemo(() => {
    return calculateProgress([
      gridElectricityRaw,
      emissionFactorRaw,
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file),
    ]);
  }, [gridElectricityRaw, emissionFactorRaw, files, additionalFields]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!gridElectricityRaw || Number(gridElectricityRaw) <= 0) {
      newErrors.gridElectricity = "Please enter a valid positive number.";
    }
    if (!emissionFactorRaw || Number(emissionFactorRaw) <= 0) {
      newErrors.emissionFactor = "Please enter a valid positive emission factor.";
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

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      gridElectricity: gridElectricityRaw,
      emissionFactor: emissionFactorRaw,
      files,
      additionalFields: additionalFields.map((f) => ({
        name: f.name,
        size: f.size ?? 0,
        lastModified: f.lastModified ?? Date.now(),
        url: f.url ?? "",
        publicId: f.publicId ?? "",
      })),
    };

    dispatch({
      type: "UPDATE_EAC",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope2.marketBased.electricityEac", payload);
      if (showToast) {
        toast.success("Saved!");
        setShowSaveSuccess(true);
      }
      if (redirect) {
        setTimeout(() => router.push("/assessments/new-assessment"), 1500);
      }
    } catch (err) {
      toast.error("Failed to save");
      console.error("Save failed:", err);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) return;
    await saveForm({ showToast: true, redirect: true });
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    await saveForm({ showToast: false, redirect: false });
    onNext();
  };

  const handlePrevious = () => {
    saveForm({ showToast: false, redirect: false });
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
            className="cursor-pointer flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Purchased Electricity with Energy Attribute Certificates (Scope 2 – Market Based)
            </h3>
            <p className="text-muted-foreground text-base">
              Report grid electricity consumption backed by Energy Attribute Certificates
              (EACs/RECs) and supplier-specific emission factors.
            </p>
          </div>
        </div>

        <Card className="bg-gray-50 pt-6">
          <CardContent className="space-y-8">
            {/* Progress */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Grid Electricity */}
            {/* <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                2.1 Purchased Electricity (with Energy Attribute Certificates – EACs / RECs)
              </Label>
              <div className="space-y-4 ml-6">
                <Label className="text-base font-medium text-gray-900 mb-2 block">
                  Total grid electricity consumed (kWh) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text" // Changed from "number" to "text" to display formatted value
                  placeholder="Enter total grid electricity consumed"
                  value={gridElectricityDisplay} // Use the formatted display value
                  onChange={(e) => {
                    handleGridElectricityChange(e.target.value); // Use the hook's handler
                    if (errors.gridElectricity)
                      setErrors((prev) => ({
                        ...prev,
                        gridElectricity: undefined,
                      }));
                  }}
                  className={`w-full border-gray-400 ${
                    errors.gridElectricity ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.gridElectricity && (
                <p className="text-sm text-red-500 mt-1">{errors.gridElectricity}</p>
              )}
            </div> */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                2.1 Purchased Electricity (with Energy Attribute Certificates – EACs / RECs)
              </Label>
              <div className="ml-6">
                <Scope2EmissionInput
                  category="electricity"
                  formattedValue={{
                    rawValue: gridElectricityRaw,
                    displayValue: gridElectricityDisplay,
                    handleChange: handleGridElectricityChange,
                    setRawValue: setGridElectricityRaw,
                  }}
                  label="Total grid electricity consumed (kWh)"
                  placeholder="Enter total grid electricity consumed"
                  required
                  error={errors.gridElectricity}
                  showEmissionFactor={true}
                  isMarketBased={true}
                  customEmissionFactor={Number(emissionFactorRaw) || null}
                  onErrorClear={() =>
                    setErrors((prev) => ({ ...prev, gridElectricity: undefined }))
                  }
                />
              </div>
            </div>

            {/* EAC / REC Certificate Upload */}
            <div className="ml-6 mt-6">
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                Upload EAC / REC Certificate
              </Label>
              <Card className="p-4 flex flex-col items-center justify-center border-2">
                <Label
                  htmlFor="upload-eac-rec"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <CloudUpload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-gray-400 text-center">
                    Attach Energy Attribute Certificate or Renewable Energy Certificate proving
                    renewable sourcing. (Max. 10mb)
                  </span>
                </Label>

                <Input
                  id="upload-eac-rec"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange("EAC / REC Certificate", e)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                {uploading["EAC / REC Certificate"] ? (
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <LoadingSpinner size="sm" /> Uploading...
                  </div>
                ) : deleting["EAC / REC Certificate"] ? (
                  <div className="flex items-center gap-2 mt-2 text-red-500">
                    <LoadingSpinner size="sm" /> Deleting...
                  </div>
                ) : files["EAC / REC Certificate"] ? (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-[var(--color-primary)] break-words max-w-full text-center">
                      Uploaded: {files["EAC / REC Certificate"]!.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("EAC / REC Certificate")}
                      disabled={deleting["EAC / REC Certificate"]}
                      className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      aria-label="Remove uploaded EAC/REC certificate"
                    >
                      <X />
                    </button>
                  </div>
                ) : null}
              </Card>
            </div>

            {/* Emission Factor */}
            <div className="ml-6">
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                Emission Factor Applied <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                step="0.0001"
                placeholder="Enter supplier-specific emission factor"
                value={emissionFactorDisplay}
                onChange={(e) => {
                  handleEmissionFactorChange(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    emissionFactor: undefined,
                  }));
                }}
                className={`w-full border-gray-400 ${
                  errors.emissionFactor ? "border-red-500" : ""
                }`}
              />
              {errors.emissionFactor && (
                <p className="text-sm text-red-500 mt-1">{errors.emissionFactor}</p>
              )}
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                2.2 Documents / Evidence Upload
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

            {/* Nav Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="cursor-pointer justify-self-start border-teal-600 text-teal-700 hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-[var(--color-primary)]  hover:bg-teal-600 hover:cursor-pointer text-white  transition-colors"
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
                className="cursor-pointer justify-self-end border-teal-600 text-teal-700 hover:bg-green-50 flex items-center gap-2"
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
