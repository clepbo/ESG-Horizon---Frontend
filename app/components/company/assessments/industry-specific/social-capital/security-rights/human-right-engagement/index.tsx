"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, CheckCircle2, Info, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { TotalsResponse } from "@/services/assessment.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useAssessment } from "@/hooks/useAssessment";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";

interface HumanRightEngagementProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: string;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
  onSubmit: (totals: TotalsResponse | null) => void;
}

export default function HumanRightEngagement({
  onBack,
  // onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
  onSubmit,
}: HumanRightEngagementProps) {
  const router = useRouter();
  const { state } = useAssessment();
  const { saveNow, submitGroup, isPreviouslySubmitted, getSubmitLabel } = useAssessmentFlow(
    "socialCapital.securityRights.humanRightEngagement"
  );
  const hasExistingData = !!state.assessmentData.socialCapital?.securityRights?.humanRightEngagement;

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    hasGrievanceMechanism: "",
    engagementDescription: "",
  });

  // Pre-fill form from saved assessment data
  useEffect(() => {
    const existingData = state.assessmentData?.socialCapital?.securityRights?.humanRightEngagement;
    if (existingData && Object.keys(existingData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        hasGrievanceMechanism: existingData.hasGrievanceMechanism ?? prev.hasGrievanceMechanism,
        engagementDescription: existingData.engagementDescription ?? prev.engagementDescription,
      }));
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [state.assessmentData?.socialCapital?.securityRights?.humanRightEngagement]);

  const { filled, total } = useMemo(() => {
    const hasGrievanceMechanism = formData.hasGrievanceMechanism !== "";
    const hasDescription = formData.engagementDescription.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasGrievanceMechanism, hasDescription, hasEvidence]);
  }, [formData.hasGrievanceMechanism, formData.engagementDescription, filesAndLinks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.hasGrievanceMechanism) {
      newErrors.hasGrievanceMechanism = "Please select an option.";
    }
    if (!formData.engagementDescription.trim()) {
      newErrors.engagementDescription = "Description is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "engagementDescription") {
      setErrors((prev) => ({ ...prev, engagementDescription: "" }));
    }
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);

    const payload = {
      hasGrievanceMechanism: formData.hasGrievanceMechanism,
      engagementDescription: formData.engagementDescription,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow("socialCapital.securityRights.humanRightEngagement", payload);
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 1000);
    } catch (_error: any) {
      console.error(_error);
      toast.error("Failed to save data", _error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setIsSaving(true);

    const payload = {
      hasGrievanceMechanism: formData.hasGrievanceMechanism,
      engagementDescription: formData.engagementDescription,
      filesAndLinks: filesAndLinks,
    };

    try {
      // Save data first
      await saveNow("socialCapital.securityRights.humanRightEngagement", payload);
      // Then submit the group
      await submitGroup();
      toast.success("Assessment completed successfully!");
      onSubmit(null);
    } catch (_error: any) {
      toast.error("Failed to submit assessment", _error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold"> Human Rights Engagement Processes</h3>
            <p className="text-muted-foreground text-base">
              Describe your organization&apos;s engagement processes and due diligence practices
              concerning human rights, indigenous rights, and operating in areas of conflict.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Third-Party Grievance Mechanism Radio Button */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <Label className="text-base font-semibold text-gray-900">
                Is there a formal Third-Party Grievance Mechanism available to host communities?
              </Label>
              <RadioGroup
                value={formData.hasGrievanceMechanism}
                onValueChange={(value) => handleInputChange("hasGrievanceMechanism", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {errors.hasGrievanceMechanism && (
                <p className="text-red-600 text-sm mt-2">{errors.hasGrievanceMechanism}</p>
              )}
            </div>

            {/* Description of Engagement and Due Diligence Practices */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Description of Engagement and Due Diligence Practices
                </Label>
                <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-help">
                  <span className="text-xs text-gray-600">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <p>
                          Provide details on how your company engages with local communities,
                          indigenous groups, and other stakeholders in areas where operations may
                          pose social or environmental risks. Describe consultation processes,
                          impact assessments, grievance mechanisms, and any steps taken to prevent,
                          detect, or respond to human rights concerns. This helps demonstrate
                          responsible operation and compliance with international standards.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <Textarea
                  placeholder="e.g., We adhere to the Voluntary Principles on Security and Human Rights for managing security forces. Community engagement is governed by Global Memorandum of Understanding (GMoU) frameworks and PIA-mandated Host Community Development Trusts (HCDTs)..."
                  value={formData.engagementDescription}
                  onChange={(e) => handleInputChange("engagementDescription", e.target.value)}
                  className="min-h-[200px] resize-none border-gray-300"
                />
                {errors.engagementDescription && (
                  <p className="text-red-600 text-sm mt-2">{errors.engagementDescription}</p>
                )}
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like signed GMoU documents, HCDT registration materials,
                training records for security personnel on the Voluntary Principles, and your
                corporate human rights policy.
              </p>

              <div className="mt-6">
                <AddMoreFilesLinks
                  onFieldsChange={handleFilesAndLinksChange}
                  initialData={filesAndLinks}
                  uploadService={uploadService}
                  showToast={(msg, type) => toast[type](msg)}
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
                onClick={handleSubmit}
                disabled={isSaving || isPreviouslySubmitted}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
