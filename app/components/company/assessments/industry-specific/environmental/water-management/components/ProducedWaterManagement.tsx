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

export interface ProducedWaterManagementProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopic: () => void;
  backToWaterWasteManagement: () => void;
}

export default function ProducedWaterManagement({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopic,
  backToWaterWasteManagement,
}: ProducedWaterManagementProps) {
  const totalProducedWaterGenerated = useFormattedNumber("");
  const volumeDischargedToSurface = useFormattedNumber("");
  const volumeInjectedForDisposal = useFormattedNumber("");
  const volumeRecycledReused = useFormattedNumber("");

  const { state, dispatch } = useAssessment();
  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow("produced-water-management");

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
      label: "Produced Water Management",
    },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    totalProducedWaterGeneratedUnit: "",
    volumeDischargedToSurfaceUnit: "",
    volumeInjectedForDisposalUnit: "",
    volumeRecycledReusedUnit: "",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.waterManagement?.waterAndProducedWaterManagement
        ?.producedWaterManagement;
    if (existingData && Object.keys(existingData).length > 0) {
      totalProducedWaterGenerated.handleChange(
        String(existingData.totalProducedWaterGenerated || "")
      );
      volumeDischargedToSurface.handleChange(String(existingData.volumeDischargedToSurface || ""));
      volumeInjectedForDisposal.handleChange(String(existingData.volumeInjectedForDisposal || ""));
      volumeRecycledReused.handleChange(String(existingData.volumeRecycledReused || ""));

      setFormData({
        totalProducedWaterGeneratedUnit: existingData.totalProducedWaterGeneratedUnit || "",
        volumeDischargedToSurfaceUnit: existingData.volumeDischargedToSurfaceUnit || "",
        volumeInjectedForDisposalUnit: existingData.volumeInjectedForDisposalUnit || "",
        volumeRecycledReusedUnit: existingData.volumeRecycledReusedUnit || "",
      });
      setFilesAndLinks(existingData.filesAndLinks || []);
    }
  }, [
    state.assessmentData.environment?.waterManagement?.waterAndProducedWaterManagement
      ?.producedWaterManagement,
  ]);

  // Calculate percentages based on total produced water
  const percentages = useMemo(() => {
    const total = Number(totalProducedWaterGenerated.rawValue) || 0;
    if (total === 0) return { discharged: 0, injected: 0, recycled: 0 };

    return {
      discharged: total > 0 ? ((Number(volumeDischargedToSurface.rawValue) || 0) / total) * 100 : 0,
      injected: total > 0 ? ((Number(volumeInjectedForDisposal.rawValue) || 0) / total) * 100 : 0,
      recycled: total > 0 ? ((Number(volumeRecycledReused.rawValue) || 0) / total) * 100 : 0,
    };
  }, [
    totalProducedWaterGenerated.rawValue,
    volumeDischargedToSurface.rawValue,
    volumeInjectedForDisposal.rawValue,
    volumeRecycledReused.rawValue,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalProducedWaterGenerated.rawValue) {
      newErrors.totalProducedWaterGenerated = "Volume is required";
    }
    if (!formData.totalProducedWaterGeneratedUnit) {
      newErrors.totalProducedWaterGeneratedUnit = "Unit is required";
    }

    if (!volumeDischargedToSurface.rawValue) {
      newErrors.volumeDischargedToSurface = "Volume is required";
    }
    if (!formData.volumeDischargedToSurfaceUnit) {
      newErrors.volumeDischargedToSurfaceUnit = "Unit is required";
    }

    if (!volumeInjectedForDisposal.rawValue) {
      newErrors.volumeInjectedForDisposal = "Volume is required";
    }
    if (!formData.volumeInjectedForDisposalUnit) {
      newErrors.volumeInjectedForDisposalUnit = "Unit is required";
    }

    if (!volumeRecycledReused.rawValue) {
      newErrors.volumeRecycledReused = "Volume is required";
    }
    if (!formData.volumeRecycledReusedUnit) {
      newErrors.volumeRecycledReusedUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useMemo(() => {
    const hasTotalProducedWaterGenerated =
      totalProducedWaterGenerated.rawValue !== "" &&
      formData.totalProducedWaterGeneratedUnit !== "";

    const hasVolumeDischargedToSurface =
      volumeDischargedToSurface.rawValue !== "" && formData.volumeDischargedToSurfaceUnit !== "";

    const hasVolumeInjectedForDisposal =
      volumeInjectedForDisposal.rawValue !== "" && formData.volumeInjectedForDisposalUnit !== "";

    const hasVolumeRecycledReused =
      volumeRecycledReused.rawValue !== "" && formData.volumeRecycledReusedUnit !== "";

    // const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasTotalProducedWaterGenerated,
      hasVolumeDischargedToSurface,
      hasVolumeInjectedForDisposal,
      hasVolumeRecycledReused,
      // hasEvidence,
    ]);
  }, [
    totalProducedWaterGenerated.rawValue,
    volumeDischargedToSurface.rawValue,
    volumeInjectedForDisposal.rawValue,
    volumeRecycledReused.rawValue,
    formData.totalProducedWaterGeneratedUnit,
    formData.volumeDischargedToSurfaceUnit,
    formData.volumeInjectedForDisposalUnit,
    formData.volumeRecycledReusedUnit,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = {
      totalProducedWaterGenerated: Number(totalProducedWaterGenerated.rawValue),
      totalProducedWaterGeneratedUnit: formData.totalProducedWaterGeneratedUnit,
      volumeDischargedToSurface: Number(volumeDischargedToSurface.rawValue),
      volumeDischargedToSurfaceUnit: formData.volumeDischargedToSurfaceUnit,
      volumeInjectedForDisposal: Number(volumeInjectedForDisposal.rawValue),
      volumeInjectedForDisposalUnit: formData.volumeInjectedForDisposalUnit,
      volumeRecycledReused: Number(volumeRecycledReused.rawValue),
      volumeRecycledReusedUnit: formData.volumeRecycledReusedUnit,
      percentages: {
        dischargedPercentage: percentages.discharged,
        injectedPercentage: percentages.injected,
        recycledPercentage: percentages.recycled,
      },
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_PRODUCED", payload });

    try {
      await saveNow(
        "environment.waterManagement.waterAndProducedWaterManagement.producedWaterManagement",
        payload
      );
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (error) {
      toast.error("Failed to save data");
    }
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      totalProducedWaterGenerated: Number(totalProducedWaterGenerated.rawValue),
      totalProducedWaterGeneratedUnit: formData.totalProducedWaterGeneratedUnit,
      volumeDischargedToSurface: Number(volumeDischargedToSurface.rawValue),
      volumeDischargedToSurfaceUnit: formData.volumeDischargedToSurfaceUnit,
      volumeInjectedForDisposal: Number(volumeInjectedForDisposal.rawValue),
      volumeInjectedForDisposalUnit: formData.volumeInjectedForDisposalUnit,
      volumeRecycledReused: Number(volumeRecycledReused.rawValue),
      volumeRecycledReusedUnit: formData.volumeRecycledReusedUnit,
      percentages: {
        dischargedPercentage: percentages.discharged,
        injectedPercentage: percentages.injected,
        recycledPercentage: percentages.recycled,
      },
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_PRODUCED", payload });
    onContinueToNextAssessment();
  };

  const handlePrevious = () => {
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={features} />
      <div className="max-w-5xl mx-auto space-y-6 ">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Produced Water Management</h3>
            <p className="text-muted-foreground text-base">
              Report the total volume of produced water and flowback generated from your operations.
              Enter the volumes for how this water was managed; percentages will be calculated
              automatically.
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
              fieldsCompleted={1}
              totalFields={4}
              isSubmitted={false}
            />
            <ReusableInput
              label={"Total Produced Water Generated"}
              tooltipTitle={"Total Produced Water Generated"}
              tooltipBody={
                "Total volume of water that comes to the surface during oil and gas production activities. Includes formation water, injected water, and flowback from wells."
              }
              inputValue={totalProducedWaterGenerated.displayValue}
              unitValue={formData.totalProducedWaterGeneratedUnit}
              onInputChange={(num) => {
                totalProducedWaterGenerated.handleChange(String(num));
                setErrors((prev) => ({ ...prev, totalProducedWaterGenerated: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("totalProducedWaterGeneratedUnit", unit);
                setErrors((prev) => ({ ...prev, totalProducedWaterGeneratedUnit: "" }));
              }}
              error={errors.totalProducedWaterGenerated}
              unitError={errors.totalProducedWaterGeneratedUnit}
              formatNumbers={false}
            />

            <ReusableInput
              label={"Volume Discharged to Surface"}
              tooltipTitle={"Volume Discharged to Surface"}
              tooltipBody={
                "Produced water discharged to surface water bodies such as rivers, lakes, or oceans after treatment, in compliance with regulatory limits. Report total discharge volume for the reporting period."
              }
              inputValue={volumeDischargedToSurface.displayValue}
              unitValue={formData.volumeDischargedToSurfaceUnit}
              onInputChange={(num) => {
                volumeDischargedToSurface.handleChange(String(num));
                setErrors((prev) => ({ ...prev, volumeDischargedToSurface: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("volumeDischargedToSurfaceUnit", unit);
                setErrors((prev) => ({ ...prev, volumeDischargedToSurfaceUnit: "" }));
              }}
              error={errors.volumeDischargedToSurface}
              unitError={errors.volumeDischargedToSurfaceUnit}
              formatNumbers={false}
            />

            <ReusableInput
              label={"Volume Injected for Disposal"}
              tooltipTitle={"Volume Injected for Disposal"}
              tooltipBody={
                "Produced water permanently injected into underground formations or disposal wells. Commonly used when treatment or discharge is not feasible."
              }
              inputValue={volumeInjectedForDisposal.displayValue}
              unitValue={formData.volumeInjectedForDisposalUnit}
              onInputChange={(num) => {
                volumeInjectedForDisposal.handleChange(String(num));
                setErrors((prev) => ({ ...prev, volumeInjectedForDisposal: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("volumeInjectedForDisposalUnit", unit);
                setErrors((prev) => ({ ...prev, volumeInjectedForDisposalUnit: "" }));
              }}
              error={errors.volumeInjectedForDisposal}
              unitError={errors.volumeInjectedForDisposalUnit}
              formatNumbers={false}
            />

            <ReusableInput
              label={"Volume Recycled/Reused"}
              tooltipTitle={"Volume Recycled/Reused"}
              tooltipBody={
                "Produced water treated and reused for operational purposes—for example, reinjection for enhanced oil recovery, drilling, or hydraulic fracturing. Report how much water was recovered instead of disposed."
              }
              inputValue={volumeRecycledReused.displayValue}
              unitValue={formData.volumeRecycledReusedUnit}
              onInputChange={(num) => {
                volumeRecycledReused.handleChange(String(num));
                setErrors((prev) => ({ ...prev, volumeRecycledReused: "" }));
              }}
              onUnitChange={(unit) => {
                handleInputChange("volumeRecycledReusedUnit", unit);
                setErrors((prev) => ({ ...prev, volumeRecycledReusedUnit: "" }));
              }}
              error={errors.volumeRecycledReused}
              unitError={errors.volumeRecycledReusedUnit}
              formatNumbers={false}
            />

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>

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
