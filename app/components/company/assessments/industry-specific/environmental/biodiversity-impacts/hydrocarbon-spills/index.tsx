"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/ui/input";

interface HydrocarbonSpillsProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function HydrocarbonSpills({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: HydrocarbonSpillsProps) {
  const router = useRouter();
  const numberOfSpills = useFormattedNumber("");
  const totalVolumeSpilled = useFormattedNumber("");
  const volumeRecovered = useFormattedNumber("");
  const volumeInArctic = useFormattedNumber("");
  const volumeImpactingShorelines = useFormattedNumber("");

  const { state, dispatch } = useAssessment();
  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow("hydrocarbon-spills");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.biodiversityImpact?.environmentalManagement
        ?.hydrocarbonSpills;
    if (existingData && Object.keys(existingData).length > 0) {
      numberOfSpills.handleChange(String(existingData.numberOfSpills || ""));
      totalVolumeSpilled.handleChange(String(existingData.totalVolumeSpilled || ""));
      volumeRecovered.handleChange(String(existingData.volumeRecovered || ""));
      volumeInArctic.handleChange(String(existingData.volumeInArctic || ""));
      volumeImpactingShorelines.handleChange(String(existingData.volumeImpactingShorelines || ""));
      setFilesAndLinks(existingData.filesAndLinks || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.assessmentData.environment?.biodiversityImpact?.environmentalManagement
      ?.hydrocarbonSpills,
  ]);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const { filled, total } = useMemo(() => {
    const hasNumberOfSpills = numberOfSpills.rawValue !== "";
    const hasTotalVolumeSpilled = totalVolumeSpilled.rawValue !== "";
    const hasVolumeRecovered = volumeRecovered.rawValue !== "";
    const hasVolumeInArctic = volumeInArctic.rawValue !== "";
    const hasVolumeImpactingShorelines = volumeImpactingShorelines.rawValue !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasNumberOfSpills,
      hasTotalVolumeSpilled,
      hasVolumeRecovered,
      hasVolumeInArctic,
      hasVolumeImpactingShorelines,
      hasEvidence,
    ]);
  }, [
    numberOfSpills.rawValue,
    totalVolumeSpilled.rawValue,
    volumeRecovered.rawValue,
    volumeInArctic.rawValue,
    volumeImpactingShorelines.rawValue,
    filesAndLinks,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!numberOfSpills.rawValue) {
      newErrors.numberOfSpills = "Number of spills is required";
    }
    if (!totalVolumeSpilled.rawValue) {
      newErrors.totalVolumeSpilled = "Volume is required";
    }
    if (!volumeRecovered.rawValue) {
      newErrors.volumeRecovered = "Volume is required";
    }
    if (!volumeInArctic.rawValue) {
      newErrors.volumeInArctic = "Volume is required";
    }
    if (!volumeImpactingShorelines.rawValue) {
      newErrors.volumeImpactingShorelines = "Volume is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      numberOfSpills: Number(numberOfSpills.rawValue),
      totalVolumeSpilled: Number(totalVolumeSpilled.rawValue),
      volumeRecovered: Number(volumeRecovered.rawValue),
      volumeInArctic: Number(volumeInArctic.rawValue),
      volumeImpactingShorelines: Number(volumeImpactingShorelines.rawValue),
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_BIODIVERSITY_SPILLS", payload });

    try {
      await saveNow(
        "environment.biodiversityImpact.environmentalManagement.hydrocarbonSpills",
        payload
      );
      setShowSaveSuccess(true);
      toast.success("Data saved successfully");
      setTimeout(() => {
        setShowSaveSuccess(false);
        router.push("/assessments/new-assessment");
      }, 1500);
    } catch {
      toast.error("Failed to save data.");
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      numberOfSpills: Number(numberOfSpills.rawValue),
      totalVolumeSpilled: Number(totalVolumeSpilled.rawValue),
      volumeRecovered: Number(volumeRecovered.rawValue),
      volumeInArctic: Number(volumeInArctic.rawValue),
      volumeImpactingShorelines: Number(volumeImpactingShorelines.rawValue),
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_BIODIVERSITY_SPILLS", payload });

    try {
      await saveNow(
        "environment.biodiversityImpact.environmentalManagement.hydrocarbonSpills",
        payload
      );
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to save data.");
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
            <h3 className="text-2xl font-semibold">Hydrocarbon Spills</h3>
            <p className="text-muted-foreground text-base">
              Report the aggregate number and volume of all hydrocarbon spills greater than one
              barrel (159 liters) that reached the environment during the reporting year. This form
              covers metric EM-EP-160a.2, focusing on the quantitative impact of spills.
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

            {/* Number of Spills */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">Number of Spills</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <h6 className="font-semibold mb-1">Number of Spills</h6>
                    <p className="text-sm">
                      Enter the total number of reportable hydrocarbon spills that occurred during
                      the reporting period. Count only spills that reached land, water, or required
                      cleanup action.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Number of Spills</Label>
                  <Input
                    type="text"
                    value={numberOfSpills.displayValue}
                    onChange={(e) => {
                      numberOfSpills.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, numberOfSpills: "" }));
                    }}
                    placeholder="Enter Number of Spills"
                    className="border-gray-300"
                  />
                  {errors.numberOfSpills && (
                    <p className="text-red-600 text-xs">{errors.numberOfSpills}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <Input
                    type="text"
                    value="Spills"
                    disabled
                    className="border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Total Volume Spilled */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Total Volume Spilled
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <h6 className="font-semibold mb-1">Total Volume Spilled</h6>
                    <p className="text-sm">
                      Provide the total quantity of hydrocarbons spilled, measured in barrels or
                      litres. This represents all material released before recovery or cleanup.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Volume</Label>
                  <Input
                    type="text"
                    value={totalVolumeSpilled.displayValue}
                    onChange={(e) => {
                      totalVolumeSpilled.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, totalVolumeSpilled: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />
                  {errors.totalVolumeSpilled && (
                    <p className="text-red-600 text-xs">{errors.totalVolumeSpilled}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <Input
                    type="text"
                    value="Barrels (bbl)"
                    disabled
                    className="border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Volume Recovered from Environment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Volume Recovered from Environment
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <h6 className="font-semibold mb-1">Volume Recovered from Environment</h6>
                    <p className="text-sm">
                      Report the amount of spilled hydrocarbons successfully recovered from soil,
                      water, or shoreline during cleanup operations. This helps measure spill
                      response effectiveness.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Volume</Label>
                  <Input
                    type="text"
                    value={volumeRecovered.displayValue}
                    onChange={(e) => {
                      volumeRecovered.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, volumeRecovered: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />
                  {errors.volumeRecovered && (
                    <p className="text-red-600 text-xs">{errors.volumeRecovered}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <Input
                    type="text"
                    value="Barrels (bbl)"
                    disabled
                    className="border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Volume in Arctic */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">Volume in Arctic</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <h6 className="font-semibold mb-1">Volume in Arctic</h6>
                    <p className="text-sm">
                      Enter the volume of hydrocarbons spilled within Arctic or high-latitude
                      environments, where ecological sensitivity and recovery challenges are
                      greater.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Volume</Label>
                  <Input
                    type="text"
                    value={volumeInArctic.displayValue}
                    onChange={(e) => {
                      volumeInArctic.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, volumeInArctic: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />
                  {errors.volumeInArctic && (
                    <p className="text-red-600 text-xs">{errors.volumeInArctic}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <Input
                    type="text"
                    value="Barrels (bbl)"
                    disabled
                    className="border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Volume Impacting Sensitive Shorelines (ESI 8-10) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Volume Impacting Sensitive Shorelines (ESI 8-10)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <h6 className="font-semibold mb-1">
                      Volume Impacting Sensitive Shorelines (ESI 8-10)
                    </h6>
                    <p className="text-sm">
                      Provide the spill volume that reached shorelines classified as highly
                      sensitive under the Environmental Sensitivity Index (ESI 8–10), such as
                      mangroves, marshes, coral reefs, or protected coastal zones.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Volume</Label>
                  <Input
                    type="text"
                    value={volumeImpactingShorelines.displayValue}
                    onChange={(e) => {
                      volumeImpactingShorelines.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, volumeImpactingShorelines: "" }));
                    }}
                    placeholder="Enter volume"
                    className="border-gray-300"
                  />
                  {errors.volumeImpactingShorelines && (
                    <p className="text-red-600 text-xs">{errors.volumeImpactingShorelines}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unit</Label>
                  <Input
                    type="text"
                    value="Barrels (bbl)"
                    disabled
                    className="border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload your official oil spill incident logs, reports filed with regulators (e.g.,
                NOSDRA, NUPRC), and Joint Investigation Visit (JIV) reports.
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
                onClick={handleNext}
                disabled={isActionLoading}
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
