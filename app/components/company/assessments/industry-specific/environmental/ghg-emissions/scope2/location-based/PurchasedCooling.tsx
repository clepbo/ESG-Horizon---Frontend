"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ArrowLeft, Save, CheckCircle2, ArrowRight, CloudUpload, X, Info } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { useRouter } from "next/navigation";
import { ScopeInput } from "@/app/components/company/assessments/ScopeInput";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";

interface PurchasedCoolingFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

const uploadFields = [
  "Cooling energy invoices from service providers",
  "Equipment performance logs (e.g., chiller reports)",
  "Sub-metering or monitoring records",
];

const coolingSystemTypes = [
  { id: "centralized", label: "Centralized Chiller Plant (building-based)" },
  { id: "direct", label: "District Cooling System (utility-purchased)" },
  {
    id: "packaged",
    label: "Packaged Air Conditioning Units (split/rooftop)",
  },
  { id: "portable", label: "Portable Cooling Systems" },
  { id: "evaporative", label: "Evaporative Cooling Systems" },
];

export function PurchasedCoolingForm({
  onBack,
  onNext,
  onBackToHub,
  stepIndex,
  totalSteps,
  breadcrumb,
}: PurchasedCoolingFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const coolingConsumed = useFormattedNumber("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [otherComments, setOtherComments] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [errors, setErrors] = useState<{
    coolingConsumed?: string;
    selectedSystems?: string;
    files?: string;
  }>({});
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();
  const {
    saveNow,
    isLoading: isSaving,
    isAssignedTask,
    handleAssignedTaskRedirect,
  } = useAssessmentFlow("ghg-scope2-location-purchasedcooling");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // FIX: Check for null/undefined instead of truthiness to handle 0 values correctly
  useEffect(() => {
    const existingData = state.assessmentData.environment?.ghg?.scope2?.locationBased?.cooling;

    if (existingData) {
      coolingConsumed.setRawValue(
        existingData.coolingConsumed !== null && existingData.coolingConsumed !== undefined
          ? existingData.coolingConsumed.toString()
          : ""
      );
      setSelectedSystems(existingData.selectedSystems || []);
      setOtherComments(existingData.otherComments || "");
      setFiles(
        existingData.files ?? Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.assessmentData]);

  // FIX: Check for valid numbers >= 0 instead of just > 0
  const { filled, total } = useMemo(() => {
    const hasCooling =
      coolingConsumed.rawValue !== "" &&
      coolingConsumed.rawValue !== null &&
      coolingConsumed.rawValue !== undefined &&
      !isNaN(Number(coolingConsumed.rawValue)) &&
      Number(coolingConsumed.rawValue) >= 0;

    const hasFiles =
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file);

    return calculateProgress([hasCooling, hasFiles]);
  }, [coolingConsumed.rawValue, files, additionalFields]);

  const handleSystemChange = (systemId: string, checked: boolean) => {
    setSelectedSystems((prev) =>
      checked ? [...prev, systemId] : prev.filter((id) => id !== systemId)
    );
    if (errors.selectedSystems) {
      setErrors((prev) => ({ ...prev, selectedSystems: undefined }));
    }
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

  // FIX: Accept 0 and any valid number >= 0
  const validateForm = () => {
    const newErrors: {
      coolingConsumed?: string;
      selectedSystems?: string;
      files?: string;
    } = {};

    if (
      coolingConsumed.rawValue === "" ||
      coolingConsumed.rawValue === null ||
      coolingConsumed.rawValue === undefined ||
      isNaN(Number(coolingConsumed.rawValue)) ||
      Number(coolingConsumed.rawValue) < 0
    ) {
      newErrors.coolingConsumed = "Please enter a valid cooling consumption value (0 or greater).";
    }
    if (selectedSystems.length === 0) {
      newErrors.selectedSystems = "Please select at least one cooling system type.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      coolingConsumed: String(coolingConsumed.rawValue) || "",
      selectedSystems,
      otherComments,
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
      type: "UPDATE_LOCATION_COOLING",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope2.locationBased.cooling", payload);
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
      type: "UPDATE_LOCATION_COOLING",
      payload: {
        coolingConsumed: String(coolingConsumed.rawValue) || "",
        selectedSystems,
        otherComments,
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
        {/* Header */}
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 bg-white border-primary text-primary hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Scope 2: Purchased Cooling</h3>
            <p className="text-muted-foreground text-base">
              Emissions from cooling energy purchased for your facilities
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            {/* Progress bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Cooling Consumed */}
            <div>
              <Label className="text-md font-semibold mb-2 block">2.1 Purchased Cooling</Label>
              <div className="ml-6">
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="cooling-consumed" className="text-sm font-medium text-gray-700">
                    Amount of Cooling Energy Consumed (kWh) <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Cooling Energy Input Guide</p>
                        <p className="text-xs">
                          Enter the total cooling energy consumed during the reporting period.
                        </p>
                        <p className="text-xs mt-1">
                          • You can enter 0 if no cooling energy was consumed
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
                  category="cooling"
                  formattedValue={coolingConsumed}
                  label=""
                  placeholder="Enter amount in kWh"
                  required={false}
                  error={errors.coolingConsumed}
                  showEmissionFactor={true}
                  onErrorClear={() =>
                    setErrors((prev) => ({ ...prev, coolingConsumed: undefined }))
                  }
                />
              </div>
            </div>

            {/* Cooling System Types */}
            <div>
              <Label className="text-md font-medium mb-2 block ml-6">
                Type of Cooling System <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3 ml-6">
                {coolingSystemTypes.map((system) => (
                  <div key={system.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={system.id}
                      checked={selectedSystems.includes(system.id)}
                      onCheckedChange={(checked) =>
                        handleSystemChange(system.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={system.id}>{system.label}</Label>
                  </div>
                ))}
              </div>
              {errors.selectedSystems && (
                <p className="text-sm text-red-500 mt-1">{errors.selectedSystems}</p>
              )}
            </div>

            {/* Others */}
            <div className="ml-6">
              <Label htmlFor="other-comments">Others</Label>
              <Textarea
                id="other-comments"
                placeholder="Please specify"
                value={otherComments}
                onChange={(e) => setOtherComments(e.target.value)}
                rows={3}
              />
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                2.2 Documents/Evidence Uploads
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
                            <p className="text-sm text-green-600 wrap-break-word max-w-full text-center">
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
