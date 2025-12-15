"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight, X } from "lucide-react";
import { FileMetadata } from "@/hooks/useAssessment";
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
import { Checkbox } from "@/app/components/ui/checkbox";

interface DownstreamTransportationAndDistributionProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface DownstreamTransportationErrors {
  massOfProductsSold?: string;
  averageDistributionDistance?: string;
  fuelConsumedByDistribution?: string;
  files?: string;
}

const uploadFields = [
  "Customer/shipping invoices",
  "Bills of lading, waybills, or delivery notes",
  "Fuel consumption logs from distributors",
];

export function DownstreamTransportationAndDistribution({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: DownstreamTransportationAndDistributionProps) {
  // const { state } = useAssessment();
  const router = useRouter();

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<DownstreamTransportationErrors>({});

  // Input fields
  const [massOfProductsSold, setMassOfProductsSold] = useState("");
  const [averageDistributionDistance, setAverageDistributionDistance] = useState("");
  const [fuelConsumedByDistribution, setFuelConsumedByDistribution] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    massOfProductsSold: false,
    averageDistributionDistance: false,
    fuelConsumedByDistribution: false,
  });

  const { saveNow, isLoading } = useAssessmentFlow("ghg-scope3-downstream-transportation");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Load existing data
  //   useEffect(() => {
  //     const existingData = (state.assessmentData.downstreamLeasedAssets as any);
  //     if (existingData) {
  //       // Input fields
  //       setMassOfProductsSold(existingData.massOfProductsSold || "");
  //       setAverageDistributionDistance(existingData.averageDistributionDistance || "");
  //       setFuelConsumedByDistribution(existingData.fuelConsumedByDistribution || "");

  //       // Files
  //       setFiles(
  //         existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
  //       );
  //       setAdditionalFields(existingData.additionalFields || []);
  //     }
  //   }, [state.assessmentData]);

  const { filled, total } = useMemo(() => {
    // Check each required field
    const hasMassOfProductsSold = massOfProductsSold.trim().length > 0;
    const hasAverageDistributionDistance = averageDistributionDistance.trim().length > 0;
    const hasFuelConsumedByDistribution = fuelConsumedByDistribution.trim().length > 0;
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);

    const progressChecks = [
      hasMassOfProductsSold,
      hasAverageDistributionDistance,
      hasFuelConsumedByDistribution,
      hasFileUploaded || hasAdditionalFields,
    ];

    return calculateProgress(progressChecks);
  }, [
    massOfProductsSold,
    averageDistributionDistance,
    fuelConsumedByDistribution,
    files,
    additionalFields,
  ]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      massOfProductsSold: false,
      averageDistributionDistance: false,
      fuelConsumedByDistribution: false,
    });
  };

  const validateForm = () => {
    const newErrors: DownstreamTransportationErrors = {};
    const newFieldErrors = {
      massOfProductsSold: false,
      averageDistributionDistance: false,
      fuelConsumedByDistribution: false,
    };

    // Validate input fields
    if (!massOfProductsSold.trim()) {
      newErrors.massOfProductsSold = "Please enter the mass of products sold.";
      newFieldErrors.massOfProductsSold = true;
    }

    if (!averageDistributionDistance.trim()) {
      newErrors.averageDistributionDistance = "Please enter the average distribution distance.";
      newFieldErrors.averageDistributionDistance = true;
    }

    if (!fuelConsumedByDistribution.trim()) {
      newErrors.fuelConsumedByDistribution =
        "Please enter the fuel consumed by distribution network.";
      newFieldErrors.fuelConsumedByDistribution = true;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      // Input fields
      massOfProductsSold,
      averageDistributionDistance,
      fuelConsumedByDistribution,

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

    try {
      await saveNow("environment.ghg.scope3.downstreamTransportation", payload);
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

  const handleNext = async () => {
    if (!validateForm()) {
      // Auto-clear errors after 5 seconds
      setTimeout(clearAllErrors, 5000);
      return;
    }
    await saveForm({ showToast: false, redirect: false });
    onNext();
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Auto-clear errors after 5 seconds
      setTimeout(clearAllErrors, 5000);
      return;
    }

    // Proceed to save and next
    handleNext();
  };

  // Handle input changes with automatic error clearing
  const handleMassOfProductsSoldChange = (value: string) => {
    setMassOfProductsSold(value);
    if (fieldErrors.massOfProductsSold) {
      setErrors((prev) => ({ ...prev, massOfProductsSold: undefined }));
      setFieldErrors((prev) => ({ ...prev, massOfProductsSold: false }));
    }
  };

  const handleAverageDistributionDistanceChange = (value: string) => {
    setAverageDistributionDistance(value);
    if (fieldErrors.averageDistributionDistance) {
      setErrors((prev) => ({ ...prev, averageDistributionDistance: undefined }));
      setFieldErrors((prev) => ({ ...prev, averageDistributionDistance: false }));
    }
  };

  const handleFuelConsumedByDistributionChange = (value: string) => {
    setFuelConsumedByDistribution(value);
    if (fieldErrors.fuelConsumedByDistribution) {
      setErrors((prev) => ({ ...prev, fuelConsumedByDistribution: undefined }));
      setFieldErrors((prev) => ({ ...prev, fuelConsumedByDistribution: false }));
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
    { label: "Scope-3 Downstream Transportation & Distribution" },
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
              Downstream Emissions (Categories 9–15)
            </h3>
            <p className="text-muted-foreground text-base">
              Indirect emissions from activities after your operations{" "}
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
                1.1 Downstream Transportation & Distribution
              </h4>
              <p className="text-muted-foreground text-base">
                Report transportation and distribution data for products sold to customers.
              </p>
            </div>

            {/* 1.1 Downstream Transportation & Distribution */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <SmartInput
                      label="Mass of products sold"
                      placeholder="Enter mass"
                      type="number"
                      required
                      value={massOfProductsSold}
                      onChange={handleMassOfProductsSoldChange}
                      errorTrigger={fieldErrors.massOfProductsSold}
                      errorMessage="Please enter the mass of products sold."
                    />
                    <div className="absolute right-3 top-9">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium">
                        tonnes
                      </span>
                    </div>
                    {errors.massOfProductsSold && (
                      <p className="text-sm text-red-500 animate-pulse col-span-full">
                        {errors.massOfProductsSold}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <SmartInput
                      label="Average distribution distance"
                      type="number"
                      required
                      placeholder="Enter distance"
                      value={averageDistributionDistance}
                      onChange={handleAverageDistributionDistanceChange}
                      errorTrigger={fieldErrors.averageDistributionDistance}
                      errorMessage="Please enter the average distribution distance."
                    />
                    <div className="absolute right-3 top-9">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium">
                        km
                      </span>
                    </div>
                    {errors.averageDistributionDistance && (
                      <p className="text-sm text-red-500 animate-pulse col-span-full">
                        {errors.averageDistributionDistance}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <SmartInput
                      label="Fuel consumed by downstream distribution network"
                      type="number"
                      required
                      placeholder="Enter fuel consumption"
                      value={fuelConsumedByDistribution}
                      onChange={handleFuelConsumedByDistributionChange}
                      errorTrigger={fieldErrors.fuelConsumedByDistribution}
                      errorMessage="Please enter the fuel consumed by distribution network."
                    />
                    <div className="absolute right-3 top-9">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium">
                        litres
                      </span>
                    </div>
                    {errors.fuelConsumedByDistribution && (
                      <p className="text-sm text-red-500 animate-pulse col-span-full">
                        {errors.fuelConsumedByDistribution}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 1.2 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                1.2 Documents/Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && (
                  <p className="text-sm text-red-500 animate-pulse">{errors.files}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col">
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
