"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress, computeProgressPercent, normalizeFiles } from "@/lib/utils";
import { getFuelOptions, unitOptions, type FuelOption } from "@/lib/fuelDataFile";
import { AddSource, SourceData } from "@/app/components/company/assessments/AddSource";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { FilePreview } from "@/app/components/common/FilePreview";

interface MarineAviationProps {
  onBack: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  isSubmitted: boolean;
  breadcrumb: BreadcrumbItemType[];
}

const uploadFields = [
  "Vessel logbooks (fuel bunkered per trip)",
  "Supplier invoices (MGO/Jet A-1)",
  "Aviation fuel receipts",
  "Flight logs (distance, refueling events)",
];

export function MarineAviation({
  onBack,
  onSubmit,
  stepIndex,
  totalSteps,
  isSubmitted,
  breadcrumb,
}: MarineAviationProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{
    air?: string;
    marine?: string;
    files?: string;
  }>({});

  const airOptions = useMemo(() => getFuelOptions("air"), []);
  const marineOptions = useMemo(() => getFuelOptions("marine"), []);

  const router = useRouter();
  const {
    saveNow,
    submitGroup,
    isLoading: isActionLoading,
  } = useAssessmentFlow("ghg-mobile-sources-marine-aviation");

  const formRef = useRef<HTMLDivElement>(null);

  const isAssignedTask = state.isAssignedTask || false;

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const getInitialSources = (
    existingSources: SourceData[] | undefined,
    fuelOptions: FuelOption[]
  ) => {
    if (existingSources && existingSources.length > 0) {
      return existingSources;
    }
    const defaultFuel = fuelOptions[0] || {
      value: "",
      emissionFactor: 0,
      source: "N/A",
    };
    return [
      {
        id: "initial-" + Date.now().toString(),
        fuelType: defaultFuel.value,
        volume: "",
        unit: unitOptions[0]?.value || "",
        emissionFactor: defaultFuel.emissionFactor,
        source: defaultFuel.source,
      },
    ];
  };

  const [air, setAir] = useState<SourceData[]>(() =>
    getInitialSources(
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.marineAviation?.air,
      airOptions
    )
  );

  const [marine, setMarine] = useState<SourceData[]>(() =>
    getInitialSources(
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.marineAviation?.marine,
      marineOptions
    )
  );

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.marineAviation;
    if (existingData) {
      setAir(existingData.air || getInitialSources([], airOptions));
      setMarine(existingData.marine || getInitialSources([], marineOptions));
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [
    state.assessmentData.environment?.ghg?.scope1?.mobileSources?.marineAviation,
    airOptions,
    marineOptions,
  ]);

  const { filled, total } = useMemo(() => {
    // FIX: Check for valid numbers >= 0 instead of just truthy values
    // This allows 0 to be considered valid
    const hasAirData = air.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );
    const hasMarineData = marine.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);
    const progressChecks = [hasAirData, hasMarineData, hasFileUploaded || hasAdditionalFields];

    return calculateProgress(progressChecks);
  }, [air, marine, files, additionalFields]);

  const validateForm = () => {
    const newErrors: {
      air?: string;
      marine?: string;
      files?: string;
    } = {};

    const hasValidAir = air.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );

    const hasValidMarine = marine.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );

    if (!hasValidAir) {
      newErrors.air = "Please enter at least one air fuel value with a volume.";
    }

    if (!hasValidMarine) {
      newErrors.marine = "Please enter at least one marine fuel value with a volume.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      setUploading((prev) => ({ ...prev, [field]: false }));
    }

    if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
  };

  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };

  const handleSaveAndContinue = async () => {
    const progressPercent = computeProgressPercent({
      stepIndex,
      totalSteps,
      fieldsCompleted: filled,
      totalFields: total,
    });

    const payload = {
      air,
      marine,
      files,
      additionalFields: additionalFields.map((f) => ({
        name: f.name,
        size: f.size ?? 0,
        lastModified: f.lastModified ?? Date.now(),
        url: f.url ?? "",
        publicId: f.publicId ?? "",
      })),
      progressPercent,
    };

    dispatch({
      type: "UPDATE_MOBILE_MARINE_AVIATION",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope1.mobileSources.marineAviation", payload);

      setShowSaveSuccess(true);
      if (isAssignedTask) {
        dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
        onBack();
      }
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 2000);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Fields cannot be empty. Enter 0 if data is unavailable for a specific section.");
      return;
    }

    const assessmentId = state.assessmentId;

    // Get previous steps data from state to ensure it's saved on submission
    const roadTransport =
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.roadTransport;
    const vehicleEquipment =
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.vehicleEquipment;

    const progressPercent = computeProgressPercent({
      stepIndex,
      totalSteps,
      fieldsCompleted: filled,
      totalFields: total,
    });

    const payload = {
      air,
      marine,
      files,
      additionalFields: normalizeFiles(additionalFields),
      progressPercent,
    };

    dispatch({
      type: "UPDATE_MOBILE_MARINE_AVIATION",
      payload,
    });

    try {
      // Bulk save all steps in the group before submitting
      if (roadTransport) {
        await saveNow("environment.ghg.scope1.mobileSources.roadTransport", roadTransport);
      }
      if (vehicleEquipment) {
        await saveNow("environment.ghg.scope1.mobileSources.vehicleEquipment", vehicleEquipment);
      }
      await saveNow("environment.ghg.scope1.mobileSources.marineAviation", payload);

      const res = await submitGroup();
      if (!assessmentId && res?.assessment?.id)
        dispatch({ type: "SET_ASSESSMENT_ID", payload: res.assessment.id });
      onSubmit(res?.totals ?? null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit");
    }
  };

  const handlePrevious = () => {
    onBack();
  };

  const handleRemoveFile = async (key: string) => {
    const file = files[key];
    if (file?.publicId) {
      try {
        // Start the deleting state for this specific file
        setDeleting((prev) => ({ ...prev, [key]: true }));

        await uploadService.deleteImage(file.publicId);
        toast.success("File deleted successfully");
      } catch (err) {
        toast.error("Failed to delete file");
        console.error(err);
      } finally {
        // Stop the deleting state regardless of success or failure
        setDeleting((prev) => ({ ...prev, [key]: false }));

        // Always remove the file from local state and clear the input field
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
      // If there is no publicId, just remove the file from the local state
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
            className="flex items-center gap-2 bg-white border-primary text-primary hover:bg-green-50"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Mobile Sources</h3>
            <p className="text-muted-foreground text-base">
              Emissions from moving equipment or vehicles, such as trucks, ships, or planes.
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
              isSubmitted={isSubmitted}
            />

            <div>
              <h4 className="text-xl font-medium text-foreground">Marine and Aviation</h4>
              <p className="text-muted-foreground text-base">
                Emissions from ships, boats, aircraft, and related subsidiaries for transport or
                industrial use.
              </p>
            </div>

            {/* 1.1 Helicopters */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Helicopters Used for Transporting Personnel and Equipment to Offshore Oil
                Platforms <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={airOptions}
                  unitOptions={unitOptions}
                  sources={air}
                  onSourcesChange={setAir}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.air}
                />
              </div>
            </div>

            {/* 1.2 Company-owned Boats and Vessels */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Company-owned Boats and Vessels for Transport in the Niger Delta and Offshore
                Subsidiaries <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={marineOptions}
                  unitOptions={unitOptions}
                  sources={marine}
                  onSourcesChange={setMarine}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.marine}
                />
              </div>
            </div>

            {/* 1.3 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.3 Document/Evidence Upload
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

            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="justify-self-start hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isActionLoading}
                className="justify-self-center bg-primary hover:cursor-pointer text-white hover:bg-teal-300 transition-colors"
                aria-label="Save and continue later"
              >
                {isActionLoading ? (
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
                onClick={() => handleSubmit()}
                disabled={isActionLoading}
                className="justify-self-end hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Submit assessment"
              >
                {isActionLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* <SubmitConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onSave={() => {
            setShowConfirmDialog(false);
            handleSaveAndContinue();
          }}
          onSubmit={() => {
            setShowConfirmDialog(false);
            handleSubmit();
          }}
        /> */}
      </div>
    </div>
  );
}
