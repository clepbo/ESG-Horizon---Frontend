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
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface OffshoreSitesProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export function OffshoreSites({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: OffshoreSitesProps) {
  const router = useRouter();
  const { saveNow } = useAssessmentFlow("activityMetrics.assetPortfolio.offshoreSites");

  const productionPlatforms = useFormattedNumber("");
  const fpsos = useFormattedNumber("");
  const otherOffshoreSites = useFormattedNumber("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!productionPlatforms.rawValue) {
      newErrors.productionPlatforms = "Number is required";
    }
    if (!fpsos.rawValue) {
      newErrors.fpsos = "Number is required";
    }
    if (!otherOffshoreSites.rawValue) {
      newErrors.otherOffshoreSites = "Number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasProductionPlatforms = productionPlatforms.rawValue !== "";
    const hasFpsos = fpsos.rawValue !== "";
    const hasOtherSites = otherOffshoreSites.rawValue !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasProductionPlatforms,
      hasFpsos,
      hasOtherSites,
      hasEvidence,
    ]);
  }, [
    productionPlatforms.rawValue,
    fpsos.rawValue,
    otherOffshoreSites.rawValue,
    filesAndLinks,
  ]);

  const getPayload = () => {
    const platforms = Number(productionPlatforms.rawValue) || 0;
    const fpsosCount = Number(fpsos.rawValue) || 0;
    const other = Number(otherOffshoreSites.rawValue) || 0;
    return {
      productionPlatforms: platforms,
      FPSOs: fpsosCount,
      otherSites: other,
      totalNumber: platforms + fpsosCount + other,
      filesAndLinks,
    };
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    const payload = getPayload();

    try {
      await saveNow("activityMetrics.assetPortfolio.offshoreSites", payload);
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

    const payload = getPayload();

    try {
      await saveNow("activityMetrics.assetPortfolio.offshoreSites", payload);
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

  const renderCountField = (
    label: string,
    tooltipTitle: string,
    tooltipContent: string,
    value: ReturnType<typeof useFormattedNumber>,
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
            value={value.displayValue}
            onChange={(e) => {
              value.handleChange(e.target.value);
              setErrors((prev) => ({ ...prev, [errorKey]: "" }));
            }}
            placeholder="Enter number"
            className="border-gray-300"
          />
          {errors[errorKey] && (
            <p className="text-red-600 text-xs">{errors[errorKey]}</p>
          )}
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
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Offshore Sites</h3>
            <p className="text-muted-foreground text-base">
              Report the total number of distinct operational offshore sites at
              the end of the reporting year. Use the sub-metric fields below to
              provide a breakdown.
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
              "Number of Production Platforms",
              "Number of Production Platforms",
              "Enter the total number of fixed or mobile offshore production platforms operated during the reporting period.",
              productionPlatforms,
              "Platforms",
              "productionPlatforms"
            )}

            {renderCountField(
              "Number of FPSOs (Floating Production Storage and Offloading)",
              "Number of FPSOs",
              "Specify the number of FPSO units used for offshore production, storage, and offloading.",
              fpsos,
              "FPSOs",
              "fpsos"
            )}

            {renderCountField(
              "Number of Other Offshore Sites (e.g., FSOs, Drilling Rigs)",
              "Number of Other Offshore Sites",
              "Include all other offshore assets such as FSOs, drillships, jack-up rigs, and floating units not captured under FPSOs or platforms.",
              otherOffshoreSites,
              "Sites",
              "otherOffshoreSites"
            )}

            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                Document/Evidence Upload
              </h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents such as asset registers, operational
                site lists, or third-party verification of offshore site counts
                for the reporting period.
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
