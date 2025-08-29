"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { ArrowLeft, Save, CheckCircle2, CloudUpload } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface PurchasedHeatingFormProps {
  onBack: () => void;
  onSubmit: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
}

const uploadFields = [
  "Invoices/receipts for heating services",
  "Metered heating records",
  "Supplier contracts",
  "Certification of refrigerant type",
];

export function PurchasedHeatingForm({
  onBack,
  onSubmit,
  stepIndex,
  totalSteps,
  percent,
}: PurchasedHeatingFormProps) {
  const { state, dispatch } = useAssessment();

  const [heatingPurchased, setHeatingPurchased] = useState("");
  const [heatingConsumed, setHeatingConsumed] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [errors, setErrors] = useState<{
    heatingPurchased?: string;
    heatingConsumed?: string;
    supplierName?: string;
    files?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load existing data
  useEffect(() => {
    const existing = state.assessmentData.heating;

    if (existing) {
      setHeatingPurchased(existing.heatingPurchased || "");
      setHeatingConsumed(existing.heatingConsumed || "");
      setSupplierName(existing.supplierName || "");
      setFiles(existing.uploads || files);
    }
  }, [files, state.assessmentData.heating]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!heatingPurchased) {
      newErrors.heatingPurchased =
        "Please select whether heating was purchased.";
    }

    if (heatingPurchased === "yes") {
      if (!heatingConsumed || Number(heatingConsumed) <= 0) {
        newErrors.heatingConsumed = "Please enter a valid positive number.";
      }
      if (!supplierName.trim()) {
        newErrors.supplierName = "Please enter supplier name.";
      }
    }

    if (!Object.values(files).some((file) => file !== null)) {
      newErrors.files = "Please upload at least one document.";
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

  const buildPayload = () => ({
    heatingPurchased,
    heatingConsumed,
    supplierName,
    files,
  });

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = buildPayload();
    dispatch({ type: "UPDATE_HEATING", payload });
    dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const payload = buildPayload();
    dispatch({ type: "UPDATE_HEATING", payload });
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
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Scope 2 – Heating
            </h3>
            <p className="text-muted-foreground text-base">
              Purchased heating energy consumption and supporting evidence.
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

            {/* 4.1 Purchased Heating */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                4.1 Purchased Heating
              </Label>
              <RadioGroup
                value={heatingPurchased}
                onValueChange={(val) => {
                  setHeatingPurchased(val);
                  if (errors.heatingPurchased) {
                    setErrors((prev) => ({
                      ...prev,
                      heatingPurchased: undefined,
                    }));
                  }
                }}
                className={`mt-2 ${
                  errors.heatingPurchased ? "border-red-500 p-2 rounded" : ""
                }`}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
              {errors.heatingPurchased && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.heatingPurchased}
                </p>
              )}
            </div>

            {heatingPurchased === "yes" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="heating-consumed">
                    Total heating energy consumed (GJ)
                  </Label>
                  <Input
                    id="heating-consumed"
                    type="number"
                    placeholder="Enter heating energy in GJ"
                    value={heatingConsumed}
                    onChange={(e) => {
                      setHeatingConsumed(e.target.value);
                      if (errors.heatingConsumed) {
                        setErrors((prev) => ({
                          ...prev,
                          heatingConsumed: undefined,
                        }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.heatingConsumed ? "border-red-500" : ""
                    }`}
                  />
                  {errors.heatingConsumed && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.heatingConsumed}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    placeholder="Enter supplier name"
                    value={supplierName}
                    onChange={(e) => {
                      setSupplierName(e.target.value);
                      if (errors.supplierName) {
                        setErrors((prev) => ({
                          ...prev,
                          supplierName: undefined,
                        }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.supplierName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.supplierName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.supplierName}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* 4.2 File Uploads */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                4.2 Document/Evidence Upload
              </Label>
              {errors.files && (
                <p className="text-sm text-red-500">{errors.files}</p>
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
