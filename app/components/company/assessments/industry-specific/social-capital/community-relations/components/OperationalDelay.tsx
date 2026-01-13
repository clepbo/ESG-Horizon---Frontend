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

import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { toast } from "react-toastify";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";

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

  const numberOfDelaysCommunityProtests = useFormattedNumber("");
  const durationDelaysCommunityProtests = useFormattedNumber("");
  const numberOfDelaysOtherStakeholder = useFormattedNumber("");
  const durationDelaysOtherIssues = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, _setFormData] = useState({
    numberOfDelaysCommunityProtestsUnit: "Delays",
    durationDelaysCommunityProtestsUnit: "Days",
    numberOfDelaysOtherStakeholderUnit: "Delays",
    durationDelaysOtherIssuesUnit: "Days",
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
    const hasNumberOfDelaysCommunity =
      numberOfDelaysCommunityProtests.rawValue !== "" &&
      formData.numberOfDelaysCommunityProtestsUnit !== "";
    const hasDurationDelaysCommunity =
      durationDelaysCommunityProtests.rawValue !== "" &&
      formData.durationDelaysCommunityProtestsUnit !== "";
    const hasNumberOfDelaysOther =
      numberOfDelaysOtherStakeholder.rawValue !== "" &&
      formData.numberOfDelaysOtherStakeholderUnit !== "";
    const hasDurationDelaysOther =
      durationDelaysOtherIssues.rawValue !== "" && formData.durationDelaysOtherIssuesUnit !== "";

    const completed = [
      hasNumberOfDelaysCommunity,
      hasDurationDelaysCommunity,
      hasNumberOfDelaysOther,
      hasDurationDelaysOther,
    ].filter(Boolean).length;
    return completed;
  }, [
    numberOfDelaysCommunityProtests.rawValue,
    formData.numberOfDelaysCommunityProtestsUnit,
    durationDelaysCommunityProtests.rawValue,
    formData.durationDelaysCommunityProtestsUnit,
    numberOfDelaysOtherStakeholder.rawValue,
    formData.numberOfDelaysOtherStakeholderUnit,
    durationDelaysOtherIssues.rawValue,
    formData.durationDelaysOtherIssuesUnit,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!numberOfDelaysCommunityProtests.rawValue) {
      newErrors.numberOfDelaysCommunityProtests = "Count is required";
    }
    if (!durationDelaysCommunityProtests.rawValue) {
      newErrors.durationDelaysCommunityProtests = "Duration is required";
    }
    if (!numberOfDelaysOtherStakeholder.rawValue) {
      newErrors.numberOfDelaysOtherStakeholder = "Count is required";
    }
    if (!durationDelaysOtherIssues.rawValue) {
      newErrors.durationDelaysOtherIssues = "Duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      numberOfDelaysCommunityProtests: Number(numberOfDelaysCommunityProtests.rawValue),
      numberOfDelaysCommunityProtestsUnit: formData.numberOfDelaysCommunityProtestsUnit,
      durationDelaysCommunityProtests: Number(durationDelaysCommunityProtests.rawValue),
      durationDelaysCommunityProtestsUnit: formData.durationDelaysCommunityProtestsUnit,
      numberOfDelaysOtherStakeholder: Number(numberOfDelaysOtherStakeholder.rawValue),
      numberOfDelaysOtherStakeholderUnit: formData.numberOfDelaysOtherStakeholderUnit,
      durationDelaysOtherIssues: Number(durationDelaysOtherIssues.rawValue),
      durationDelaysOtherIssuesUnit: formData.durationDelaysOtherIssuesUnit,
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
    } catch (_error:any) {

      toast.error("Failed to save data", _error.message);
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
      numberOfDelaysCommunityProtests: Number(numberOfDelaysCommunityProtests.rawValue),
      numberOfDelaysCommunityProtestsUnit: formData.numberOfDelaysCommunityProtestsUnit,
      durationDelaysCommunityProtests: Number(durationDelaysCommunityProtests.rawValue),
      durationDelaysCommunityProtestsUnit: formData.durationDelaysCommunityProtestsUnit,
      numberOfDelaysOtherStakeholder: Number(numberOfDelaysOtherStakeholder.rawValue),
      numberOfDelaysOtherStakeholderUnit: formData.numberOfDelaysOtherStakeholderUnit,
      durationDelaysOtherIssues: Number(durationDelaysOtherIssues.rawValue),
      durationDelaysOtherIssuesUnit: formData.durationDelaysOtherIssuesUnit,
      filesAndLinks: filesAndLinks,
    };

    setIsActionLoading(true);

    try {
      await saveNow("socialCapital.communityRelations.operationalDelays", payload);
      await submitGroup();
      toast.success("Assessment completed successfully!");
      onNext();
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
              Report the total number and duration of site shutdowns or project delays caused by
              non-technical factors, such as community protests or stakeholder resistance, during
              the reporting year.
            </p>
          </div>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={progress}
              totalFields={4}
              isSubmitted={false}
            />

            {/* Number of Delays (Community Protests) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Number of Delays (Community Protests)
                </Label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Number of Delays (Community Protests)"
                      message="Enter how many operational delays were caused by community protests within the reporting period. A delay refers to any interruption, slowdown, shutdown, or restricted access triggered directly by community action."
                    />
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-lg p-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfDelaysCommunityProtests" className="text-sm font-medium">
                    Count
                  </Label>
                  <Input
                    id="numberOfDelaysCommunityProtests"
                    type="text"
                    placeholder="e.g., 10"
                    value={numberOfDelaysCommunityProtests.displayValue}
                    onChange={(e) => {
                      numberOfDelaysCommunityProtests.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, numberOfDelaysCommunityProtests: "" }));
                    }}
                    className={errors.numberOfDelaysCommunityProtests ? "border-red-500" : ""}
                  />
                  {errors.numberOfDelaysCommunityProtests && (
                    <p className="text-sm text-red-500">{errors.numberOfDelaysCommunityProtests}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="numberOfDelaysCommunityProtestsUnit"
                    className="text-sm font-medium"
                  >
                    Unit
                  </Label>
                  <Input
                    id="numberOfDelaysCommunityProtestsUnit"
                    type="text"
                    value={formData.numberOfDelaysCommunityProtestsUnit}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Duration of Delays (Community Protests, in days) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Duration of Delays (Community Protests, in days)
                </Label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Duration of Delays (Community Protests)"
                      message="Report the total number of days operations were delayed due to community protests. If multiple events occurred, provide the combined duration in days (e.g., 3 delays totaling 12 days)."
                    />
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-lg p-4">
                <div className="space-y-2">
                  <Label htmlFor="durationDelaysCommunityProtests" className="text-sm font-medium">
                    Count
                  </Label>
                  <Input
                    id="durationDelaysCommunityProtests"
                    type="text"
                    placeholder="e.g., 75"
                    value={durationDelaysCommunityProtests.displayValue}
                    onChange={(e) => {
                      durationDelaysCommunityProtests.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, durationDelaysCommunityProtests: "" }));
                    }}
                    className={errors.durationDelaysCommunityProtests ? "border-red-500" : ""}
                  />
                  {errors.durationDelaysCommunityProtests && (
                    <p className="text-sm text-red-500">{errors.durationDelaysCommunityProtests}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="durationDelaysCommunityProtestsUnit"
                    className="text-sm font-medium"
                  >
                    Unit
                  </Label>
                  <Input
                    id="durationDelaysCommunityProtestsUnit"
                    type="text"
                    value={formData.durationDelaysCommunityProtestsUnit}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Number of Delays (Other Stakeholder/Political Issues) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Number of Delays (Other Stakeholder/Political Issues)
                </Label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Number of Delays (Other Stakeholder/Political Issues)"
                      message="Disclose the number of operational delays caused by non-technical issues such as government restrictions, land-access conflicts, regulatory actions, or disputes with other local stakeholders."
                    />
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-lg p-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfDelaysOtherStakeholder" className="text-sm font-medium">
                    Count
                  </Label>
                  <Input
                    id="numberOfDelaysOtherStakeholder"
                    type="text"
                    placeholder="e.g., 2"
                    value={numberOfDelaysOtherStakeholder.displayValue}
                    onChange={(e) => {
                      numberOfDelaysOtherStakeholder.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, numberOfDelaysOtherStakeholder: "" }));
                    }}
                    className={errors.numberOfDelaysOtherStakeholder ? "border-red-500" : ""}
                  />
                  {errors.numberOfDelaysOtherStakeholder && (
                    <p className="text-sm text-red-500">{errors.numberOfDelaysOtherStakeholder}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="numberOfDelaysOtherStakeholderUnit"
                    className="text-sm font-medium"
                  >
                    Unit
                  </Label>
                  <Input
                    id="numberOfDelaysOtherStakeholderUnit"
                    type="text"
                    value={formData.numberOfDelaysOtherStakeholderUnit}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Duration of Delays (Other Issues, in days) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Duration of Delays (Other Issues, in days)
                </Label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Duration of Delays (Other Issues)"
                      message="Enter the total number of days operations could not proceed due to stakeholder or political issues. Combine all relevant events in the reporting year into one total duration."
                    />
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-lg p-4">
                <div className="space-y-2">
                  <Label htmlFor="durationDelaysOtherIssues" className="text-sm font-medium">
                    Count
                  </Label>
                  <Input
                    id="durationDelaysOtherIssues"
                    type="text"
                    placeholder="e.g., 10"
                    value={durationDelaysOtherIssues.displayValue}
                    onChange={(e) => {
                      durationDelaysOtherIssues.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, durationDelaysOtherIssues: "" }));
                    }}
                    className={errors.durationDelaysOtherIssues ? "border-red-500" : ""}
                  />
                  {errors.durationDelaysOtherIssues && (
                    <p className="text-sm text-red-500">{errors.durationDelaysOtherIssues}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDelaysOtherIssuesUnit" className="text-sm font-medium">
                    Unit
                  </Label>
                  <Input
                    id="durationDelaysOtherIssuesUnit"
                    type="text"
                    value={formData.durationDelaysOtherIssuesUnit}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like daily operational reports detailing shutdowns,
                incident reports on community disruptions, and production deferment records.
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
                className="justify-self-end border border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2 cursor-pointer"
              >
                {isActionLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>Submit</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
