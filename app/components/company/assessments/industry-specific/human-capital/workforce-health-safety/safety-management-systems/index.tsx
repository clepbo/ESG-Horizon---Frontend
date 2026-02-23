"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useAssessment } from "@/hooks/useAssessment";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";

interface SafetyManagementSystemProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: string;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
  onSubmit: (totals: any | null) => void;
}

export default function SafetyManagementSystem({
  onBack,
  // onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
  onSubmit,
}: SafetyManagementSystemProps) {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { saveNow, submitGroup } = useAssessmentFlow(
    "humanCapital.workforceHealthAndSafety.riskAndOpportunityManagement.safetyManagementSystems"
  );
  const { state } = useAssessment();
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    executiveRemunerationLinked: "",
    safetyDescription: "",
  });

  // Rehydrate form data from saved assessment (e.g., when navigating back)
  const hasRehydrated = useRef(false);
  useEffect(() => {
    if (hasRehydrated.current) return;
    const saved = (state.assessmentData as any)?.humanCapital?.workforceHealthAndSafety
      ?.riskAndOpportunityManagement?.safetyManagementSystems;
    if (!saved) return;
    hasRehydrated.current = true;

    setFormData({
      executiveRemunerationLinked: saved.executiveRemunerationLinked || "",
      safetyDescription: saved.safetyDescription || "",
    });
    if (saved.filesAndLinks?.length) {
      setFilesAndLinks(saved.filesAndLinks);
    }
  }, [state.assessmentData]);

  // Fix: Move calculateProgress inside useMemo to avoid dependency issues
  const { filled, total } = useMemo(() => {
    const hasRemuneration = formData.executiveRemunerationLinked !== "";
    const hasDescription = formData.safetyDescription.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    const filled = [hasRemuneration, hasDescription, hasEvidence].filter(Boolean).length;
    return { filled, total: 3 };
  }, [formData, filesAndLinks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.executiveRemunerationLinked) {
      newErrors.executiveRemunerationLinked = "Please select an option.";
    }
    if (!formData.safetyDescription.trim()) {
      newErrors.safetyDescription = "Description is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const payload = {
    executiveRemunerationLinked: formData.executiveRemunerationLinked,
    safetyDescription: formData.safetyDescription,
    filesAndLinks: filesAndLinks,
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    // setShowSaveSuccess(true);
    // setIsSaving(true);

    try {
      await saveNow(
        "humanCapital.workforceHealthAndSafety.riskAndOpportunityManagement.safetyManagementSystems",
        payload
      );
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

    // console.log("DATA TO SAVE:", payload);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      // Save data first
      await saveNow(
        "humanCapital.workforceHealthAndSafety.riskAndOpportunityManagement.safetyManagementSystems",
        payload
      );
      // Then submit the group
      await submitGroup();
      toast.success("Assessment completed successfully!");
      onSubmit(null);
    } catch (_error: any) {
      toast.error("Failed to submit assessment", _error.message);
    } finally {
      setIsSaving(false);
    }

    // console.log("FINAL SUBMISSION:", payload);

    // toast.success("Assessment completed successfully!");
    // onSubmit(null);
    // setTimeout(() => onContinueToNextAssessment(), 1500);
  };

  const handlePrevious = () => {
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
            <h3 className="text-2xl font-semibold">Safety Management Systems</h3>
            <p className="text-muted-foreground text-base">
              Describe the management systems your organization uses to integrate a culture of
              safety throughout the entire exploration and production lifecycle.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            {/* Progress Bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Executive Remuneration Question */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <Label className="text-base font-semibold text-gray-900">
                Is executive remuneration (bonuses) explicitly linked to safety performance metrics?
              </Label>
              <RadioGroup
                value={formData.executiveRemunerationLinked}
                onValueChange={(value) => handleInputChange("executiveRemunerationLinked", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {errors.executiveRemunerationLinked && (
                <p className="text-red-600 text-sm mt-2">{errors.executiveRemunerationLinked}</p>
              )}
            </div>

            {/* Description of Safety Management Systems */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Description of Safety Management Systems
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <p>
                      Provide details on your Safety Management System (SMS) framework, including
                      key elements such as Stop Work Authority programs, safety training protocols,
                      incident reporting mechanisms, and how safety is integrated into daily
                      operations and decision-making processes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <Textarea
                  placeholder="e.g., We operate under a Safety Management System (SMS) framework aligned with ISO 45001. A key element is our 'Stop Work Authority' program, which empowers all employees and contractors to halt unsafe work without fear of reprisal..."
                  value={formData.safetyDescription}
                  onChange={(e) => handleInputChange("safetyDescription", e.target.value)}
                  className="min-h-50 resize-none border-gray-300"
                />
                {errors.safetyDescription && (
                  <p className="text-red-600 text-sm mt-2">{errors.safetyDescription}</p>
                )}
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like your Safety Management System (SMS) manual, records
                of &apos;Stop Work Authority&apos; interventions, and minutes from Health and Safety
                Committee meetings.
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
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
