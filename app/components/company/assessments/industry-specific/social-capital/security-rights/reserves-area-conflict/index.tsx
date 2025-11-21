"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress, computeProgressPercent } from "@/lib/utils";
import { AdditionalFileUpload, FileData } from "../../../../AdditionalFileUpload";
import { AdditionalLinkUpload, LinkData } from "../../../../AdditionalLinkUpload";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { UnitSelect } from "../../../../UnitSelect";

interface ReservesAreaConflictProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function ReservesAreaConflict({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
}: ReservesAreaConflictProps) {
  const totalProvedReservesVolume = useFormattedNumber("");
  const provedReservesInConflictVolume = useFormattedNumber("");
  const probableReservesInConflictVolume = useFormattedNumber("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [additionalLinks, setAdditionalLinks] = useState<LinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    totalProvedReservesVolume: "",
    totalProvedReservesUnit: "",
    provedReservesInConflictVolume: "",
    provedReservesInConflictUnit: "",
    probableReservesInConflictVolume: "",
    probableReservesInConflictUnit: "",
    fileName: "",
    fileLink: "",
    uploadedFile: null as File | null,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalProvedReservesVolume.rawValue) {
      newErrors.totalProvedReservesVolume = "Volume is required";
    }
    if (!formData.totalProvedReservesUnit) {
      newErrors.totalProvedReservesUnit = "Unit is required";
    }

    if (!provedReservesInConflictVolume.rawValue) {
      newErrors.provedReservesInConflictVolume = "Volume is required";
    }
    if (!formData.provedReservesInConflictUnit) {
      newErrors.provedReservesInConflictUnit = "Unit is required";
    }

    if (!probableReservesInConflictVolume.rawValue) {
      newErrors.probableReservesInConflictVolume = "Volume is required";
    }
    if (!formData.probableReservesInConflictUnit) {
      newErrors.probableReservesInConflictUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasTotalProvedReserves =
      totalProvedReservesVolume.rawValue !== "" && formData.totalProvedReservesUnit !== "";

    const hasProvedConflict =
      provedReservesInConflictVolume.rawValue !== "" &&
      formData.provedReservesInConflictUnit !== "";

    const hasProbableConflict =
      probableReservesInConflictVolume.rawValue !== "" &&
      formData.probableReservesInConflictUnit !== "";

    const hasEvidence = additionalFields.length > 0 || additionalLinks.length > 0;

    return calculateProgress([
      hasTotalProvedReserves,
      hasProvedConflict,
      hasProbableConflict,
      hasEvidence,
    ]);
  }, [
    totalProvedReservesVolume.rawValue,
    provedReservesInConflictVolume.rawValue,
    probableReservesInConflictVolume.rawValue,
    formData.totalProvedReservesUnit,
    formData.provedReservesInConflictUnit,
    formData.probableReservesInConflictUnit,
    additionalFields,
    additionalLinks,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // const handleSaveAndContinue = () => {
  //   setShowSaveSuccess(true);
  //   toast.success("Progress saved! You can continue later.");
  //   if (onBackToHub) {
  //     setTimeout(() => onBackToHub(), 1500);
  //   }
  // };
  const handleSaveAndContinue = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    setShowSaveSuccess(true);
    setIsSaving(true);
    const progressPercent = computeProgressPercent({
      stepIndex,
      totalSteps,
      fieldsCompleted: filled,
      totalFields: total,
    });
    const payload = {
      totalProvedReservesVolume: Number(totalProvedReservesVolume.rawValue),
      totalProvedReservesUnit: formData.totalProvedReservesUnit,

      provedReservesInConflictVolume: Number(provedReservesInConflictVolume.rawValue),
      provedReservesInConflictUnit: formData.provedReservesInConflictUnit,

      probableReservesInConflictVolume: Number(probableReservesInConflictVolume.rawValue),
      probableReservesInConflictUnit: formData.probableReservesInConflictUnit,

      additionalFiles: additionalFields,
      additionalLinks,
      progressPercent,
    };
    console.log("DATA TO SAVE:", payload);

    console.log("DATA TO SAVE:", payload);

    toast.success("Data logged to console.");
    setIsSaving(false);
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    toast.success("Moved to next section");
    onContinueToNextAssessment();
  };
  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };
  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };
  const handleAdditionalLinksChange = (links: LinkData[]) => {
    setAdditionalLinks(links);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-primary text-primary hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold"> Reserves in or near Areas of Conflict</h3>
            <p className="text-muted-foreground text-base">
              Report the percentage of your proved and probable reserves that are located in or near
              areas of active conflict, as defined by the Uppsala Conflict Data Program (UCDP).
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            {/* Progress Bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Total Proved Reserves */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Total Proved Reserves
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-gray-600 cursor-pointer">
                    {" "}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <h6>Total Proved Reserves </h6>
                        <p>
                          The total quantity of oil and gas reserves that geological and engineering
                          data confirm can be commercially recovered under existing economic and
                          operating conditions. Report the total proved reserves for the reporting
                          period, typically in barrels of oil equivalent (BOE) or cubic feet.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Volume</Label>
                  <Input
                    type="text"
                    value={totalProvedReservesVolume.displayValue}
                    onChange={(e) => {
                      totalProvedReservesVolume.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, totalProvedReservesVolume: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />

                  {errors.totalProvedReservesVolume && (
                    <p className="text-red-600 text-xs">{errors.totalProvedReservesVolume}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>

                  <UnitSelect
                    value={formData.totalProvedReservesUnit}
                    onValueChange={(value) => {
                      handleInputChange("totalProvedReservesUnit", value);
                      setErrors((prev) => ({ ...prev, totalProvedReservesUnit: "" }));
                    }}
                    error={errors.totalProvedReservesUnit}
                  />
                </div>
              </div>
            </div>

            {/* Proved Reserves in Conflict Areas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Proved Reserves in Conflict Areas
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-gray-600 cursor-pointer">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <h6>Proved Reserves in Conflict Areas </h6>
                        <p>
                          The portion of total proved reserves that are located in regions affected
                          by conflict, political instability, or social unrest. Disclosing this
                          helps assess operational, security, and human rights risks associated with
                          extraction activities in those areas.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Volume</Label>

                  <Input
                    type="text"
                    value={provedReservesInConflictVolume.displayValue}
                    onChange={(e) => {
                      provedReservesInConflictVolume.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, provedReservesInConflictVolume: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />

                  {errors.provedReservesInConflictVolume && (
                    <p className="text-red-600 text-xs">{errors.provedReservesInConflictVolume}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>

                  <UnitSelect
                    value={formData.provedReservesInConflictUnit}
                    onValueChange={(value) => {
                      handleInputChange("provedReservesInConflictUnit", value);
                      setErrors((prev) => ({ ...prev, provedReservesInConflictUnit: "" }));
                    }}
                    error={errors.provedReservesInConflictUnit}
                  />
                </div>
              </div>
            </div>

            {/* Probable Reserves in Conflict Areas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Probable Reserves in Conflict Areas
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-gray-600 cursor-pointer">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <h6>Probable Reserves in Conflict Areas </h6>
                        <p>
                          The estimated quantity of reserves with a lower level of certainty than
                          proved reserves, but which are still likely to be recoverable. Report the
                          amount of probable reserves specifically located in conflict or high-risk
                          zones, helping investors understand exposure to geopolitical and human
                          rights risks.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Volume</Label>

                  <Input
                    type="text"
                    value={probableReservesInConflictVolume.displayValue}
                    onChange={(e) => {
                      probableReservesInConflictVolume.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, probableReservesInConflictVolume: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />

                  {errors.probableReservesInConflictVolume && (
                    <p className="text-red-600 text-xs">
                      {errors.probableReservesInConflictVolume}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>

                  <UnitSelect
                    value={formData.probableReservesInConflictUnit}
                    onValueChange={(value) => {
                      handleInputChange("probableReservesInConflictUnit", value);
                      setErrors((prev) => ({ ...prev, probableReservesInConflictUnit: "" }));
                    }}
                    error={errors.probableReservesInConflictUnit}
                  />
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like your reserves statement, internal security risk
                assessments for relevant regions, and citations for the UCDP data used.
              </p>

              <div className="mt-6">
                <AdditionalFileUpload
                  onFieldsChange={handleAdditionalFieldsChange}
                  initialData={additionalFields}
                />
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Or Upload Via Link</h4>
                <AdditionalLinkUpload
                  onFieldsChange={handleAdditionalLinksChange}
                  initialData={additionalLinks}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="justify-self-start border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-primary text-white hover:bg-teal-300 flex items-center gap-2"
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
                type="button"
                variant="outline"
                onClick={handleNext}
                disabled={isSaving}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
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
