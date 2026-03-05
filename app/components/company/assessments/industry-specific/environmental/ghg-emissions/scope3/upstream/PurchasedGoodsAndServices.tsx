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
import { FilePreview } from "@/app/components/common/FilePreview";
import { Input } from "@/app/components/ui/input";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import SmartInput from "../components/Scope3Input";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Info } from "lucide-react";

interface UpstreamProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface ElectricityHeatErrors {
  electricity?: string;
  purchasedGoods?: string;
  files?: string;
  goodsCategories?: string;
}

const uploadFields = [
  "Purchase invoices/receipts",
  "Procurement records",
  "Supplier declarations on product weight/composition",
];

const GOODS_CATEGORIES = [
  { id: "raw_materials", label: "Raw materials" },
  { id: "packaging", label: "Packaging" },
  { id: "office_supplies", label: "Office supplies" },
  { id: "it_equipment", label: "IT equipment" },
  { id: "others", label: "Others" },
] as const;

export function PurchasedGoodsAndServices({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: UpstreamProps) {
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
  const [errors, setErrors] = useState<ElectricityHeatErrors>({});
  const [electricity, setElectricity] = useState("");
  const [purchasedGoods, setPurchasedGoods] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherCategoryInput, setOtherCategoryInput] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Combine all field error triggers into one state
  const [fieldErrors, setFieldErrors] = useState({
    electricity: false,
    purchasedGoods: false,
    goodsCategories: false,
  });

  const { saveNow, isLoading } = useAssessmentFlow("ghg-scope3-upstream-purchasedgoodsandservices");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // FIX: Load existing data with proper null/undefined handling
  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope3?.upstream?.purchasedGoodsAndServices;
    if (existingData) {
      // FIX: Handle null/undefined properly for numeric values
      setElectricity(
        existingData.totalAmountSpent !== null && existingData.totalAmountSpent !== undefined
          ? existingData.totalAmountSpent.toString()
          : ""
      );
      setPurchasedGoods(
        existingData.massOfGoods !== null && existingData.massOfGoods !== undefined
          ? existingData.massOfGoods.toString()
          : ""
      );

      const savedCategories = existingData.selectedCategories;
      const savedOtherValue = existingData.otherCategoryValue;

      if (savedCategories && Array.isArray(savedCategories)) {
        setSelectedCategories(savedCategories);

        if (savedCategories.includes("others") && savedOtherValue) {
          setShowOtherInput(true);
          setOtherCategoryInput(savedOtherValue);
        }
      }

      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.environment?.ghg?.scope3?.upstream]);

  // FIX: Check for valid numbers >= 0 instead of just checking length
  const { filled, total } = useMemo(() => {
    const hasSpendingData =
      electricity !== "" &&
      electricity !== null &&
      electricity !== undefined &&
      !isNaN(Number(electricity)) &&
      Number(electricity) >= 0;

    const hasMassData =
      purchasedGoods !== "" &&
      purchasedGoods !== null &&
      purchasedGoods !== undefined &&
      !isNaN(Number(purchasedGoods)) &&
      Number(purchasedGoods) >= 0;

    const hasSelectedCategories = selectedCategories.length > 0;

    const progressChecks = [
      hasSpendingData,
      hasMassData,
      hasSelectedCategories,
    ];

    return calculateProgress(progressChecks);
  }, [electricity, purchasedGoods, selectedCategories]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      electricity: false,
      purchasedGoods: false,
      goodsCategories: false,
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
      if (categoryId === "others") {
        setShowOtherInput(true);
      }
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
      if (categoryId === "others") {
        setShowOtherInput(false);
        setOtherCategoryInput("");
      }
    }

    // Clear checkbox error when user selects ANY checkbox
    if (errors.goodsCategories || fieldErrors.goodsCategories) {
      setErrors((prev) => ({ ...prev, goodsCategories: undefined }));
      setFieldErrors((prev) => ({ ...prev, goodsCategories: false }));
    }
  };

  // FIX: Accept 0 and any valid number >= 0
  const validateForm = () => {
    const newErrors: ElectricityHeatErrors = {};
    const newFieldErrors = {
      electricity: false,
      purchasedGoods: false,
      goodsCategories: false,
    };

    // FIX: Validate electricity field - accept 0 or greater
    if (
      electricity === "" ||
      electricity === null ||
      electricity === undefined ||
      isNaN(Number(electricity)) ||
      Number(electricity) < 0
    ) {
      newErrors.electricity = "Please enter a valid amount spent (0 or greater).";
      newFieldErrors.electricity = true;
    }

    // FIX: Validate purchased goods field - accept 0 or greater
    if (
      purchasedGoods === "" ||
      purchasedGoods === null ||
      purchasedGoods === undefined ||
      isNaN(Number(purchasedGoods)) ||
      Number(purchasedGoods) < 0
    ) {
      newErrors.purchasedGoods = "Please enter a valid mass of goods (0 or greater).";
      newFieldErrors.purchasedGoods = true;
    }

    // // Validate checkbox field - only error if NO checkboxes are selected
    // if (selectedCategories.length === 0) {
    //   newErrors.goodsCategories = "Please select at least one category of goods/services.";
    //   newFieldErrors.goodsCategories = true;
    // } else if (selectedCategories.includes("others") && !otherCategoryInput.trim()) {
    //   // Only check "others" input if "others" checkbox is selected
    //   newErrors.goodsCategories = "Please specify the 'Others' category.";
    //   newFieldErrors.goodsCategories = true;
    // }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      totalAmountSpent: electricity,
      massOfGoods: purchasedGoods,
      files,
      selectedCategories,
      otherCategoryValue: selectedCategories.includes("others") ? otherCategoryInput : "",
      additionalFields: additionalFields.map((f) => ({
        name: f.name,
        size: f.size ?? 0,
        lastModified: f.lastModified ?? Date.now(),
        url: f.url ?? "",
        publicId: f.publicId ?? "",
      })),
    };

    dispatch({
      type: "UPDATE_UPSTREAM_PURCHASED_GOODS",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope3.upstream.purchasedGoodsAndServices", payload);
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
      totalAmountSpent: electricity,
      massOfGoods: purchasedGoods,
      files,
      selectedCategories,
      otherCategoryValue: selectedCategories.includes("others") ? otherCategoryInput : "",
      additionalFields: additionalFields.map((f) => ({
        name: f.name,
        size: f.size ?? 0,
        lastModified: f.lastModified ?? Date.now(),
        url: f.url ?? "",
        publicId: f.publicId ?? "",
      })),
    };

    dispatch({
      type: "UPDATE_UPSTREAM_PURCHASED_GOODS",
      payload,
    });

    onNext();
  };

  const handleSubmit = () => {
    handleNext();
  };

  // Handle input changes with automatic error clearing
  const handleElectricityChange = (value: string) => {
    setElectricity(value);
    if (fieldErrors.electricity) {
      setErrors((prev) => ({ ...prev, electricity: undefined }));
      setFieldErrors((prev) => ({ ...prev, electricity: false }));
    }
  };

  const handlePurchasedGoodsChange = (value: string) => {
    setPurchasedGoods(value);
    if (fieldErrors.purchasedGoods) {
      setErrors((prev) => ({ ...prev, purchasedGoods: undefined }));
      setFieldErrors((prev) => ({ ...prev, purchasedGoods: false }));
    }
  };

  const handleOtherCategoryInputChange = (value: string) => {
    setOtherCategoryInput(value);
    // Clear error when user starts typing in "others" field
    if (errors.goodsCategories || fieldErrors.goodsCategories) {
      setErrors((prev) => ({ ...prev, goodsCategories: undefined }));
      setFieldErrors((prev) => ({ ...prev, goodsCategories: false }));
    }
  };

  // File handling functions
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
            onClick={backToGHGEmissions}
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
              groupKey="environment.ghg.scope3.upstream"
            />
            <div>
              <h4 className="text-xl font-medium text-foreground">
                Electricity and Heat Generation
              </h4>
              <p className="text-muted-foreground text-base">
                Emissions from producing electricity or heat, whether for your own use or for sale
                to others.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Label className="text-md font-medium mb-2 block">
                1.1 Purchased Goods & Services
              </Label>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Total amount spent on purchased goods/services{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Amount Spent Input Guide</p>
                        <p className="text-xs">
                          Enter the total amount spent on purchased goods/services during the
                          reporting period.
                        </p>
                        <p className="text-xs mt-1">• You can enter 0 if no purchases were made</p>
                        <p className="text-xs">• Negative values are not allowed</p>
                        <p className="text-xs">
                          • Use decimals for precise amounts (e.g., 1250.50)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <SmartInput
                  label=""
                  type="number"
                  unit="₦"
                  required
                  value={electricity}
                  onChange={(value) => {
                    handleElectricityChange(value);
                    // Notify parent that this specific field's error state may have changed
                    if (fieldErrors.electricity && value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, electricity: false }));
                      setErrors((prev) => ({ ...prev, electricity: undefined }));
                    }
                  }}
                  errorTrigger={fieldErrors.electricity}
                  errorMessage="Please enter the total amount spent on purchased goods/services."
                />
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Mass of goods purchased <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Mass of Goods Input Guide</p>
                        <p className="text-xs">
                          Enter the total mass (weight) of goods purchased during the reporting
                          period.
                        </p>
                        <p className="text-xs mt-1">• You can enter 0 if no goods were purchased</p>
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
                  unit="kg"
                  required
                  value={purchasedGoods}
                  onChange={(value) => {
                    handlePurchasedGoodsChange(value);
                    if (fieldErrors.purchasedGoods && value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, purchasedGoods: false }));
                      setErrors((prev) => ({ ...prev, purchasedGoods: undefined }));
                    }
                  }}
                  errorTrigger={fieldErrors.purchasedGoods}
                  errorMessage="Please enter the mass of goods purchased."
                />
              </div>
            </div>

            {/* CHECKBOX FIELD */}
            <div className="space-y-4">
              <Label className="text-md font-medium block">
                Select Categories of purchases
              </Label>

              {errors.goodsCategories && (
                <p className="text-sm text-red-500 animate-pulse">{errors.goodsCategories}</p>
              )}

              <div className="grid grid-cols-1 gap-4 ml-4">
                {GOODS_CATEGORIES.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked as boolean)
                      }
                      className={fieldErrors.goodsCategories ? "border-red-500" : ""}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>

              {showOtherInput && (
                <div className="ml-4 mt-4 space-y-2">
                  <Label htmlFor="other-category" className="text-sm font-medium">
                    Please specify other category:
                  </Label>
                  <Input
                    id="other-category"
                    type="text"
                    placeholder="Enter other category..."
                    value={otherCategoryInput}
                    onChange={(e) => handleOtherCategoryInputChange(e.target.value)}
                    className={`max-w-md ${fieldErrors.goodsCategories ? "border-red-500" : ""}`}
                  />
                  <p className="text-xs text-gray-500">
                    Specify other types of goods/services not listed above
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-md font-medium mb-2 block">1.2 Document/Evidence Upload</Label>
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
