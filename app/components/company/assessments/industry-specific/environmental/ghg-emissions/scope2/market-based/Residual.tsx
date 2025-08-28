"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface ResidualFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

export function ResidualForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: ResidualFormProps) {
  const { state, dispatch } = useAssessment();

  const [electricityConsumed, setElectricityConsumed] = useState("");
  const [residualMixFactor, setResidualMixFactor] = useState("");
  const [uploads, setUploads] = useState<{
    gridElectricity: File | null;
    gridDocumentation: File | null;
    supplierContracts: File | null;
  }>({
    gridElectricity: null,
    gridDocumentation: null,
    supplierContracts: null,
  });

  const [errors, setErrors] = useState<{
    electricityConsumed?: string;
    residualMixFactor?: string;
    uploads?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const existing = state.assessmentData.residual;
    if (existing) {
      setElectricityConsumed(existing.electricityConsumed || "");
      setResidualMixFactor(existing.residualMixFactor || "");
      setUploads(existing.uploads || uploads);
    }
  }, [state.assessmentData.residual, uploads]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!electricityConsumed || Number(electricityConsumed) <= 0) {
      newErrors.electricityConsumed = "Please enter a valid positive number.";
    }
    if (!residualMixFactor || Number(residualMixFactor) <= 0) {
      newErrors.residualMixFactor =
        "Please enter a valid positive emission factor.";
    }
    if (
      !uploads.gridElectricity &&
      !uploads.gridDocumentation &&
      !uploads.supplierContracts
    ) {
      newErrors.uploads = "Please upload at least one supporting document";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (
    key: keyof typeof uploads,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        uploads: `${file.name} exceeds 10MB limit`,
      }));
      return;
    }

    setUploads((prev) => ({ ...prev, [key]: file }));
    if (errors.uploads) setErrors((prev) => ({ ...prev, uploads: undefined }));
  };

  const savePayload = () => {
    const payload = { electricityConsumed, residualMixFactor, uploads };
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
                3.1 Purchased Electricity (kWh)
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
              {errors.electricityConsumed && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.electricityConsumed}
                </p>
              )}
            </div>

            {/* Residual Mix Factor */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                Residual Mix Emission Factor
              </Label>
              <Input
                type="number"
                step="0.0001"
                placeholder="Enter residual mix emission factor"
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
              {errors.uploads && (
                <p className="text-sm text-red-500 mb-2">{errors.uploads}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    key: "gridElectricity",
                    label: "Grid electricity invoices",
                  },
                  {
                    key: "gridDocumentation",
                    label: "Nigerian grid emission factor documentation",
                  },
                  { key: "supplierContracts", label: "Supplier contracts" },
                ].map((doc) => (
                  <Card
                    key={doc.key}
                    className="p-4 flex flex-col items-center justify-center border-2"
                  >
                    <Label
                      htmlFor={`upload-${doc.key}`}
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <CloudUpload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-gray-400 text-center">
                        Upload {doc.label} (Max 10MB)
                      </span>
                    </Label>
                    <Input
                      id={`upload-${doc.key}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(doc.key as keyof typeof uploads, e)
                      }
                    />
                    {uploads[doc.key as keyof typeof uploads] && (
                      <p className="text-sm text-green-600 mt-2 text-center">
                        Uploaded:{" "}
                        {uploads[doc.key as keyof typeof uploads]?.name}
                      </p>
                    )}
                  </Card>
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
