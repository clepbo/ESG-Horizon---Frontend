"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import ReusableInput from "./ReusableInput";
import { useRouter } from "next/navigation";

export interface FreshWaterWithdrawalAndConsumptionProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopic: () => void;
  backToWaterWasteManagement: () => void;
}

export default function FreshWaterWithdrawalAndConsumption({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopic,
  backToWaterWasteManagement,
}: FreshWaterWithdrawalAndConsumptionProps) {
  const router = useRouter();
  const withdrawalfromGroundwater = useFormattedNumber("");
  const withdrawalfromMunicipalotherOtherSources = useFormattedNumber("");
  const totalWaterConsumed = useFormattedNumber("");
  const volumeWithdrawnfromWaterStressedRegions = useFormattedNumber("");
  const withdrawalfromSurfaceWater = useFormattedNumber("");

  const { state, dispatch } = useAssessment();
  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow(
    "freshwater-withdrawal-consumption"
  );

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      label: "Freshwater Withdrawal and Consumption",
    },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    withdrawalfromSurfaceWaterUnit: "m³",
    withdrawalfromGroundwaterUnit: "m³",
    withdrawalfromMunicipalotherOtherSourcesUnit: "m³",
    totalWaterConsumedUnit: "m³",
    volumeWithdrawnfromWaterStressedRegionsUnit: "m³",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.waterManagement?.waterAndProducedWaterManagement
        ?.freshwaterWithdrawals;

    if (existingData && typeof existingData === "object") {
      if (existingData.withdrawalfromSurfaceWater !== undefined) {
        withdrawalfromSurfaceWater.handleChange(String(existingData.withdrawalfromSurfaceWater));
      }
      if (
        existingData.withdrawalvalues !== undefined ||
        existingData.withdrawalfromGroundwater !== undefined
      ) {
        withdrawalfromGroundwater.handleChange(
          String(existingData.withdrawalvalues ?? existingData.withdrawalfromGroundwater ?? "")
        );
      }
      if (existingData.withdrawalfromMunicipalotherOtherSources !== undefined) {
        withdrawalfromMunicipalotherOtherSources.handleChange(
          String(existingData.withdrawalfromMunicipalotherOtherSources)
        );
      }
      if (existingData.totalWaterConsumed !== undefined) {
        totalWaterConsumed.handleChange(String(existingData.totalWaterConsumed));
      }
      if (existingData.volumeWithdrawnfromWaterStressedRegions !== undefined) {
        volumeWithdrawnfromWaterStressedRegions.handleChange(
          String(existingData.volumeWithdrawnfromWaterStressedRegions)
        );
      }

      setFormData({
        withdrawalfromSurfaceWaterUnit: existingData.withdrawalfromSurfaceWaterUnit || "m³",
        withdrawalfromGroundwaterUnit: existingData.withdrawalfromGroundwaterUnit || "m³",
        withdrawalfromMunicipalotherOtherSourcesUnit:
          existingData.withdrawalfromMunicipalotherOtherSourcesUnit || "m³",
        totalWaterConsumedUnit: existingData.totalWaterConsumedUnit || "m³",
        volumeWithdrawnfromWaterStressedRegionsUnit:
          existingData.volumeWithdrawnfromWaterStressedRegionsUnit || "m³",
      });

      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.assessmentData.environment?.waterManagement?.waterAndProducedWaterManagement
      ?.freshwaterWithdrawals,
  ]);

  const { filled, total } = useMemo(() => {
    const hasWithdrawalFromSurfaceWater =
      withdrawalfromSurfaceWater.rawValue !== "" && formData.withdrawalfromSurfaceWaterUnit !== "";
    const hasWithdrawalFromGroundwater =
      withdrawalfromGroundwater.rawValue !== "" && formData.withdrawalfromGroundwaterUnit !== "";
    const hasWithdrawalFromMunicipal =
      withdrawalfromMunicipalotherOtherSources.rawValue !== "" &&
      formData.withdrawalfromMunicipalotherOtherSourcesUnit !== "";
    const hasTotalWaterConsumed =
      totalWaterConsumed.rawValue !== "" && formData.totalWaterConsumedUnit !== "";
    const hasVolumeFromWaterStressed =
      volumeWithdrawnfromWaterStressedRegions.rawValue !== "" &&
      formData.volumeWithdrawnfromWaterStressedRegionsUnit !== "";

    return calculateProgress([
      hasWithdrawalFromSurfaceWater,
      hasWithdrawalFromGroundwater,
      hasWithdrawalFromMunicipal,
      hasTotalWaterConsumed,
      hasVolumeFromWaterStressed,
    ]);
  }, [
    withdrawalfromSurfaceWater.rawValue,
    formData.withdrawalfromSurfaceWaterUnit,
    withdrawalfromGroundwater.rawValue,
    formData.withdrawalfromGroundwaterUnit,
    withdrawalfromMunicipalotherOtherSources.rawValue,
    formData.withdrawalfromMunicipalotherOtherSourcesUnit,
    totalWaterConsumed.rawValue,
    formData.totalWaterConsumedUnit,
    volumeWithdrawnfromWaterStressedRegions.rawValue,
    formData.volumeWithdrawnfromWaterStressedRegionsUnit,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Withdrawal from Surface Water
    if (!withdrawalfromSurfaceWater.rawValue) {
      newErrors.withdrawalfromSurfaceWater = "Volume is required";
    }
    if (!formData.withdrawalfromSurfaceWaterUnit) {
      newErrors.withdrawalfromSurfaceWaterUnit = "Unit is required";
    }

    // Withdrawal from Groundwater
    if (!withdrawalfromGroundwater.rawValue) {
      newErrors.withdrawalfromGroundwater = "Volume is required";
    }
    if (!formData.withdrawalfromGroundwaterUnit) {
      newErrors.withdrawalfromGroundwaterUnit = "Unit is required";
    }

    // Withdrawal from Municipal & Other Sources
    if (!withdrawalfromMunicipalotherOtherSources.rawValue) {
      newErrors.withdrawalfromMunicipalotherOtherSources = "Volume is required";
    }
    if (!formData.withdrawalfromMunicipalotherOtherSourcesUnit) {
      newErrors.withdrawalfromMunicipalotherOtherSourcesUnit = "Unit is required";
    }

    // Total Water Consumed
    if (!totalWaterConsumed.rawValue) {
      newErrors.totalWaterConsumed = "Volume is required";
    }
    if (!formData.totalWaterConsumedUnit) {
      newErrors.totalWaterConsumedUnit = "Unit is required";
    }

    // Volume Withdrawn from Water-Stressed Regions
    if (!volumeWithdrawnfromWaterStressedRegions.rawValue) {
      newErrors.volumeWithdrawnfromWaterStressedRegions = "Volume is required";
    }
    if (!formData.volumeWithdrawnfromWaterStressedRegionsUnit) {
      newErrors.volumeWithdrawnfromWaterStressedRegionsUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      withdrawalfromGroundwater: Number(withdrawalfromGroundwater.rawValue),
      withdrawalfromGroundwaterUnit: formData.withdrawalfromGroundwaterUnit,
      withdrawalfromSurfaceWater: Number(withdrawalfromSurfaceWater.rawValue),
      withdrawalfromSurfaceWaterUnit: formData.withdrawalfromSurfaceWaterUnit,
      withdrawalfromMunicipalotherOtherSources: Number(
        withdrawalfromMunicipalotherOtherSources.rawValue
      ),
      withdrawalfromMunicipalotherOtherSourcesUnit:
        formData.withdrawalfromMunicipalotherOtherSourcesUnit,
      totalWaterConsumed: Number(totalWaterConsumed.rawValue),
      totalWaterConsumedUnit: formData.totalWaterConsumedUnit,
      volumeWithdrawnfromWaterStressedRegions: Number(
        volumeWithdrawnfromWaterStressedRegions.rawValue
      ),
      volumeWithdrawnfromWaterStressedRegionsUnit:
        formData.volumeWithdrawnfromWaterStressedRegionsUnit,
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_FRESHWATER", payload });

    try {
      await saveNow(
        "environment.waterManagement.waterAndProducedWaterManagement.freshwaterWithdrawals",
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

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fill the input fields before proceeding.");
      return;
    }

    const payload = {
      withdrawalfromGroundwater: Number(withdrawalfromGroundwater.rawValue),
      withdrawalfromGroundwaterUnit: formData.withdrawalfromGroundwaterUnit,
      withdrawalfromSurfaceWater: Number(withdrawalfromSurfaceWater.rawValue),
      withdrawalfromSurfaceWaterUnit: formData.withdrawalfromSurfaceWaterUnit,
      withdrawalfromMunicipalotherOtherSources: Number(
        withdrawalfromMunicipalotherOtherSources.rawValue
      ),
      withdrawalfromMunicipalotherOtherSourcesUnit:
        formData.withdrawalfromMunicipalotherOtherSourcesUnit,
      totalWaterConsumed: Number(totalWaterConsumed.rawValue),
      totalWaterConsumedUnit: formData.totalWaterConsumedUnit,
      volumeWithdrawnfromWaterStressedRegions: Number(
        volumeWithdrawnfromWaterStressedRegions.rawValue
      ),
      volumeWithdrawnfromWaterStressedRegionsUnit:
        formData.volumeWithdrawnfromWaterStressedRegionsUnit,
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_FRESHWATER", payload });

    try {
      await saveNow(
        "environment.waterManagement.waterAndProducedWaterManagement.freshwaterWithdrawals",
        payload
      );
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to save data.");
    }
  };

  const handlePrevious = () => {
    // toast.info("Returning to previous section");
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={features} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Freshwater Withdrawal & Consumption</h3>
            <p className="text-muted-foreground text-base">
              This form covers metric EM-EP-140a.1, focusing on the company&apos;s overall water
              footprint.
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

            <ReusableInput
              label="Withdrawal from Surface Water"
              tooltipTitle="Withdrawal from Surface Water"
              tooltipBody="Water taken directly from rivers, lakes, wetlands, reservoirs, or oceans for operational use. Report total volume withdrawn during the reporting period."
              inputValue={withdrawalfromSurfaceWater.displayValue}
              unitValue={formData.withdrawalfromSurfaceWaterUnit}
              onInputChange={(num) => {
                withdrawalfromSurfaceWater.handleChange(String(num));
                setErrors((prev) => ({ ...prev, withdrawalfromSurfaceWater: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("withdrawalfromSurfaceWaterUnit", unit);
                setErrors((prev) => ({ ...prev, withdrawalfromSurfaceWaterUnit: "" }));
              }}
              error={errors.withdrawalfromSurfaceWater}
              unitError={errors.withdrawalfromSurfaceWaterUnit}
              formatNumbers={false}
              placeholder="e.g., 1500"
            />

            <ReusableInput
              label="Withdrawal from Groundwater"
              tooltipTitle="Groundwater Withdrawal"
              tooltipBody="Water extracted from underground aquifers or wells. Includes both shallow and deep groundwater sources used for drilling, processing, or facility operations."
              inputValue={withdrawalfromGroundwater.displayValue}
              unitValue={formData.withdrawalfromGroundwaterUnit}
              onInputChange={(num) => {
                withdrawalfromGroundwater.handleChange(String(num));
                setErrors((prev) => ({ ...prev, withdrawalfromGroundwater: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("withdrawalfromGroundwaterUnit", unit);
                setErrors((prev) => ({ ...prev, withdrawalfromGroundwaterUnit: "" }));
              }}
              error={errors.withdrawalfromGroundwater}
              unitError={errors.withdrawalfromGroundwaterUnit}
              formatNumbers={false}
              placeholder="e.g., 1200"
            />

            <ReusableInput
              label="Withdrawal from Municipal & Other Sources"
              tooltipTitle="Withdrawal from Municipal & Other Sources"
              tooltipBody="Water supplied by municipal utilities, third-party providers, or purchased from external sources. This includes treated potable water used in facilities."
              inputValue={withdrawalfromMunicipalotherOtherSources.displayValue}
              unitValue={formData.withdrawalfromMunicipalotherOtherSourcesUnit}
              onInputChange={(num) => {
                withdrawalfromMunicipalotherOtherSources.handleChange(String(num));
                setErrors((prev) => ({ ...prev, withdrawalfromMunicipalotherOtherSources: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("withdrawalfromMunicipalotherOtherSourcesUnit", unit);
                setErrors((prev) => ({
                  ...prev,
                  withdrawalfromMunicipalotherOtherSourcesUnit: "",
                }));
              }}
              error={errors.withdrawalfromMunicipalotherOtherSources}
              unitError={errors.withdrawalfromMunicipalotherOtherSourcesUnit}
              formatNumbers={false}
              placeholder="e.g., 800"
            />

            <ReusableInput
              label="Total Water Consumed"
              tooltipTitle="Total Water Consumed"
              tooltipBody="The portion of water withdrawn that is not returned to the original source because it was evaporated, incorporated into products, or contaminated beyond reuse."
              inputValue={totalWaterConsumed.displayValue}
              unitValue={formData.totalWaterConsumedUnit}
              onInputChange={(num) => {
                totalWaterConsumed.handleChange(String(num));
                setErrors((prev) => ({ ...prev, totalWaterConsumed: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("totalWaterConsumedUnit", unit);
                setErrors((prev) => ({ ...prev, totalWaterConsumedUnit: "" }));
              }}
              error={errors.totalWaterConsumed}
              unitError={errors.totalWaterConsumedUnit}
              formatNumbers={false}
              placeholder="e.g., 2000"
            />

            <ReusableInput
              label="Volume Withdrawn from Water-Stressed Regions"
              tooltipTitle="Volume Withdrawn from Water-Stressed Regions"
              tooltipBody="Total water withdrawal from locations identified as water-stressed or high-baseline water-risk areas. Typically determined using recognized tools such as WRI Aqueduct or WWF Water Risk Filter."
              inputValue={volumeWithdrawnfromWaterStressedRegions.displayValue}
              unitValue={formData.volumeWithdrawnfromWaterStressedRegionsUnit}
              onInputChange={(num) => {
                volumeWithdrawnfromWaterStressedRegions.handleChange(String(num));
                setErrors((prev) => ({ ...prev, volumeWithdrawnfromWaterStressedRegions: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("volumeWithdrawnfromWaterStressedRegionsUnit", unit);
                setErrors((prev) => ({
                  ...prev,
                  volumeWithdrawnfromWaterStressedRegionsUnit: "",
                }));
              }}
              error={errors.volumeWithdrawnfromWaterStressedRegions}
              unitError={errors.volumeWithdrawnfromWaterStressedRegionsUnit}
              formatNumbers={false}
              placeholder="e.g., 500"
            />

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like water withdrawal permits, utility bills, and
                internal water balance reports.
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
