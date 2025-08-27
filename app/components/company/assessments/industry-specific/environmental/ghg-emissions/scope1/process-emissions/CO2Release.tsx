/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
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

interface CO2ReleaseProps {
  onBack: () => void;
  onNext: () => void;
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
  "Clinker production records",
  "Lab chemical analysis of limestone",
  "Kiln operation logs",
];

export function CO2Release({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: CO2ReleaseProps) {
  const { state, dispatch } = useAssessment();
  const [clinkerQuantity, setClinkerQuantity] = useState("");
  const [calciumOxide, setCalciumOxide] = useState("");
  const [magnesiumOxide, setMagnesiumOxide] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    clinkerQuantity?: string;
    calciumOxide?: string;
    magnesiumOxide?: string;
    files?: string;
  }>({});

  useEffect(() => {
    const existingData =
      state.assessmentData.processEmissions?.co2Release ||
      JSON.parse(localStorage.getItem("esg-assessment-data") || "{}").processEmissions?.co2Release ||
      {};
    if (existingData) {
      setClinkerQuantity(existingData.clinkerQuantity || "");
      setCalciumOxide(existingData.calciumOxide || "");
      setMagnesiumOxide(existingData.magnesiumOxide || "");
      setFiles(existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null])));
    }
  }, [state.assessmentData.processEmissions?.co2Release]);

  const validateForm = () => {
    const newErrors: {
      clinkerQuantity?: string;
      calciumOxide?: string;
      magnesiumOxide?: string;
      files?: string;
    } = {};
    if (!clinkerQuantity) {
      newErrors.clinkerQuantity = "Please enter the quantity of clinker produced";
    } else if (isNaN(Number(clinkerQuantity)) || Number(clinkerQuantity) < 0) {
      newErrors.clinkerQuantity = "Please enter a valid positive number";
    }
    if (!calciumOxide) {
      newErrors.calciumOxide = "Please enter the calcium oxide content";
    } else if (isNaN(Number(calciumOxide)) || Number(calciumOxide) < 0) {
      newErrors.calciumOxide = "Please enter a valid positive number";
    }
    if (!magnesiumOxide) {
      newErrors.magnesiumOxide = "Please enter the magnesium oxide content";
    } else if (isNaN(Number(magnesiumOxide)) || Number(magnesiumOxide) < 0) {
      newErrors.magnesiumOxide = "Please enter a valid positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
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
        [field]: { name: file.name, size: file.size, lastModified: file.lastModified },
      }));
      if (errors.files) {
        setErrors((prev) => ({ ...prev, files: undefined }));
      }
    }
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    const payload = { clinkerQuantity, calciumOxide, magnesiumOxide, files };
    // dispatch({
    //   type: "UPDATE_PROCESS_EMISSIONS",
    //   payload: {
    //     ...state.assessmentData.processEmissions,
    //     co2Release: payload,
    //   },
    // });
    // dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;
    handleSaveAndContinue();
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
            <h3 className="text-2xl font-bold text-foreground">Process Emissions</h3>
            <p className="text-muted-foreground text-base">
              Greenhouse gases released during industrial or chemical processes, not from fuel combustion.
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Section {stepIndex} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-gray-500">{percent}% complete</span>
              </div>
              <div className="w-full h-3 bg-green-300 rounded-lg">
                <div
                  className="h-3 bg-green-800 rounded transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 CO2 from Calcination in Cement Manufacturing
              </Label>
              <div className="space-y-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="clinker-quantity">Quantity of Clinker Produced (Tonnes)</Label>
                  <Input
                    id="clinker-quantity"
                    type="number"
                    placeholder="Enter quantity of clinker produced"
                    value={clinkerQuantity}
                    onChange={(e) => {
                      setClinkerQuantity(e.target.value);
                      if (errors.clinkerQuantity) {
                        setErrors((prev) => ({ ...prev, clinkerQuantity: undefined }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.clinkerQuantity ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.clinkerQuantity ? "clinker-quantity-error" : undefined}
                  />
                  {errors.clinkerQuantity && (
                    <p id="clinker-quantity-error" className="text-sm text-red-500">
                      {errors.clinkerQuantity}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calcium-oxide">Calcium Oxide Content (Tonnes)</Label>
                  <Input
                    id="calcium-oxide"
                    type="number"
                    placeholder="Enter calcium oxide content"
                    value={calciumOxide}
                    onChange={(e) => {
                      setCalciumOxide(e.target.value);
                      if (errors.calciumOxide) {
                        setErrors((prev) => ({ ...prev, calciumOxide: undefined }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.calciumOxide ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.calciumOxide ? "calcium-oxide-error" : undefined}
                  />
                  {errors.calciumOxide && (
                    <p id="calcium-oxide-error" className="text-sm text-red-500">
                      {errors.calciumOxide}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="magnesium-oxide">Magnesium Oxide Content (Tonnes)</Label>
                  <Input
                    id="magnesium-oxide"
                    type="number"
                    placeholder="Enter magnesium oxide content"
                    value={magnesiumOxide}
                    onChange={(e) => {
                      setMagnesiumOxide(e.target.value);
                      if (errors.magnesiumOxide) {
                        setErrors((prev) => ({ ...prev, magnesiumOxide: undefined }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.magnesiumOxide ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.magnesiumOxide ? "magnesium-oxide-error" : undefined}
                  />
                  {errors.magnesiumOxide && (
                    <p id="magnesium-oxide-error" className="text-sm text-red-500">
                      {errors.magnesiumOxide}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Document/Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
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