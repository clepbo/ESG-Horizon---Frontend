"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress, computeProgressPercent } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { getFuelOptions, unitOptions, type FuelOption } from "@/lib/fuelDataFile";
import { AddSource, SourceData } from "@/app/components/company/assessments/AddSource";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { FilePreview } from "@/app/components/common/FilePreview";

interface RoadTransportProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

const uploadFields = [
  "Fuel card statements",
  "Fleet management reports (consumption per vehicle)",
  "Odometer/GPS mileage logs",
  "Fuel purchase receipts",
  "Vehicle inventory list (make, model, fuel type)",
];

export function RoadTransport({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  breadcrumb,
}: RoadTransportProps) {
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
    vehicleFleet?: string;
    carsBuses?: string;
    files?: string;
  }>({});

  const vehicleFleetOptions = useMemo(() => getFuelOptions("vehicleFleet"), []);
  const carsBusesOptions = useMemo(() => getFuelOptions("carsBuses"), []);
  const router = useRouter();
  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow(
    "ghg-mobile-sources-road-transport"
  );

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

  const [vehicleFleet, setVehicleFleet] = useState<SourceData[]>(() =>
    getInitialSources(
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.roadTransport?.vehicleFleet,
      vehicleFleetOptions
    )
  );

  const [carsBuses, setCarsBuses] = useState<SourceData[]>(() =>
    getInitialSources(
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.roadTransport?.carsBuses,
      carsBusesOptions
    )
  );

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope1?.mobileSources?.roadTransport;
    if (existingData) {
      setVehicleFleet(existingData.vehicleFleet || getInitialSources([], vehicleFleetOptions));
      setCarsBuses(existingData.carsBuses || getInitialSources([], carsBusesOptions));
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [
    state.assessmentData.environment?.ghg?.scope1?.mobileSources?.roadTransport,
    vehicleFleetOptions,
    carsBusesOptions,
  ]);

  const { filled, total } = useMemo(() => {
    const hasVehicleFleetData = vehicleFleet.some(
      (s) => s.volume && parseFloat(s.volume.toString()) > 0
    );
    const hasCarsBusesData = carsBuses.some((s) => s.volume && parseFloat(s.volume.toString()) > 0);
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);
    const progressChecks = [
      hasVehicleFleetData,
      hasCarsBusesData,
      hasFileUploaded || hasAdditionalFields,
    ];

    return calculateProgress(progressChecks);
  }, [vehicleFleet, carsBuses, files, additionalFields]);

  const validateForm = () => {
    const newErrors: {
      vehicleFleet?: string;
      carsBuses?: string;
      files?: string;
    } = {};

    const hasValidVehicleFleet = vehicleFleet.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );
    const hasValidCarsBuses = carsBuses.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );

    if (!hasValidVehicleFleet) {
      newErrors.vehicleFleet =
        "Please add at least one fuel source with a volume for the truck fleet.";
    }

    if (!hasValidCarsBuses) {
      newErrors.carsBuses =
        "Please add at least one fuel source with a volume for the cars and buses.";
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

  const handleSaveAndContinue = async () => {
    const progressPercent = computeProgressPercent({
      stepIndex,
      totalSteps,
      fieldsCompleted: filled,
      totalFields: total,
    });

    const payload = {
      vehicleFleet,
      carsBuses,
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
      type: "UPDATE_MOBILE_ROAD_TRANSPORT",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope1.mobileSources.roadTransport", payload);

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

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Fields cannot be empty. Enter 0 if data is unavailable for a specific section.");
      return;
    }

    dispatch({
      type: "UPDATE_MOBILE_ROAD_TRANSPORT",
      payload: {
        vehicleFleet,
        carsBuses,
        files,
        additionalFields: additionalFields as FileMetadata[],
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
              isSubmitted={false}
              groupKey="environment.ghg.scope1.mobileSources"
            />

            <div>
              <h4 className="text-xl font-medium text-foreground">Road Transportation</h4>
              <p className="text-muted-foreground text-base">
                Emissions from moving equipment or vehicles, such as trucks.
              </p>
            </div>

            {/* 1.1 Fleet of Diesel Trucks */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Fleet of Diesel Trucks for Product Distribution and Logistics{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={vehicleFleetOptions}
                  unitOptions={unitOptions}
                  sources={vehicleFleet}
                  onSourcesChange={setVehicleFleet}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.vehicleFleet}
                />
              </div>
            </div>

            {/* 1.2 Company Cars and Buses */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Company Cars and Buses Used for Employee Transportation{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={carsBusesOptions}
                  unitOptions={unitOptions}
                  sources={carsBuses}
                  onSourcesChange={setCarsBuses}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.carsBuses}
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
                onClick={handleNext}
                disabled={isActionLoading}
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
