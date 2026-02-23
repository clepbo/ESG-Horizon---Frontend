"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { uploadService } from "@/services/upload.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";

interface PublicPolicyEngagementFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function PublicPolicyEngagement({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: PublicPolicyEngagementFormProps) {
  const { state, dispatch } = useAssessment();
  const current =
    "leadershipGovernance.managementOfTheLegalAndRegulatoryEnvironment.publicPolicyEngagement";
  const { saveNow } = useAssessmentFlow(current);
  const [disclosesContributions, setDisclosesContributions] = useState("");
  const [policyPositions, setPolicyPositions] = useState("");
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData =
      state.assessmentData.leadershipGovernance
        ?.managementOfTheLegalAndRegulatoryEnvironment?.publicPolicyEngagement;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.disclosesContributions !== undefined) {
        setDisclosesContributions(existingData.disclosesContributions);
      }
      if (existingData.policyPositions !== undefined) {
        setPolicyPositions(existingData.policyPositions);
      }
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [
    state.assessmentData.leadershipGovernance
      ?.managementOfTheLegalAndRegulatoryEnvironment?.publicPolicyEngagement,
  ]);

  // Calculate progress
  const { filled, total } = useMemo(() => {
    const fields = [
      disclosesContributions !== "",
      policyPositions.trim() !== "",
      filesAndLinks.some((item) => item.name || item.link || item.file),
    ];
    const completed = fields.filter(Boolean).length;
    return { filled: completed, total: fields.length };
  }, [disclosesContributions, policyPositions, filesAndLinks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!disclosesContributions) {
      newErrors.disclosesContributions = "Please select an option";
    }

    if (!policyPositions.trim()) {
      newErrors.policyPositions = "Discussion of corporate positions is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
    if (errors.filesAndLinks && fields.length > 0) {
      setErrors((prev) => ({ ...prev, filesAndLinks: "" }));
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setShowSaveSuccess(false);

    const payload = {
      disclosesContributions,
      policyPositions,
      filesAndLinks: filesAndLinks.filter((item) => item.name || item.link || item.file),
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "managementOfTheLegalAndRegulatoryEnvironment",
          section: "publicPolicyEngagement",
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
      disclosesContributions,
      policyPositions,
      filesAndLinks: filesAndLinks.filter((item) => item.name || item.link || item.file),
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "managementOfTheLegalAndRegulatoryEnvironment",
          section: "publicPolicyEngagement",
          data: payload,
        },
      });
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to save progress");
    }
  };

  const handlePrevious = () => {
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />

      <div className="max-w-5xl mx-auto mt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Public Policy Engagement</h1>
          <p className="text-sm text-gray-600">
            Discuss your company&lsquo;s corporate positions on significant government regulations
            or policy proposals that address environmental and social factors affecting the oil and
            gas industry.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Question 1: Disclosure */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Does the company publicly disclose the monetary value of its lobbying/trade
                  association contributions?
                </label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Lobbying/Trade Association Contributions"
                      message="Select whether your company publicly discloses the monetary value of contributions made to lobbying activities and trade associations. This transparency is important for stakeholders to understand your political engagement."
                    />
                  }
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="disclosesContributions"
                    value="yes"
                    checked={disclosesContributions === "yes"}
                    onChange={(e) => {
                      setDisclosesContributions(e.target.value);
                      setErrors((prev) => ({ ...prev, disclosesContributions: "" }));
                    }}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="disclosesContributions"
                    value="no"
                    checked={disclosesContributions === "no"}
                    onChange={(e) => {
                      setDisclosesContributions(e.target.value);
                      setErrors((prev) => ({ ...prev, disclosesContributions: "" }));
                    }}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.disclosesContributions && (
                <p className="text-sm text-red-600 mt-2">{errors.disclosesContributions}</p>
              )}
            </div>

            {/* Question 2: Policy Positions */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-900">
                  Discussion of Corporate Positions on Policy and Regulation
                </label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Discussion of Corporate Positions on Policy and Regulation"
                      message="Provide a clear narrative on your company's stance and actions related to key legislation or policy. Identify the risks and opportunities associated with this regulatory environment. Discuss whether your stance aligns with or differs from major industry associations you are a part of, and why."
                    />
                  }
                />
              </div>

              <textarea
                placeholder="e.g., We actively supported the passage of the Petroleum Industry Act (PIA) 2021. Our engagement included providing input during the public consultation phase on the fiscal terms and host community development frameworks to ensure a stable and clear operating environment for long-term investment..."
                value={policyPositions}
                onChange={(e) => {
                  setPolicyPositions(e.target.value);
                  setErrors((prev) => ({ ...prev, policyPositions: "" }));
                }}
                rows={6}
                className={`w-full px-4 py-3 border ${errors.policyPositions ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
              />
              {errors.policyPositions && (
                <p className="text-sm text-red-600 mt-1">{errors.policyPositions}</p>
              )}
            </div>

            {/* Document/Evidence Upload */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600 mb-6">
                Upload publicly available submissions made during policy consultation phases, press
                releases or corporate statements on key legislation (like the PIA), and links to
                your corporate policy on government engagement or lobbying.
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
