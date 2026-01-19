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
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface EmbeddedCarbonInReservesProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function EmbeddedCarbonInReserves({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: EmbeddedCarbonInReservesProps) {
  const totalProvedReserves = useFormattedNumber("");
  const estimatedEmbeddedEmissions = useFormattedNumber("");

  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { saveNow } = useAssessmentFlow(
    "businessModelAndInnovation.reserveValuation.climateImpact.embeddedCarbonInReserve"
  );

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, _setFormData] = useState({
    totalProvedReservesUnit: "",
    estimatedEmbeddedEmissionsUnit: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalProvedReserves.rawValue) {
      newErrors.totalProvedReserves = "Volume is required";
    }

    if (!estimatedEmbeddedEmissions.rawValue) {
      newErrors.estimatedEmbeddedEmissions = "Volume is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasTotalProvedReserves =
      totalProvedReserves.rawValue !== "" && formData.totalProvedReservesUnit !== "";
    const hasEstimatedEmbeddedEmissions =
      estimatedEmbeddedEmissions.rawValue !== "" && formData.estimatedEmbeddedEmissionsUnit !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasTotalProvedReserves, hasEstimatedEmbeddedEmissions, hasEvidence]);
  }, [
    totalProvedReserves.rawValue,
    estimatedEmbeddedEmissions.rawValue,
    formData.totalProvedReservesUnit,
    formData.estimatedEmbeddedEmissionsUnit,
    filesAndLinks,
  ]);

  // const handleInputChange = (field: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  // };

  const payload = {
    totalProvedReserves: Number(totalProvedReserves.rawValue),
    totalProvedReservesUnit: formData.totalProvedReservesUnit,

    estimatedEmbeddedEmissions: Number(estimatedEmbeddedEmissions.rawValue),
    estimatedEmbeddedEmissionsUnit: formData.estimatedEmbeddedEmissionsUnit,

    filesAndLinks: filesAndLinks,
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setShowSaveSuccess(false);

    // businessModelAndInnovation.reserveValuation.climateImpact.embeddedCarbonInReserve

    try {
      await saveNow(
        "businessModelAndInnovation.reserveValuation.climateImpact.embeddedCarbonInReserve",
        payload
      );
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
      toast.error("Please fix the errors before continuing.");
      return;
    }
    try {
      await saveNow(
        "businessModelAndInnovation.reserveValuation.climateImpact.embeddedCarbonInReserve",
        payload
      );
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save data");
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
            <h3 className="text-2xl font-semibold">Embedded Carbon in Reserves</h3>
            <p className="text-muted-foreground text-base">
              This form covers metric EM-EP-420a.2, which is specific to the estimated CO₂ emissions
              embedded in proved reserves.
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
              label="Total Proved Reserves"
              tooltipTitle="Total Proved Reserves"
              tooltipBody="Enter the total quantity of proved reserves reported by your company. Use official reserve statements or audited reserves data to ensure accuracy."
              inputValue={totalProvedReserves.displayValue}
              unitValue=""
              onInputChange={(num) => {
                totalProvedReserves.handleChange(String(num));
                setErrors((prev) => ({ ...prev, totalProvedReserves: "" }));
              }}
              onUnitChange={() => {}}
              customUnit="Billion BOE"
              error={errors.totalProvedReserves}
              unitError={errors.totalProvedReservesUnit}
              formatNumbers={false}
              placeholder="e.g., 1.5"
            />

            {/* Estimated Embedded CO₂ Emissions */}
            <ReusableInput
              label="Estimated Embedded CO₂ Emissions"
              tooltipTitle="Estimated Embedded CO₂ Emissions"
              tooltipBody="Enter the estimated total greenhouse gas emissions that would be released if all proved reserves were extracted and combusted. Use internal modelling or recognized emission-conversion factors to calculate this value."
              inputValue={estimatedEmbeddedEmissions.displayValue}
              unitValue=""
              onInputChange={(num) => {
                estimatedEmbeddedEmissions.handleChange(String(num));
                setErrors((prev) => ({ ...prev, estimatedEmbeddedEmissions: "" }));
              }}
              onUnitChange={() => {}}
              customUnit="Million t CO₂-e"
              error={errors.estimatedEmbeddedEmissions}
              unitError={errors.estimatedEmbeddedEmissionsUnit}
              formatNumbers={false}
              placeholder="e.g., 850"
            />

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              </div>
              <p className="text-sm text-gray-600">
                Upload the calculation methodology document and the data from reserves reports used
                in the calculation.
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
