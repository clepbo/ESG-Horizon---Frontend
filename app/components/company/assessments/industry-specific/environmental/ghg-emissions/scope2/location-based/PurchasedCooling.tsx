"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ArrowLeft, Save, CheckCircle2, ArrowRight, CloudUpload, X } from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { useSaveAssessment } from "@/services/hooks/assessment.hooks";
interface PurchasedCoolingFormProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Cooling energy invoices from service providers",
  "Equipment performance logs (e.g., chiller reports)",
  "Sub-metering or monitoring records",
];

const coolingSystemTypes = [
  { id: "centralized", label: "Centralized Chiller Plant (building-based)" },
  { id: "direct", label: "District Cooling System (utility-purchased)" },
  {
    id: "packaged",
    label: "Packaged Air Conditioning Units (split/rooftop)",
  },
  { id: "portable", label: "Portable Cooling Systems" },
  { id: "evaporative", label: "Evaporative Cooling Systems" },
];

export function PurchasedCoolingForm({
  onBack,
  onNext,
  onBackToHub,
  stepIndex,
  totalSteps,
}: PurchasedCoolingFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [coolingConsumed, setCoolingConsumed] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [otherComments, setOtherComments] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [errors, setErrors] = useState<{
    coolingConsumed?: string;
    selectedSystems?: string;
    files?: string;
  }>({});
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment();

  useEffect(() => {
    const existingData = state.assessmentData.cooling;

    if (existingData) {
      setCoolingConsumed(existingData.coolingConsumed || "");
      setSelectedSystems(existingData.selectedSystems || []);
      setOtherComments(existingData.otherComments || "");
      setFiles(
        existingData.files ?? Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData.cooling]);

  const { filled, total } = useMemo(() => {
    return calculateProgress([
      coolingConsumed,
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file),
    ]);
  }, [coolingConsumed, files, additionalFields]);

  const handleSystemChange = (systemId: string, checked: boolean) => {
    setSelectedSystems((prev) =>
      checked ? [...prev, systemId] : prev.filter((id) => id !== systemId)
    );
    if (errors.selectedSystems) {
      setErrors((prev) => ({ ...prev, selectedSystems: undefined }));
    }
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
      setUploading((prev) => ({ ...prev, [field]: false })); // stop spinner
    }

    if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
  };
  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };

  const handleSaveAndContinue = () => {
    const assessmentId = state.assessmentData.assessmentId;
    if (!assessmentId) {
      toast.error("Cannot save: Assessment ID missing.");
      return;
    }

    dispatch({
      type: "UPDATE_COOLING",
      payload: {
        coolingConsumed,
        selectedSystems,
        otherComments,
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });

    saveAssessment(
      {
        assessmentId,
        data: {
          ...state.assessmentData,
          cooling: {
            coolingConsumed,
            selectedSystems,
            otherComments,
            files,
            additionalFields: additionalFields as FileMetadata[],
          },
          lastSavedForm: "ghg-location-based-cooling",
        },
      },
      {
        onSuccess: () => {
          setShowSaveSuccess(true);
          toast.success("Cooling data saved.");
          onBackToHub();
        },
      }
    );
  };

  const handleNext = () => {
    dispatch({
      type: "UPDATE_COOLING",
      payload: {
        coolingConsumed,
        selectedSystems,
        otherComments,
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });

    onNext();
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
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Scope 2: Purchased Cooling</h3>
            <p className="text-muted-foreground text-base">
              Emissions from cooling energy purchased for your facilities
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            {/* Progress bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Cooling Consumed */}
            <div>
              <Label className="text-md font-semibold mb-2 block">2.1 Purchased Cooling</Label>
              <div className="space-y-4 ml-6">
                <Label>Amount of Energy Cooling Energy Consumed (kWh)</Label>
                <Input
                  id="cooling-consumed"
                  type="number"
                  placeholder="Enter amount in kWh"
                  value={coolingConsumed}
                  onChange={(e) => setCoolingConsumed(e.target.value)}
                  className={`w-full border-gray-400 ${
                    errors.coolingConsumed ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.coolingConsumed && (
                <p className="text-sm text-red-500 mt-1">{errors.coolingConsumed}</p>
              )}
            </div>

            {/* Cooling System Types */}
            <div>
              <Label className="text-md font-medium mb-2 block ml-6">Type of Cooling System</Label>
              <div className="space-y-3 ml-6">
                {coolingSystemTypes.map((system) => (
                  <div key={system.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={system.id}
                      checked={selectedSystems.includes(system.id)}
                      onCheckedChange={(checked) =>
                        handleSystemChange(system.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={system.id}>{system.label}</Label>
                  </div>
                ))}
              </div>
              {errors.selectedSystems && (
                <p className="text-sm text-red-500 mt-1">{errors.selectedSystems}</p>
              )}
            </div>

            {/* Others */}
            <div className="ml-6">
              <Label htmlFor="other-comments">Others</Label>
              <Textarea
                id="other-comments"
                placeholder="Please specify"
                value={otherComments}
                onChange={(e) => setOtherComments(e.target.value)}
                rows={3}
              />
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                2.2 Documents/Evidence Uploads
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
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-sm text-green-600 break-words max-w-full text-center">
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
              <div className="mt-6">
                <AdditionalFileUpload
                  onFieldsChange={handleAdditionalFieldsChange}
                  initialData={additionalFields}
                />
              </div>
            </div>

            {/* Nav Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="cursor-pointer justify-self-start border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                type="button"
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
                className="cursor-pointer justify-self-end border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
