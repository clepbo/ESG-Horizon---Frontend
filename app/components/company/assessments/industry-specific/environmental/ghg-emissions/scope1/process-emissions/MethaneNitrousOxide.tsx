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
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  CloudUpload,
  ArrowRight,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface MethaneNitrousOxideProps {
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

const animalTypes = [
  "Cattle (Dairy)",
  "Cattle (Beef)",
  "Sheep",
  "Goats",
  "Pigs",
  "Poultry (Broilers)",
  "Poultry (Layers)",
  "Others",
];

const manureSystems = [
  "Liquid/Slurry",
  "Solid Storage",
  "Pasture/Range/Paddock",
  "Anaerobic Digester",
  "Composting",
  "Deep Litter",
  "Others",
];

const uploadFields = [
  "Livestock inventory records",
  "Farm records on feed and productivity",
  "Manure management system descriptions",
  "Fertilizer/manure application logs",
];

export function MethaneNitrousOxide({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: MethaneNitrousOxideProps) {
  const { state, dispatch } = useAssessment();
  const [animals, setAnimals] = useState<{ [type: string]: number }>(
    Object.fromEntries(animalTypes.map((type) => [type, 0]))
  );
  const [manureSystem, setManureSystem] = useState("");
  const [otherManureSystem, setOtherManureSystem] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    animals?: string;
    [key: string]: string | undefined;
  }>({});

  useEffect(() => {
    const existingData =
      state.assessmentData.processEmissions?.methaneNitrousOxide ||
      JSON.parse(localStorage.getItem("esg-assessment-data") || "{}").processEmissions?.methaneNitrousOxide ||
      {};
    if (existingData) {
      setAnimals(existingData.animals || Object.fromEntries(animalTypes.map((type) => [type, 0])));
      setManureSystem(existingData.manureSystem || "");
      setOtherManureSystem(existingData.otherManureSystem || "");
      setFiles(existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null])));
    }
  }, [state.assessmentData.processEmissions?.methaneNitrousOxide]);

  const validateForm = () => {
    const newErrors: { animals?: string; [key: string]: string | undefined } = {};
    const totalAnimals = Object.values(animals).reduce((sum, count) => sum + count, 0);
    if (totalAnimals === 0) {
      newErrors.animals = "Please enter the number of animals for at least one type";
    } else {
      Object.entries(animals).forEach(([type, count]) => {
        if (count < 0) {
          newErrors[`animals.${type}`] = "Number of animals must be non-negative";
        }
      });
    }
    if (!manureSystem) {
      newErrors.manureSystem = "Please select a manure management system";
    }
    if (manureSystem === "Others" && !otherManureSystem.trim()) {
      newErrors.otherManureSystem = "Please specify the other manure system";
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
    const payload = { animals, manureSystem, otherManureSystem, files };
    // dispatch({
    //   type: "UPDATE_PROCESS_EMISSIONS",
    //   payload: {
    //     ...state.assessmentData.processEmissions,
    //     methaneNitrousOxide: payload,
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
                1.1 Methane and Nitrous Oxide from Manure Management
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Number of Animals</Label>
                {errors.animals && <p className="text-sm text-red-500">{errors.animals}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animalTypes.map((type) => (
                    <div key={type} className="space-y-2">
                      <Label htmlFor={`animal-${type.replace(/\s/g, "-").toLowerCase()}`}>
                        {type}
                      </Label>
                      <Input
                        id={`animal-${type.replace(/\s/g, "-").toLowerCase()}`}
                        type="number"
                        placeholder={`Enter number of ${type.toLowerCase()}`}
                        value={animals[type] || ""}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setAnimals((prev) => ({ ...prev, [type]: value }));
                          if (errors[`animals.${type}`]) {
                            setErrors((prev) => ({ ...prev, [`animals.${type}`]: undefined }));
                          }
                          if (errors.animals) {
                            setErrors((prev) => ({ ...prev, animals: undefined }));
                          }
                        }}
                        className={`w-full border-gray-400 ${
                          errors[`animals.${type}`] ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        aria-describedby={errors[`animals.${type}`] ? `animal-${type}-error` : undefined}
                      />
                      {errors[`animals.${type}`] && (
                        <p id={`animal-${type}-error`} className="text-sm text-red-500">
                          {errors[`animals.${type}`]}
                        </p>
                      )}
                      {type === "Others" && animals.Others > 0 && (
                        <div className="space-y-2 mt-2">
                          <Label htmlFor="other-animal-type">Specify Other Animal Type</Label>
                          <Input
                            id="other-animal-type"
                            type="text"
                            placeholder="Enter animal type"
                            value={otherManureSystem}
                            onChange={(e) => {
                              setOtherManureSystem(e.target.value);
                              if (errors.otherManureSystem) {
                                setErrors((prev) => ({ ...prev, otherManureSystem: undefined }));
                              }
                            }}
                            className={`w-full border-gray-400 ${
                              errors.otherManureSystem ? "border-red-500 focus:border-red-500" : ""
                            }`}
                            aria-describedby={errors.otherManureSystem ? "other-animal-type-error" : undefined}
                          />
                          {errors.otherManureSystem && (
                            <p id="other-animal-type-error" className="text-sm text-red-500">
                              {errors.otherManureSystem}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Label className="mt-4 block">Type of Manure Management System</Label>
                <RadioGroup
                  value={manureSystem}
                  onValueChange={(value) => {
                    setManureSystem(value);
                    if (value !== "Others") {
                      setOtherManureSystem("");
                      setErrors((prev) => ({ ...prev, otherManureSystem: undefined }));
                    }
                    if (errors.manureSystem) {
                      setErrors((prev) => ({ ...prev, manureSystem: undefined }));
                    }
                  }}
                  className={`flex flex-col space-y-2 ${
                    errors.manureSystem ? "border-red-500 p-2 rounded" : ""
                  }`}
                >
                  {manureSystems.map((system) => (
                    <div key={system} className="flex items-center space-x-2">
                      <RadioGroupItem value={system} id={`manure-${system.replace(/\s/g, "-").toLowerCase()}`} />
                      <Label htmlFor={`manure-${system.replace(/\s/g, "-").toLowerCase()}`}>
                        {system}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.manureSystem && (
                  <p className="text-sm text-red-500">{errors.manureSystem}</p>
                )}
                {manureSystem === "Others" && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="other-manure-system">Specify Other Manure System</Label>
                    <Input
                      id="other-manure-system"
                      type="text"
                      placeholder="Enter manure system type"
                      value={otherManureSystem}
                      onChange={(e) => {
                        setOtherManureSystem(e.target.value);
                        if (errors.otherManureSystem) {
                          setErrors((prev) => ({ ...prev, otherManureSystem: undefined }));
                        }
                      }}
                      className={`w-full border-gray-400 ${
                        errors.otherManureSystem ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      aria-describedby={errors.otherManureSystem ? "other-manure-system-error" : undefined}
                    />
                    {errors.otherManureSystem && (
                      <p id="other-manure-system-error" className="text-sm text-red-500">
                        {errors.otherManureSystem}
                      </p>
                    )}
                  </div>
                )}
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