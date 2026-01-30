"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { Info } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import { TotalsResponse } from "@/services/assessment.service";

interface AntiCorruptionManagementProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
  onSubmit: (totals: TotalsResponse | null) => void;
}

export default function AntiCorruptionManagement({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
  onSubmit,
}: AntiCorruptionManagementProps) {
  const { state, dispatch } = useAssessment();
  const { saveNow } = useAssessmentFlow(
    "businessInnovation.businessEthicsAndTransparency.antiCorruptionManagementSystem"
  );
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasWhistleblowerHotline, setHasWhistleblowerHotline] = useState<string>("");
  const [systemDescription, setSystemDescription] = useState<string>("");

  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.businessInnovation?.businessEthicsAndTransparency
        ?.antiCorruptionManagementSystem;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.hasWhistleblowerHotline !== undefined) {
        setHasWhistleblowerHotline(existingData.hasWhistleblowerHotline);
      }
      if (existingData.systemDescription !== undefined) {
        setSystemDescription(existingData.systemDescription);
      }
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
  }, [
    state.assessmentData.environment?.businessInnovation?.businessEthicsAndTransparency
      ?.antiCorruptionManagementSystem,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate radio button selection
    if (!hasWhistleblowerHotline) {
      newErrors.hasWhistleblowerHotline = "This field is required";
    }

    // Validate fields based on selection
    if (hasWhistleblowerHotline === "yes") {
      if (!systemDescription.trim()) {
        newErrors.systemDescription = "Description is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasRadioSelection = hasWhistleblowerHotline !== "";

    let hasAdditionalFields = false;
    if (hasWhistleblowerHotline === "yes") {
      hasAdditionalFields = systemDescription.trim() !== "";
    } else if (hasWhistleblowerHotline === "no") {
      hasAdditionalFields = true; // No additional fields needed for "No"
    }

    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasRadioSelection, hasAdditionalFields, hasEvidence]);
  }, [hasWhistleblowerHotline, systemDescription, filesAndLinks]);

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setShowSaveSuccess(false);

    const payload = {
      hasWhistleblowerHotline,
      ...(hasWhistleblowerHotline === "yes" && {
        systemDescription,
      }),
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(
        "businessInnovation.businessEthicsAndTransparency.antiCorruptionManagementSystem",
        payload
      );
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "businessEthicsAndTransparency",
          section: "antiCorruptionManagementSystem",
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
      hasWhistleblowerHotline,
      ...(hasWhistleblowerHotline === "yes" && {
        systemDescription,
      }),
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow(
        "businessInnovation.businessEthicsAndTransparency.antiCorruptionManagementSystem",
        payload
      );
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "businessEthicsAndTransparency",
          section: "antiCorruptionManagementSystem",
          data: payload,
        },
      });

      // Call onSubmit with null or actual totals response if you have one
      onSubmit(null);

      toast.success("Form submitted successfully!");
      onContinueToNextAssessment();
    } catch (error) {
      toast.error("Failed to submit form");
    }
  };

  const handlePrevious = () => {
    toast.info("Returning to previous section");
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Anti-Corruption Management System</h3>
            <p className="text-muted-foreground text-base">
              Describe the management system your organization has in place to prevent corruption
              and bribery within your own operations and across your value chain (e.g., with
              business partners).
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

            {/* Radio Button Question */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  Is there an anonymous Whistleblower Hotline managed by an independent third party?
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Indicate whether your organization has established an anonymous whistleblower
                      hotline managed by an independent third party. This mechanism allows employees
                      and stakeholders to report suspected corruption or unethical behavior without
                      fear of retaliation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <RadioGroup
                value={hasWhistleblowerHotline}
                onValueChange={(value) => {
                  setHasWhistleblowerHotline(value);
                  setErrors((prev) => ({ ...prev, hasWhistleblowerHotline: "" }));
                }}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>

              {errors.hasWhistleblowerHotline && (
                <p className="text-sm text-red-600">{errors.hasWhistleblowerHotline}</p>
              )}
            </div>

            {/* Conditional Field for YES response */}
            {hasWhistleblowerHotline === "yes" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold text-gray-900">
                    Description of Anti-Corruption Management System
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Provide a comprehensive description of your anti-corruption management
                        system, including policies, training programs, due diligence processes, and
                        monitoring mechanisms. Explain how the whistleblower hotline integrates with
                        your broader anti-corruption framework.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Textarea
                  value={systemDescription}
                  onChange={(e) => {
                    setSystemDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, systemDescription: "" }));
                  }}
                  placeholder="e.g., We have a zero-tolerance policy for bribery and corruption, embedded in our Corporate Code of Conduct. Mandatory annual anti-corruption training is required for all staff. We are a signatory to the Nigerian Extractive Industries Transparency Initiative (NEITI) principles and publish all payments to government..."
                  className={`min-h-[150px] resize-none w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.systemDescription ? "border-red-500" : "border-gray-300"
                    }`}
                />

                {errors.systemDescription && (
                  <p className="text-sm text-red-600">{errors.systemDescription}</p>
                )}
              </div>
            )}

            {/* Document/Evidence Upload - Only show when a selection is made */}
            {hasWhistleblowerHotline && (
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 animate-in fade-in duration-300">
                <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>

                <p className="text-sm text-gray-600">
                  Upload your corporate code of conduct, records of employee anti-corruption
                  training completion, and published NEITI audit reports showing company payments.
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
            )}

            {/* Navigation buttons - Conditional rendering based on selection */}
            <div className="pt-8">
              {!hasWhistleblowerHotline ? (
                // No selection made - show only Back and Save & Continue Later
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={isSaving}
                    className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
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
                </div>
              ) : (
                // Selection made - show all three buttons
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={isSaving}
                    className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
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
                    className="border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
                  >
                    Submit
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
