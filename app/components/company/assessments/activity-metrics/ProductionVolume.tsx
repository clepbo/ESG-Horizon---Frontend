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
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface ProductionVolumeProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  backToActivityMetrics: () => void;
}

export function ProductionVolume({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  backToActivityMetrics,
}: ProductionVolumeProps) {
  const router = useRouter();
  const { saveNow } = useAssessmentFlow("activityMetrics.productionVolume");

  const crudeOilProduction = useFormattedNumber("");
  const naturalGasProduction = useFormattedNumber("");
  const syntheticOilProduction = useFormattedNumber("");
  const syntheticGasProduction = useFormattedNumber("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const breadcrumFeature = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Activity Metrics", onClick: backToActivityMetrics },
    { label: "Production Volume" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!crudeOilProduction.rawValue) {
      newErrors.crudeOilProduction = "Volume is required";
    }
    if (!naturalGasProduction.rawValue) {
      newErrors.naturalGasProduction = "Volume is required";
    }
    if (!syntheticOilProduction.rawValue) {
      newErrors.syntheticOilProduction = "Volume is required";
    }
    if (!syntheticGasProduction.rawValue) {
      newErrors.syntheticGasProduction = "Volume is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasCrudeOil = crudeOilProduction.rawValue !== "";
    const hasNaturalGas = naturalGasProduction.rawValue !== "";
    const hasSyntheticOil = syntheticOilProduction.rawValue !== "";
    const hasSyntheticGas = syntheticGasProduction.rawValue !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasCrudeOil,
      hasNaturalGas,
      hasSyntheticOil,
      hasSyntheticGas,
      hasEvidence,
    ]);
  }, [
    crudeOilProduction.rawValue,
    naturalGasProduction.rawValue,
    syntheticOilProduction.rawValue,
    syntheticGasProduction.rawValue,
    filesAndLinks,
  ]);

  const handleSaveAndContinue = async () => {
    setIsSaving(true);

    const payload = {
      crudeOilProductionVolume: Number(crudeOilProduction.rawValue),
      crudeOilProductionUnit: "kbpd",
      naturalGasProductionVolume: Number(naturalGasProduction.rawValue),
      naturalGasProductionUnit: "MMscf/day",
      syntheticOilProductionVolume: Number(syntheticOilProduction.rawValue),
      syntheticOilProductionUnit: "kbpd",
      syntheticGasProductionVolume: Number(syntheticGasProduction.rawValue),
      syntheticGasProductionUnit: "MMscf/day",
      filesAndLinks,
    };

    try {
      await saveNow("activityMetrics.productionVolume", payload);
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
      crudeOilProductionVolume: Number(crudeOilProduction.rawValue),
      crudeOilProductionUnit: "kbpd",
      naturalGasProductionVolume: Number(naturalGasProduction.rawValue),
      naturalGasProductionUnit: "MMscf/day",
      syntheticOilProductionVolume: Number(syntheticOilProduction.rawValue),
      syntheticOilProductionUnit: "kbpd",
      syntheticGasProductionVolume: Number(syntheticGasProduction.rawValue),
      syntheticGasProductionUnit: "MMscf/day",
      filesAndLinks,
    };

    try {
      await saveNow("activityMetrics.productionVolume", payload);
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

  const renderProductionField = (
    label: string,
    tooltipTitle: string,
    tooltipContent: string,
    volume: ReturnType<typeof useFormattedNumber>,
    unit: string,
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
            value={volume.displayValue}
            onChange={(e) => {
              volume.handleChange(e.target.value);
              setErrors((prev) => ({ ...prev, [errorKey]: "" }));
            }}
            placeholder="Enter volume"
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

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumFeature} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Production Volumes</h3>
            <p className="text-muted-foreground text-base">
              Provide the average daily production volumes for the reporting year. Enter &apos0&apos
              for any products that are not applicable to your operations.
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

            {renderProductionField(
              "Crude Oil Production (Thousand barrels per day)",
              "Crude Oil Production (Thousand barrels per day)",
              "Enter the average daily crude oil production for the reporting period. This should reflect output in thousand barrels per day (kbpd).",
              crudeOilProduction,
              "kbpd",
              "crudeOilProduction"
            )}

            {renderProductionField(
              "Natural Gas Production (Million standard cubic feet per day)",
              "Natural Gas Production (Million standard cubic feet per day)",
              "Enter the average daily natural gas production measured in million standard cubic feet per day (MMscf/d).",
              naturalGasProduction,
              "MMscf/day",
              "naturalGasProduction"
            )}

            {renderProductionField(
              "Synthetic Oil Production (Thousand barrels per day)",
              "Synthetic Oil Production (Thousand barrels per day)",
              "Input the daily production volume of synthetic oil (e.g., from upgrading or processing), in thousand barrels per day (kbpd).",
              syntheticOilProduction,
              "kbpd",
              "syntheticOilProduction"
            )}

            {renderProductionField(
              "Synthetic Gas Production (Million standard cubic feet per day)",
              "Synthetic Gas Production (Million standard cubic feet per day)",
              "Provide the daily synthetic or processed gas output in MMscf/d for the reporting period.",
              syntheticGasProduction,
              "MMscf/day",
              "syntheticGasProduction"
            )}

            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents such as production reports, operational statements, or
                third-party verification of production volumes for the reporting period.
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
