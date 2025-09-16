"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, ArrowRight } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";

interface EntericFermentationProps {
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

interface EntericFermentationData {
  animals?: { [key: string]: number };
  files?: { [key: string]: FileMetadata | null };
}

export function EntericFermentation({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
}: EntericFermentationProps) {
  const { state, dispatch } = useAssessment();

  const [animals, setAnimals] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const existing = state.assessmentData.processEmissions
      ?.entericFermentation as EntericFermentationData | undefined;

    if (existing?.animals && typeof existing.animals === "object") {
      const values = Object.values(existing.animals);
      const total = values.reduce((sum, v) => {
        if (typeof v === "number" && Number.isFinite(v)) return sum + v;
        const n = Number(v);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0);
      setAnimals(total);
    } else {
      setAnimals(0);
    }
  }, [state.assessmentData.processEmissions?.entericFermentation]);

  const { filled, total } = useMemo(() => {
    const hasAnimalCount = animals > 0;

    return calculateProgress([hasAnimalCount]);
  }, [animals]);

  const handleSaveAndContinue = () => {
    setIsSaving(true);
    dispatch({
      type: "UPDATE_PROCESS_ENTERIC_FERMENTATION",
      payload: {
        animals: { Total: animals },
        files: {},
      },
    });
    dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
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
            <h3 className="text-2xl font-bold text-foreground">
              Process Emissions
            </h3>
            <p className="text-muted-foreground text-base">
              Greenhouse gases released during industrial or chemical processes,
              not from fuel combustion.
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />
            <div>
              <Label className="text-md font-semibold mb-2 block">
                Enteric fermentation from livestock (e.g., cattle)
              </Label>
              <div className="space-y-2 ml-6">
                <p className="text-muted-foreground">
                  Number of animals categorized by species, age, and function
                  (e.g., dairy cow, beef cattle).
                </p>

                <div className="mt-4">
                  <Label htmlFor="enteric-animals">
                    Enter the number of animals
                  </Label>
                  <div className="relative">
                    <Input
                      id="enteric-animals"
                      type="number"
                      placeholder="Enter total number of animals"
                      value={animals || ""}
                      onChange={(e) =>
                        setAnimals(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      className="w-full border-gray-400 pr-12"
                      aria-label="Number of animals"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      m³
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="justify-self-start hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
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
