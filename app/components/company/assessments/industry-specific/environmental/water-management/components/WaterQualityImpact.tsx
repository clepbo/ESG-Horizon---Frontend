"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { useRouter } from "next/navigation";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import ReusableInput from "./ReusableInput";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";

interface WaterQualityImpactProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopic: () => void;
  backToWaterWasteManagement: () => void;
}

export default function WaterQualityImpact({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopic,
  backToWaterWasteManagement,
}: WaterQualityImpactProps) {
  const router = useRouter();
  const totalMonitoredSites = useFormattedNumber("");
  const sitesWithDeterioratedQuality = useFormattedNumber("");

  const { state, dispatch } = useAssessment();
  const {
    saveNow,
    submitGroup,
    isLoading: isActionLoading,
    isPreviouslySubmitted,
    getSubmitLabel,
  } = useAssessmentFlow("water-quality-impacts", "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts");
  const hasExistingData = !!state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts?.waterQualityImpacts;

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [operatesFrackedWells, setOperatesFrackedWells] = useState<string>("");

  const features = [
    {
      label: "Assessments",
      onClick: backToAssessment,
    },
    {
      label: "Disclosure Topic",
      onClick: backToDisclosureTopic,
    },
    {
      label: "Water and Waterwaste management",
      onClick: backToWaterWasteManagement,
    },
    {
      label: "Water Quality Impacts",
    },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    totalMonitoredSitesUnit: "Sites",
    sitesWithDeterioratedQualityUnit: "Sites",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts
        ?.waterQualityImpacts;
    if (existingData && Object.keys(existingData).length > 0) {
      setOperatesFrackedWells(existingData.operatesFrackedWells || "");
      if (existingData.operatesFrackedWells === "yes") {
        totalMonitoredSites.handleChange(String(existingData.totalMonitoredSites || ""));
        sitesWithDeterioratedQuality.handleChange(
          String(existingData.sitesWithDeterioratedQuality || "")
        );
        setFormData({
          totalMonitoredSitesUnit: existingData.totalMonitoredSitesUnit || "Sites",
          sitesWithDeterioratedQualityUnit:
            existingData.sitesWithDeterioratedQualityUnit || "Sites",
        });
      }
      setFilesAndLinks(existingData.filesAndLinks || []);
    }
  }, [
    state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts
      ?.waterQualityImpacts,
    sitesWithDeterioratedQuality,
    totalMonitoredSites,
  ]);

  const { filled, total } = useMemo(() => {
    const hasRadioSelection = operatesFrackedWells !== "";

    let hasAdditionalFields = false;
    if (operatesFrackedWells === "yes") {
      const hasTotalSites =
        totalMonitoredSites.rawValue !== "" && formData.totalMonitoredSitesUnit !== "";
      const hasDeterioratedSites =
        sitesWithDeterioratedQuality.rawValue !== "" &&
        formData.sitesWithDeterioratedQualityUnit !== "";
      hasAdditionalFields = hasTotalSites && hasDeterioratedSites;
    } else if (operatesFrackedWells === "no") {
      hasAdditionalFields = true; // No additional fields needed for "No"
    }

    return calculateProgress([hasRadioSelection, hasAdditionalFields]);
  }, [
    operatesFrackedWells,
    totalMonitoredSites.rawValue,
    sitesWithDeterioratedQuality.rawValue,
    formData.totalMonitoredSitesUnit,
    formData.sitesWithDeterioratedQualityUnit,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate radio button selection
    if (!operatesFrackedWells) {
      newErrors.operatesFrackedWells = "This field is required";
    }

    // Validate fields based on selection
    if (operatesFrackedWells === "yes") {
      if (!totalMonitoredSites.rawValue) {
        newErrors.totalMonitoredSites = "Number of sites is required";
      }
      if (!formData.totalMonitoredSitesUnit) {
        newErrors.totalMonitoredSitesUnit = "Unit is required";
      }

      if (!sitesWithDeterioratedQuality.rawValue) {
        newErrors.sitesWithDeterioratedQuality = "Number of sites is required";
      }
      if (!formData.sitesWithDeterioratedQualityUnit) {
        newErrors.sitesWithDeterioratedQualityUnit = "Unit is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = {
      operatesFrackedWells,
      ...(operatesFrackedWells === "yes" && {
        totalMonitoredSites: Number(totalMonitoredSites.rawValue),
        totalMonitoredSitesUnit: formData.totalMonitoredSitesUnit,
        sitesWithDeterioratedQuality: Number(sitesWithDeterioratedQuality.rawValue),
        sitesWithDeterioratedQualityUnit: formData.sitesWithDeterioratedQualityUnit,
      }),
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_QUALITY", payload });

    try {
      await saveNow(
        "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts",
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
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const payload = {
      operatesFrackedWells,
      ...(operatesFrackedWells === "yes" && {
        totalMonitoredSites: Number(totalMonitoredSites.rawValue),
        totalMonitoredSitesUnit: formData.totalMonitoredSitesUnit,
        sitesWithDeterioratedQuality: Number(sitesWithDeterioratedQuality.rawValue),
        sitesWithDeterioratedQualityUnit: formData.sitesWithDeterioratedQualityUnit,
      }),
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_QUALITY", payload });

    try {
      await saveNow(
        "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts",
        payload
      );
      await submitGroup();
      toast.success("Water management assessment submitted successfully");
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to submit water management assessment");
    }
  };

  const handlePrevious = () => {
    // toast.info("Returning to previous section");
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
    if (errors.filesAndLinks && fields.length > 0) {
      setErrors((prev) => ({ ...prev, filesAndLinks: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={features} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">
              {operatesFrackedWells === "no" ? "Hydraulic Fracturing" : "Water Quality Impacts"}
            </h3>
            <p className="text-muted-foreground text-base">
              {operatesFrackedWells === "no"
                ? "Report on the use of hydraulic fracturing to extract oil and gas from underground rock formations."
                : "Report on the impact of hydraulic fracturing operations on local water quality compared to a pre-established baseline."}
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
              groupKey="environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts"
            />

            {/* Radio Button Question */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  Does your company conduct baseline and ongoing water quality monitoring at
                  hydraulic fracturing sites?
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Indicate whether your company conducts baseline and ongoing water quality
                      monitoring at hydraulic fracturing sites. This helps assess the impact of
                      fracturing operations on local water sources.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <RadioGroup
                value={operatesFrackedWells}
                onValueChange={(value) => {
                  setOperatesFrackedWells(value);
                  setErrors((prev) => ({ ...prev, operatesFrackedWells: "" }));
                }}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>

              {errors.operatesFrackedWells && (
                <p className="text-sm text-red-600">{errors.operatesFrackedWells}</p>
              )}
            </div>

            {/* Conditional Fields for YES response */}
            {operatesFrackedWells === "yes" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <ReusableInput
                  label="Total Number of Monitored Hydraulic Fracturing Sites"
                  tooltipTitle="Total Number of Monitored Hydraulic Fracturing Sites"
                  tooltipBody="The total number of hydraulic fracturing sites where water quality monitoring is conducted regularly. This includes sites where baseline and ongoing water quality assessments are performed to track potential impacts."
                  inputValue={totalMonitoredSites.displayValue}
                  unitValue={formData.totalMonitoredSitesUnit}
                  onInputChange={(num) => {
                    totalMonitoredSites.handleChange(String(num));
                    setErrors((prev) => ({ ...prev, totalMonitoredSites: "" }));
                  }}
                  onUnitChange={(unit) => {
                    handleInputChange("totalMonitoredSitesUnit", unit);
                    setErrors((prev) => ({ ...prev, totalMonitoredSitesUnit: "" }));
                  }}
                  error={errors.totalMonitoredSites}
                  unitError={errors.totalMonitoredSitesUnit}
                  formatNumbers={false}
                  placeholder="e.g., 50"
                  customUnit="Sites"
                />

                <ReusableInput
                  label="Number of Sites Where Water Quality Deteriorated"
                  tooltipTitle="Number of Sites Where Water Quality Deteriorated"
                  tooltipBody="The number of sites where water quality measurements showed deterioration compared to pre-established baseline levels. This indicates potential negative impacts from hydraulic fracturing operations on local water sources."
                  inputValue={sitesWithDeterioratedQuality.displayValue}
                  unitValue={formData.sitesWithDeterioratedQualityUnit}
                  onInputChange={(num) => {
                    sitesWithDeterioratedQuality.handleChange(String(num));
                    setErrors((prev) => ({ ...prev, sitesWithDeterioratedQuality: "" }));
                  }}
                  onUnitChange={(unit) => {
                    handleInputChange("sitesWithDeterioratedQualityUnit", unit);
                    setErrors((prev) => ({ ...prev, sitesWithDeterioratedQualityUnit: "" }));
                  }}
                  error={errors.sitesWithDeterioratedQuality}
                  unitError={errors.sitesWithDeterioratedQualityUnit}
                  formatNumbers={false}
                  placeholder="e.g., 5"
                  customUnit="Sites"
                />
              </div>
            )}

            {/* Conditional Document/Evidence Upload - Only show when Yes or No is selected */}
            {operatesFrackedWells !== "" && (
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 animate-in fade-in duration-300">
                <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>

                <p className="text-sm text-gray-600">
                  {operatesFrackedWells === "yes"
                    ? "Provide links to the public disclosure platforms (e.g., corporate sustainability website, FracFocus registry) and upload any relevant policy documents."
                    : "Upload supporting documents or statements confirming that no hydraulic fracturing operations were conducted during the reporting period, along with any relevant water quality monitoring policies or procedures."}
                </p>

                <div className="mt-6">
                  <AddMoreFilesLinks
                    onFieldsChange={handleFilesAndLinksChange}
                    initialData={filesAndLinks}
                    uploadService={uploadService}
                  />
                </div>

                {errors.filesAndLinks && (
                  <p className="text-sm text-red-600 mt-2">{errors.filesAndLinks}</p>
                )}
              </div>
            )}

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
                disabled={isActionLoading || isPreviouslySubmitted}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getSubmitLabel(hasExistingData)}
                {!isPreviouslySubmitted && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
