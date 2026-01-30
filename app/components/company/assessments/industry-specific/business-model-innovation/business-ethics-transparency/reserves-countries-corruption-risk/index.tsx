"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
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

interface ReservesCorruptionRiskFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function ReservesCountriesCorruptionRisk({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ReservesCorruptionRiskFormProps) {
  const { state, dispatch } = useAssessment();
  const { saveNow } = useAssessmentFlow(
    "businessInnovation.businessEthicsAndTransparency.reservesInCountriesWithHighCorruptionRisk"
  );
  const totalProvedReserves = useFormattedNumber("");
  const provedReservesHighRisk = useFormattedNumber("");
  const totalProbableReserves = useFormattedNumber("");
  const probableReservesHighRisk = useFormattedNumber("");

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
    totalProvedReservesUnit: "",
    provedReservesHighRiskUnit: "",
    totalProbableReservesUnit: "",
    probableReservesHighRiskUnit: "",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.businessInnovation?.businessEthicsAndTransparency
        ?.reservesInCountriesWithHighCorruptionRisk;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.totalProvedReserves !== undefined) {
        totalProvedReserves.handleChange(String(existingData.totalProvedReserves));
      }
      if (existingData.provedReservesHighRisk !== undefined) {
        provedReservesHighRisk.handleChange(String(existingData.provedReservesHighRisk));
      }
      if (existingData.totalProbableReserves !== undefined) {
        totalProbableReserves.handleChange(String(existingData.totalProbableReserves));
      }
      if (existingData.probableReservesHighRisk !== undefined) {
        probableReservesHighRisk.handleChange(String(existingData.probableReservesHighRisk));
      }

      setFormData({
        totalProvedReservesUnit: existingData.totalProvedReservesUnit || "",
        provedReservesHighRiskUnit: existingData.provedReservesHighRiskUnit || "",
        totalProbableReservesUnit: existingData.totalProbableReservesUnit || "",
        probableReservesHighRiskUnit: existingData.probableReservesHighRiskUnit || "",
      });

      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [
    state.assessmentData.environment?.businessInnovation?.businessEthicsAndTransparency
      ?.reservesInCountriesWithHighCorruptionRisk,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalProvedReserves.rawValue) {
      newErrors.totalProvedReserves = "Volume is required";
    }
    if (!formData.totalProvedReservesUnit) {
      newErrors.totalProvedReservesUnit = "Unit is required";
    }

    if (!provedReservesHighRisk.rawValue) {
      newErrors.provedReservesHighRisk = "Volume is required";
    }
    if (!formData.provedReservesHighRiskUnit) {
      newErrors.provedReservesHighRiskUnit = "Unit is required";
    }

    if (!totalProbableReserves.rawValue) {
      newErrors.totalProbableReserves = "Volume is required";
    }
    if (!formData.totalProbableReservesUnit) {
      newErrors.totalProbableReservesUnit = "Unit is required";
    }

    if (!probableReservesHighRisk.rawValue) {
      newErrors.probableReservesHighRisk = "Volume is required";
    }
    if (!formData.probableReservesHighRiskUnit) {
      newErrors.probableReservesHighRiskUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasTotalProvedReserves =
      totalProvedReserves.rawValue !== "" && formData.totalProvedReservesUnit !== "";
    const hasProvedReservesHighRisk =
      provedReservesHighRisk.rawValue !== "" && formData.provedReservesHighRiskUnit !== "";
    const hasTotalProbableReserves =
      totalProbableReserves.rawValue !== "" && formData.totalProbableReservesUnit !== "";
    const hasProbableReservesHighRisk =
      probableReservesHighRisk.rawValue !== "" && formData.probableReservesHighRiskUnit !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasTotalProvedReserves,
      hasProvedReservesHighRisk,
      hasTotalProbableReserves,
      hasProbableReservesHighRisk,
      hasEvidence,
    ]);
  }, [
    totalProvedReserves.rawValue,
    formData.totalProvedReservesUnit,
    provedReservesHighRisk.rawValue,
    formData.provedReservesHighRiskUnit,
    totalProbableReserves.rawValue,
    formData.totalProbableReservesUnit,
    probableReservesHighRisk.rawValue,
    formData.probableReservesHighRiskUnit,
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
      totalProvedReserves: Number(totalProvedReserves.rawValue),
      totalProvedReservesUnit: formData.totalProvedReservesUnit,

      provedReservesHighRisk: Number(provedReservesHighRisk.rawValue),
      provedReservesHighRiskUnit: formData.provedReservesHighRiskUnit,

      totalProbableReserves: Number(totalProbableReserves.rawValue),
      totalProbableReservesUnit: formData.totalProbableReservesUnit,

      probableReservesHighRisk: Number(probableReservesHighRisk.rawValue),
      probableReservesHighRiskUnit: formData.probableReservesHighRiskUnit,

      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(
        "businessInnovation.businessEthicsAndTransparency.reservesInCountriesWithHighCorruptionRisk",
        payload
      );
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "businessEthicsAndTransparency",
          section: "reservesInCountriesWithHighCorruptionRisk",
          data: payload,
        },
      });
      setShowSaveSuccess(true);
      toast.success("Data saved successfully.");
    } catch (error) {
      toast.error(`Failed to save data. ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      totalProvedReserves: Number(totalProvedReserves.rawValue),
      totalProvedReservesUnit: formData.totalProvedReservesUnit,
      provedReservesHighRisk: Number(provedReservesHighRisk.rawValue),
      provedReservesHighRiskUnit: formData.provedReservesHighRiskUnit,
      totalProbableReserves: Number(totalProbableReserves.rawValue),
      totalProbableReservesUnit: formData.totalProbableReservesUnit,
      probableReservesHighRisk: Number(probableReservesHighRisk.rawValue),
      probableReservesHighRiskUnit: formData.probableReservesHighRiskUnit,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(
        "businessInnovation.businessEthicsAndTransparency.reservesInCountriesWithHighCorruptionRisk",
        payload
      );
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "businessEthicsAndTransparency",
          section: "reservesInCountriesWithHighCorruptionRisk",
          data: payload,
        },
      });
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch (error) {
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
            <h3 className="text-2xl font-semibold">
              Reserves in Countries with High Corruption Risk
            </h3>
            <p className="text-muted-foreground text-base">
              Report the percentage of your proved and probable reserves located in countries that
              have one of the 20 lowest rankings in the most recent Transparency International
              Corruption Perception Index (CPI).
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
            <ReusableInput
              label="Total Proved Reserves (by volume)"
              tooltipTitle="Total Proved Reserves (by volume)"
              tooltipBody="Enter the total volume of your company’s proved reserves based on your most recent internal reserve audit or third-party certification. Use standard industry units such as barrels of oil equivalent (boe) or cubic feet (scf)."
              inputValue={totalProvedReserves.displayValue}
              unitValue={formData.totalProvedReservesUnit}
              onInputChange={(num) => {
                totalProvedReserves.handleChange(String(num));
                setErrors((prev) => ({ ...prev, totalProvedReserves: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("totalProvedReservesUnit", unit);
                setErrors((prev) => ({ ...prev, totalProvedReservesUnit: "" }));
              }}
              error={errors.totalProvedReserves}
              unitError={errors.totalProvedReservesUnit}
              formatNumbers={false}
              placeholder="e.g., 1500"
            />

            {/* Proved Reserves in High-Risk Countries */}
            <ReusableInput
              label="Proved Reserves in High-Risk Countries (by volume)"
              tooltipTitle="Proved Reserves in High-Risk Countries (by volume)"
              tooltipBody="Report the portion of your proved reserves that are located in countries classified as high corruption risk. Use the same measurement unit as your total proved reserves, and base this figure on your geographic reserve breakdown or risk-screening analysis."
              inputValue={provedReservesHighRisk.displayValue}
              unitValue={formData.provedReservesHighRiskUnit}
              onInputChange={(num) => {
                provedReservesHighRisk.handleChange(String(num));
                setErrors((prev) => ({ ...prev, provedReservesHighRisk: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("provedReservesHighRiskUnit", unit);
                setErrors((prev) => ({ ...prev, provedReservesHighRiskUnit: "" }));
              }}
              error={errors.provedReservesHighRisk}
              unitError={errors.provedReservesHighRiskUnit}
              formatNumbers={false}
              placeholder="e.g., 1500"
            />

            {/* Total Probable Reserves */}
            <ReusableInput
              label="Total Probable Reserves (by volume)"
              tooltipTitle="Total Probable Reserves (by volume)"
              tooltipBody="Provide the total volume of probable reserves identified in your reserve assessments. Use industry-standard units (e.g., boe, scf) and ensure the values align with internal estimates or third-party reserve evaluations."
              inputValue={totalProbableReserves.displayValue}
              unitValue={formData.totalProbableReservesUnit}
              onInputChange={(num) => {
                totalProbableReserves.handleChange(String(num));
                setErrors((prev) => ({ ...prev, totalProbableReserves: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("totalProbableReservesUnit", unit);
                setErrors((prev) => ({ ...prev, totalProbableReservesUnit: "" }));
              }}
              error={errors.totalProbableReserves}
              unitError={errors.totalProbableReservesUnit}
              formatNumbers={false}
              placeholder="e.g., 800"
            />

            {/* Probable Reserves in High-Risk Countries */}
            <ReusableInput
              label="Probable Reserves in High-Risk Countries (by volume)"
              tooltipTitle="Probable Reserves in High-Risk Countries (by volume)"
              tooltipBody="Enter the volume of probable reserves situated in countries flagged as having high corruption risk. This value should reflect your company’s reserve mapping and geopolitical risk classification for the reporting period."
              inputValue={probableReservesHighRisk.displayValue}
              unitValue={formData.probableReservesHighRiskUnit}
              onInputChange={(num) => {
                probableReservesHighRisk.handleChange(String(num));
                setErrors((prev) => ({ ...prev, probableReservesHighRisk: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("probableReservesHighRiskUnit", unit);
                setErrors((prev) => ({ ...prev, probableReservesHighRiskUnit: "" }));
              }}
              error={errors.probableReservesHighRisk}
              unitError={errors.probableReservesHighRiskUnit}
              formatNumbers={false}
              placeholder="e.g., 800"
            />

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload your reserves statement confirming locations and provide a link to the
                Transparency International Corruption Perception Index report used for the
                assessment.
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
