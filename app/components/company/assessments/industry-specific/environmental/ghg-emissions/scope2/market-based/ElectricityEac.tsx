"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, CloudUpload, Info, X } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { useRouter } from "next/navigation";
import { ScopeInput } from "@/app/components/company/assessments/ScopeInput";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { FilePreview } from "@/app/components/common/FilePreview";

interface ElectricityEACFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

const uploadFields = [
  "Energy Attribute Certificates (EACs) or RECs",
  "Grid consumption invoices",
  "Contracts/purchase agreements",
];

export function ElectricityEACForm({
  onBack,
  onNext,
  onBackToHub,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ElectricityEACFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Use the formatted number hook for grid electricity
  const gridElectricity = useFormattedNumber("");
  const emissionFactor = useFormattedNumber("");

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
  const {
    saveNow,
    isLoading: isSaving,
    isAssignedTask,
    handleAssignedTaskRedirect,
  } = useAssessmentFlow("ghg-scope2-market-electricityeac");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // FIX: Check for null/undefined instead of truthiness to handle 0 values correctly
  useEffect(() => {
    const existingData = state.assessmentData.environment?.ghg?.scope2?.marketBased?.eac;
    if (existingData) {
      gridElectricity.setRawValue(
        existingData.gridElectricity !== null && existingData.gridElectricity !== undefined
          ? existingData.gridElectricity.toString()
          : ""
      );
      emissionFactor.setRawValue(
        existingData.emissionFactor !== null && existingData.emissionFactor !== undefined
          ? existingData.emissionFactor.toString()
          : ""
      );
      setFiles(
        existingData.files ?? Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.assessmentData]);

  // FIX: Check for valid numbers >= 0 instead of just > 0
  const { filled, total } = useMemo(() => {
    const hasElectricity =
      gridElectricity.rawValue !== "" &&
      gridElectricity.rawValue !== null &&
      gridElectricity.rawValue !== undefined &&
      !isNaN(Number(gridElectricity.rawValue)) &&
      Number(gridElectricity.rawValue) >= 0;

    const hasFactor =
      emissionFactor.rawValue !== "" &&
      emissionFactor.rawValue !== null &&
      emissionFactor.rawValue !== undefined &&
      !isNaN(Number(emissionFactor.rawValue)) &&
      Number(emissionFactor.rawValue) >= 0;

    const _hasFiles =
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file);

    return calculateProgress([hasElectricity, hasFactor]);
  }, [gridElectricity.rawValue, emissionFactor.rawValue, files, additionalFields]);

  // FIX: Accept 0 and any valid number >= 0
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (
      gridElectricity.rawValue === "" ||
      gridElectricity.rawValue === null ||
      gridElectricity.rawValue === undefined ||
      isNaN(Number(gridElectricity.rawValue)) ||
      Number(gridElectricity.rawValue) < 0
    ) {
      newErrors.gridElectricity =
        "Please enter a valid electricity consumption value (0 or greater).";
    }
    if (
      emissionFactor.rawValue === "" ||
      emissionFactor.rawValue === null ||
      emissionFactor.rawValue === undefined ||
      isNaN(Number(emissionFactor.rawValue)) ||
      Number(emissionFactor.rawValue) < 0
    ) {
      newErrors.emissionFactor = "Please enter a valid emission factor (0 or greater).";
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
      gridElectricity: gridElectricity.rawValue,
      emissionFactor: emissionFactor.rawValue,
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
      type: "UPDATE_MARKET_EAC",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope2.marketBased.eac", payload);
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
    if (isAssignedTask || handleAssignedTaskRedirect()) {
      await saveForm({ showToast: true, redirect: false });
      onBackToHub();
    } else {
      // For normal flow, let saveForm handle the redirect
      await saveForm({ showToast: true, redirect: true });
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Fields cannot be empty. Enter 0 if data is unavailable for a specific section.");
      return;
    }
    dispatch({
      type: "UPDATE_MARKET_EAC",
      payload: {
        gridElectricity: gridElectricity.rawValue,
        emissionFactor: emissionFactor.rawValue,
        files,
        additionalFields: additionalFields.map((f) => ({
          name: f.name,
          size: f.size ?? 0,
          lastModified: f.lastModified ?? Date.now(),
          url: f.url ?? "",
          publicId: f.publicId ?? "",
        })),
      },
    });
    onNext();
  };

  const handlePrevious = () => {
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
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-4xl mx-auto space-y-6 mt-4">
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
              groupKey="environment.ghg.scope2.marketBased"
            />

            {/* Grid Electricity */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                2.1 Purchased Electricity (with Energy Attribute Certificates – EACs / RECs)
              </Label>
              <div className="ml-6">
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-base font-medium text-gray-900">
                    Total grid electricity consumed (kWh) <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Electricity Consumption Input Guide</p>
                        <p className="text-xs">
                          Enter the total electricity consumed during the reporting period.
                        </p>
                        <p className="text-xs mt-1">
                          • You can enter 0 if no electricity was consumed
                        </p>
                        <p className="text-xs">• Negative values are not allowed</p>
                        <p className="text-xs">
                          • Use decimals for precise measurements (e.g., 1250.5)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ScopeInput
                  category="electricity"
                  formattedValue={gridElectricity}
                  label=""
                  placeholder="Enter total grid electricity consumed"
                  required={false}
                  error={errors.gridElectricity}
                  showEmissionFactor={true}
                  isMarketBased={true}
                  customEmissionFactor={Number(emissionFactor.rawValue) || null}
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
                    <p className="text-sm text-primary wrap-break-word max-w-full text-center">
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
                value={emissionFactor.displayValue}
                onChange={(e) => {
                  emissionFactor.handleChange(e.target.value);
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
                          <div className="w-full mt-2">
                            <FilePreview
                              file={files[field]!}
                              onRemove={() => handleRemoveFile(field)}
                              disabled={deleting[field]}
                            />
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
                className="justify-self-center bg-primary  hover:bg-teal-600 hover:cursor-pointer text-white  transition-colors"
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
