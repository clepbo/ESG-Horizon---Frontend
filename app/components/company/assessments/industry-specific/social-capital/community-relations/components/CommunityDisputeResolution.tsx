import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
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
import { useAssessment } from "@/hooks/useAssessment";
import { useRouter } from "next/navigation";

interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function CommunityDisputeResolution({
  onBack,
  onDisclosureTopics,
  onNext,
  stepIndex,
  totalSteps,
}: Props) {
  const router = useRouter();
  const { state } = useAssessment();
  const { saveNow } = useAssessmentFlow("socialCapital.communityRelations.disputeResolution");

  const disputesReferred = useFormattedNumber("");
  const disputesResolved = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    disputesReferredUnit: "Dispute",
    disputesResolvedUnit: "Dispute",
  });

  // Pre-fill form from saved assessment data
  useEffect(() => {
    const existingData = state.assessmentData?.socialCapital?.communityRelations?.disputeResolution;
    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.disputesReferred != null) {
        disputesReferred.handleChange(String(existingData.disputesReferred));
      }
      if (existingData.disputesResolved != null) {
        disputesResolved.handleChange(String(existingData.disputesResolved));
      }
      setFormData((prev) => ({
        ...prev,
        disputesReferredUnit: existingData.disputesReferredUnit ?? prev.disputesReferredUnit,
        disputesResolvedUnit: existingData.disputesResolvedUnit ?? prev.disputesResolvedUnit,
      }));
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [state.assessmentData?.socialCapital?.communityRelations?.disputeResolution]);

  const features = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onDisclosureTopics },
    { label: "Community Relations", onClick: onBack },
    { label: "Community Dispute Resolution (NUPRC ADRC)" },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Calculate progress
  const progress = useMemo(() => {
    const hasDisputesReferred =
      disputesReferred.rawValue !== "" && formData.disputesReferredUnit !== "";
    const hasDisputesResolved =
      disputesResolved.rawValue !== "" && formData.disputesResolvedUnit !== "";

    const completed = [hasDisputesReferred, hasDisputesResolved].filter(Boolean).length;
    return completed;
  }, [
    disputesReferred.rawValue,
    disputesResolved.rawValue,
    formData.disputesReferredUnit,
    formData.disputesResolvedUnit,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!disputesReferred.rawValue) {
      newErrors.disputesReferred = "Number of disputes referred is required";
    }
    if (!formData.disputesReferredUnit) {
      newErrors.disputesReferredUnit = "Unit is required";
    }

    if (!disputesResolved.rawValue) {
      newErrors.disputesResolved = "Number of disputes resolved is required";
    }
    if (!formData.disputesResolvedUnit) {
      newErrors.disputesResolvedUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      disputesReferred: Number(disputesReferred.rawValue),
      disputesReferredUnit: formData.disputesReferredUnit,
      disputesResolved: Number(disputesResolved.rawValue),
      disputesResolvedUnit: formData.disputesResolvedUnit,
      filesAndLinks: filesAndLinks,
    };

    setIsActionLoading(true);

    try {
      await saveNow("socialCapital.communityRelations.disputeResolution", payload);
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 1000);
    } catch (_error) {
      console.error(_error);
      toast.error("Failed to save data");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      disputesReferred: Number(disputesReferred.rawValue),
      disputesReferredUnit: formData.disputesReferredUnit,
      disputesResolved: Number(disputesResolved.rawValue),
      disputesResolvedUnit: formData.disputesResolvedUnit,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow("socialCapital.communityRelations.disputeResolution", payload);
      toast.success("Progress saved!");
      onNext();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save data");
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
            <h3 className="text-2xl font-semibold">Community Dispute Resolution (NUPRC ADRC)</h3>
            <p className="text-muted-foreground text-base">
              Report the number of community disputes that were referred to and resolved through the
              NUPRC&apos;s Alternative Dispute Resolution Centre (ADRC).
            </p>
          </div>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={progress}
              totalFields={2}
              isSubmitted={false}
            />

            {/* Number of Disputes Referred to ADRC */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Number of Disputes Referred to ADRC
                </Label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Number of Disputes Referred to ADRC"
                      message="Enter the total count of distinct community-related disputes formally submitted to the NUPRC's ADRC for mediation."
                    />
                  }
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="disputesReferred">Count</Label>
                    <Input
                      id="disputesReferred"
                      type="text"
                      placeholder="e.g., 5"
                      value={disputesReferred.displayValue}
                      onChange={(e) => {
                        disputesReferred.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, disputesReferred: "" }));
                      }}
                      className={errors.disputesReferred ? "border-red-500" : ""}
                    />
                    {errors.disputesReferred && (
                      <p className="text-sm text-red-500">{errors.disputesReferred}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disputesReferredUnit">Unit</Label>
                    <Input
                      id="disputesReferredUnit"
                      type="text"
                      value={formData.disputesReferredUnit}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, disputesReferredUnit: e.target.value }));
                        setErrors((prev) => ({ ...prev, disputesReferredUnit: "" }));
                      }}
                      readOnly
                      className="bg-gray-50"
                    />
                    {errors.disputesReferredUnit && (
                      <p className="text-sm text-red-500">{errors.disputesReferredUnit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Number of Disputes Resolved via ADRC */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Number of Disputes Resolved via ADRC
                </Label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Number of Disputes Resolved via ADRC"
                      message="Enter the count of the referred disputes that were successfully resolved through the ADRC process during the reporting year."
                    />
                  }
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="disputesResolved">Count</Label>
                    <Input
                      id="disputesResolved"
                      type="text"
                      placeholder="e.g., 4"
                      value={disputesResolved.displayValue}
                      onChange={(e) => {
                        disputesResolved.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, disputesResolved: "" }));
                      }}
                      className={errors.disputesResolved ? "border-red-500" : ""}
                    />
                    {errors.disputesResolved && (
                      <p className="text-sm text-red-500">{errors.disputesResolved}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disputesResolvedUnit">Unit</Label>
                    <Input
                      id="disputesResolvedUnit"
                      type="text"
                      value={formData.disputesResolvedUnit}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, disputesResolvedUnit: e.target.value }));
                        setErrors((prev) => ({ ...prev, disputesResolvedUnit: "" }));
                      }}
                      readOnly
                      className="bg-gray-50"
                    />
                    {errors.disputesResolvedUnit && (
                      <p className="text-sm text-red-500">{errors.disputesResolvedUnit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload official correspondence from the NUPRC&apos;s ADRC, internal legal reports on
                community disputes, and any settlement agreements reached through the ADRC process.
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
    </section>
  );
}
