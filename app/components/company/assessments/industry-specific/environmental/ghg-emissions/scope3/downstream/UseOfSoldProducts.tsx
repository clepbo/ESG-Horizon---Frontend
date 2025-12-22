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
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import SmartInput from "../components/Scope3Input";

interface UseOfSoldProductsProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface UseOfSoldProductsErrors {
  unitsSold?: string;
  productLifetime?: string;
  averageAnnualConsumption?: string;
  files?: string;
}

const uploadFields = [
  "Product manuals (fuel/energy consumption specs)",
  "Sales records/invoices",
  "Warranty/after-sales service records",
];

export function UseOfSoldProducts({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: UseOfSoldProductsProps) {
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
  const [errors, setErrors] = useState<UseOfSoldProductsErrors>({});

  // Input fields
  const [unitsSold, setUnitsSold] = useState("");
  const [productLifetime, setProductLifetime] = useState("");
  const [averageAnnualConsumption, setAverageAnnualConsumption] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    unitsSold: false,
    productLifetime: false,
    averageAnnualConsumption: false,
  });

  const { saveNow, isLoading } = useAssessmentFlow("ghg-scope3-use-of-sold-products");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Load existing data
  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope3?.downstream?.useOfSoldProducts;
    if (existingData) {
      // Input fields
      setUnitsSold(existingData.unitsSold || "");
      setProductLifetime(existingData.productLifetime || "");
      setAverageAnnualConsumption(existingData.averageAnnualConsumption || "");

      // Files
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.environment?.ghg?.scope3?.downstream]);

  const { filled, total } = useMemo(() => {
    // Check each required field
    const hasUnitsSold = unitsSold.trim().length > 0;
    const hasProductLifetime = productLifetime.trim().length > 0;
    const hasAverageAnnualConsumption = averageAnnualConsumption.trim().length > 0;
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);

    const progressChecks = [
      hasUnitsSold,
      hasProductLifetime,
      hasAverageAnnualConsumption,
      hasFileUploaded || hasAdditionalFields,
    ];

    return calculateProgress(progressChecks);
  }, [unitsSold, productLifetime, averageAnnualConsumption, files, additionalFields]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      unitsSold: false,
      productLifetime: false,
      averageAnnualConsumption: false,
    });
  };

  const validateForm = () => {
    const newErrors: UseOfSoldProductsErrors = {};
    const newFieldErrors = {
      unitsSold: false,
      productLifetime: false,
      averageAnnualConsumption: false,
    };

    // Validate input fields
    if (!unitsSold.trim()) {
      newErrors.unitsSold = "Please enter the number of units sold.";
      newFieldErrors.unitsSold = true;
    }

    if (!productLifetime.trim()) {
      newErrors.productLifetime = "Please enter the expected lifetime of the product.";
      newFieldErrors.productLifetime = true;
    }

    if (!averageAnnualConsumption.trim()) {
      newErrors.averageAnnualConsumption =
        "Please enter the average annual fuel/energy consumption.";
      newFieldErrors.averageAnnualConsumption = true;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      // Input fields
      unitsSold,
      productLifetime,
      averageAnnualConsumption,

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
      type: "UPDATE_DOWNSTREAM_USE_OF_SOLD",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope3.downstream.useOfSoldProducts", payload);
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
  const handleUnitsSoldChange = (value: string) => {
    setUnitsSold(value);
    if (fieldErrors.unitsSold) {
      setErrors((prev) => ({ ...prev, unitsSold: undefined }));
      setFieldErrors((prev) => ({ ...prev, unitsSold: false }));
    }
  };

  const handleProductLifetimeChange = (value: string) => {
    setProductLifetime(value);
    if (fieldErrors.productLifetime) {
      setErrors((prev) => ({ ...prev, productLifetime: undefined }));
      setFieldErrors((prev) => ({ ...prev, productLifetime: false }));
    }
  };

  const handleAverageAnnualConsumptionChange = (value: string) => {
    setAverageAnnualConsumption(value);
    if (fieldErrors.averageAnnualConsumption) {
      setErrors((prev) => ({ ...prev, averageAnnualConsumption: undefined }));
      setFieldErrors((prev) => ({ ...prev, averageAnnualConsumption: false }));
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
    { label: "Scope-3 Use of Sold Products" },
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
              Indirect emissions from activities after your operations
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
              <h4 className="text-xl font-medium text-foreground">3. Use of Sold Products</h4>
              <p className="text-muted-foreground text-base">
                Report emissions from the use of products and services sold by your company.
              </p>
            </div>

            {/* 3.1 Use of Sold Products */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <SmartInput
                    label="Number of units sold"
                    placeholder="Enter total units sold"
                    type="number"
                    required
                    value={unitsSold}
                    onChange={handleUnitsSoldChange}
                    errorTrigger={fieldErrors.unitsSold}
                    errorMessage="Please enter the number of units sold."
                  />
                  {errors.unitsSold && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.unitsSold}
                    </p>
                  )}

                  <SmartInput
                    label="Expected lifetime of the product"
                    type="number"
                    required
                    placeholder="Enter lifespan in years"
                    value={productLifetime}
                    onChange={handleProductLifetimeChange}
                    errorTrigger={fieldErrors.productLifetime}
                    errorMessage="Please enter the expected lifetime of the product."
                  />
                  {errors.productLifetime && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.productLifetime}
                    </p>
                  )}

                  <SmartInput
                    label="Average annual fuel/energy consumption of product (if applicable)"
                    type="number"
                    required
                    placeholder="Enter consumption amount"
                    value={averageAnnualConsumption}
                    onChange={handleAverageAnnualConsumptionChange}
                    errorTrigger={fieldErrors.averageAnnualConsumption}
                    errorMessage="Please enter the average annual fuel/energy consumption."
                  />
                  {errors.averageAnnualConsumption && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.averageAnnualConsumption}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3.2 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                3.2 Documents/Evidence Upload
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
