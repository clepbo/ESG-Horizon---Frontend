"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface FlareCombustionProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

type FormField = "volumeToFlare" | "flareEfficiency" | "gasComposition";

export function IncompleteFlareCombustion({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: FlareCombustionProps) {
  const {
    state: { assessmentData },
    dispatch,
  } = useAssessment();

  const incompleteCombustion = assessmentData.fugitiveEmissions?.incompleteCombustion;

  const [formState, setFormState] = useState<Record<FormField, string>>({
    volumeToFlare: incompleteCombustion?.volumeToFlare?.toString() ?? "",
    flareEfficiency: incompleteCombustion?.flareEfficiency?.toString() ?? "",
    gasComposition: incompleteCombustion?.gasComposition?.toString() ?? "",
  });

  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const labelClass = "text-gray-700 text-sm font-medium";
  const inputClass =
    "border border-gray-300 rounded px-3 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-full";

  // Type guard to ensure valid keys when indexing formState and errors
  function isFormField(key: string): key is FormField {
    return ["volumeToFlare", "flareEfficiency", "gasComposition"].includes(key);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isFormField(name) && /^\d*\.?\d*$/.test(value)) {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<FormField, string>> = {};

    if (!formState.volumeToFlare || Number(formState.volumeToFlare) < 0) {
      newErrors.volumeToFlare = "Value cannot be negative or empty";
    }

    ["flareEfficiency", "gasComposition"].forEach((field) => {
      const val = formState[field as FormField];
      if (val !== "") {
        const num = Number(val);
        if (isNaN(num) || num < 0 || num > 100) {
          newErrors[field as FormField] = "Value must be between 0 and 100";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = () => {
    if (!validate()) return;

    setIsSaving(true);

    dispatch({
      type: "UPDATE_FUGITIVE_INCOMPLETE_COMBUSTION",
      payload: {
        volumeToFlare: Number(formState.volumeToFlare),
        flareEfficiency: Number(formState.flareEfficiency),
        gasComposition: Number(formState.gasComposition),
      },
    });
    dispatch({ type: "SAVE_PROGRESS" });

    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validate()) return;

    dispatch({
      type: "UPDATE_FUGITIVE_INCOMPLETE_COMBUSTION",
      payload: {
        volumeToFlare: Number(formState.volumeToFlare),
        flareEfficiency: Number(formState.flareEfficiency),
        gasComposition: Number(formState.gasComposition),
      },
    });

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
            <h3 className="text-2xl font-semibold text-foreground">
              Fugitive Emissions
            </h3>
            <p className="text-muted-foreground text-base">
              Incomplete Combustion from Gas Flaring
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 pt-6 pb-8">
          <CardContent className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-gray-500">
                Section {stepIndex} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {percent}% complete
              </span>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {(["volumeToFlare", "flareEfficiency", "gasComposition"] as FormField[]).map((field) => {
                const labelMap: Record<FormField, string> = {
                  volumeToFlare: "Volume of Gas Sent to Flare Stack (m³)",
                  flareEfficiency: "Flare Combustion Efficiency (%)",
                  gasComposition: "Gas Composition (%)",
                };
                return (
                  <div key={field} className="flex flex-col ml-6">
                    <Label htmlFor={field} className={labelClass}>
                      {labelMap[field]}
                    </Label>
                    <Input
                      id={field}
                      name={field}
                      type="number"
                      min={field === "volumeToFlare" ? 0 : 0}
                      max={field === "volumeToFlare" ? undefined : 100}
                      step="any"
                      value={formState[field]}
                      onChange={handleChange}
                      className={
                        errors[field] ? inputClass + " border-red-500" : inputClass
                      }
                      aria-invalid={!!errors[field]}
                      aria-describedby={errors[field] ? `${field}-error` : undefined}
                    />
                    {errors[field] && (
                      <p className="text-red-600 text-xs mt-1" id={`${field}-error`}>
                        {errors[field]}
                      </p>
                    )}
                    {field === "volumeToFlare" && (
                      <p className="text-gray-600 text-xs mt-1">
                        State the volume of gas directed to the flare.
                      </p>
                    )}
                    {field === "flareEfficiency" && (
                      <p className="text-gray-600 text-xs mt-1">
                        Enter the efficiency rate (or use standard factor if direct measurement is unavailable).
                      </p>
                    )}
                    {field === "gasComposition" && (
                      <p className="text-gray-600 text-xs mt-1">
                        Indicate the gas makeup before combustion.
                      </p>
                    )}
                  </div>
                );
              })}

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
                  className="justify-self-center bg-green-500 text-white hover:bg-green-300 transition-colors flex items-center justify-center"
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
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
