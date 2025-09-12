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
import {
  AssessmentData,
  FileMetadata,
  useAssessment,
} from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface PurchasedElectricityFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

const uploadFields = [
  "Electricity bills/invoices from Elect. Distr. Companies",
  "Smart meter or sub-meter readings",
  "Utility contracts or purchase agreements",
];

export function PurchasedElectricityForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: PurchasedElectricityFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [electricityConsumed, setElectricityConsumed] = useState("");
  const [supplier, setSupplier] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    electricityConsumed?: string;
    supplier?: string;
    files?: string;
  }>({});

  useEffect(() => {
    const existingData = state.assessmentData?.electricity as NonNullable<
      AssessmentData["electricity"]
    >;

    if (existingData) {
      setElectricityConsumed(existingData.electricityConsumed ?? "");

      setSupplier(existingData.supplier ?? "");
      setFiles(
        existingData.files ??
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData?.electricity]);

  const validateForm = () => {
    const newErrors: {
      electricityConsumed?: string;
      supplier?: string;
      files?: string;
    } = {};

    if (!electricityConsumed || Number(electricityConsumed) <= 0) {
      newErrors.electricityConsumed = "Please enter a valid positive number";
    }
    if (!supplier.trim()) {
      newErrors.supplier = "Supplier name is required";
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
    const payload = {
      electricityConsumed,
      supplier,
      files,
    };
    dispatch({ type: "UPDATE_ELECTRICITY", payload });
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
              Purchased Electricity (Scope 2)
            </h3>
            <p className="text-muted-foreground text-base">
              Report emissions from purchased electricity, based on local grid
              or supplier emission factors.
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
              <Label className="text-md font-semibold mb-2 block">
                1.1 Purchased Electricity
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Total Electricity Consumed (kwh)</Label>
                <Input
                  type="number"
                  placeholder="Enter total electricity consumed in kWh"
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

            {/* Electricity Supplier */}
            <div className="space-y-4 ml-6">
              <Label>Electricity Supplier</Label>
              <Input
                placeholder="Enter supplier name"
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value);
                  if (errors.supplier)
                    setErrors((prev) => ({ ...prev, supplier: undefined }));
                }}
                className={`w-full border-gray-400 ${
                  errors.supplier ? "border-red-500" : ""
                }`}
              />
              {errors.supplier && (
                <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>
              )}
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                1.2 Documents / Evidence Upload
              </Label>
              <div className="mx-6">
                {errors.files && (
                  <p className="text-sm text-red-500 mb-2">{errors.files}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          id={`upload-${field
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
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
