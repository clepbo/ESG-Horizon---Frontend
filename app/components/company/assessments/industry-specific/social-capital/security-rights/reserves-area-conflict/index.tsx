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
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { UnitSelect } from "../../../../UnitSelect";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface ReservesAreaConflictProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function ReservesAreaConflict({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ReservesAreaConflictProps) {
  const router = useRouter();
  const { saveNow } = useAssessmentFlow("socialCapital.securityRights.reservesAreaConflict");

  const totalProvedReservesVolume = useFormattedNumber("");
  const totalProbableReservesVolume = useFormattedNumber("");
  const provedReservesInConflictVolume = useFormattedNumber("");
  const probableReservesInConflictVolume = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    totalProvedReservesUnit: "",
    totalProbableReservesUnit: "",
    provedReservesInConflictUnit: "",
    probableReservesInConflictUnit: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalProvedReservesVolume.rawValue)
      newErrors.totalProvedReservesVolume = "Volume is required";
    if (!formData.totalProvedReservesUnit)
      newErrors.totalProvedReservesUnit = "Unit is required";

    if (!totalProbableReservesVolume.rawValue)
      newErrors.totalProbableReservesVolume = "Volume is required";
    if (!formData.totalProbableReservesUnit)
      newErrors.totalProbableReservesUnit = "Unit is required";

    if (!provedReservesInConflictVolume.rawValue)
      newErrors.provedReservesInConflictVolume = "Volume is required";
    if (!formData.provedReservesInConflictUnit)
      newErrors.provedReservesInConflictUnit = "Unit is required";

    if (!probableReservesInConflictVolume.rawValue)
      newErrors.probableReservesInConflictVolume = "Volume is required";
    if (!formData.probableReservesInConflictUnit)
      newErrors.probableReservesInConflictUnit = "Unit is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    return calculateProgress([
      totalProvedReservesVolume.rawValue && formData.totalProvedReservesUnit,
      totalProbableReservesVolume.rawValue && formData.totalProbableReservesUnit,
      provedReservesInConflictVolume.rawValue && formData.provedReservesInConflictUnit,
      probableReservesInConflictVolume.rawValue && formData.probableReservesInConflictUnit,
      filesAndLinks.length > 0,
    ]);
  }, [
    totalProvedReservesVolume.rawValue,
    totalProbableReservesVolume.rawValue,
    provedReservesInConflictVolume.rawValue,
    probableReservesInConflictVolume.rawValue,
    formData,
    filesAndLinks,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    totalProvedReservesVolume: Number(totalProvedReservesVolume.rawValue),
    totalProvedReservesUnit: formData.totalProvedReservesUnit,

    totalProbableReservesVolume: Number(totalProbableReservesVolume.rawValue),
    totalProbableReservesUnit: formData.totalProbableReservesUnit,

    provedReservesInConflictVolume: Number(provedReservesInConflictVolume.rawValue),
    provedReservesInConflictUnit: formData.provedReservesInConflictUnit,

    probableReservesInConflictVolume: Number(probableReservesInConflictVolume.rawValue),
    probableReservesInConflictUnit: formData.probableReservesInConflictUnit,

    filesAndLinks,
  });

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      await saveNow("socialCapital.securityRights.reservesAreaConflict", buildPayload());
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => router.push("/assessments/new-assessment"), 1000);
    } catch {
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

    try {
      await saveNow("socialCapital.securityRights.reservesAreaConflict", buildPayload());
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to save data");
    }
  };

  const renderInputCard = (
    label: string,
    tooltip: string,
    volumeHook: ReturnType<typeof useFormattedNumber>,
    unitField: string,
    volumeErrorKey: string,
    unitErrorKey: string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-base font-semibold text-gray-900">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Volume</Label>
          <Input
            type="text"
            value={volumeHook.displayValue}
            onChange={(e) => {
              volumeHook.handleChange(e.target.value);
              setErrors((prev) => ({ ...prev, [volumeErrorKey]: "" }));
            }}
            placeholder="Enter volume"
            className="border-gray-300"
          />
          {errors[volumeErrorKey] && (
            <p className="text-red-600 text-xs">{errors[volumeErrorKey]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Unit</Label>
          <UnitSelect
            value={(formData as any)[unitField]}
            onValueChange={(value) => {
              handleInputChange(unitField, value);
              setErrors((prev) => ({ ...prev, [unitErrorKey]: "" }));
            }}
            error={errors[unitErrorKey]}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />

      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {renderInputCard(
              "Total Proved Reserves",
              "Total quantity of reserves proven by geological and engineering data to be commercially recoverable.",
              totalProvedReservesVolume,
              "totalProvedReservesUnit",
              "totalProvedReservesVolume",
              "totalProvedReservesUnit"
            )}

            {renderInputCard(
              "Total Probable Reserves by Volume",
              "Total Probable Reserves (by volume, e.g., MMbbls)",
              totalProbableReservesVolume,
              "totalProbableReservesUnit",
              "totalProbableReservesVolume",
              "totalProbableReservesUnit"
            )}

            {renderInputCard(
              "Proved Reserves in Conflict Areas",
              "Portion of proved reserves located in conflict-affected or high-risk geopolitical regions.",
              provedReservesInConflictVolume,
              "provedReservesInConflictUnit",
              "provedReservesInConflictVolume",
              "provedReservesInConflictUnit"
            )}

            {renderInputCard(
              "Probable Reserves in Conflict Areas",
              "Estimated probable reserves located in regions affected by conflict, indicating elevated operational and human rights risk.",
              probableReservesInConflictVolume,
              "probableReservesInConflictUnit",
              "probableReservesInConflictVolume",
              "probableReservesInConflictUnit"
            )}

            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold">Document / Evidence Upload</h3>
              <AddMoreFilesLinks
                onFieldsChange={setFilesAndLinks}
                initialData={filesAndLinks}
                uploadService={uploadService}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button variant="outline" onClick={onBack} className="justify-self-start">
                <ArrowLeft className="h-4 w-4" /> Go Back
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-primary text-white"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save & Continue Later
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={handleNext} className="justify-self-end">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}