"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
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
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";

interface CO2ReleaseProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
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
}: CO2ReleaseProps) {
  const { state, dispatch } = useAssessment();
  const [clinkerQuantity, setClinkerQuantity] = useState<number>(0);
  const [calciumOxide, setCalciumOxide] = useState<number>(0);
  const [magnesiumOxide, setMagnesiumOxide] = useState<number>(0);
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
    const existingData = state.assessmentData.processEmissions?.co2Release;
    if (existingData) {
      setClinkerQuantity(existingData.clinkerQuantity);
      setCalciumOxide(existingData.calciumOxide);
      setMagnesiumOxide(existingData.magnesiumOxide);
      setFiles(
        existingData.files ||
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData.processEmissions?.co2Release]);

  const { filled, total } = useMemo(() => {
    return calculateProgress([
      clinkerQuantity > 0,
      calciumOxide > 0,
      magnesiumOxide > 0,
      ...Object.values(files).map(Boolean),
    ]);
  }, [clinkerQuantity, calciumOxide, magnesiumOxide, files]);

  const validateForm = () => {
    const newErrors: {
      clinkerQuantity?: string;
      calciumOxide?: string;
      magnesiumOxide?: string;
      files?: string;
    } = {};
    if (clinkerQuantity <= 0) {
      newErrors.clinkerQuantity =
        "Please enter a positive quantity of clinker produced";
    }
    if (calciumOxide <= 0) {
      newErrors.calciumOxide = "Please enter a positive calcium oxide content";
    }
    if (magnesiumOxide <= 0) {
      newErrors.magnesiumOxide =
        "Please enter a positive magnesium oxide content";
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
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    dispatch({
      type: "UPDATE_PROCESS_CO2_RELEASE",
      payload: { clinkerQuantity, calciumOxide, magnesiumOxide, files },
    });
    dispatch({ type: "SAVE_PROGRESS" });
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
            <h3 className="text-xl font-semibold text-gray-900">
              Process Emissions
            </h3>
            <p className="text-sm text-gray-600">
              Greenhouse gases released during industrial or chemical processes,
              not from fuel combustion.
            </p>
          </div>
        </div>
        <Card className="bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-4 block">
                1.1 CO2 from Calcination in Cement Manufacturing
              </Label>
              <div className="space-y-6 ml-6">
                <div className="space-y-4">
                  <Label
                    htmlFor="clinker-quantity"
                    className="text-sm font-medium text-gray-700"
                  >
                    Quantity of Clinker Produced (Tonnes)
                  </Label>
                  <Input
                    id="clinker-quantity"
                    type="number"
                    placeholder="Enter quantity of clinker produced"
                    value={clinkerQuantity || ""}
                    onChange={(e) => {
                      setClinkerQuantity(Number(e.target.value));
                      setErrors((prev) => ({
                        ...prev,
                        clinkerQuantity: undefined,
                      }));
                    }}
                    className={`w-full border-gray-400 ${
                      errors.clinkerQuantity
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    aria-describedby={
                      errors.clinkerQuantity
                        ? "clinker-quantity-error"
                        : undefined
                    }
                  />
                  {errors.clinkerQuantity && (
                    <p
                      id="clinker-quantity-error"
                      className="text-sm text-red-500"
                    >
                      {errors.clinkerQuantity}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  <Label
                    htmlFor="calcium-oxide"
                    className="text-sm font-medium text-gray-700"
                  >
                    Calcium Oxide Content (Tonnes)
                  </Label>
                  <Input
                    id="calcium-oxide"
                    type="number"
                    placeholder="Enter calcium oxide content"
                    value={calciumOxide || ""}
                    onChange={(e) => {
                      setCalciumOxide(Number(e.target.value));
                      setErrors((prev) => ({
                        ...prev,
                        calciumOxide: undefined,
                      }));
                    }}
                    className={`w-full border-gray-400 ${
                      errors.calciumOxide
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    aria-describedby={
                      errors.calciumOxide ? "calcium-oxide-error" : undefined
                    }
                  />
                  {errors.calciumOxide && (
                    <p
                      id="calcium-oxide-error"
                      className="text-sm text-red-500"
                    >
                      {errors.calciumOxide}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  <Label
                    htmlFor="magnesium-oxide"
                    className="text-sm font-medium text-gray-700"
                  >
                    Magnesium Oxide Content (Tonnes)
                  </Label>
                  <Input
                    id="magnesium-oxide"
                    type="number"
                    placeholder="Enter magnesium oxide content"
                    value={magnesiumOxide || ""}
                    onChange={(e) => {
                      setMagnesiumOxide(Number(e.target.value));
                      setErrors((prev) => ({
                        ...prev,
                        magnesiumOxide: undefined,
                      }));
                    }}
                    className={`w-full border-gray-400 ${
                      errors.magnesiumOxide
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    aria-describedby={
                      errors.magnesiumOxide
                        ? "magnesium-oxide-error"
                        : undefined
                    }
                  />
                  {errors.magnesiumOxide && (
                    <p
                      id="magnesium-oxide-error"
                      className="text-sm text-red-500"
                    >
                      {errors.magnesiumOxide}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-4 block">
                1.2 Document/Evidence Upload
              </Label>
              <div className="ml-6 space-y-6">
                {errors.files && (
                  <p className="text-sm text-red-500">{errors.files}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uploadFields.map((field) => (
                    <div key={field} className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        {field}
                      </Label>
                      <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
                        <Label
                          htmlFor={`upload-${field
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <CloudUpload className="h-6 w-6 text-gray-400" />
                          <span className="text-xs text-gray-400 text-center">
                            Upload {field} (Max. 10MB)
                          </span>
                        </Label>
                        <Input
                          id={`upload-${field
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
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
                className="justify-self-start border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 text-white hover:bg-green-600 transition-colors"
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
                className="justify-self-end border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
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
