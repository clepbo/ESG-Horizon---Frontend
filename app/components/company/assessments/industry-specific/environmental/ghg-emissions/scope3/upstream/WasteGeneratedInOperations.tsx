"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight, X } from "lucide-react";
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
import { Checkbox } from "@/app/components/ui/checkbox";

interface WasteGeneratedProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface WasteGeneratedErrors {
  wasteWeight?: string;
  wasteManagementMethod?: string;
  files?: string;
}

const uploadFields = [
  "Waste disposal invoices/contracts",
  "Waste manifests/tracking records",
  "Recycling/recovery certificates",
];

const WASTE_METHODS = [
  { id: "landfill", label: "Landfill" },
  { id: "recycling", label: "Recycling" },
  { id: "composting", label: "Composting" },
  { id: "incineration", label: "Incineration" },
  { id: "others", label: "Others" },
] as const;

export function WasteGeneratedInOperations({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: WasteGeneratedProps) {
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
  const [errors, setErrors] = useState<WasteGeneratedErrors>({});
  const [wasteWeight, setWasteWeight] = useState("");

  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [otherMethodInput, setOtherMethodInput] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    wasteWeight: false,
    wasteManagementMethod: false,
  });

  const { saveNow, isLoading } = useAssessmentFlow("ghg-scope3-upstream-waste");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Load existing data
  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope3?.upstream?.wasteGeneratedInOperations;
    if (existingData) {
      const savedMethods = existingData.selectedMethods;
      const savedOtherValue = existingData.otherMethodValue;

      if (savedMethods && Array.isArray(savedMethods)) {
        setSelectedMethods(savedMethods);

        if (savedMethods.includes("others") && savedOtherValue) {
          setShowOtherInput(true);
          setOtherMethodInput(savedOtherValue);
        }
      }

      setWasteWeight(existingData.wasteWeight || "");
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.environment?.ghg?.scope3?.upstream]);

  const { filled, total } = useMemo(() => {
    const hasWasteWeight = wasteWeight.trim().length > 0;
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);
    const hasSelectedMethods = selectedMethods.length > 0;

    const progressChecks = [
      hasWasteWeight,
      hasSelectedMethods,
      hasFileUploaded || hasAdditionalFields,
    ];

    return calculateProgress(progressChecks);
  }, [wasteWeight, files, additionalFields, selectedMethods]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      wasteWeight: false,
      wasteManagementMethod: false,
    });
  };

  const handleMethodChange = (methodId: string, checked: boolean) => {
    if (checked) {
      setSelectedMethods((prev) => [...prev, methodId]);
      if (methodId === "others") {
        setShowOtherInput(true);
      }
    } else {
      setSelectedMethods((prev) => prev.filter((id) => id !== methodId));
      if (methodId === "others") {
        setShowOtherInput(false);
        setOtherMethodInput("");
      }
    }

    // Clear checkbox error when user selects ANY checkbox
    if (errors.wasteManagementMethod || fieldErrors.wasteManagementMethod) {
      setErrors((prev) => ({ ...prev, wasteManagementMethod: undefined }));
      setFieldErrors((prev) => ({ ...prev, wasteManagementMethod: false }));
    }
  };

  const validateForm = () => {
    const newErrors: WasteGeneratedErrors = {};
    const newFieldErrors = {
      wasteWeight: false,
      wasteManagementMethod: false,
    };

    // Validate waste weight field
    if (!wasteWeight.trim()) {
      newErrors.wasteWeight = "Please enter the total weight of waste generated.";
      newFieldErrors.wasteWeight = true;
    }

    // Validate checkbox field - only error if NO checkboxes are selected
    if (selectedMethods.length === 0) {
      newErrors.wasteManagementMethod = "Please select at least one waste management method.";
      newFieldErrors.wasteManagementMethod = true;
    } else if (selectedMethods.includes("others") && !otherMethodInput.trim()) {
      // Only check "others" input if "others" checkbox is selected
      newErrors.wasteManagementMethod = "Please specify the 'Others' waste management method.";
      newFieldErrors.wasteManagementMethod = true;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      wasteWeight,
      selectedMethods,
      otherMethodValue: selectedMethods.includes("others") ? otherMethodInput : "",
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
      type: "UPDATE_UPSTREAM_WASTE",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope3.upstream.wasteGeneratedInOperations", payload);
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
  const handleWasteWeightChange = (value: string) => {
    setWasteWeight(value);
    if (fieldErrors.wasteWeight) {
      setErrors((prev) => ({ ...prev, wasteWeight: undefined }));
      setFieldErrors((prev) => ({ ...prev, wasteWeight: false }));
    }
  };

  const handleOtherMethodInputChange = (value: string) => {
    setOtherMethodInput(value);
    // Clear error when user starts typing in "others" field
    if (errors.wasteManagementMethod || fieldErrors.wasteManagementMethod) {
      setErrors((prev) => ({ ...prev, wasteManagementMethod: undefined }));
      setFieldErrors((prev) => ({ ...prev, wasteManagementMethod: false }));
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
              <h4 className="text-xl font-medium text-foreground">Waste Generated in Operations</h4>
              <p className="text-muted-foreground text-base">
                Emissions from waste generated in operations, including treatment and disposal.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Label className="text-md font-medium mb-2 block">
                5.1 Waste Generated in Operations
              </Label>

              <div className="relative">
                <SmartInput
                  label="Total weight of waste generated"
                  type="number"
                  required
                  value={wasteWeight}
                  onChange={handleWasteWeightChange}
                  errorTrigger={fieldErrors.wasteWeight}
                  errorMessage="Please enter the total weight of waste generated."
                />
                <div className="absolute right-3 top-9 flex items-center gap-2">
                  {/* <Trash2 className="h-5 w-5 text-gray-600" /> */}
                  <span className="text-sm text-gray-600">tonnes</span>
                </div>
                {errors.wasteWeight && (
                  <p className="text-sm text-red-500 animate-pulse">{errors.wasteWeight}</p>
                )}
              </div>
            </div>

            {/* WASTE MANAGEMENT METHODS CHECKBOX FIELD */}
            <div className="space-y-4">
              <Label className="text-md font-medium block">
                Waste management method (select all that apply):
              </Label>

              {errors.wasteManagementMethod && (
                <p className="text-sm text-red-500 animate-pulse">{errors.wasteManagementMethod}</p>
              )}

              <div className="grid grid-cols-1 gap-4 ml-4">
                {WASTE_METHODS.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={method.id}
                      checked={selectedMethods.includes(method.id)}
                      onCheckedChange={(checked) =>
                        handleMethodChange(method.id, checked as boolean)
                      }
                      className={fieldErrors.wasteManagementMethod ? "border-red-500" : ""}
                    />
                    <Label
                      htmlFor={method.id}
                      className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                    >
                      {method.label}
                    </Label>
                  </div>
                ))}
              </div>

              {showOtherInput && (
                <div className="ml-4 mt-4 space-y-2">
                  <Label htmlFor="other-method" className="text-sm font-medium">
                    Please specify other waste management method:
                  </Label>
                  <Input
                    id="other-method"
                    type="text"
                    placeholder="Enter other waste management method..."
                    value={otherMethodInput}
                    onChange={(e) => handleOtherMethodInputChange(e.target.value)}
                    className={`max-w-md ${fieldErrors.wasteManagementMethod ? "border-red-500" : ""}`}
                  />
                  <p className="text-xs text-gray-500">
                    Specify other waste management methods not listed above
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-md font-medium mb-2 block">5.2 Document/Evidence Upload</Label>
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
