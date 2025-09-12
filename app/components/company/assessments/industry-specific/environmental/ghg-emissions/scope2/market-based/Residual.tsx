"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  CloudUpload,
  X,
} from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface ResidualFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

const uploadFields = [
  "Grid electricity invoices",
  "Nigerian grid emission factor documentation",
  "Supplier contracts",
];

export function ResidualForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: ResidualFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [electricityConsumed, setElectricityConsumed] = useState("");
  const [residualMixFactor, setResidualMixFactor] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [errors, setErrors] = useState<{
    electricityConsumed?: string;
    residualMixFactor?: string;
    files?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const existingData = state.assessmentData.residual;
    if (existingData) {
      setElectricityConsumed(existingData.electricityConsumed || "");
      setResidualMixFactor(existingData.residualMixFactor || "");
      setFiles(
        existingData.files ??
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData.residual]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!electricityConsumed || Number(electricityConsumed) <= 0) {
      newErrors.electricityConsumed = "Please enter a valid positive number.";
    }
    if (!residualMixFactor || Number(residualMixFactor) <= 0) {
      newErrors.residualMixFactor =
        "Please enter a valid positive emission factor.";
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
          file,
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
        },
      }));
      if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const savePayload = () => {
    const payload = { electricityConsumed, residualMixFactor, files };
    dispatch({ type: "UPDATE_RESIDUAL", payload });
    return payload;
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;

    setIsSaving(true);
    savePayload();
    dispatch({ type: "SAVE_PROGRESS" });

    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;
    savePayload();
    onNext();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveFile = (key: string) => {
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
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Residual Mix Electricity (Scope 2 – Market Based)
            </h3>
            <p className="text-muted-foreground text-base">
              Report electricity purchased using the residual mix emission
              factor, including documentation and contracts.
            </p>
          </div>
        </div>

        <Card className="bg-gray-50 pt-6">
          <CardContent className="space-y-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">
                  Section {stepIndex} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500">
                  {percent}% complete
                </span>
              </div>
              <div className="w-full h-3 bg-green-300 rounded-lg">
                <div
                  className="h-3 bg-green-800 rounded transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Electricity Consumed */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                3.1 Purchased Electricity
              </Label>
              <div className="space-y-4 ml-6">
                <Label className="text-base font-medium text-gray-900 mb-2 block">
                  Total electricity consumed (kWh)
                </Label>
                <Input
                  type="number"
                  placeholder="Enter total electricity consumed"
                  value={electricityConsumed}
                  onChange={(e) => {
                    setElectricityConsumed(e.target.value);
                    if (errors.electricityConsumed)
                      setErrors((prev) => ({
                        ...prev,
                        electricityConsumed: undefined,
                      }));
                  }}
                  className={`w-full border-gray-400 ${
                    errors.electricityConsumed ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.electricityConsumed && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.electricityConsumed}
                </p>
              )}
            </div>

            {/* Residual Mix Factor */}
            <div className="ml-6">
              <Label className="text-base font-medium text-gray-900 mb-2 block ">
                Residual Mix emission factor applied
              </Label>
              <Input
                type="number"
                step="0.0001"
                placeholder="Enter factor (kg CO₂e/kWh) based on Nigerian grid residual mix"
                value={residualMixFactor}
                onChange={(e) => {
                  setResidualMixFactor(e.target.value);
                  if (errors.residualMixFactor)
                    setErrors((prev) => ({
                      ...prev,
                      residualMixFactor: undefined,
                    }));
                }}
                className={`w-full border-gray-400 ${
                  errors.residualMixFactor ? "border-red-500" : ""
                }`}
              />
              {errors.residualMixFactor && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.residualMixFactor}
                </p>
              )}
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                3.2 Documents / Evidence Upload
              </Label>
              {errors.files && (
                <p className="text-sm text-red-500 mb-2">{errors.files}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-8">
                {uploadFields.map((field) => (
                  <div key={field} className="flex flex-col gap-2">
                    <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
                      {field}
                    </Label>
                    <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
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
                      {files[field] && (
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-sm text-green-600 break-words max-w-full text-center">
                            Uploaded: {files[field]!.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(field)}
                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                            aria-label={`Remove ${field}`}
                          >
                            <X />
                          </button>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Status */}
            {isSaving ? (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <LoadingSpinner size="sm" /> Saving...
              </div>
            ) : showSaveSuccess ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Saved successfully!
              </p>
            ) : null}

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
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 text-white hover:bg-green-300 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save & Continue Later
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
