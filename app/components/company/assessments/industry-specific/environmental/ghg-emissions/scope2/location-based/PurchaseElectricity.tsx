"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  CloudUpload,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface PurchasedElectricityFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

export function PurchasedElectricityForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: PurchasedElectricityFormProps) {
  const { state, dispatch } = useAssessment();

  const [electricityConsumed, setElectricityConsumed] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("monthly");
  const [supplier, setSupplier] = useState("");
  const [uploads, setUploads] = useState<{
    equipmentInventory: File | null;
    ldarReport: File | null;
    gasAnalysis: File | null;
  }>({
    equipmentInventory: null,
    ldarReport: null,
    gasAnalysis: null,
  });

  const [errors, setErrors] = useState<{
    electricityConsumed?: string;
    supplier?: string;
    uploads?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const existing =
      state.assessmentData.electricity ||
      JSON.parse(localStorage.getItem("electricity") || "{}");
    if (existing) {
      setElectricityConsumed(existing.electricityConsumed || "");
      setReportingPeriod(existing.reportingPeriod || "monthly");
      setSupplier(existing.supplier || "");
      setUploads(existing.uploads || uploads);
    }
  }, [state.assessmentData.electricity]);

  const validateForm = () => {
    const newErrors: {
      electricityConsumed?: string;
      supplier?: string;
      uploads?: string;
    } = {};

    if (!electricityConsumed || Number(electricityConsumed) <= 0) {
      newErrors.electricityConsumed = "Please enter a valid positive number";
    }
    if (!supplier.trim()) {
      newErrors.supplier = "Supplier name is required";
    }
    if (
      !uploads.equipmentInventory &&
      !uploads.ldarReport &&
      !uploads.gasAnalysis
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
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          uploads: `${file.name} exceeds 10MB limit`,
        }));
        return;
      }
      setUploads((prev) => ({ ...prev, [key]: file }));
      if (errors.uploads)
        setErrors((prev) => ({ ...prev, uploads: undefined }));
    }
  };

  const savePayload = () => {
    const payload = {
      electricityConsumed,
      reportingPeriod,
      supplier,
      uploads,
    };
    dispatch({ type: "UPDATE_ELECTRICITY", payload });
    localStorage.setItem("electricity", JSON.stringify(payload));
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
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                1.1 Purchased Electricity (kWh)
              </Label>
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
              {errors.electricityConsumed && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.electricityConsumed}
                </p>
              )}
            </div>

            {/* Reporting Period */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-4 block">
                Reporting Period
              </Label>
              <RadioGroup
                value={reportingPeriod}
                onValueChange={setReportingPeriod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly">Quarterly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annually" id="annually" />
                  <Label htmlFor="annually">Annually</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Supplier */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                Supplier
              </Label>
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
              {errors.uploads && (
                <p className="text-sm text-red-500 mb-2">{errors.uploads}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "equipmentInventory", label: "Equipment inventory" },
                  {
                    key: "ldarReport",
                    label: "Leak Detection & Repair (LDAR) survey report",
                  },
                  {
                    key: "gasAnalysis",
                    label: "Gas composition laboratory analysis",
                  },
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
