"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import ReusableInput from "../../../environmental/water-management/components/ReusableInput";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface ReservesSensitivityFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function ReservesSensitivityForm({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ReservesSensitivityFormProps) {
  const carbonPriceScenario = useFormattedNumber("");
  const percentageDecrease = useFormattedNumber("");
  const estimatedDecrease = useFormattedNumber("");

  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  const _router = useRouter();
  const { state, dispatch } = useAssessment();
  const { saveNow } = useAssessmentFlow(
    "businessInnovation.reservesValuationAndCapitalExpenditures.reservesSensitivityToCarbonPricing"
  );

  useEffect(() => {
    const existingData =
      state.assessmentData.businessInnovation?.reservesValuationAndCapitalExpenditures
        ?.reservesSensitivityToCarbonPricing;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.carbonPriceScenario !== undefined) {
        carbonPriceScenario.handleChange(String(existingData.carbonPriceScenario));
      }
      if (existingData.percentageDecrease !== undefined) {
        percentageDecrease.handleChange(String(existingData.percentageDecrease));
      }
      if (existingData.estimatedDecrease !== undefined) {
        estimatedDecrease.handleChange(String(existingData.estimatedDecrease));
      }

      setFormData({
        carbonPriceScenarioUnit: existingData.carbonPriceScenarioUnit || "$/tonne CO₂-e",
        percentageDecreaseUnit: existingData.percentageDecreaseUnit || "%",
        estimatedDecreaseUnit: existingData.estimatedDecreaseUnit || "",
      });

      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.assessmentData.businessInnovation?.reservesValuationAndCapitalExpenditures
      ?.reservesSensitivityToCarbonPricing,
  ]);

  // Scroll to top when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    carbonPriceScenarioUnit: "$/tonne CO₂-e",
    percentageDecreaseUnit: "%",
    estimatedDecreaseUnit: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!carbonPriceScenario.rawValue) {
      newErrors.carbonPriceScenario = "Volume is required";
    }
    if (!percentageDecrease.rawValue) {
      newErrors.percentageDecrease = "Volume is required";
    }
    if (!estimatedDecrease.rawValue) {
      newErrors.estimatedDecrease = "Volume is required";
    }
    if (!formData.estimatedDecreaseUnit) {
      newErrors.estimatedDecreaseUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasCarbonPriceScenario = carbonPriceScenario.rawValue !== "";
    const hasPercentageDecrease = percentageDecrease.rawValue !== "";
    const hasEstimatedDecrease =
      estimatedDecrease.rawValue !== "" && formData.estimatedDecreaseUnit !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasCarbonPriceScenario,
      hasPercentageDecrease,
      hasEstimatedDecrease,
      hasEvidence,
    ]);
  }, [
    carbonPriceScenario.rawValue,
    percentageDecrease.rawValue,
    estimatedDecrease.rawValue,
    formData.estimatedDecreaseUnit,
    filesAndLinks,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const payload = {
    carbonPriceScenario: Number(carbonPriceScenario.rawValue),
    carbonPriceScenarioUnit: formData.carbonPriceScenarioUnit,

    percentageDecrease: Number(percentageDecrease.rawValue),
    percentageDecreaseUnit: formData.percentageDecreaseUnit,

    estimatedDecrease: Number(estimatedDecrease.rawValue),
    estimatedDecreaseUnit: formData.estimatedDecreaseUnit,

    filesAndLinks: filesAndLinks,
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    setShowSaveSuccess(false);

    try {
      await saveNow(
        "businessInnovation.reservesValuationAndCapitalExpenditures.reservesSensitivityToCarbonPricing",
        payload
      );
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "reservesValuationAndCapitalExpenditures",
          section: "reservesSensitivityToCarbonPricing",
          data: payload,
        },
      });
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        _router.push("/assessments/new-assessment");
      }, 1500);
    } catch (_error: any) {
      console.error(_error);
      toast.error("Failed to save data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    try {
      await saveNow(
        "businessInnovation.reservesValuationAndCapitalExpenditures.reservesSensitivityToCarbonPricing",
        payload
      );
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "reservesValuationAndCapitalExpenditures",
          section: "reservesSensitivityToCarbonPricing",
          data: payload,
        },
      });
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save progress");
    }
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
    if (errors.filesAndLinks && fields.length > 0) {
      setErrors((prev) => ({ ...prev, filesAndLinks: "" }));
    }
  };

  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Reserves Sensitivity to Carbon Pricing</h3>
            <p className="text-muted-foreground text-base">
              This form covers metric EM-EP-420a.1, focusing on the sensitivity of hydrocarbon
              reserves to various carbon price scenarios.
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

            {/* Carbon Price Scenario Used */}
            <ReusableInput
              label="Carbon Price Scenario Used"
              tooltipTitle="Carbon Price Scenario Used"
              tooltipBody="Enter the carbon price value used in your sensitivity analysis. This should match the internal price on carbon or external scenario (e.g., IEA, NGFS) applied to assess how carbon costs affect the economic viability of your proved reserves."
              inputValue={carbonPriceScenario.displayValue}
              unitValue=""
              onInputChange={(num) => {
                carbonPriceScenario.handleChange(String(num));
                setErrors((prev) => ({ ...prev, carbonPriceScenario: "" }));
              }}
              onUnitChange={() => {}}
              customUnit="$/tonne CO₂-e"
              error={errors.carbonPriceScenario}
              formatNumbers={false}
              placeholder="e.g., 50"
            />

            {/* Estimated % Decrease in Proved Oil Reserves */}
            <ReusableInput
              label="Estimated % Decrease in Proved Oil Reserves"
              tooltipTitle="Estimated % Decrease in Proved Oil Reserves"
              tooltipBody="Enter the percentage reduction in proved reserves based on your analysis of how the selected carbon price impacts project profitability. This reflects the potential write-down of assets if carbon costs increase."
              inputValue={percentageDecrease.displayValue}
              unitValue=""
              onInputChange={(num) => {
                percentageDecrease.handleChange(String(num));
                setErrors((prev) => ({ ...prev, percentageDecrease: "" }));
              }}
              onUnitChange={() => {}}
              customUnit="%"
              error={errors.percentageDecrease}
              formatNumbers={false}
              placeholder="e.g., 8"
            />

            {/* Estimated Decrease in Proved Oil Reserves */}
            <ReusableInput
              label="Estimated Decrease in Proved Oil Reserves"
              tooltipTitle="Estimated Decrease in Proved Oil Reserves"
              tooltipBody="Enter the actual volume of proved reserves expected to become uneconomic under the chosen carbon price scenario. Use your internal financial models or third-party audit results to determine the estimated loss."
              inputValue={estimatedDecrease.displayValue}
              unitValue={formData.estimatedDecreaseUnit}
              onInputChange={(num) => {
                estimatedDecrease.handleChange(String(num));
                setErrors((prev) => ({ ...prev, estimatedDecrease: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("estimatedDecreaseUnit", unit);
                setErrors((prev) => ({ ...prev, estimatedDecreaseUnit: "" }));
              }}
              error={errors.estimatedDecrease}
              unitError={errors.estimatedDecreaseUnit}
              formatNumbers={false}
              placeholder="e.g., 120"
            />

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload the internal reserves valuation report that incorporates climate-risk
                scenarios, the third-party reserves audit report, and your corporate TCFD report.
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
                className="justify-self-center bg-primary text-white hover:bg-teal-300 flex items-center gap-2 cursor-pointer border-none"
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
