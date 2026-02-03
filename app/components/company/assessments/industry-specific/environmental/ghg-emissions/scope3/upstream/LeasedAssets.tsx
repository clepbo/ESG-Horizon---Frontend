"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight, X, Info } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { Input } from "@/app/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import SmartInput from "../components/Scope3Input";

interface LeasedAssetsProps {
  onBack: () => void;
  onSubmit: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface LeasedAssetsErrors {
  electricityConsumed?: string;
  fuelConsumed?: string;
  floorArea?: string;
  files?: string;
}

const uploadFields = [
  "Lease agreements/contracts",
  "Utility bills for leased properties",
  "Reports from landlords/property managers",
];

export function LeasedAssets({
  onBack,
  onSubmit,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: LeasedAssetsProps) {
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
  const [errors, setErrors] = useState<LeasedAssetsErrors>({});

  // Input fields
  const [electricityConsumed, setElectricityConsumed] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [floorArea, setFloorArea] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    electricityConsumed: false,
    fuelConsumed: false,
    floorArea: false,
  });

  const { saveNow, isLoading } = useAssessmentFlow("ghg-scope3-upstream-leased-assets");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Load existing data
  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope3?.upstream?.upstreamLeasedAssets;
    if (existingData) {
      setElectricityConsumed(existingData.electricityConsumed || "");
      setFuelConsumed(existingData.fuelConsumed || "");
      setFloorArea(existingData.floorArea || "");

      // Files
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.environment?.ghg?.scope3?.upstream]);

  // FIX: Check for valid numbers >= 0 instead of just checking length
  const { filled, total } = useMemo(() => {
    // Check each required field - accept valid numbers including 0
    const hasElectricityConsumed =
      electricityConsumed.trim() !== "" &&
      !isNaN(Number(electricityConsumed)) &&
      Number(electricityConsumed) >= 0;
    const hasFuelConsumed =
      fuelConsumed.trim() !== "" && !isNaN(Number(fuelConsumed)) && Number(fuelConsumed) >= 0;
    const hasFloorArea =
      floorArea.trim() !== "" && !isNaN(Number(floorArea)) && Number(floorArea) >= 0;
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);

    const progressChecks = [
      hasElectricityConsumed,
      hasFuelConsumed,
      hasFloorArea,
      hasFileUploaded || hasAdditionalFields,
    ];

    return calculateProgress(progressChecks);
  }, [electricityConsumed, fuelConsumed, floorArea, files, additionalFields]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      electricityConsumed: false,
      fuelConsumed: false,
      floorArea: false,
    });
  };

  const validateForm = () => {
    const newErrors: LeasedAssetsErrors = {};
    const newFieldErrors = {
      electricityConsumed: false,
      fuelConsumed: false,
      floorArea: false,
    };

    // Validate input fields - accept 0 and any valid number >= 0
    if (
      !electricityConsumed.trim() ||
      isNaN(Number(electricityConsumed)) ||
      Number(electricityConsumed) < 0
    ) {
      newErrors.electricityConsumed =
        "Please enter the total electricity consumed by leased assets (0 or greater).";
      newFieldErrors.electricityConsumed = true;
    }

    if (!fuelConsumed.trim() || isNaN(Number(fuelConsumed)) || Number(fuelConsumed) < 0) {
      newErrors.fuelConsumed =
        "Please enter the total fuel consumed by leased assets (0 or greater).";
      newFieldErrors.fuelConsumed = true;
    }

    if (!floorArea.trim() || isNaN(Number(floorArea)) || Number(floorArea) < 0) {
      newErrors.floorArea = "Please enter the total leasable floor area occupied (0 or greater).";
      newFieldErrors.floorArea = true;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      // Input fields
      electricityConsumed,
      fuelConsumed,
      floorArea,

      // Files
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
      type: "UPDATE_UPSTREAM_LEASED_ASSETS",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope3.upstream.upstreamLeasedAssets", payload);
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

  const handleSubmit = () => {
    if (!validateForm()) {
      // Show toast notification for validation failure
      toast.error("Fields cannot be empty. Enter 0 if data is unavailable for a specific section.");
      // Auto-clear errors after 5 seconds
      setTimeout(clearAllErrors, 5000);
      return;
    }

    const payload = {
      // Input fields
      electricityConsumed,
      fuelConsumed,
      floorArea,

      // Files
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
      type: "UPDATE_UPSTREAM_LEASED_ASSETS",
      payload,
    });

    // Call onSubmit to trigger parent's submission logic (which includes bulk save)
    onSubmit();
  };

  // Handle input changes with automatic error clearing
  const handleElectricityConsumedChange = (value: string) => {
    setElectricityConsumed(value);
    if (fieldErrors.electricityConsumed) {
      setErrors((prev) => ({ ...prev, electricityConsumed: undefined }));
      setFieldErrors((prev) => ({ ...prev, electricityConsumed: false }));
    }
  };

  const handleFuelConsumedChange = (value: string) => {
    setFuelConsumed(value);
    if (fieldErrors.fuelConsumed) {
      setErrors((prev) => ({ ...prev, fuelConsumed: undefined }));
      setFieldErrors((prev) => ({ ...prev, fuelConsumed: false }));
    }
  };

  const handleFloorAreaChange = (value: string) => {
    setFloorArea(value);
    if (fieldErrors.floorArea) {
      setErrors((prev) => ({ ...prev, floorArea: undefined }));
      setFieldErrors((prev) => ({ ...prev, floorArea: false }));
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
              <h4 className="text-xl font-medium text-foreground">Upstream Leased Assets</h4>
              <p className="text-muted-foreground text-base">
                Emissions from the operation of leased assets such as buildings, equipment, or
                vehicles.
              </p>
            </div>

            {/* 8.1 Upstream Leased Assets */}
            <div className="space-y-6">
              <Label className="text-md font-medium block">8.1 Upstream Leased Assets</Label>

              <div className="space-y-4">
                <div className="grid grid-cols-1  gap-4">
                  {/* Electricity Consumed */}
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Total electricity consumed by leased assets{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">
                              Electricity Consumption Input Guide
                            </p>
                            <p className="text-xs">
                              Enter the total electricity consumed by leased assets during the
                              reporting period.
                            </p>
                            <p className="text-xs mt-1">
                              • You can enter 0 if no electricity was used
                            </p>
                            <p className="text-xs">• Negative values are not allowed</p>
                            <p className="text-xs">
                              • Use decimals for precise measurements (e.g., 1250.5)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <SmartInput
                      label=""
                      type="number"
                      required={false}
                      value={electricityConsumed}
                      onChange={handleElectricityConsumedChange}
                      errorTrigger={fieldErrors.electricityConsumed}
                      errorMessage="Please enter the total electricity consumed by leased assets (0 or greater)."
                    />
                    <div className="absolute right-3 top-9 flex items-center gap-1">
                      {/* <Zap className="h-4 w-4 text-gray-600" /> */}
                      <span className="text-sm text-gray-600">kWh</span>
                    </div>
                    {errors.electricityConsumed && (
                      <p className="text-sm text-red-500 animate-pulse">
                        {errors.electricityConsumed}
                      </p>
                    )}
                  </div>

                  {/* Fuel Consumed */}
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Total fuel consumed by leased assets <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Fuel Consumption Input Guide</p>
                            <p className="text-xs">
                              Enter the total fuel consumed by leased assets during the reporting
                              period.
                            </p>
                            <p className="text-xs mt-1">• You can enter 0 if no fuel was used</p>
                            <p className="text-xs">• Negative values are not allowed</p>
                            <p className="text-xs">
                              • Use decimals for precise measurements (e.g., 500.75)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <SmartInput
                      label=""
                      type="number"
                      required={false}
                      value={fuelConsumed}
                      onChange={handleFuelConsumedChange}
                      errorTrigger={fieldErrors.fuelConsumed}
                      errorMessage="Please enter the total fuel consumed by leased assets (0 or greater)."
                    />
                    <div className="absolute right-3 top-9 flex items-center gap-1">
                      {/* <Fuel className="h-4 w-4 text-gray-600" /> */}
                      <span className="text-sm text-gray-600">litres</span>
                    </div>
                    {errors.fuelConsumed && (
                      <p className="text-sm text-red-500 animate-pulse">{errors.fuelConsumed}</p>
                    )}
                  </div>

                  {/* Floor Area - Full width on mobile, half width on desktop */}
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Total leasable floor area occupied <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Floor Area Input Guide</p>
                            <p className="text-xs">
                              Enter the total leasable floor area occupied during the reporting
                              period.
                            </p>
                            <p className="text-xs mt-1">
                              • You can enter 0 if no area was occupied
                            </p>
                            <p className="text-xs">• Negative values are not allowed</p>
                            <p className="text-xs">
                              • Use decimals for precise measurements (e.g., 2500.5)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <SmartInput
                      label=""
                      type="number"
                      required={false}
                      value={floorArea}
                      onChange={handleFloorAreaChange}
                      errorTrigger={fieldErrors.floorArea}
                      errorMessage="Please enter the total leasable floor area occupied (0 or greater)."
                    />
                    <div className="absolute right-3 top-9 flex items-center gap-1">
                      {/* <Square className="h-4 w-4 text-gray-600" /> */}
                      <span className="text-sm text-gray-600">m²</span>
                    </div>
                    {errors.floorArea && (
                      <p className="text-sm text-red-500 animate-pulse">{errors.floorArea}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 8.2 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-medium mb-2 block">8.2 Document/Evidence Upload</Label>
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
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-sm text-primary wrap-break-word max-w-full text-center">
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
                Submit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
