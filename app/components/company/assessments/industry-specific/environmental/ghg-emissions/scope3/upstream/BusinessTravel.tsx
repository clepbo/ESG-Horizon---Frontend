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

interface BusinessTravelProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopics: () => void;
  backToGHGEmissions: () => void;
}

interface BusinessTravelErrors {
  totalFlights?: string;
  airDistance?: string;
  airEmployees?: string;
  economyPercent?: string;
  businessPercent?: string;
  firstClassPercent?: string;
  groundDistance?: string;
  groundEmployees?: string;
  fuelConsumed?: string;
  hotelNights?: string;
  files?: string;
}

const uploadFields = [
  "Consolidated travel expense report",
  "Aggregated employee claim/expense sheet",
  "Corporate travel agency invoices/statements",
  "Hotel booking summaries",
];

export function BusinessTravel({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopics,
  backToGHGEmissions,
}: BusinessTravelProps) {
  const { state } = useAssessment();
  const router = useRouter();

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<BusinessTravelErrors>({});

  // Air Travel Fields
  const [totalFlights, setTotalFlights] = useState("");
  const [airDistance, setAirDistance] = useState("");
  const [airEmployees, setAirEmployees] = useState("");
  const [economyPercent, setEconomyPercent] = useState("");
  const [businessPercent, setBusinessPercent] = useState("");
  const [firstClassPercent, setFirstClassPercent] = useState("");

  // Ground Travel Fields
  const [groundDistance, setGroundDistance] = useState("");
  const [groundEmployees, setGroundEmployees] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  // Accommodation Field
  const [hotelNights, setHotelNights] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    totalFlights: false,
    airDistance: false,
    airEmployees: false,
    economyPercent: false,
    businessPercent: false,
    firstClassPercent: false,
    groundDistance: false,
    groundEmployees: false,
    fuelConsumed: false,
    hotelNights: false,
  });

  const { saveNow, isLoading } = useAssessmentFlow("ghg-scope1-stationary-business-travel");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Load existing data
  useEffect(() => {
    const existingData = (state.assessmentData.stationarySources as any)?.businessTravel;
    if (existingData) {
      // Air Travel
      setTotalFlights(existingData.totalFlights || "");
      setAirDistance(existingData.airDistance || "");
      setAirEmployees(existingData.airEmployees || "");
      setEconomyPercent(existingData.economyPercent || "");
      setBusinessPercent(existingData.businessPercent || "");
      setFirstClassPercent(existingData.firstClassPercent || "");

      // Ground Travel
      setGroundDistance(existingData.groundDistance || "");
      setGroundEmployees(existingData.groundEmployees || "");
      setFuelConsumed(existingData.fuelConsumed || "");

      // Accommodation
      setHotelNights(existingData.hotelNights || "");

      // Files
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData]);

  const { filled, total } = useMemo(() => {
    // Check each required field
    const hasAirTravelData =
      totalFlights.trim().length > 0 &&
      airDistance.trim().length > 0 &&
      airEmployees.trim().length > 0;
    const hasClassDistribution =
      economyPercent.trim().length > 0 &&
      businessPercent.trim().length > 0 &&
      firstClassPercent.trim().length > 0;
    const hasGroundTravelData =
      groundDistance.trim().length > 0 &&
      groundEmployees.trim().length > 0 &&
      fuelConsumed.trim().length > 0;
    const hasAccommodationData = hotelNights.trim().length > 0;
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);

    const progressChecks = [
      hasAirTravelData,
      hasClassDistribution,
      hasGroundTravelData,
      hasAccommodationData,
      hasFileUploaded || hasAdditionalFields,
    ];

    return calculateProgress(progressChecks);
  }, [
    totalFlights,
    airDistance,
    airEmployees,
    economyPercent,
    businessPercent,
    firstClassPercent,
    groundDistance,
    groundEmployees,
    fuelConsumed,
    hotelNights,
    files,
    additionalFields,
  ]);

  // Clear error when user interacts with ANY field
  const clearAllErrors = () => {
    setErrors({});
    setFieldErrors({
      totalFlights: false,
      airDistance: false,
      airEmployees: false,
      economyPercent: false,
      businessPercent: false,
      firstClassPercent: false,
      groundDistance: false,
      groundEmployees: false,
      fuelConsumed: false,
      hotelNights: false,
    });
  };

  const validateForm = () => {
    const newErrors: BusinessTravelErrors = {};
    const newFieldErrors = {
      totalFlights: false,
      airDistance: false,
      airEmployees: false,
      economyPercent: false,
      businessPercent: false,
      firstClassPercent: false,
      groundDistance: false,
      groundEmployees: false,
      fuelConsumed: false,
      hotelNights: false,
    };

    // Validate Air Travel
    if (!totalFlights.trim()) {
      newErrors.totalFlights = "Please enter the total number of flights taken.";
      newFieldErrors.totalFlights = true;
    }

    if (!airDistance.trim()) {
      newErrors.airDistance = "Please enter the total air distance travelled.";
      newFieldErrors.airDistance = true;
    }

    if (!airEmployees.trim()) {
      newErrors.airEmployees = "Please enter the total number of employees for air trips.";
      newFieldErrors.airEmployees = true;
    }

    if (!economyPercent.trim()) {
      newErrors.economyPercent = "Please enter the economy class percentage.";
      newFieldErrors.economyPercent = true;
    }

    if (!businessPercent.trim()) {
      newErrors.businessPercent = "Please enter the business class percentage.";
      newFieldErrors.businessPercent = true;
    }

    if (!firstClassPercent.trim()) {
      newErrors.firstClassPercent = "Please enter the first class percentage.";
      newFieldErrors.firstClassPercent = true;
    }

    // Validate Ground Travel
    if (!groundDistance.trim()) {
      newErrors.groundDistance = "Please enter the total ground distance travelled.";
      newFieldErrors.groundDistance = true;
    }

    if (!groundEmployees.trim()) {
      newErrors.groundEmployees = "Please enter the total number of employees for ground trips.";
      newFieldErrors.groundEmployees = true;
    }

    if (!fuelConsumed.trim()) {
      newErrors.fuelConsumed = "Please enter the total fuel consumed.";
      newFieldErrors.fuelConsumed = true;
    }

    // Validate Accommodation
    if (!hotelNights.trim()) {
      newErrors.hotelNights = "Please enter the total number of hotel nights.";
      newFieldErrors.hotelNights = true;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      // Air Travel
      totalFlights,
      airDistance,
      airEmployees,
      economyPercent,
      businessPercent,
      firstClassPercent,

      // Ground Travel
      groundDistance,
      groundEmployees,
      fuelConsumed,

      // Accommodation
      hotelNights,

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

    // dispatch({
    //     type: "UPDATE_STATIONARY_BUSINESS_TRAVEL",
    //     payload,
    // });

    try {
      await saveNow("environment.ghg.scope1.stationarySources.businessTravel", payload);
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
  const handleAirTravelChange = (field: keyof typeof fieldErrors, value: string) => {
    switch (field) {
      case "totalFlights":
        setTotalFlights(value);
        break;
      case "airDistance":
        setAirDistance(value);
        break;
      case "airEmployees":
        setAirEmployees(value);
        break;
      case "economyPercent":
        setEconomyPercent(value);
        break;
      case "businessPercent":
        setBusinessPercent(value);
        break;
      case "firstClassPercent":
        setFirstClassPercent(value);
        break;
    }

    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleGroundTravelChange = (field: keyof typeof fieldErrors, value: string) => {
    switch (field) {
      case "groundDistance":
        setGroundDistance(value);
        break;
      case "groundEmployees":
        setGroundEmployees(value);
        break;
      case "fuelConsumed":
        setFuelConsumed(value);
        break;
    }

    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleAccommodationChange = (value: string) => {
    setHotelNights(value);
    if (fieldErrors.hotelNights) {
      setErrors((prev) => ({ ...prev, hotelNights: undefined }));
      setFieldErrors((prev) => ({ ...prev, hotelNights: false }));
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
              <h4 className="text-xl font-medium text-foreground">Business Travel</h4>
              <p className="text-muted-foreground text-base">
                Emissions from employee business travel including air, ground transportation, and
                accommodation.
              </p>
            </div>

            {/* 6.1 Business Travel */}
            <div className="space-y-6">
              <Label className="text-md font-medium block">6.1 Business Travel</Label>

              {/* 6.1.1 Air Travel */}
              <div className="ml-4 space-y-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {/* <Plane className="h-5 w-5 text-gray-600" /> */}
                  <Label className="text-md font-medium">6.1.1 Air Travel</Label>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <SmartInput
                    label="Total number of flights taken"
                    type="number"
                    required
                    value={totalFlights}
                    onChange={(value) => handleAirTravelChange("totalFlights", value)}
                    errorTrigger={fieldErrors.totalFlights}
                    errorMessage="Please enter the total number of flights taken."
                  />
                  {errors.totalFlights && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.totalFlights}
                    </p>
                  )}

                  <div className="relative">
                    <SmartInput
                      label="Total distance travelled"
                      type="number"
                      required
                      value={airDistance}
                      onChange={(value) => handleAirTravelChange("airDistance", value)}
                      errorTrigger={fieldErrors.airDistance}
                      errorMessage="Please enter the total air distance travelled."
                    />
                    <div className="absolute right-3 top-9">
                      <span className="text-sm text-gray-600">km</span>
                    </div>
                    {errors.airDistance && (
                      <p className="text-sm text-red-500 animate-pulse col-span-full">
                        {errors.airDistance}
                      </p>
                    )}
                  </div>

                  <SmartInput
                    label="Total number of employees for all trips"
                    type="number"
                    required
                    value={airEmployees}
                    onChange={(value) => handleAirTravelChange("airEmployees", value)}
                    errorTrigger={fieldErrors.airEmployees}
                    errorMessage="Please enter the total number of employees for air trips."
                  />
                  {errors.airEmployees && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.airEmployees}
                    </p>
                  )}
                </div>

                {/* Class Distribution */}
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Class of air travel distribution:
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <SmartInput
                        label="Economy"
                        type="number"
                        required
                        value={economyPercent}
                        onChange={(value) => handleAirTravelChange("economyPercent", value)}
                        errorTrigger={fieldErrors.economyPercent}
                        errorMessage="Please enter economy class percentage."
                      />
                      <div className="absolute right-3 top-9">
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                      {errors.economyPercent && (
                        <p className="text-sm text-red-500 animate-pulse">
                          {errors.economyPercent}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <SmartInput
                        label="Business"
                        type="number"
                        required
                        value={businessPercent}
                        onChange={(value) => handleAirTravelChange("businessPercent", value)}
                        errorTrigger={fieldErrors.businessPercent}
                        errorMessage="Please enter business class percentage."
                      />
                      <div className="absolute right-3 top-9">
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                      {errors.businessPercent && (
                        <p className="text-sm text-red-500 animate-pulse">
                          {errors.businessPercent}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <SmartInput
                        label="First Class"
                        type="number"
                        required
                        value={firstClassPercent}
                        onChange={(value) => handleAirTravelChange("firstClassPercent", value)}
                        errorTrigger={fieldErrors.firstClassPercent}
                        errorMessage="Please enter first class percentage."
                      />
                      <div className="absolute right-3 top-9">
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                      {errors.firstClassPercent && (
                        <p className="text-sm text-red-500 animate-pulse">
                          {errors.firstClassPercent}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6.1.2 Ground Travel */}
              <div className="ml-4 space-y-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {/* <Car className="h-5 w-5 text-gray-600" /> */}
                  <Label className="text-md font-medium">
                    6.1.2 Ground Travel (Car/Bus Rentals, Taxis, Company Cars)
                  </Label>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <SmartInput
                      label="Total distance travelled"
                      type="number"
                      required
                      value={groundDistance}
                      onChange={(value) => handleGroundTravelChange("groundDistance", value)}
                      errorTrigger={fieldErrors.groundDistance}
                      errorMessage="Please enter the total ground distance travelled."
                    />
                    <div className="absolute right-3 top-9">
                      <span className="text-sm text-gray-600">km</span>
                    </div>
                    {errors.groundDistance && (
                      <p className="text-sm text-red-500 animate-pulse col-span-full">
                        {errors.groundDistance}
                      </p>
                    )}
                  </div>

                  <SmartInput
                    label="Total number of employees for all trips"
                    type="number"
                    required
                    value={groundEmployees}
                    onChange={(value) => handleGroundTravelChange("groundEmployees", value)}
                    errorTrigger={fieldErrors.groundEmployees}
                    errorMessage="Please enter the total number of employees for ground trips."
                  />
                  {errors.groundEmployees && (
                    <p className="text-sm text-red-500 animate-pulse col-span-full">
                      {errors.groundEmployees}
                    </p>
                  )}

                  <div className="relative">
                    <SmartInput
                      label="Total fuel consumed"
                      type="number"
                      required
                      value={fuelConsumed}
                      onChange={(value) => handleGroundTravelChange("fuelConsumed", value)}
                      errorTrigger={fieldErrors.fuelConsumed}
                      errorMessage="Please enter the total fuel consumed."
                    />
                    <div className="absolute right-3 top-9 flex items-center gap-1">
                      {/* <Fuel className="h-4 w-4 text-gray-600" /> */}
                      <span className="text-sm text-gray-600">litres</span>
                    </div>
                    {errors.fuelConsumed && (
                      <p className="text-sm text-red-500 animate-pulse col-span-full">
                        {errors.fuelConsumed}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 6.1.3 Accommodation */}
              <div className="ml-4 space-y-4 bg-gray-50 rounded-lg ">
                <div className="flex items-center gap-2 mb-3">
                  {/* <Hotel className="h-5 w-5 text-gray-600" /> */}
                  <Label className="text-md font-medium">6.1.3 Accommodation (Hotel stays)</Label>
                </div>

                <div className="w-full">
                  <SmartInput
                    label="Total number of hotel nights"
                    type="number"
                    required
                    value={hotelNights}
                    placeholder="Enter cummulative number of nights stayed"
                    onChange={handleAccommodationChange}
                    errorTrigger={fieldErrors.hotelNights}
                    errorMessage="Please enter the total number of hotel nights."
                  />
                  {errors.hotelNights && (
                    <p className="text-sm text-red-500 animate-pulse">{errors.hotelNights}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 6.2 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-medium mb-2 block">6.2 Document/Evidence Upload</Label>
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
