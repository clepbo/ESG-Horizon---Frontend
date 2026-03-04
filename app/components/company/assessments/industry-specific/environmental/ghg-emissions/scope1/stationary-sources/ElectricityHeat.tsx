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
import { getFuelOptions, unitOptions, type FuelOption } from "@/lib/fuelDataFile";
import { AddSource, SourceData } from "@/app/components/company/assessments/AddSource";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { Input } from "@/app/components/ui/input";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { FilePreview } from "@/app/components/common/FilePreview";

interface ElectricityHeatFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

interface ElectricityHeatErrors {
  dieselGenerators?: string;
  gasTurbines?: string;
  files?: string;
}

const uploadFields = [
  "Gas supply invoices from suppliers",
  "Calibrated gas meter readings (scm or scf logs)",
  "Turbine operation logs (hours, efficiency)",
  "Fuel purchase receipts for diesel generators",
  "Generator capacity certificates (kVA rating)",
  "On-site storage/fuel tank logs",
];

export function ElectricityHeatForm({
  onBack,
  onNext,
  onBackToHub,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ElectricityHeatFormProps) {
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

  const { saveNow, isLoading, isAssignedTask, handleAssignedTaskRedirect } = useAssessmentFlow(
    "ghg-scope1-stationary-electricityheat"
  );

  const dieselFuelOptions = useMemo(() => getFuelOptions("dieselGenerators"), []);
  const gasFuelOptions = useMemo(() => getFuelOptions("gasTurbines"), []);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);
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
        emissionFactor: fuelOptions[0]?.emissionFactor || 2.68,
        source: fuelOptions[0]?.source || "IPCC 2006, Vintage: 2006",
      },
    ];
  };

  const [dieselGenerators, setDieselGenerators] = useState<SourceData[]>(() =>
    getInitialSources([], dieselFuelOptions)
  );

  const [gasTurbines, setGasTurbines] = useState<SourceData[]>(() =>
    getInitialSources([], gasFuelOptions)
  );

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.ghg?.scope1?.stationarySources?.electricityHeat;
    if (existingData) {
      setDieselGenerators(
        existingData.dieselGenerators || getInitialSources([], dieselFuelOptions)
      );
      setGasTurbines(existingData.gasTurbines || getInitialSources([], gasFuelOptions));
      setFiles(
        existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [
    dieselFuelOptions,
    gasFuelOptions,
    state.assessmentData.environment?.ghg?.scope1?.stationarySources?.electricityHeat,
  ]);

  const { filled, total } = useMemo(() => {
    const hasDieselData = dieselGenerators.some(
      (s) => s.volume && parseFloat(s.volume.toString()) > 0
    );
    const hasGasData = gasTurbines.some((s) => s.volume && parseFloat(s.volume.toString()) > 0);

    const hasAdditionalFields = additionalFields.length > 0;
    const hasFileUploaded = Object.values(files).some(Boolean);
    const progressChecks = [hasDieselData, hasGasData, hasFileUploaded || hasAdditionalFields];

    return calculateProgress(progressChecks);
  }, [dieselGenerators, gasTurbines, files, additionalFields]);

  const validateForm = () => {
    const newErrors: {
      dieselGenerators?: string;
      gasTurbines?: string;
      files?: string;
    } = {};

    const hasValidDiesel = dieselGenerators.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );
    const hasValidGas = gasTurbines.some(
      (s) =>
        s.volume !== "" &&
        s.volume !== null &&
        s.volume !== undefined &&
        !isNaN(Number(s.volume)) &&
        Number(s.volume) >= 0
    );

    if (!hasValidDiesel) {
      newErrors.dieselGenerators =
        "Please enter at least one diesel generator value with a volume.";
    }

    if (!hasValidGas) {
      newErrors.gasTurbines = "Please enter at least one gas turbine value with a volume.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveForm = async (options: { showToast?: boolean; redirect?: boolean } = {}) => {
    const { showToast = true, redirect = true } = options;

    const payload = {
      dieselGenerators,
      gasTurbines,
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
      type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
      payload,
    });

    try {
      await saveNow("environment.ghg.scope1.stationarySources.electricityHeat", payload);
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

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Fields cannot be empty. Enter 0 if data is unavailable for a specific section.");
      return;
    }

    dispatch({
      type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
      payload: {
        dieselGenerators,
        gasTurbines,
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

  const handlePrevious = () => {
    onBack();
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
              groupKey="environment.ghg.scope1.stationarySources"
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

            <div>
              <Label className="text-md font-medium mb-2 block">
                1.1 Diesel-Powered Generators <span className="text-red-500">*</span>
              </Label>
              <AddSource
                title="Fuel Sources"
                fuelTypeOptions={dieselFuelOptions}
                unitOptions={unitOptions}
                sources={dieselGenerators}
                onSourcesChange={setDieselGenerators}
                volumeLabel="Volume of Fuel Consumed"
                volumePlaceholder="Enter volume consumed"
                error={errors.dieselGenerators}
              />
            </div>
            <div>
              <Label className="text-md font-medium mb-2 block">
                1.2 Gas-Fired Turbines <span className="text-red-500">*</span>
              </Label>
              <AddSource
                title="Fuel Sources"
                fuelTypeOptions={gasFuelOptions}
                unitOptions={unitOptions}
                sources={gasTurbines}
                onSourcesChange={setGasTurbines}
                volumeLabel="Volume of Fuel Consumed"
                volumePlaceholder="Enter volume consumed"
                error={errors.gasTurbines}
              />
            </div>
            <div>
              <Label className="text-md font-medium mb-2 block">1.3 Document/Evidence Upload</Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
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
                onClick={handleNext}
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
