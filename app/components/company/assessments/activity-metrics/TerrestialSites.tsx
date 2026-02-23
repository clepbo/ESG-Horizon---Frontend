"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";

import { uploadService } from "@/services/upload.service";
import { calculateProgress } from "@/lib/utils";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useAssessment } from "@/hooks/useAssessment";

interface TerrestialSitesProps {
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb?: Array<{ label: string; href?: string; onClick?: () => void }>;
}

export function TerrestialSites({
  onBack,
  stepIndex,
  totalSteps,
  breadcrumb = [],
}: TerrestialSitesProps) {
  const router = useRouter();
  const { state, dispatch } = useAssessment();

  const {
    saveNow,
    submitGroup,
    isLoading: isActionLoading,
  } = useAssessmentFlow("activityMetrics.assetPortfolio.terrestrialSites");

  const flowStations = useFormattedNumber("");
  const gasProcessingPlants = useFormattedNumber("");
  const otherTerrestrialSites = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData = state.assessmentData.activityMetrics?.assetPortfolio?.terrestrialSites;
    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.flowStations !== undefined) {
        flowStations.handleChange(String(existingData.flowStations));
      }
      if (existingData.gasProcessingPlants !== undefined) {
        gasProcessingPlants.handleChange(String(existingData.gasProcessingPlants));
      }
      if (existingData.otherSites !== undefined) {
        otherTerrestrialSites.handleChange(String(existingData.otherSites));
      }
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.assessmentData.activityMetrics?.assetPortfolio?.terrestrialSites]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!flowStations.rawValue) newErrors.flowStations = "Number is required";
    if (!gasProcessingPlants.rawValue) newErrors.gasProcessingPlants = "Number is required";
    if (!otherTerrestrialSites.rawValue) newErrors.otherTerrestrialSites = "Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasFlowStations = flowStations.rawValue !== "";
    const hasGasProcessing = gasProcessingPlants.rawValue !== "";
    const hasOtherSites = otherTerrestrialSites.rawValue !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasFlowStations, hasGasProcessing, hasOtherSites, hasEvidence]);
  }, [
    flowStations.rawValue,
    gasProcessingPlants.rawValue,
    otherTerrestrialSites.rawValue,
    filesAndLinks,
  ]);

  const getPayload = () => {
    const flowStationsCount = Number(flowStations.rawValue) || 0;
    const gasPlantsCount = Number(gasProcessingPlants.rawValue) || 0;
    const otherSitesCount = Number(otherTerrestrialSites.rawValue) || 0;

    return {
      flowStations: flowStationsCount,
      gasProcessingPlants: gasPlantsCount,
      otherSites: otherSitesCount,
      totalNumber: flowStationsCount + gasPlantsCount + otherSitesCount,
      filesAndLinks,
    };
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = getPayload();
    try {
      await saveNow("activityMetrics.assetPortfolio.terrestrialSites", payload);
      dispatch({
        type: "UPDATE_ASSET_PORTFOLIO",
        payload: { section: "terrestrialSites", data: payload },
      });
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => router.push("/assessments/new-assessment"), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save data");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const payload = getPayload();
    try {
      await saveNow("activityMetrics.assetPortfolio.terrestrialSites", payload);
      dispatch({
        type: "UPDATE_ASSET_PORTFOLIO",
        payload: { section: "terrestrialSites", data: payload },
      });
      await submitGroup();
      toast.success("Activity metrics submitted successfully");
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit activity metrics");
    }
  };

  const handlePrevious = () => {
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  const renderCountField = (
    label: string,
    tooltipTitle: string,
    tooltipContent: string,
    value: ReturnType<typeof useFormattedNumber>,
    unit: string,
    placeholder: string,
    errorKey: string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-base font-semibold text-gray-900">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
          >
            <h6>{tooltipTitle}</h6>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-md border border-gray-200">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Value</Label>
          <Input
            type="text"
            value={value.displayValue}
            onChange={(e) => {
              value.handleChange(e.target.value);
              setErrors((prev) => ({ ...prev, [errorKey]: "" }));
            }}
            placeholder={placeholder}
            className="border-gray-300"
          />
          {errors[errorKey] && <p className="text-red-600 text-xs">{errors[errorKey]}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Unit</Label>
          <Input
            type="text"
            value={unit}
            readOnly
            className="border-gray-300 bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Terrestrial Sites"
        nextAssessment="Greenhouse Gas Emissions"
        onContinue={() => router.push("/reports-and-analytics")}
        onContinueAssessment={() => {
          // Jump to the first form in the Environmental pillar
          dispatch({ type: "SET_VIEW", payload: "ghg-stationary-sources" });
        }}
        onBackToHub={() => router.push("/assessments/new-assessment")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Terrestrial Sites</h3>
            <p className="text-muted-foreground text-base">
              Report the total number of distinct operational terrestrial (onshore) sites at the end
              of the reporting year. Use the sub-metric fields below to provide a breakdown.
            </p>
          </div>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {renderCountField(
              "Number of Flow Stations",
              "Number of Flow Stations",
              "Enter the number of flow stations used for gathering, separating, or routing crude and gas from well clusters.",
              flowStations,
              "Stations",
              "eg. 7",
              "flowStations"
            )}

            {renderCountField(
              "Number of Gas Processing Plants",
              "Number of Gas Processing Plants",
              "State the total number of gas processing plants, including facilities for compression, treatment, or liquefaction.",
              gasProcessingPlants,
              "Plants",
              "eg. 2",
              "gasProcessingPlants"
            )}

            {renderCountField(
              "Number of Other Terrestrial Sites (e.g., Terminals, Field Logistics Bases)",
              "Number of Other Terrestrial Sites",
              "Include all other onshore operational sites such as terminals, depots, logistics bases, and support facilities.",
              otherTerrestrialSites,
              "Sites",
              "eg. 2",
              "otherTerrestrialSites"
            )}

            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents such as asset registers, operational site lists, or
                third-party verification of terrestrial site counts for the reporting period.
              </p>
              <div className="mt-6">
                <AddMoreFilesLinks
                  onFieldsChange={handleFilesAndLinksChange}
                  initialData={filesAndLinks}
                  uploadService={uploadService}
                />
              </div>
            </div>

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
                disabled={isActionLoading}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                Submit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
