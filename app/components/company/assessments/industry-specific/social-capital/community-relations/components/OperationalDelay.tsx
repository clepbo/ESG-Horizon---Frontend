"use client";

import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { toast } from "react-toastify";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function OperationalDelay({
  onBack,
  onDisclosureTopics,
  onNext,
  stepIndex,
  totalSteps,
}: Props) {
  const router = useRouter();
  const { saveNow, submitGroup } = useAssessmentFlow(
    "socialCapital.communityRelations.operationalDelays"
  );

  const delayDays = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    delayDaysUnit: "Days",
  });

  const features = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onDisclosureTopics },
    { label: "Community Relations", onClick: onBack },
    { label: "Operational Delays (Non-Technical)" },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Calculate progress
  const progress = useMemo(() => {
    const hasDelayDays = delayDays.rawValue !== "" && formData.delayDaysUnit !== "";
    const completed = [hasDelayDays].filter(Boolean).length;
    return completed;
  }, [delayDays.rawValue, formData.delayDaysUnit]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!delayDays.rawValue) {
      newErrors.delayDays = "Number of delay days is required";
    }
    if (!formData.delayDaysUnit) {
      newErrors.delayDaysUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      delayDays: Number(delayDays.rawValue),
      delayDaysUnit: formData.delayDaysUnit,
      filesAndLinks: filesAndLinks,
    };

    setIsActionLoading(true);

    try {
      await saveNow("socialCapital.communityRelations.operationalDelays", payload);
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 1000);
    } catch (_error) {
      toast.error("Failed to save data");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const payload = {
      delayDays: Number(delayDays.rawValue),
      delayDaysUnit: formData.delayDaysUnit,
      filesAndLinks: filesAndLinks,
    };

    setIsActionLoading(true);

    try {
      await saveNow("socialCapital.communityRelations.operationalDelays", payload);
      await submitGroup();
      toast.success("Assessment completed successfully!");
      onNext(); // This triggers the success screen
    } catch (_error) {
      toast.error("Failed to submit assessment");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePrevious = () => {
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  return (
    <section className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={features} />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Operational Delays (Non-Technical)</h3>
            <p className="text-muted-foreground text-base">
              Report the quantitative impact of non-technical, community-related disruptions on your
              operations during the reporting period.
            </p>
          </div>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={progress}
              totalFields={1}
              isSubmitted={false}
            />

            {/* Number of Delay Days */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Number of Operational Delay Days (Non-Technical)
                </Label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Operational Delay Days"
                      message="Enter the total number of days that operations were delayed or disrupted due to non-technical, community-related issues such as protests, access restrictions, or unresolved disputes."
                    />
                  }
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delayDays">Count</Label>
                    <Input
                      id="delayDays"
                      type="text"
                      placeholder="e.g., 15"
                      value={delayDays.displayValue}
                      onChange={(e) => {
                        delayDays.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, delayDays: "" }));
                      }}
                      className={errors.delayDays ? "border-red-500" : ""}
                    />
                    {errors.delayDays && <p className="text-sm text-red-500">{errors.delayDays}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delayDaysUnit">Unit</Label>
                    <Input
                      id="delayDaysUnit"
                      type="text"
                      value={formData.delayDaysUnit}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, delayDaysUnit: e.target.value }));
                        setErrors((prev) => ({ ...prev, delayDaysUnit: "" }));
                      }}
                      readOnly
                      className="bg-gray-50"
                    />
                    {errors.delayDaysUnit && (
                      <p className="text-sm text-red-500">{errors.delayDaysUnit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload operational reports showing downtime or delays, incident logs detailing
                community-related disruptions, and correspondence with community representatives or
                government authorities.
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
                onClick={handleSubmit}
                disabled={isActionLoading}
                className="justify-self-end bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                {isActionLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
