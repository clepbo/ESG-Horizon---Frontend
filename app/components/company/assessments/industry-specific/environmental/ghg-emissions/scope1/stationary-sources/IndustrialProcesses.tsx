"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload, ArrowRight, X } from "lucide-react";
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
import { useSaveAssessment } from "@/services/hooks/assessment.hooks";
import { useRouter } from "next/navigation";

interface IndustrialProcessesFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub?: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Fuel purchase records (diesel, LPFO, natural gas, coal, biomass)",
  "On-site metering logs (daily/weekly)",
  "Laboratory reports on fuel carbon content",
  "Production logs (e.g., cement clinker production records)",
];

export function IndustrialProcessesForm({
  onBack,
  onNext,
  onBackToHub,
  stepIndex,
  totalSteps,
}: IndustrialProcessesFormProps) {
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
    boilerFurnaces?: string;
    files?: string;
  }>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const router = useRouter();
  const { mutateAsync: saveAssessmentMutate, isPending: isSaving } = useSaveAssessment();

  const boilerFurnacesOptions = useMemo(() => getFuelOptions("boilerFurnaces"), []);

  const getInitialSources = (existingSources: SourceData[], fuelOptions: FuelOption[]) => {
    if (existingSources?.length > 0) {
      return existingSources;
    }
    return [
      {
        id: "initial-" + Date.now().toString(),
        fuelType: fuelOptions[0]?.value || "",
        volume: "",
        unit: unitOptions[0]?.value || "",
        emissionFactor: fuelOptions[0]?.emissionFactor || 2.05,
        source: fuelOptions[0]?.source || "IEA (Emission Factors 2023), IPCC",
      },
    ];
  };

  const [boilerFurnaces, setBoilerFurnaces] = useState<SourceData[]>(() =>
    getInitialSources([], boilerFurnacesOptions)
  );

  useEffect(() => {
    const existingData = state.assessmentData.stationarySources?.industrialProcesses;
    if (existingData) {
      setBoilerFurnaces(
        existingData.boilerFurnaces || getInitialSources([], boilerFurnacesOptions)
      );
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.stationarySources?.industrialProcesses, boilerFurnacesOptions]);

  const { filled, total } = useMemo(() => {
    const hasBoilerFurnacesData = boilerFurnaces.some(
      (s) => s.volume && parseFloat(s.volume.toString()) > 0
    );
    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);
    const progressChecks = [hasBoilerFurnacesData, hasFileUploaded || hasAdditionalFields];

    return calculateProgress(progressChecks);
  }, [boilerFurnaces, files, additionalFields]);

  const validateForm = () => {
    const newErrors: {
      boilerFurnaces?: string;
      files?: string;
    } = {};

    const hasValidBoilers = boilerFurnaces.some((s) => s.volume && Number(s.volume) > 0);

    if (!hasValidBoilers) {
      newErrors.boilerFurnaces = "Please add at least one fuel source with a positive volume.";
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
    const assessmentId = state.assessmentId;

    const progressPercent = computeProgressPercent({
      stepIndex,
      totalSteps,
      fieldsCompleted: filled,
      totalFields: total,
    });

    const payload = {
      boilerFurnaces,
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
      type: "UPDATE_STATIONARY_INDUSTRIAL",
      payload,
    });

    try {
      const response = await saveAssessmentMutate({
        assessmentId,
        data: {
          ...state.assessmentData,
          stationarySources: {
            ...state.assessmentData.stationarySources,
            industrialProcesses: payload,
          },
          lastSavedForm: "ghg-stationary-sources-industrial-processes",
        },
      });

      if (!assessmentId && response.assessmentId) {
        dispatch({ type: "SET_ASSESSMENT_ID", payload: response.assessmentId });
        toast.success(`New assessment draft #${response.assessmentId} created.`);
      }

      setShowSaveSuccess(true);
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 2000);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save");
    }
  };

  const handleNext = () => {
    if (!validateForm()) return;

    dispatch({
      type: "UPDATE_STATIONARY_INDUSTRIAL",
      payload: {
        boilerFurnaces,
        additionalFields: additionalFields as FileMetadata[],
        files,
      },
    });

    onNext();
  };
  const handlePrevious = () => {
    dispatch({
      type: "UPDATE_STATIONARY_INDUSTRIAL",
      payload: {
        boilerFurnaces,
        additionalFields: additionalFields as FileMetadata[],
        files,
      },
    });

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-green-50"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Stationary Sources</h3>
            <p className="text-muted-foreground text-base">
              Emissions from fixed facilities or equipment, such as power plants or boilers
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
              <h4 className="text-xl font-medium text-foreground">Industrial Processes</h4>
              <p className="text-muted-foreground text-base">
                Emissions from manufacturing activities such as boilers and furnaces, based on the
                type and amount of fuel used.
              </p>
            </div>

            {/* 1.1 Boilers and Furnaces in Manufacturing */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                2.1 Boilers and Furnaces in Manufacturing <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-4 ml-6">
                <AddSource
                  title="Fuel Sources"
                  fuelTypeOptions={boilerFurnacesOptions}
                  unitOptions={unitOptions}
                  sources={boilerFurnaces}
                  onSourcesChange={setBoilerFurnaces}
                  volumeLabel="Volume of Fuel Consumed"
                  volumePlaceholder="Enter volume consumed"
                  error={errors.boilerFurnaces}
                />
              </div>
            </div>

            {/* 2.2 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-medium mb-2 block">2.2 Document/Evidence Upload</Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all h-full">
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
                            <p className="text-sm text-[var(--color-primary)] break-words max-w-full text-center">
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
              <div className=" mt-6">
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
                className="justify-self-start hover:cursor-pointer border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-teal-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
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
                className="justify-self-end hover:cursor-pointer border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-green-50 flex items-center gap-2"
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
