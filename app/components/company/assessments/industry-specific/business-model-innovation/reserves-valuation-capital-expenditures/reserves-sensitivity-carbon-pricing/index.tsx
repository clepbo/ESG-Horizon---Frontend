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

  // Scroll to top when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    carbonPriceScenarioUnit: "$/tonne CO₂-e",
    percentageDecreaseUnit: "%",
    estimatedDecreaseUnit: "Select the unit of measurement",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasCarbonPriceScenario = carbonPriceScenario.rawValue !== "";
    const hasPercentageDecrease = percentageDecrease.rawValue !== "";
    const hasEstimatedDecrease = estimatedDecrease.rawValue !== "";
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
    filesAndLinks,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setShowSaveSuccess(false);

    const payload = {
      carbonPriceScenario: Number(carbonPriceScenario.rawValue),
      carbonPriceScenarioUnit: formData.carbonPriceScenarioUnit,

      percentageDecrease: Number(percentageDecrease.rawValue),
      percentageDecreaseUnit: formData.percentageDecreaseUnit,

      estimatedDecrease: Number(estimatedDecrease.rawValue),
      estimatedDecreaseUnit: formData.estimatedDecreaseUnit,

      filesAndLinks: filesAndLinks,
    };

    try {
      console.log("RESERVES SENSITIVITY DATA:", payload);
      // Add your save API call here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowSaveSuccess(true);
      toast.success("Data saved successfully.");
    } catch (error) {
      toast.error("Failed to save data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }
    onContinueToNextAssessment();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  const handlePrevious = () => {
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
              label="Carbon Price Scenario Used ($/tonne CO₂-e)"
              tooltipTitle="Carbon Price Scenario Used ($/tonne CO₂-e)"
              tooltipBody="Enter the carbon price value used in your sensitivity analysis. This should match the internal price on carbon or external scenario (e.g., IEA, NGFS) applied to assess how carbon costs affect the economic viability of your proved reserves."
              inputValue={carbonPriceScenario.displayValue}
              unitValue={formData.carbonPriceScenarioUnit}
              onInputChange={(num) => {
                carbonPriceScenario.handleChange(String(num));
                setErrors((prev) => ({ ...prev, carbonPriceScenario: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("carbonPriceScenarioUnit", unit);
              }}
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
              unitValue={formData.percentageDecreaseUnit}
              onInputChange={(num) => {
                percentageDecrease.handleChange(String(num));
                setErrors((prev) => ({ ...prev, percentageDecrease: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("percentageDecreaseUnit", unit);
              }}
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
              }}
              error={errors.estimatedDecrease}
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
                Back
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
