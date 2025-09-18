"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

import {
  ArrowLeft,
  Save,
  CheckCircle2,
  CloudUpload,
  ArrowRight,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import {
  getFuelOptions,
  unitOptions,
  type FuelOption,
} from "@/lib/fuelDataFile";
import {
  AddSource,
  SourceData,
} from "@/app/components/company/assessments/AddSource";

interface VehicleEquipmentProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
}

const uploadFields = [
  "Refueling logs or farm storage tank logs",
  "LPG cylinder replacement records",
  "Operational hours log per equipment",
  "Land area serviced (for tractors)",
];

export function VehicleEquipment({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
}: VehicleEquipmentProps) {
  const { state, dispatch } = useAssessment();
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    forkliftFuelType?: string;
    heavyDutyFuelType?: string;
    tractorFuelType?: string;
    files?: string;
  }>({});

  const forkliftFuelTypeOptions = useMemo(
    () => getFuelOptions("forkliftFuelType"),
    []
  );
  const heavyDutyFuelTypeOptions = useMemo(
    () => getFuelOptions("heavyDutyFuelType"),
    []
  );
  const tractorFuelTypeOptions = useMemo(
    () => getFuelOptions("tractorFuelType"),
    []
  );

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

  const [forkliftFuelType, setForkliftFuelType] = useState<SourceData[]>(() => {
    const existingData =
      state.assessmentData.mobileSources?.vehicleEquipment?.forkliftFuelType;
    return Array.isArray(existingData)
      ? existingData
      : getInitialSources([], forkliftFuelTypeOptions);
  });

  const [heavyDutyFuelType, setHeavyDutyFuelType] = useState<SourceData[]>(
    () => {
      const existingData =
        state.assessmentData.mobileSources?.vehicleEquipment?.heavyDutyFuelType;
      return Array.isArray(existingData)
        ? existingData
        : getInitialSources([], heavyDutyFuelTypeOptions);
    }
  );
  const [tractorFuelType, setTractorFuelType] = useState<SourceData[]>(() => {
    const existingData =
      state.assessmentData.mobileSources?.vehicleEquipment?.tractorFuelType;
    return Array.isArray(existingData)
      ? existingData
      : getInitialSources([], tractorFuelTypeOptions);
  });

  useEffect(() => {
    const existingData = state.assessmentData.mobileSources?.vehicleEquipment;
    if (existingData) {
      setForkliftFuelType(
        Array.isArray(existingData.forkliftFuelType)
          ? existingData.forkliftFuelType
          : getInitialSources([], forkliftFuelTypeOptions)
      );
      setHeavyDutyFuelType(
        Array.isArray(existingData.heavyDutyFuelType)
          ? existingData.heavyDutyFuelType
          : getInitialSources([], heavyDutyFuelTypeOptions)
      );
      setTractorFuelType(
        Array.isArray(existingData.tractorFuelType)
          ? existingData.tractorFuelType
          : getInitialSources([], tractorFuelTypeOptions)
      );
      setFiles(
        existingData.files ||
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [
    state.assessmentData.mobileSources?.vehicleEquipment,
    forkliftFuelTypeOptions,
    heavyDutyFuelTypeOptions,
    tractorFuelTypeOptions,
  ]);
  const { filled, total } = useMemo(() => {
    const hasForkliftFuelTypeData = forkliftFuelType.some(
      (s) => s.volume && parseFloat(s.volume.toString()) > 0
    );
    const hasHeavyDutyFuelTypeData = heavyDutyFuelType.some(
      (s) => s.volume && parseFloat(s.volume.toString()) > 0
    );
    const hasTractorFuelTypeData = tractorFuelType.some(
      (s) => s.volume && parseFloat(s.volume.toString()) > 0
    );

    const hasFileUploaded = Object.values(files).some(Boolean);
    const progressChecks = [
      hasForkliftFuelTypeData,
      hasHeavyDutyFuelTypeData,
      hasTractorFuelTypeData,
      hasFileUploaded,
    ];

    return calculateProgress(progressChecks);
  }, [forkliftFuelType, heavyDutyFuelType, tractorFuelType, files]);

  const validateForm = () => {
    const newErrors: {
      forkliftFuelType?: string;
      heavyDutyFuelType?: string;
      tractorFuelType?: string;
      files?: string;
    } = {};

    const hasValidForkliftFuelType = forkliftFuelType.some(
      (s) => s.volume && Number(s.volume) > 0
    );
    const hasValidHeavyDutyFuelType = heavyDutyFuelType.some(
      (s) => s.volume && Number(s.volume) > 0
    );
    const hasValidTractorFuelType = tractorFuelType.some(
      (s) => s.volume && Number(s.volume) > 0
    );

    if (!hasValidForkliftFuelType) {
      newErrors.forkliftFuelType =
        "Please add at least one fuel source with a positive volume for the truck fleet.";
    }

    if (!hasValidHeavyDutyFuelType) {
      newErrors.heavyDutyFuelType =
        "Please add at least one fuel source with a positive volume for the cars and buses.";
    }
    if (!hasValidTractorFuelType) {
      newErrors.tractorFuelType =
        "Please add at least one fuel source with a positive volume for the tractors and machinery.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          files: `File "${field}" exceeds 10MB limit`,
        }));
        return;
      }
      setFiles((prev) => ({
        ...prev,
        [field]: {
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
        },
      }));
      if (errors.files) {
        setErrors((prev) => ({ ...prev, files: undefined }));
      }
    }
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      forkliftFuelType,
      heavyDutyFuelType,
      tractorFuelType,
      files,
    };
    dispatch({
      type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT",
      payload,
    });
    dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;
    const payload = {
      forkliftFuelType,
      heavyDutyFuelType,
      tractorFuelType,
      files,
    };
    dispatch({
      type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT",
      payload,
    });
    dispatch({ type: "SAVE_PROGRESS" });
    console.log("Vehicle Equipment Data:", state.assessmentData.mobileSources);
    onNext();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              Mobile Sources
            </h3>
            <p className="text-muted-foreground text-base">
              Emissions from moving equipment or vehicles, such as trucks,
              ships, or planes.
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
              <h4 className="text-xl font-medium text-foreground">
                Off-road Vehicles & Equipment
              </h4>
              <p className="text-muted-foreground text-base">
                Emissions from vehicles and machinery not used on public roads,
                such as construction, mining, or agricultural equipment.
              </p>
            </div>

            {/* 1.1 Forklifts and Other Machinery */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Forklifts and Other Machinery Used in Warehouses and Factory
                Floors
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={forkliftFuelTypeOptions}
                  unitOptions={unitOptions}
                  sources={forkliftFuelType}
                  onSourcesChange={setForkliftFuelType}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.forkliftFuelType}
                />
              </div>
            </div>

            {/* 1.2 Heavy-duty Vehicles and Equipment */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Heavy-duty Vehicles and Equipment Used in Construction and
                Mining Subsidiaries
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={heavyDutyFuelTypeOptions}
                  unitOptions={unitOptions}
                  sources={heavyDutyFuelType}
                  onSourcesChange={setHeavyDutyFuelType}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.heavyDutyFuelType}
                />
              </div>
            </div>

            {/* 1.3 Tractors and Other Machinery */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.3 Tractors and Other Machinery on Large Commercial Farms
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={tractorFuelTypeOptions}
                  unitOptions={unitOptions}
                  sources={tractorFuelType}
                  onSourcesChange={setTractorFuelType}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.tractorFuelType}
                />
              </div>
            </div>

            {/* 1.4 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.4 Document/Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && (
                  <p className="text-sm text-red-500">{errors.files}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1">
                        {field}
                      </Label>
                      <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all h-32">
                        <Label
                          htmlFor={`upload-${field
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <CloudUpload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-gray-400 text-center">
                            Upload {field} (Max. 10MB)
                          </span>
                        </Label>
                        <Input
                          id={`upload-${field
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(field, e)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          aria-label={`Upload ${field}`}
                        />
                        {files[field] && (
                          <p className="text-sm text-green-600 mt-2 text-center truncate">
                            Uploaded: {files[field]!.name}
                          </p>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="justify-self-start hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
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
                className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
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
