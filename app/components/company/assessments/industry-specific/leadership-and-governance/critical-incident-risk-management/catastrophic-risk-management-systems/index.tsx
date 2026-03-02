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

interface CatastrophicRiskManagementProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
  onSubmit: (totals: TotalsResponse | null) => void;
}

export default function CatastrophicRiskManagement({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: CatastrophicRiskManagementProps) {
  const { state, dispatch } = useAssessment();
  const current =
    "leadershipGovernance.criticalIncidentRiskManagement.catastrophicRiskManagementSystems";
  const { saveNow, isPreviouslySubmitted, getSubmitLabel } = useAssessmentFlow(current);
  const hasExistingData = !!state.assessmentData.leadershipGovernance?.criticalIncidentRiskManagement?.catastrophicRiskManagementSystems;
  const [auditDate, setAuditDate] = useState("");
  const [systemDescription, setSystemDescription] = useState("");
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
      state.assessmentData.leadershipGovernance?.criticalIncidentRiskManagement
        ?.catastrophicRiskManagementSystems;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.auditDate !== undefined) {
        setAuditDate(existingData.auditDate);
      }
      if (existingData.systemDescription !== undefined) {
        setSystemDescription(existingData.systemDescription);
      }
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [
    state.assessmentData.leadershipGovernance?.criticalIncidentRiskManagement
      ?.catastrophicRiskManagementSystems,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!auditDate) {
      newErrors.auditDate = "Audit date is required";
    }

    if (!systemDescription.trim()) {
      newErrors.systemDescription = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasAuditDate = auditDate !== "";
    const hasDescription = systemDescription.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasAuditDate, hasDescription, hasEvidence]);
  }, [auditDate, systemDescription, filesAndLinks]);

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setShowSaveSuccess(false);

    const payload = {
      auditDate,
      systemDescription,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "criticalIncidentRiskManagement",
          section: "catastrophicRiskManagementSystems",
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
      auditDate,
      systemDescription,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "criticalIncidentRiskManagement",
          section: "catastrophicRiskManagementSystems",
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
            Catastrophic Risk Management Systems
          </h1>
          <p className="text-sm text-gray-600">
            Describe the management systems your organization uses to identify, mitigate, and manage
            catastrophic and tail-end risks (low-probability, high-impact events).
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

            {/* Date of Audit */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium text-gray-900">
                  Date of the most recent external Asset Integrity Audit.
                </Label>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={auditDate}
                  onChange={(e) => {
                    setAuditDate(e.target.value);
                    setErrors((prev) => ({ ...prev, auditDate: "" }));
                  }}
                  className={`w-full px-4 py-2 border ${errors.auditDate ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              {errors.auditDate && <p className="text-sm text-red-600 mt-1">{errors.auditDate}</p>}
            </div>

            {/* Description */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium text-gray-900">
                  Description of Catastrophic Risk Management Systems
                </Label>
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Description of Catastrophic Risk Management Systems"
                      message="Provide a brief description of your company’s systems and processes for identifying, assessing, and managing catastrophic risks. Include key elements such as risk assessment tools, emergency response plans, governance structures, and monitoring mechanisms."
                    />
                  }
                />
              </div>

              <Textarea
                value={systemDescription}
                onChange={(e) => {
                  setSystemDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, systemDescription: "" }));
                }}
                placeholder="e.g., Our Safety Case methodology for offshore assets identifies and mitigates major accident hazards (MAHs). For onshore assets, we conduct regular pipeline integrity checks and security audits to mitigate risks from sabotage and theft..."
                className={`min-h-37.5 resize-none w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.systemDescription ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.systemDescription && (
                <p className="text-sm text-red-600 mt-1">{errors.systemDescription}</p>
              )}
            </div>

            {/* Document/Evidence Upload */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600 mb-6">
                Upload key documents such as the Safety Case for your offshore assets, your Pipeline
                Integrity Management Program documentation, and onshore security risk assessment
                reports.
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
                disabled={isSaving || isPreviouslySubmitted}
                className="border-primary text-primary bg-transparent hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getSubmitLabel(hasExistingData)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
