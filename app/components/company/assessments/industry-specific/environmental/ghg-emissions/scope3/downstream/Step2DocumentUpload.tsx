"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  CloudUpload,
  ArrowRight,
  FileText,
  FileCheck,
  ClipboardList,
  X,
} from "lucide-react";
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

interface DocumentUploadProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToParentSection: () => void;
}

interface DocumentUploadErrors {
  files?: string;
  [key: string]: string | undefined;
}

const uploadFields = [
  {
    key: "salesInvoicesContracts",
    label: "Sales invoices/contracts",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    key: "processingAgreementsBuyers",
    label: "Processing agreements with buyers",
    icon: FileCheck,
    color: "text-green-600",
  },
  {
    key: "productionSalesRecords",
    label: "Production/sales records",
    icon: ClipboardList,
    color: "text-purple-600",
  },
];

export function DocumentUpload({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToParentSection,
}: DocumentUploadProps) {
  const { state, dispatch } = useAssessment();
  const router = useRouter();

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field.key, null]))
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<DocumentUploadErrors>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(uploadFields.map((field) => [field.key, false]))
  );

  const { saveNow, saveQuiet, isLoading } = useAssessmentFlow("ghg-scope3-document-upload");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Load existing data
  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope3?.downstream?.processingSoldProducts;
    if (existingData) {
      // Files
      const loadedFiles: { [key: string]: FileMetadata | null } = {};
      uploadFields.forEach((field) => {
        loadedFiles[field.key] = existingData.files?.[field.key] || null;
      });
      setFiles(loadedFiles);
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.environment?.ghg?.scope3?.downstream]);

  const { filled, total } = useMemo(() => {
    // Check if all three required files are uploaded
    const allRequiredFilesUploaded = uploadFields.every((field) => files[field.key] !== null);
    const hasAdditionalFields = additionalFields.length > 0;

    const progressChecks = [
      allRequiredFilesUploaded,
      hasAdditionalFields || allRequiredFilesUploaded, // Count as completed if either has files
    ];

    return calculateProgress(progressChecks);
  }, [files, additionalFields]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    const newFieldErrors: { [key: string]: boolean } = {};
    uploadFields.forEach((field) => {
      newFieldErrors[field.key] = false;
    });
    setFieldErrors(newFieldErrors);
  };

  const validateForm = () => {
    const newErrors: DocumentUploadErrors = {};
    const newFieldErrors: { [key: string]: boolean } = {};

    // Validate that all three required files are uploaded
    uploadFields.forEach((field) => {
      if (!files[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
        newFieldErrors[field.key] = true;
      }
    });

    // Set general files error if any file is missing
    const missingFiles = uploadFields.filter((field) => !files[field.key]);
    if (missingFiles.length > 0) {
      newErrors.files = `Please upload all required documents: ${missingFiles.map((f) => f.label).join(", ")}`;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
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
      type: "UPDATE_DOWNSTREAM_PROCESSING_SOLD",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope3.downstream.processingSoldProducts", payload);
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
      // Auto-clear errors after 5 seconds
      setTimeout(clearAllErrors, 5000);
      return;
    }

    const payload = {
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
      type: "UPDATE_DOWNSTREAM_PROCESSING_SOLD",
      payload,
    });

    saveQuiet("environment.ghg.scope3.downstream.processingSoldProducts", payload).catch(() => {});
    onNext();
  };

  const handleSubmit = () => {
    handleNext();
  };

  const handleFileChange = async (fieldKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [fieldKey]: `File exceeds 10MB limit` }));
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [fieldKey]: true }));

      const uploaded = await uploadService.uploadImage(file);

      if (uploaded?.url) {
        setFiles((prev) => ({
          ...prev,
          [fieldKey]: {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
            url: uploaded.url,
            publicId: uploaded.publicId,
          },
        }));

        // Clear error for this field when file is uploaded
        setErrors((prev) => ({ ...prev, [fieldKey]: undefined }));
        setFieldErrors((prev) => ({ ...prev, [fieldKey]: false }));

        toast.success(`${file.name} uploaded successfully`);
      } else {
        toast.error("Failed to upload file");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading file");
    } finally {
      setUploading((prev) => ({ ...prev, [fieldKey]: false }));
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
    { label: "GHG Emissions", onClick: backToParentSection },
    { label: "9.2 Documents/Evidence Upload" },
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
            <h4 className="text-xl font-medium text-foreground">
              Category 9: Downstream Transportation & Distribution
            </h4>
            <p className="text-muted-foreground text-base">
              Report transportation and distribution data for products sold to customers.
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
              groupKey="environment.ghg.scope3.downstream"
            />
            <div>
              <h4 className="text-xl font-medium text-foreground">Required Documents</h4>
              <p className="text-muted-foreground text-base">
                All documents must be uploaded before you can proceed to the next step.
              </p>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-6">
              {errors.files && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium">{errors.files}</p>
                  <p className="text-red-500 text-sm mt-1">
                    Please upload all three required documents to continue.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadFields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key} className="flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                        {/* <Icon className={`h-5 w-5 ${field.color}`} /> */}
                        <Label className="text-sm font-medium text-gray-900">
                          {field.label}
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                      </div>

                      <Card
                        className={`p-4 flex flex-col items-center justify-center border transition-all h-full flex-1 ${
                          fieldErrors[field.key]
                            ? "border-red-300 bg-red-50/50"
                            : files[field.key]
                              ? "border-green-300 bg-green-50/30"
                              : "border-gray-200 hover:border-primary"
                        }`}
                      >
                        <Label
                          htmlFor={`upload-${field.key}`}
                          className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center"
                        >
                          <div className="flex flex-col items-center">
                            <CloudUpload className={`h-10 w-10 text-gray-500 mb-2`} />
                            <span className="text-xs text-gray-500 text-center mb-1">
                              {files[field.key] ? "Click to change file" : "Click to upload"}
                            </span>
                            <span className="text-xs text-gray-400 text-center">
                              PDF, JPG, PNG (Max. 10MB)
                            </span>
                          </div>
                        </Label>
                        <Input
                          id={`upload-${field.key}`}
                          type="file"
                          ref={(el) => {
                            inputRefs.current[field.key] = el;
                          }}
                          className="hidden"
                          onChange={(e) => handleFileChange(field.key, e)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          aria-label={`Upload ${field.label}`}
                        />

                        {uploading[field.key] ? (
                          <div className="flex items-center gap-2 mt-4 text-gray-500">
                            <LoadingSpinner size="sm" /> Uploading...
                          </div>
                        ) : deleting[field.key] ? (
                          <div className="flex items-center gap-2 mt-4 text-red-500">
                            <LoadingSpinner size="sm" /> Deleting...
                          </div>
                        ) : files[field.key] ? (
                          <div className="flex flex-col items-center gap-2 mt-4 w-full">
                            <div className="flex items-center justify-between w-full bg-white p-2 rounded border">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                                <span className="text-sm text-gray-700 truncate">
                                  {files[field.key]!.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(field.key)}
                                disabled={deleting[field.key]}
                                className="ml-2 text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                                aria-label={`Remove ${field.label}`}
                              >
                                <X />
                              </button>
                            </div>
                            <div className="w-8 h-1 bg-green-500 rounded-full mt-1"></div>
                          </div>
                        ) : null}

                        {fieldErrors[field.key] && errors[field.key] && (
                          <p className="text-red-500 text-xs mt-2 text-center">
                            {errors[field.key]}
                          </p>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Upload Progress */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {Object.values(files).filter(Boolean).length} of 3 uploaded
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(Object.values(files).filter(Boolean).length / 3) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Object.values(files).filter(Boolean).length === 3
                    ? "✅ All required documents uploaded. You can now proceed."
                    : `${3 - Object.values(files).filter(Boolean).length} more document(s) required.`}
                </p>
              </div>
            </div>

            {/* Additional Files Section */}
            <div className="mt-8">
              {/* <Label className="text-md font-medium mb-2 block">Additional Supporting Documents (Optional)</Label>
              <p className="text-sm text-gray-600 mb-4">
                Upload any additional files that support your documentation (optional).
              </p> */}
              <AdditionalFileUpload
                onFieldsChange={(newFields) => {
                  setAdditionalFields(newFields);
                }}
                initialData={additionalFields}
              />
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
                disabled={isLoading || Object.values(files).filter(Boolean).length < 3}
                className={`justify-self-end hover:cursor-pointer flex items-center gap-2 ${
                  Object.values(files).filter(Boolean).length < 3
                    ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                    : "border-primary text-primary bg-transparent hover:bg-green-50"
                }`}
                aria-label="Next step"
              >
                {Object.values(files).filter(Boolean).length < 3
                  ? `Need ${3 - Object.values(files).filter(Boolean).length} more`
                  : "Next"}
                {Object.values(files).filter(Boolean).length === 3 && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
