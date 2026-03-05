"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight, Info } from "lucide-react";
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
import { Checkbox } from "@/app/components/ui/checkbox";
import { FilePreview } from "@/app/components/common/FilePreview";

interface EmployeeCommutingProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface EmployeeCommutingErrors {
  numberOfEmployees?: string;
  averageDistance?: string;
  commutingMethods?: string;
  workdaysPerYear?: string;
  files?: string;
}

const uploadFields = [
  "Employee commuting survey result",
  "HR workforce records",
  "Transport allowance record",
];

const COMMUTING_METHODS = [
  { id: "cars", label: "Cars" },
  { id: "bus", label: "Bus" },
  { id: "motorcycle", label: "Motorcycle" },
  { id: "train", label: "Train" },
  { id: "walking", label: "Walking" },
  { id: "cycling", label: "Cycling" },
  { id: "others", label: "Others" },
] as const;

export function EmployeeCommuting({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: EmployeeCommutingProps) {
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
  const [errors, setErrors] = useState<EmployeeCommutingErrors>({});

  // Input fields
  const [numberOfEmployees, setNumberOfEmployees] = useState("");
  const [averageDistance, setAverageDistance] = useState("");
  const [workdaysPerYear, setWorkdaysPerYear] = useState("");

  // Checkbox fields
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [otherMethodInput, setOtherMethodInput] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    numberOfEmployees: false,
    averageDistance: false,
    commutingMethods: false,
    workdaysPerYear: false,
  });

  const { saveNow, saveQuiet, isLoading } = useAssessmentFlow("ghg-scope3-upstream-employee-commuting");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Load existing data
  useEffect(() => {
    const existingData = state.assessmentData.environment?.ghg?.scope3?.upstream?.employeeCommuting;
    if (existingData) {
      const s = (v: any) => (v !== null && v !== undefined ? v.toString() : "");
      // Input fields
      setNumberOfEmployees(s(existingData.numberOfEmployees));
      setAverageDistance(s(existingData.averageDistance));
      setWorkdaysPerYear(s(existingData.workdaysPerYear));

      // Checkbox fields
      const savedMethods = existingData.selectedMethods;
      const savedOtherValue = existingData.otherMethodValue;

      if (savedMethods && Array.isArray(savedMethods)) {
        setSelectedMethods(savedMethods);

        if (savedMethods.includes("others") && savedOtherValue) {
          setShowOtherInput(true);
          setOtherMethodInput(savedOtherValue);
        }
      }

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
    const hasNumberOfEmployees =
      numberOfEmployees.trim() !== "" &&
      !isNaN(Number(numberOfEmployees)) &&
      Number(numberOfEmployees) >= 0;
    const hasAverageDistance =
      averageDistance.trim() !== "" &&
      !isNaN(Number(averageDistance)) &&
      Number(averageDistance) >= 0;
    const hasSelectedMethods = selectedMethods.length > 0;
    const hasWorkdaysPerYear =
      workdaysPerYear.trim() !== "" &&
      !isNaN(Number(workdaysPerYear)) &&
      Number(workdaysPerYear) >= 0;
    const progressChecks = [
      hasNumberOfEmployees,
      hasAverageDistance,
      hasSelectedMethods,
      hasWorkdaysPerYear,
    ];

    return calculateProgress(progressChecks);
  }, [
    numberOfEmployees,
    averageDistance,
    selectedMethods,
    workdaysPerYear,
  ]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      numberOfEmployees: false,
      averageDistance: false,
      commutingMethods: false,
      workdaysPerYear: false,
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
    if (errors.commutingMethods || fieldErrors.commutingMethods) {
      setErrors((prev) => ({ ...prev, commutingMethods: undefined }));
      setFieldErrors((prev) => ({ ...prev, commutingMethods: false }));
    }
  };

  const validateForm = () => {
    const newErrors: EmployeeCommutingErrors = {};
    const newFieldErrors = {
      numberOfEmployees: false,
      averageDistance: false,
      commutingMethods: false,
      workdaysPerYear: false,
    };

    // Validate input fields - accept 0 and any valid number >= 0
    if (
      !numberOfEmployees.trim() ||
      isNaN(Number(numberOfEmployees)) ||
      Number(numberOfEmployees) < 0
    ) {
      newErrors.numberOfEmployees =
        "Please enter the number of employees commuting (0 or greater).";
      newFieldErrors.numberOfEmployees = true;
    }

    if (!averageDistance.trim() || isNaN(Number(averageDistance)) || Number(averageDistance) < 0) {
      newErrors.averageDistance =
        "Please enter the average one-way commuting distance (0 or greater).";
      newFieldErrors.averageDistance = true;
    }

    if (!workdaysPerYear.trim() || isNaN(Number(workdaysPerYear)) || Number(workdaysPerYear) < 0) {
      newErrors.workdaysPerYear =
        "Please enter the average number of workdays per year (0 or greater).";
      newFieldErrors.workdaysPerYear = true;
    }

    // Validate checkbox field - only error if NO checkboxes are selected
    // if (selectedMethods.length === 0) {
    //   newErrors.commutingMethods = "Please select at least one commuting method.";
    //   newFieldErrors.commutingMethods = true;
    // } else if (selectedMethods.includes("others") && !otherMethodInput.trim()) {
    //   // Only check "others" input if "others" checkbox is selected
    //   newErrors.commutingMethods = "Please specify the 'Others' commuting method.";
    //   newFieldErrors.commutingMethods = true;
    // }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      // Input fields
      numberOfEmployees,
      averageDistance,
      workdaysPerYear,

      // Checkbox fields
      selectedMethods,
      otherMethodValue: selectedMethods.includes("others") ? otherMethodInput : "",

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
      type: "UPDATE_UPSTREAM_EMPLOYEE_COMMUTING",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope3.upstream.employeeCommuting", payload);
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
      // Input fields
      numberOfEmployees,
      averageDistance,
      workdaysPerYear,

      // Checkbox fields
      selectedMethods,
      otherMethodValue: selectedMethods.includes("others") ? otherMethodInput : "",

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
      type: "UPDATE_UPSTREAM_EMPLOYEE_COMMUTING",
      payload,
    });

    saveQuiet("environment.ghg.scope3.upstream.employeeCommuting", payload).catch(() => {});
    onNext();
  };

  const handleSubmit = () => {
    handleNext();
  };

  // Handle input changes with automatic error clearing
  const handleNumberOfEmployeesChange = (value: string) => {
    setNumberOfEmployees(value);
    if (fieldErrors.numberOfEmployees) {
      setErrors((prev) => ({ ...prev, numberOfEmployees: undefined }));
      setFieldErrors((prev) => ({ ...prev, numberOfEmployees: false }));
    }
  };

  const handleAverageDistanceChange = (value: string) => {
    setAverageDistance(value);
    if (fieldErrors.averageDistance) {
      setErrors((prev) => ({ ...prev, averageDistance: undefined }));
      setFieldErrors((prev) => ({ ...prev, averageDistance: false }));
    }
  };

  const handleWorkdaysPerYearChange = (value: string) => {
    setWorkdaysPerYear(value);
    if (fieldErrors.workdaysPerYear) {
      setErrors((prev) => ({ ...prev, workdaysPerYear: undefined }));
      setFieldErrors((prev) => ({ ...prev, workdaysPerYear: false }));
    }
  };

  const handleOtherMethodInputChange = (value: string) => {
    setOtherMethodInput(value);
    // Clear error when user starts typing in "others" field
    if (errors.commutingMethods || fieldErrors.commutingMethods) {
      setErrors((prev) => ({ ...prev, commutingMethods: undefined }));
      setFieldErrors((prev) => ({ ...prev, commutingMethods: false }));
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
              groupKey="environment.ghg.scope3.upstream"
            />
            <div>
              <h4 className="text-xl font-medium text-foreground">Employee Commuting</h4>
              <p className="text-muted-foreground text-base">
                Emissions from employee commuting to and from work.
              </p>
            </div>

            {/* 7.1 Employee Commuting */}
            <div className="space-y-6">
              <Label className="text-md font-medium block">7.1 Employee Commuting</Label>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3"></div>

                <div className="grid grid-cols-1  gap-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Number of employees commuting <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-semibold mb-1">Employee Count Input Guide</p>
                          <p className="text-xs">
                            Enter the total number of employees commuting during the reporting
                            period.
                          </p>
                          <p className="text-xs mt-1">• You can enter 0 if no employees commuted</p>
                          <p className="text-xs">• Negative values are not allowed</p>
                          <p className="text-xs">• Enter whole numbers only (e.g., 150)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <SmartInput
                    label=""
                    placeholder="Enter total number"
                    type="number"
                    required={false}
                    value={numberOfEmployees}
                    onChange={handleNumberOfEmployeesChange}
                    errorTrigger={fieldErrors.numberOfEmployees}
                    errorMessage="Please enter the number of employees commuting (0 or greater)."
                  />
                  {errors.numberOfEmployees && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.numberOfEmployees}
                    </p>
                  )}

                  <div className="relative">
                    <div className="flex items-center gap-1 mb-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Average one-way commuting distance <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Distance Input Guide</p>
                            <p className="text-xs">
                              Enter the average one-way commuting distance for employees.
                            </p>
                            <p className="text-xs mt-1">
                              • You can enter 0 if employees work on-site
                            </p>
                            <p className="text-xs">• Negative values are not allowed</p>
                            <p className="text-xs">
                              • Use decimals for precise measurements (e.g., 15.5)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <SmartInput
                      label=""
                      type="number"
                      required={false}
                      placeholder="Enter distance in km"
                      value={averageDistance}
                      onChange={handleAverageDistanceChange}
                      errorTrigger={fieldErrors.averageDistance}
                      errorMessage="Please enter the average one-way commuting distance (0 or greater)."
                    />
                    <div className="absolute right-3 top-9">
                      <span className="text-sm text-gray-600">km</span>
                    </div>
                    {errors.averageDistance && (
                      <p className="text-sm text-red-500 animate-pulse col-span-full">
                        {errors.averageDistance}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Average number of workdays per year <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-semibold mb-1">Workdays Input Guide</p>
                          <p className="text-xs">
                            Enter the average number of workdays per year for commuting employees.
                          </p>
                          <p className="text-xs mt-1">• You can enter 0 for remote-only work</p>
                          <p className="text-xs">• Negative values are not allowed</p>
                          <p className="text-xs">• Typical values range from 200-260 days</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <SmartInput
                    label=""
                    type="number"
                    required={false}
                    placeholder="Enter number"
                    value={workdaysPerYear}
                    onChange={handleWorkdaysPerYearChange}
                    errorTrigger={fieldErrors.workdaysPerYear}
                    errorMessage="Please enter the average number of workdays per year (0 or greater)."
                  />
                  {errors.workdaysPerYear && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.workdaysPerYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Commuting Methods Checkbox Section */}
              <div className="space-y-4 mt-6">
                <Label className="text-md font-medium block">
                  Commuting methods used (select all that apply):
                </Label>

                {errors.commutingMethods && (
                  <p className="text-sm text-red-500 animate-pulse">{errors.commutingMethods}</p>
                )}

                <div className="grid grid-cols-1 gap-4 ml-4">
                  {COMMUTING_METHODS.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={method.id}
                        checked={selectedMethods.includes(method.id)}
                        onCheckedChange={(checked) =>
                          handleMethodChange(method.id, checked as boolean)
                        }
                        className={fieldErrors.commutingMethods ? "border-red-500" : ""}
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
                      Please specify other commuting method:
                    </Label>
                    <Input
                      id="other-method"
                      type="text"
                      placeholder="Enter other commuting method..."
                      value={otherMethodInput}
                      onChange={(e) => handleOtherMethodInputChange(e.target.value)}
                      className={`max-w-md ${fieldErrors.commutingMethods ? "border-red-500" : ""}`}
                    />
                    <p className="text-xs text-gray-500">
                      Specify other commuting methods not listed above
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 7.2 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-medium mb-2 block">7.2 Document/Evidence Upload</Label>
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
