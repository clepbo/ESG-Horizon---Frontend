"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { uploadService } from "@/services/upload.service";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { useRouter } from "next/navigation";

interface ReservesInSensitiveAreasProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: string;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
  onSubmit: (totals: TotalsResponse | null) => void;
}

export default function ReservesInSensitiveAreas({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
  onSubmit: _onSubmit,
}: ReservesInSensitiveAreasProps) {
  const router = useRouter();
  const totalProvedReservesVolume = useFormattedNumber("");
  const provedReservesSensitiveVolume = useFormattedNumber("");
  const totalProbableReservesVolume = useFormattedNumber("");
  const probableReservesSensitiveVolume = useFormattedNumber("");

  const { state, dispatch } = useAssessment();
  const {
    saveNow,
    submitGroup,
    isLoading: isActionLoading,
    isPreviouslySubmitted,
  } = useAssessmentFlow("reserves-in-sensitive-areas");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    totalProvedReservesUnit: "",
    provedReservesSensitiveUnit: "",
    totalProbableReservesUnit: "",
    probableReservesSensitiveUnit: "",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.biodiversityImpact?.environmentalManagement
        ?.reservesInSensitiveAreas;
    if (existingData && Object.keys(existingData).length > 0) {
      totalProvedReservesVolume.handleChange(String(existingData.totalProvedReservesVolume || ""));
      provedReservesSensitiveVolume.handleChange(
        String(existingData.provedReservesSensitiveVolume || "")
      );
      totalProbableReservesVolume.handleChange(
        String(existingData.totalProbableReservesVolume || "")
      );
      probableReservesSensitiveVolume.handleChange(
        String(existingData.probableReservesSensitiveVolume || "")
      );
      setFormData({
        totalProvedReservesUnit: existingData.totalProvedReservesUnit || "",
        provedReservesSensitiveUnit: existingData.provedReservesSensitiveUnit || "",
        totalProbableReservesUnit: existingData.totalProbableReservesUnit || "",
        probableReservesSensitiveUnit: existingData.probableReservesSensitiveUnit || "",
      });
      setFilesAndLinks(existingData.filesAndLinks || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.assessmentData.environment?.biodiversityImpact?.environmentalManagement
      ?.reservesInSensitiveAreas,
  ]);

  const { filled, total } = useMemo(() => {
    const hasTotalProvedReserves =
      totalProvedReservesVolume.rawValue !== "" && formData.totalProvedReservesUnit !== "";

    const hasProvedSensitive =
      provedReservesSensitiveVolume.rawValue !== "" && formData.provedReservesSensitiveUnit !== "";

    const hasTotalProbable =
      totalProbableReservesVolume.rawValue !== "" && formData.totalProbableReservesUnit !== "";

    const hasProbableSensitive =
      probableReservesSensitiveVolume.rawValue !== "" &&
      formData.probableReservesSensitiveUnit !== "";

    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasTotalProvedReserves,
      hasProvedSensitive,
      hasTotalProbable,
      hasProbableSensitive,
      hasEvidence,
    ]);
  }, [
    totalProvedReservesVolume.rawValue,
    provedReservesSensitiveVolume.rawValue,
    totalProbableReservesVolume.rawValue,
    probableReservesSensitiveVolume.rawValue,
    formData.totalProvedReservesUnit,
    formData.provedReservesSensitiveUnit,
    formData.totalProbableReservesUnit,
    formData.probableReservesSensitiveUnit,
    filesAndLinks,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalProvedReservesVolume.rawValue) {
      newErrors.totalProvedReservesVolume = "Volume is required";
    }
    if (!formData.totalProvedReservesUnit) {
      newErrors.totalProvedReservesUnit = "Unit is required";
    }
    if (!provedReservesSensitiveVolume.rawValue) {
      newErrors.provedReservesSensitiveVolume = "Volume is required";
    }
    if (!formData.provedReservesSensitiveUnit) {
      newErrors.provedReservesSensitiveUnit = "Unit is required";
    }
    if (!totalProbableReservesVolume.rawValue) {
      newErrors.totalProbableReservesVolume = "Volume is required";
    }
    if (!formData.totalProbableReservesUnit) {
      newErrors.totalProbableReservesUnit = "Unit is required";
    }
    if (!probableReservesSensitiveVolume.rawValue) {
      newErrors.probableReservesSensitiveVolume = "Volume is required";
    }
    if (!formData.probableReservesSensitiveUnit) {
      newErrors.probableReservesSensitiveUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      totalProvedReservesVolume: Number(totalProvedReservesVolume.rawValue),
      totalProvedReservesUnit: formData.totalProvedReservesUnit,

      provedReservesSensitiveVolume: Number(provedReservesSensitiveVolume.rawValue),
      provedReservesSensitiveUnit: formData.provedReservesSensitiveUnit,

      totalProbableReservesVolume: Number(totalProbableReservesVolume.rawValue),
      totalProbableReservesUnit: formData.totalProbableReservesUnit,

      probableReservesSensitiveVolume: Number(probableReservesSensitiveVolume.rawValue),
      probableReservesSensitiveUnit: formData.probableReservesSensitiveUnit,

      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_BIODIVERSITY_RESERVES", payload });

    try {
      await saveNow(
        "environment.biodiversityImpact.environmentalManagement.reservesInSensitiveAreas",
        payload
      );
      setShowSaveSuccess(true);
      toast.success("Data saved successfully");
      setTimeout(() => {
        setShowSaveSuccess(false);
        router.push("/assessments/new-assessment");
      }, 1500);
    } catch {
      // toast.error is already handled in useAssessmentFlow
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const payload = {
      totalProvedReservesVolume: Number(totalProvedReservesVolume.rawValue),
      totalProvedReservesUnit: formData.totalProvedReservesUnit,

      provedReservesSensitiveVolume: Number(provedReservesSensitiveVolume.rawValue),
      provedReservesSensitiveUnit: formData.provedReservesSensitiveUnit,

      totalProbableReservesVolume: Number(totalProbableReservesVolume.rawValue),
      totalProbableReservesUnit: formData.totalProbableReservesUnit,

      probableReservesSensitiveVolume: Number(probableReservesSensitiveVolume.rawValue),
      probableReservesSensitiveUnit: formData.probableReservesSensitiveUnit,

      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_BIODIVERSITY_RESERVES", payload });

    try {
      await saveNow(
        "environment.biodiversityImpact.environmentalManagement.reservesInSensitiveAreas",
        payload
      );
      await submitGroup();
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to submit biodiversity assessment");
    }
  };

  const handlePrevious = () => {
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Reserves in Sensitive Areas</h3>
            <p className="text-muted-foreground text-base">
              Report the percentage of your proved and probable reserves that are located in or near
              sites with protected conservation status or endangered species habitat. This form
              covers metric EM-EP-160a.3, quantifying the potential future impact on biodiversity.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <p>
                      Enter the total quantity of proved hydrocarbon reserves owned or controlled by
                      the company. These are reserves that geological and engineering data confirm
                      to be recoverable under existing conditions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Volume</Label>
                    <Input
                      type="text"
                      placeholder="Enter volume"
                      value={totalProvedReservesVolume.displayValue}
                      onChange={(e) => {
                        totalProvedReservesVolume.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, totalProvedReservesVolume: "" }));
                      }}
                      className="border-gray-300"
                    />
                    {errors.totalProvedReservesVolume && (
                      <p className="text-red-600 text-xs">{errors.totalProvedReservesVolume}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Unit</Label>
                    <Select
                      value={formData.totalProvedReservesUnit}
                      onValueChange={(value) => handleInputChange("totalProvedReservesUnit", value)}
                    >
                      <SelectTrigger className="w-full border-gray-300 bg-white">
                        <SelectValue placeholder="Select the unit of measurement" />
                      </SelectTrigger>
                      <SelectContent className="border-none">
                        <SelectItem value="barrels">Barrels (Bbl)</SelectItem>
                        <SelectItem value="cubic-meters">Barrel of Oil Equivalent (BOE)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.totalProvedReservesUnit && (
                      <p className="text-red-600 text-xs">{errors.totalProvedReservesUnit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Proved Reserves in Sensitive Areas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Proved Reserves in Sensitive Areas
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <p>
                      Report the portion of proved reserves located within ecologically sensitive
                      zones—such as protected habitats, wetlands, marine sanctuaries, or areas with
                      high biodiversity value.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Volume</Label>
                    <Input
                      type="text"
                      placeholder="Enter volume"
                      value={provedReservesSensitiveVolume.displayValue}
                      onChange={(e) => {
                        provedReservesSensitiveVolume.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, provedReservesSensitiveVolume: "" }));
                      }}
                      className="border-gray-300"
                    />
                    {errors.provedReservesSensitiveVolume && (
                      <p className="text-red-600 text-xs">{errors.provedReservesSensitiveVolume}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Unit</Label>
                    <Select
                      value={formData.provedReservesSensitiveUnit}
                      onValueChange={(value) =>
                        handleInputChange("provedReservesSensitiveUnit", value)
                      }
                    >
                      <SelectTrigger className="w-full border-gray-300 bg-white">
                        <SelectValue placeholder="Select the unit of measurement" />
                      </SelectTrigger>
                      <SelectContent className="border-none">
                        <SelectItem value="barrels">Barrels (Bbl)</SelectItem>
                        <SelectItem value="cubic-meters">Barrel of Oil Equivalent (BOE)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.provedReservesSensitiveUnit && (
                      <p className="text-red-600 text-xs">{errors.provedReservesSensitiveUnit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Probable Reserves */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Total Probable Reserves
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <p>
                      Provide the total estimated volume of probable reserves. These are reserves
                      with a lower level of certainty than proved reserves but are still considered
                      technically and economically recoverable.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Volume</Label>
                    <Input
                      type="text"
                      placeholder="Enter volume"
                      value={totalProbableReservesVolume.displayValue}
                      onChange={(e) => {
                        totalProbableReservesVolume.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, totalProbableReservesVolume: "" }));
                      }}
                      className="border-gray-300"
                    />
                    {errors.totalProbableReservesVolume && (
                      <p className="text-red-600 text-xs">{errors.totalProbableReservesVolume}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Unit</Label>
                    <Select
                      value={formData.totalProbableReservesUnit}
                      onValueChange={(value) =>
                        handleInputChange("totalProbableReservesUnit", value)
                      }
                    >
                      <SelectTrigger className="w-full border-gray-300 bg-white">
                        <SelectValue placeholder="Select the unit of measurement" />
                      </SelectTrigger>
                      <SelectContent className="border-none">
                        <SelectItem value="barrels">Barrels (Bbl)</SelectItem>
                        <SelectItem value="cubic-meters">Barrel of Oil Equivalent (BOE)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.totalProbableReservesUnit && (
                      <p className="text-red-600 text-xs">{errors.totalProbableReservesUnit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Probable Reserves in Sensitive Areas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Probable Reserves in Sensitive Areas
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <p>
                      Enter the estimated amount of probable reserves located in sensitive
                      environmental areas. This helps assess future ecological risks associated with
                      exploration or development.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Volume</Label>
                    <Input
                      type="text"
                      placeholder="Enter volume"
                      value={probableReservesSensitiveVolume.displayValue}
                      onChange={(e) => {
                        probableReservesSensitiveVolume.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, probableReservesSensitiveVolume: "" }));
                      }}
                      className="border-gray-300"
                    />
                    {errors.probableReservesSensitiveVolume && (
                      <p className="text-red-600 text-xs">
                        {errors.probableReservesSensitiveVolume}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Unit</Label>
                    <Select
                      value={formData.probableReservesSensitiveUnit}
                      onValueChange={(value) =>
                        handleInputChange("probableReservesSensitiveUnit", value)
                      }
                    >
                      <SelectTrigger className="w-full border-gray-300 bg-white">
                        <SelectValue placeholder="Select the unit of measurement" />
                      </SelectTrigger>
                      <SelectContent className="border-none">
                        <SelectItem value="barrels">Barrels (Bbl)</SelectItem>
                        <SelectItem value="cubic-meters">Barrel of Oil Equivalent (BOE)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.probableReservesSensitiveUnit && (
                      <p className="text-red-600 text-xs">{errors.probableReservesSensitiveUnit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload your reserves statement and geospatial maps overlaying asset locations with
                protected area boundaries (e.g., World Database on Protected Areas).
              </p>

              <div className="mt-6">
                <AddMoreFilesLinks
                  onFieldsChange={handleFilesAndLinksChange}
                  initialData={filesAndLinks}
                  uploadService={uploadService}
                  showToast={(msg, type) => toast[type](msg)}
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
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isActionLoading}
                className="justify-self-center bg-primary text-white hover:bg-teal-300 flex items-center gap-2"
              >
                {isActionLoading ? (
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
                onClick={handleSubmit}
                disabled={isActionLoading || isPreviouslySubmitted}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPreviouslySubmitted ? "Submitted" : "Submit"}
                {!isPreviouslySubmitted && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
