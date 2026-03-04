"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, CloudUpload, Info } from "lucide-react";
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

interface PurchasedElectricityFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
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
  breadcrumb,
}: PurchasedElectricityFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
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

  const router = useRouter();
  const {
    saveNow,
    isLoading: isSaving,
    isAssignedTask,
    handleAssignedTaskRedirect,
  } = useAssessmentFlow("ghg-scope2-location-purchasedelectricity");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // FIX: Check for null/undefined instead of truthiness to handle 0 values correctly
  useEffect(() => {
    const existingData = state.assessmentData.environment?.ghg?.scope2?.locationBased?.electricity;

    if (existingData) {
      electricityConsumed.setRawValue(
        existingData.electricityConsumed !== null && existingData.electricityConsumed !== undefined
          ? existingData.electricityConsumed.toString()
          : ""
      );
      setSupplier(existingData.supplier ?? "");
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
      electricityConsumed.rawValue !== "" &&
      electricityConsumed.rawValue !== null &&
      electricityConsumed.rawValue !== undefined &&
      !isNaN(Number(electricityConsumed.rawValue)) &&
      Number(electricityConsumed.rawValue) >= 0;

    const hasSupplier = supplier.trim() !== "";
    const hasFiles =
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file);

    return calculateProgress([hasElectricity, hasSupplier, hasFiles]);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleElectricityConsumedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    electricityConsumed.handleChange(value);

    if (errors.electricityConsumed) {
      setErrors((prev) => ({
        ...prev,
        electricityConsumed: undefined,
      }));
    }
  };

  // FIX: Accept 0 and any valid number >= 0
  const validateForm = () => {
    const newErrors: {
      electricityConsumed?: string;
      supplier?: string;
      files?: string;
    } = {};

    if (
      electricityConsumed.rawValue === "" ||
      electricityConsumed.rawValue === null ||
      electricityConsumed.rawValue === undefined ||
      isNaN(Number(electricityConsumed.rawValue)) ||
      Number(electricityConsumed.rawValue) < 0
    ) {
      newErrors.electricityConsumed =
        "Please enter a valid electricity consumption value (0 or greater).";
    }
    if (!supplier.trim()) {
      newErrors.supplier = "Please enter your electricity supplier.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      electricityConsumed: electricityConsumed.rawValue,
      supplier,
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
      type: "UPDATE_LOCATION_ELECTRICITY",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope2.locationBased.electricity", payload);
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
      type: "UPDATE_LOCATION_ELECTRICITY",
      payload: {
        electricityConsumed: electricityConsumed.rawValue,
        supplier,
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
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 bg-white border-primary text-primary hover:bg-green-50"
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
              groupKey="environment.ghg.scope2.locationBased"
            />

            {/* Electricity Consumed */}
            <div>
              <Label className="text-md font-semibold mb-2 block">1.1 Purchased Electricity</Label>
              <div className="ml-6">
                <div className="flex items-center gap-1 mb-2">
                  <Label
                    htmlFor="electricity-consumed"
                    className="text-sm font-medium text-gray-700"
                  >
                    Total Electricity Consumed (kWh) <span className="text-red-500">*</span>
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
                  formattedValue={electricityConsumed}
                  label=""
                  placeholder="Enter total electricity consumed in kWh"
                  required={false}
                  error={errors.electricityConsumed}
                  showEmissionFactor
                  onErrorClear={() =>
                    setErrors((prev) => ({ ...prev, electricityConsumed: undefined }))
                  }
                />
              </div>
            </div>

            {/* Electricity Supplier */}
            <div className="space-y-4 ml-6">
              <Label>
                Electricity Supplier <span className="text-red-500">*</span>
              </Label>
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
                className="cursor-pointer justify-self-start border-primary text-primary hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-primary hover:cursor-pointer text-white hover:bg-primary transition-colors"
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
                className="cursor-pointer justify-self-end border-primary text-primary hover:bg-green-50 flex items-center gap-2"
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
