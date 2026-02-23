"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { Input } from "@/app/components/ui/input";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import SmartInput from "../components/Scope3Input";
import { Fuel } from "lucide-react";
import { Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Info } from "lucide-react";
import { FilePreview } from "@/app/components/common/FilePreview";

interface EnergyRelatedActivitiesProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface EnergyRelatedErrors {
  fuelVolume?: string;
  electricityConsumed?: string;
  files?: string;
}

const uploadFields = [
  "Fuel purchase receipts or logs",
  "Generator/fuel records",
  "Electricity bills/invoices",
];

export function EnergyRelatedActivities({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: EnergyRelatedActivitiesProps) {
  const { state, dispatch } = useAssessment();
  const router = useRouter();

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<EnergyRelatedErrors>({});
  const [fuelVolume, setFuelVolume] = useState("");
  const [electricityConsumed, setElectricityConsumed] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    fuelVolume: false,
    electricityConsumed: false,
  });

  const { saveNow, isLoading } = useAssessmentFlow("ghg-scope3-upstream-energyrelatedactivities");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // FIX: Load existing data with proper null/undefined handling
  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope3?.upstream?.fuelEnergyRelatedActivities;
    if (existingData) {
      // FIX: Handle null/undefined properly for numeric values
      setFuelVolume(
        existingData.fuelVolume !== null && existingData.fuelVolume !== undefined
          ? existingData.fuelVolume.toString()
          : ""
      );
      setElectricityConsumed(
        existingData.energyType !== null && existingData.energyType !== undefined
          ? existingData.energyType.toString()
          : ""
      );
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.environment?.ghg?.scope3?.upstream]);

  // FIX: Check for valid numbers >= 0 instead of just checking length
  const { filled, total } = useMemo(() => {
    const hasFuelVolume =
      fuelVolume !== "" &&
      fuelVolume !== null &&
      fuelVolume !== undefined &&
      !isNaN(Number(fuelVolume)) &&
      Number(fuelVolume) >= 0;

    const hasElectricityConsumed =
      electricityConsumed !== "" &&
      electricityConsumed !== null &&
      electricityConsumed !== undefined &&
      !isNaN(Number(electricityConsumed)) &&
      Number(electricityConsumed) >= 0;

    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);

    const progressChecks = [
      hasFuelVolume,
      hasElectricityConsumed,
      hasFileUploaded || hasAdditionalFields,
    ];

    return calculateProgress(progressChecks);
  }, [fuelVolume, electricityConsumed, files, additionalFields]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      fuelVolume: false,
      electricityConsumed: false,
    });
  };

  // FIX: Accept 0 and any valid number >= 0
  const validateForm = () => {
    const newErrors: EnergyRelatedErrors = {};
    const newFieldErrors = {
      fuelVolume: false,
      electricityConsumed: false,
    };

    // FIX: Validate fuel volume field - accept 0 or greater
    if (
      fuelVolume === "" ||
      fuelVolume === null ||
      fuelVolume === undefined ||
      isNaN(Number(fuelVolume)) ||
      Number(fuelVolume) < 0
    ) {
      newErrors.fuelVolume = "Please enter a valid volume of fuel consumed (0 or greater).";
      newFieldErrors.fuelVolume = true;
    }

    // FIX: Validate electricity consumed field - accept 0 or greater
    if (
      electricityConsumed === "" ||
      electricityConsumed === null ||
      electricityConsumed === undefined ||
      isNaN(Number(electricityConsumed)) ||
      Number(electricityConsumed) < 0
    ) {
      newErrors.electricityConsumed =
        "Please enter a valid amount of electricity consumed (0 or greater).";
      newFieldErrors.electricityConsumed = true;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      fuelVolume,
      electricityConsumed,
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
      type: "UPDATE_UPSTREAM_FUEL_ENERGY",
      payload: {
        fuelVolume,
        energyType: electricityConsumed,
        files,
        additionalFields: payload.additionalFields,
      },
    });

    try {
      await saveNow("environment.ghg.scope3.upstream.fuelEnergyRelatedActivities", {
        fuelVolume,
        energyType: electricityConsumed,
        files,
        additionalFields: payload.additionalFields,
      });
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
    await saveForm({ showToast: true, redirect: true });
  };

  const handleNext = () => {
    if (!validateForm()) {
      // Show toast notification for validation failure
      toast.error("Fields cannot be empty. Enter 0 if data is unavailable for a specific section.");
      // Auto-clear errors after 5 seconds
      setTimeout(clearAllErrors, 5000);
      return;
    }

    const payload = {
      fuelVolume,
      energyType: electricityConsumed,
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
      type: "UPDATE_UPSTREAM_FUEL_ENERGY",
      payload,
    });

    onNext();
  };

  const handleSubmit = () => {
    handleNext();
  };

  // Handle input changes with automatic error clearing
  const handleFuelVolumeChange = (value: string) => {
    setFuelVolume(value);
    if (fieldErrors.fuelVolume) {
      setErrors((prev) => ({ ...prev, fuelVolume: undefined }));
      setFieldErrors((prev) => ({ ...prev, fuelVolume: false }));
    }
  };

  const handleElectricityConsumedChange = (value: string) => {
    setElectricityConsumed(value);
    if (fieldErrors.electricityConsumed) {
      setErrors((prev) => ({ ...prev, electricityConsumed: undefined }));
      setFieldErrors((prev) => ({ ...prev, electricityConsumed: false }));
    }
  };

  const handleFileChange = async (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, files: `File "${field}" exceeds 10MB limit` }));
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

  const handleRemoveFile = async (key: string) => {
    const file = files[key];

    if (file?.publicId) {
      try {
        setDeleting((prev) => ({ ...prev, [key]: true }));
        await uploadService.deleteImage(file.publicId);
        toast.success("File deleted successfully");
        setFiles((prev) => ({ ...prev, [key]: null }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete file");
      } finally {
        setDeleting((prev) => ({ ...prev, [key]: false }));
        if (inputRefs.current[key]) {
          inputRefs.current[key]!.value = "";
        }
        if (errors.files) {
          setErrors((prev) => ({ ...prev, files: undefined }));
        }
      }
    } else {
      setFiles((prev) => ({ ...prev, [key]: null }));
      if (inputRefs.current[key]) {
        inputRefs.current[key]!.value = "";
      }
    }
  };

  const feature = [
    { label: "Assessments", onClick: backToAssessment },
    { label: "Disclosure Topics", onClick: backToDisclosureTopics },
    { label: "GHG Emissions", onClick: backToGHGEmissions },
    { label: "Scope-3 Upstream Emissions" },
  ];

  return (
    <div className="min-h-screen bg-green-50 p-6" ref={formRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        <CustomBreadcrumbDynamic features={feature} />
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
            <h3 className="text-2xl font-semibold text-foreground">
              Upstream Emissions (Categories 1–8)
            </h3>
            <p className="text-muted-foreground text-base">
              These emissions are generated from activities in the value chain before products or
              services reach your organization.
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
              isSubmitted={false}
            />
            <div>
              <h4 className="text-xl font-medium text-foreground">
                Fuel & Energy-Related Activities
              </h4>
              <p className="text-muted-foreground text-base">
                Emissions from the extraction, production, and transportation of fuels and purchased
                energy.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Label className="text-md font-medium mb-2 block">
                3.1 Fuel & Energy-Related Activities
              </Label>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Volume of fuel consumed (diesel, petrol, etc.){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Fuel Volume Input Guide</p>
                        <p className="text-xs">
                          Enter the total volume of fuel consumed during the reporting period.
                        </p>
                        <p className="text-xs mt-1">• You can enter 0 if no fuel was consumed</p>
                        <p className="text-xs">• Negative values are not allowed</p>
                        <p className="text-xs">
                          • Use decimals for precise measurements (e.g., 500.75)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <SmartInput
                    label=""
                    type="number"
                    required
                    value={fuelVolume}
                    onChange={(value) => {
                      handleFuelVolumeChange(value);
                      if (fieldErrors.fuelVolume && value.trim()) {
                        setFieldErrors((prev) => ({ ...prev, fuelVolume: false }));
                        setErrors((prev) => ({ ...prev, fuelVolume: undefined }));
                      }
                    }}
                    errorTrigger={fieldErrors.fuelVolume}
                    errorMessage="Please enter the volume of fuel consumed."
                  />
                  <div className="absolute right-3 top-2 flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-600">litres</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Electricity consumed <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Electricity Consumption Input Guide</p>
                        <p className="text-xs">
                          Enter the total amount of electricity consumed during the reporting
                          period.
                        </p>
                        <p className="text-xs mt-1">
                          • You can enter 0 if no electricity was consumed
                        </p>
                        <p className="text-xs">• Negative values are not allowed</p>
                        <p className="text-xs">
                          • Use decimals for precise measurements (e.g., 1250.50)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <SmartInput
                    label=""
                    type="number"
                    required
                    value={electricityConsumed}
                    onChange={(value) => {
                      handleElectricityConsumedChange(value);
                      if (fieldErrors.electricityConsumed && value.trim()) {
                        setFieldErrors((prev) => ({ ...prev, electricityConsumed: false }));
                        setErrors((prev) => ({ ...prev, electricityConsumed: undefined }));
                      }
                    }}
                    errorTrigger={fieldErrors.electricityConsumed}
                    errorMessage="Please enter the amount of electricity consumed."
                  />
                  <div className="absolute right-3 top-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-600">kWh</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-md font-medium mb-2 block">3.2 Document/Evidence Upload</Label>
              <div className="ml-6">
                {errors.files && (
                  <p className="text-sm text-red-500 animate-pulse">{errors.files}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border hover:border-solid hover:border-primary transition-all h-full">
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
                  onFieldsChange={(newFields) => {
                    setAdditionalFields(newFields);
                  }}
                  initialData={additionalFields}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="justify-self-start hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isLoading}
                className="justify-self-center bg-teal-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
                aria-label="Save and continue later"
              >
                {isLoading ? (
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
                disabled={isLoading}
                className="justify-self-end hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
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
