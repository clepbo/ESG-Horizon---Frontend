"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { TotalsResponse } from "@/services/assessment.service";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";

interface BoardManagementOversightProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
  onSubmit: (totals: TotalsResponse | null) => void;
}

export default function BoardManagementOversight({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: BoardManagementOversightProps) {
  const { state, dispatch } = useAssessment();
  const current =
    "leadershipGovernance.managementOfTheLegalAndRegulatoryEnvironment.boardAndManagementOversight";
  const { saveNow } = useAssessmentFlow(current);
  const [hasBoardCommittee, setHasBoardCommittee] = useState("");
  const [oversightDiscussion, setOversightDiscussion] = useState("");
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.leadershipGovernance
        ?.managementOfTheLegalAndRegulatoryEnvironment?.boardAndManagementOversight;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.hasBoardCommittee !== undefined) {
        setHasBoardCommittee(existingData.hasBoardCommittee);
      }
      if (existingData.oversightDiscussion !== undefined) {
        setOversightDiscussion(existingData.oversightDiscussion);
      }
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [
    state.assessmentData.environment?.leadershipGovernance
      ?.managementOfTheLegalAndRegulatoryEnvironment?.boardAndManagementOversight,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!hasBoardCommittee) {
      newErrors.hasBoardCommittee = "Please select an option";
    }

    if (!oversightDiscussion.trim()) {
      newErrors.oversightDiscussion = "Discussion of board oversight is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasCommittee = hasBoardCommittee !== "";
    const hasDiscussion = oversightDiscussion.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasCommittee, hasDiscussion, hasEvidence]);
  }, [hasBoardCommittee, oversightDiscussion, filesAndLinks]);

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setShowSaveSuccess(false);

    const payload = {
      hasBoardCommittee,
      oversightDiscussion,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "managementOfTheLegalAndRegulatoryEnvironment",
          section: "boardAndManagementOversight",
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const payload = {
      hasBoardCommittee,
      oversightDiscussion,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "managementOfTheLegalAndRegulatoryEnvironment",
          section: "boardAndManagementOversight",
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

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
    if (errors.filesAndLinks && fields.length > 0) {
      setErrors((prev) => ({ ...prev, filesAndLinks: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />

      <div className="max-w-5xl mx-auto mt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Board & Management Oversight of Sustainability
          </h1>
          <p className="text-sm text-gray-600">
            Discuss the board&apos;s oversight structure and management&apos;s role in assessing and
            managing sustainability-related risks and opportunities. Specifically describe the
            process for identifying material issues and integrating Nigerian regulatory requirements
            (e.g., from NUPRC, NGX).
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

            {/* Board Committee Question */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Label className="text-sm font-medium text-gray-900">
                  Does the company have a Board-level committee dedicated specifically to
                  Sustainability/ESG oversight?
                </Label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Board-level Sustainability Committee"
                      message="Indicate whether your company has established a dedicated Board-level committee (e.g., Sustainability Committee, ESG Committee) that specifically oversees environmental, social, and governance matters."
                    />
                  }
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasBoardCommittee"
                    value="yes"
                    checked={hasBoardCommittee === "yes"}
                    onChange={(e) => {
                      setHasBoardCommittee(e.target.value);
                      setErrors((prev) => ({ ...prev, hasBoardCommittee: "" }));
                    }}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasBoardCommittee"
                    value="no"
                    checked={hasBoardCommittee === "no"}
                    onChange={(e) => {
                      setHasBoardCommittee(e.target.value);
                      setErrors((prev) => ({ ...prev, hasBoardCommittee: "" }));
                    }}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {errors.hasBoardCommittee && (
                <p className="text-sm text-red-600 mt-2">{errors.hasBoardCommittee}</p>
              )}
            </div>

            {/* Discussion of Board Oversight */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium text-gray-900">
                  Discussion of Board Oversight and Management&apos;s Role
                </Label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Discussion of Board Oversight and Management's Role"
                      message="Provide a clear narrative describing: 1. The specific board committee responsible for sustainability. 2. Management's role in day-to-day ESG management. 3. The process for identifying which sustainability issues are material to your business, with specific mention of how local requirements like the NUPRC's Environmental Risk Register (ERR) and NGX reporting rules are incorporated."
                    />
                  }
                />
              </div>

              <Textarea
                value={oversightDiscussion}
                onChange={(e) => {
                  setOversightDiscussion(e.target.value);
                  setErrors((prev) => ({ ...prev, oversightDiscussion: "" }));
                }}
                placeholder="e.g., The Board's Sustainability Committee oversees our ESG strategy, including the annual review of the NUPRC-mandated Environmental Risk Register (ERR) to quantify and disclose associated financial risks in our IFRS S1 report..."
                className={`min-h-37.5 resize-none w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.oversightDiscussion ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.oversightDiscussion && (
                <p className="text-sm text-red-600 mt-1">{errors.oversightDiscussion}</p>
              )}
            </div>

            {/* Document/Evidence Upload */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600 mb-6">
                Upload your Board Committee&apos;s Terms of Reference, minutes from meetings showing
                the review of the Environmental Risk Register (ERR), and the report from your
                Materiality Assessment Process that links ERR items to your financial statements.
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

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="border-primary text-primary bg-transparent hover:bg-green-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white"
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
                onClick={handleSubmit}
                disabled={isSaving}
                className="border-primary text-primary bg-transparent hover:bg-green-50"
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
