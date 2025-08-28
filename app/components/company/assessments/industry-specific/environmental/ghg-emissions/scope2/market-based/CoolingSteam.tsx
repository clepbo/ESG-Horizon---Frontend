"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, CloudUpload } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface CoolingSteamFormProps {
  onBack: () => void;
  onSubmit: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

const uploadFields = [
  "Supplier Contract",
  "Energy Bills / Invoices",
  "Emission Factor Certificate",
];

export function CoolingSteamForm({
  onBack,
  onSubmit,
  stepIndex,
  totalSteps,
  percent,
}: CoolingSteamFormProps) {
  const { state, dispatch } = useAssessment();

  const [energyConsumed, setEnergyConsumed] = useState("");
  const [emissionFactor, setEmissionFactor] = useState("");
  const [files, setFiles] = useState<{ [key: string]: File | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [errors, setErrors] = useState<{
    energyConsumed?: string;
    emissionFactor?: string;
    files?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const existing = state.assessmentData.coolingSteam;
    if (existing) {
      setEnergyConsumed(existing.energyConsumed || "");
      setEmissionFactor(existing.emissionFactor || "");

      setFiles({
        "Supplier Contract": existing.uploads?.supplierContract || null,
        "Energy Bills / Invoices": existing.uploads?.bills || null,
        "Emission Factor Certificate": existing.uploads?.certificate || null,
      });
    }
  }, [state.assessmentData.coolingSteam]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!energyConsumed || Number(energyConsumed) <= 0)
      newErrors.energyConsumed = "Energy consumed is required";
    if (!emissionFactor || Number(emissionFactor) <= 0)
      newErrors.emissionFactor = "Emission factor is required";
    if (!Object.values(files).some((f) => f !== null))
      newErrors.files = "Please upload at least one document";

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
        setErrors({ files: `File "${field}" exceeds 10MB limit` });
        return;
      }
      setFiles((prev) => ({
        ...prev,
        [field]: file, // store File object directly
      }));
      if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const buildPayload = () => ({
    energyConsumed,
    emissionFactor,
    uploads: {
      supplierContract: files["Supplier Contract"],
      bills: files["Energy Bills / Invoices"],
      certificate: files["Emission Factor Certificate"],
    },
  });

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    dispatch({ type: "UPDATE_COOLING_STEAM", payload: buildPayload() });
    dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    dispatch({ type: "UPDATE_COOLING_STEAM", payload: buildPayload() });
    dispatch({ type: "SAVE_PROGRESS" });
    onSubmit();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Scope 2 – Cooling / Steam
            </h3>
            <p className="text-muted-foreground text-base">
              Purchased cooling or steam energy consumption and supporting
              documents.
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Section {stepIndex} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-gray-500">
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

            {/* Energy Consumed */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                {stepIndex}.1 Purchased Cooling / Steam
              </Label>
              <Input
                type="number"
                placeholder="Enter cooling/steam energy consumed (kWh)"
                value={energyConsumed}
                onChange={(e) => {
                  setEnergyConsumed(e.target.value);
                  if (errors.energyConsumed)
                    setErrors({ ...errors, energyConsumed: undefined });
                }}
              />
              {errors.energyConsumed && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.energyConsumed}
                </p>
              )}
            </div>

            {/* Emission Factor */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                Supplier-specific emission factor applied
              </Label>
              <Input
                type="number"
                step="0.0001"
                placeholder="Enter supplier-specific emission factor"
                value={emissionFactor}
                onChange={(e) => {
                  setEmissionFactor(e.target.value);
                  if (errors.emissionFactor)
                    setErrors({ ...errors, emissionFactor: undefined });
                }}
              />
              {errors.emissionFactor && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.emissionFactor}
                </p>
              )}
            </div>

            {/* File Uploads */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                {stepIndex}.2 Documents / Evidence Upload
              </Label>
              {errors.files && (
                <p className="text-sm text-red-500 mb-2">{errors.files}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadFields.map((field) => (
                  <div key={field} className="flex flex-col gap-2">
                    <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
                      {field}
                    </Label>
                    <Card className="p-4 flex flex-col items-center justify-center border hover:border-solid hover:border-primary transition-all">
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
                        className="hidden"
                        onChange={(e) => handleFileChange(field, e)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {files[field] && (
                        <p className="text-sm text-green-600 mt-2 text-center">
                          Uploaded: {files[field]!.name}
                        </p>
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

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="cursor-pointer justify-self-start border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="cursor-pointer justify-self-center bg-green-500 text-white hover:bg-green-300 transition-colors"
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
                onClick={handleSubmit}
                disabled={isSaving}
                className="cursor-pointer justify-self-end border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
