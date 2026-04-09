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
import { calculateProgress } from "@/lib/utils";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { UnitSelect } from "../../../../UnitSelect";
import { uploadService } from "@/services/upload.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useAssessment } from "@/hooks/useAssessment";
import { useRouter } from "next/navigation";

interface ReservesIndigenousLandProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function ReservesIndigenousLand({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ReservesIndigenousLandProps) {
  const router = useRouter();
  const { state } = useAssessment();
  const { saveNow, saveAndSubmit } = useAssessmentFlow(
    "socialCapital.securityRights.reservesIndigenousLand",
    "socialCapital.securityHumanRights.reservesInNearIndigenousLand"
  );

  const totalProvedReservesVolume = useFormattedNumber("");
  const provedIndigenousVolume = useFormattedNumber("");
  const totalProbableReservesVolume = useFormattedNumber("");
  const probableIndigenousVolume = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);
  const [formData, setFormData] = useState({
    totalProvedReservesVolume: "",
    totalProvedReservesUnit: "",
    provedIndigenousVolume: "",
    provedIndigenousUnit: "",
    totalProbableReservesVolume: "",
    totalProbableReservesUnit: "",
    probableIndigenousVolume: "",
    probableIndigenousUnit: "",
  });

  // Pre-fill form from saved assessment data
  useEffect(() => {
    const existingData =
      state.assessmentData?.socialCapital?.securityRights?.reservesIndigenousLand;
    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.totalProvedReservesVolume != null) {
        totalProvedReservesVolume.handleChange(String(existingData.totalProvedReservesVolume));
      }
      if (existingData.provedIndigenousVolume != null) {
        provedIndigenousVolume.handleChange(String(existingData.provedIndigenousVolume));
      }
      if (existingData.totalProbableReservesVolume != null) {
        totalProbableReservesVolume.handleChange(String(existingData.totalProbableReservesVolume));
      }
      if (existingData.probableIndigenousVolume != null) {
        probableIndigenousVolume.handleChange(String(existingData.probableIndigenousVolume));
      }
      setFormData((prev) => ({
        ...prev,
        totalProvedReservesUnit:
          existingData.totalProvedReservesUnit ?? prev.totalProvedReservesUnit,
        provedIndigenousUnit: existingData.provedIndigenousUnit ?? prev.provedIndigenousUnit,
        totalProbableReservesUnit:
          existingData.totalProbableReservesUnit ?? prev.totalProbableReservesUnit,
        probableIndigenousUnit: existingData.probableIndigenousUnit ?? prev.probableIndigenousUnit,
      }));
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [state.assessmentData?.socialCapital?.securityRights?.reservesIndigenousLand]);

  const { filled, total } = useMemo(() => {
    const hasTotalProvedReserves =
      totalProvedReservesVolume.rawValue !== "" && formData.totalProvedReservesUnit !== "";

    const hasProvedIndigenous =
      provedIndigenousVolume.rawValue !== "" && formData.provedIndigenousUnit !== "";

    const hasTotalProbableReserves =
      totalProbableReservesVolume.rawValue !== "" && formData.totalProbableReservesUnit !== "";

    const hasProbableIndigenous =
      probableIndigenousVolume.rawValue !== "" && formData.probableIndigenousUnit !== "";

    return calculateProgress([
      hasTotalProvedReserves,
      hasProvedIndigenous,
      hasTotalProbableReserves,
      hasProbableIndigenous,
    ]);
  }, [
    totalProvedReservesVolume.rawValue,
    provedIndigenousVolume.rawValue,
    totalProbableReservesVolume.rawValue,
    probableIndigenousVolume.rawValue,
    formData.totalProvedReservesUnit,
    formData.provedIndigenousUnit,
    formData.totalProbableReservesUnit,
    formData.probableIndigenousUnit,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalProvedReservesVolume.rawValue) {
      newErrors.totalProvedReservesVolume = "Volume is required";
    }
    if (!formData.totalProvedReservesUnit) {
      newErrors.totalProvedReservesUnit = "Unit is required";
    }
    if (!provedIndigenousVolume.rawValue) {
      newErrors.provedIndigenousVolume = "Volume is required";
    }
    if (!formData.provedIndigenousUnit) {
      newErrors.provedIndigenousUnit = "Unit is required";
    }

    if (!totalProbableReservesVolume.rawValue) {
      newErrors.totalProbableReservesVolume = "Volume is required";
    }
    if (!formData.totalProbableReservesUnit) {
      newErrors.totalProbableReservesUnit = "Unit is required";
    }
    if (!probableIndigenousVolume.rawValue) {
      newErrors.probableIndigenousVolume = "Volume is required";
    }
    if (!formData.probableIndigenousUnit) {
      newErrors.probableIndigenousUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);

    const payload = {
      totalProvedReservesVolume: Number(totalProvedReservesVolume.rawValue),
      totalProvedReservesUnit: formData.totalProvedReservesUnit,
      provedIndigenousVolume: Number(provedIndigenousVolume.rawValue),
      provedIndigenousUnit: formData.provedIndigenousUnit,
      totalProbableReservesVolume: Number(totalProbableReservesVolume.rawValue),
      totalProbableReservesUnit: formData.totalProbableReservesUnit,
      probableIndigenousVolume: Number(probableIndigenousVolume.rawValue),
      probableIndigenousUnit: formData.probableIndigenousUnit,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow("socialCapital.securityRights.reservesIndigenousLand", payload);
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 1000);
    } catch (_error) {
      console.log(_error);
      toast.error("Failed to save data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before proceeding.");
      return;
    }

    const payload = {
      totalProvedReservesVolume: Number(totalProvedReservesVolume.rawValue),
      totalProvedReservesUnit: formData.totalProvedReservesUnit,
      provedIndigenousVolume: Number(provedIndigenousVolume.rawValue),
      provedIndigenousUnit: formData.provedIndigenousUnit,
      totalProbableReservesVolume: Number(totalProbableReservesVolume.rawValue),
      totalProbableReservesUnit: formData.totalProbableReservesUnit,
      probableIndigenousVolume: Number(probableIndigenousVolume.rawValue),
      probableIndigenousUnit: formData.probableIndigenousUnit,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveAndSubmit("socialCapital.securityRights.reservesIndigenousLand", payload);
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save data");
    }
  };

  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };
  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6 ">
        <div className="flex items-center gap-6 mb-4  mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Reserves in or near Indigenous Land</h3>
            <p className="text-muted-foreground text-base">
              Report the percentage of your proved and probable reserves that are located on or near
              lands considered to be occupied by indigenous peoples.
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
              groupKey="socialCapital.securityHumanRights.reservesInNearIndigenousLand"
            />

            {/* Total Proved Reserves */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Total Proved Reserves
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-gray-600">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <h6>Total Proved Reserves </h6>
                        <p>
                          The total quantity of oil and gas reserves confirmed by geological and
                          engineering data to be commercially recoverable under current operating
                          and economic conditions. Report the full proved reserve volume for the
                          reporting year.
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

            {/* Proved Reserves in/near Indigenous Land */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Proved Reserves in/near Indigenous Land
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-gray-600">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <h6>Proved Reserves in/near Indigenous Land </h6>
                        <p>
                          The portion of proved reserves located on, or within close proximity to,
                          Indigenous lands or territories. This disclosure highlights potential
                          human rights, cultural heritage, and access-to-land risks.
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
                    value={provedIndigenousVolume.displayValue}
                    onChange={(e) => {
                      provedIndigenousVolume.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, provedIndigenousVolume: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />

                  {errors.provedIndigenousVolume && (
                    <p className="text-red-600 text-xs">{errors.provedIndigenousVolume}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <UnitSelect
                    value={formData.provedIndigenousUnit}
                    onValueChange={(value) => {
                      handleInputChange("provedIndigenousUnit", value);
                      setErrors((prev) => ({ ...prev, provedIndigenousUnit: "" }));
                    }}
                    error={errors.provedIndigenousUnit}
                  />
                </div>
              </div>
            </div>

            {/* Total Probable Reserves */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Total Probable Reserves
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-gray-600">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <h6>Total Probable Reserves </h6>
                        <p>
                          The estimated volume of reserves that are less certain than proved
                          reserves, but are still likely to be recoverable based on geological and
                          engineering evidence. Report the total probable reserves for the reporting
                          period.
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
                    value={totalProbableReservesVolume.displayValue}
                    onChange={(e) => {
                      totalProbableReservesVolume.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, totalProbableReservesVolume: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />

                  {errors.totalProbableReservesVolume && (
                    <p className="text-red-600 text-xs">{errors.totalProbableReservesVolume}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <UnitSelect
                    value={formData.totalProbableReservesUnit}
                    onValueChange={(value) => {
                      handleInputChange("totalProbableReservesUnit", value);
                      setErrors((prev) => ({ ...prev, totalProbableReservesUnit: "" }));
                    }}
                    error={errors.totalProbableReservesUnit}
                  />
                </div>
              </div>
            </div>

            {/* Probable Reserves in/near Indigenous Land */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Probable Reserves in/near Indigenous Land
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer">
                  <span className="text-xs text-gray-600">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <h6>Probable Reserves in/near Indigenous Land </h6>
                        <p>
                          The estimated quantity of probable reserves situated within or close to
                          Indigenous territories. Reporting this helps assess social and
                          environmental impacts, and the need for respectful engagement and rights
                          protection.
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
                    value={probableIndigenousVolume.displayValue}
                    onChange={(e) => {
                      probableIndigenousVolume.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, probableIndigenousVolume: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />

                  {errors.probableIndigenousVolume && (
                    <p className="text-red-600 text-xs">{errors.probableIndigenousVolume}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>

                  <UnitSelect
                    value={formData.probableIndigenousUnit}
                    onValueChange={(value) => {
                      handleInputChange("probableIndigenousUnit", value);
                      setErrors((prev) => ({ ...prev, probableIndigenousUnit: "" }));
                    }}
                    error={errors.probableIndigenousUnit}
                  />
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload - Same as ReservesAreaConflict */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like maps of operational areas cross-referenced with
                community land boundaries and Social Impact Assessment (SIA) reports that identify
                local ethnic groups.
              </p>

              <div className="mt-6">
                <AddMoreFilesLinks
                  onFieldsChange={handleFilesAndLinksChange}
                  initialData={filesAndLinks}
                  uploadService={uploadService}
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
