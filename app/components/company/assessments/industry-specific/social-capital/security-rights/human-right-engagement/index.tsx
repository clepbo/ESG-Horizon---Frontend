"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { AdditionalFileUpload, FileData } from "../../../../AdditionalFileUpload";
import { AdditionalLinkUpload, LinkData } from "../../../../AdditionalLinkUpload";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { TotalsResponse } from "@/services/assessment.service";

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
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
  onSubmit,
}: HumanRightEngagementProps) {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [additionalLinks, setAdditionalLinks] = useState<LinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);
  const [formData, setFormData] = useState({
    engagementDescription: "",
    fileName: "",
    fileLink: "",
    uploadedFile: null as File | null,
  });

  const { filled, total } = useMemo(() => {
    const hasDescription = formData.engagementDescription.trim() !== "";
    const hasEvidence = additionalFields.length > 0 || additionalLinks.length > 0;

    return calculateProgress([hasDescription, hasEvidence]);
  }, [formData.engagementDescription, additionalFields, additionalLinks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.engagementDescription.trim()) {
      newErrors.engagementDescription = "Description is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    setShowSaveSuccess(true);
    setIsSaving(true);
    toast.success("Progress saved! You can continue later.");
    setIsSaving(false);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    toast.success("Assessment completed successfully!");
    onSubmit(null);
    setTimeout(() => onContinueToNextAssessment(), 1500);
  };
  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };
  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };
  const handleAdditionalLinksChange = (links: LinkData[]) => {
    setAdditionalLinks(links);
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
                  <p className="text-red-600 text-sm">{errors.engagementDescription}</p>
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
                <AdditionalFileUpload
                  onFieldsChange={handleAdditionalFieldsChange}
                  initialData={additionalFields}
                />
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Or Upload Via Link</h4>
                <AdditionalLinkUpload
                  onFieldsChange={handleAdditionalLinksChange}
                  initialData={additionalLinks}
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
                disabled={isSaving}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                Submit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
