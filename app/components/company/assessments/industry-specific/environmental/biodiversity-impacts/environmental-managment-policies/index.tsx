"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";

interface EnvironmentalManagementPoliciesProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: string;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function EnvironmentalManagementPolicies({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: EnvironmentalManagementPoliciesProps) {
  const { state, dispatch } = useAssessment();
  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow(
    "environmental-management-policies"
  );

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    isISO14001Certified: "",
    policiesDescription: "",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.biodiversityImpact?.environmentalManagement
        ?.environmentalManagementPolicies;
    if (existingData && Object.keys(existingData).length > 0) {
      setFormData({
        isISO14001Certified: existingData.isISO14001Certified ? "yes" : "no",
        policiesDescription: existingData.policiesDescription || "",
      });
      setFilesAndLinks(existingData.filesAndLinks || []);
    }
  }, [
    state.assessmentData.environment?.biodiversityImpact?.environmentalManagement
      ?.environmentalManagementPolicies,
  ]);

  const { filled, total } = useMemo(() => {
    const hasISO = formData.isISO14001Certified !== "";
    const hasDescription = formData.policiesDescription.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasISO, hasDescription, hasEvidence]);
  }, [formData.isISO14001Certified, formData.policiesDescription, filesAndLinks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.isISO14001Certified) {
      newErrors.isISO14001Certified = "Please select an option.";
    }
    if (!formData.policiesDescription.trim()) {
      newErrors.policiesDescription = "Description is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = {
      isISO14001Certified: formData.isISO14001Certified === "yes",
      policiesDescription: formData.policiesDescription,
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_BIODIVERSITY_POLICIES", payload });

    try {
      await saveNow(
        "environment.biodiversityImpact.environmentalManagement.environmentalManagementPolicies",
        payload
      );
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch {
      // toast.error is already handled in useAssessmentFlow
    }
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      isISO14001Certified: formData.isISO14001Certified === "yes",
      policiesDescription: formData.policiesDescription,
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_BIODIVERSITY_POLICIES", payload });
    onContinueToNextAssessment();
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
            <h3 className="text-2xl font-semibold">Environmental Management Policies</h3>
            <p className="text-muted-foreground text-base">
              Describe your organization&apos;s environmental management policies and practices for
              active sites, including those in protected areas or areas of high biodiversity value.
              This form covers metric EM-EP-160a.1, which is qualitative and descriptive.
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
            {/* ISO 14001 Certification Question */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Is the Environmental Management System (EMS) ISO 14001 Certified?
              </Label>
              <RadioGroup
                value={formData.isISO14001Certified}
                onValueChange={(value) => handleInputChange("isISO14001Certified", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="iso-yes" />
                  <Label htmlFor="iso-yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="iso-no" />
                  <Label htmlFor="iso-no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {errors.isISO14001Certified && (
                <p className="text-red-600 text-sm mt-2">{errors.isISO14001Certified}</p>
              )}
            </div>

            {/* Description of Policies and Practices */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium text-gray-900">
                  Description of Environmental Management Policies and Practices
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <h6>Description of Environmental Management Policies and Practices </h6>
                    <p>
                      Provide details of your company’s policies and operational practices designed
                      to protect biodiversity and reduce environmental impacts. This may include
                      habitat conservation plans, protected species management, environmental
                      monitoring programs, spill prevention measures, and site restoration
                      commitments.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                placeholder="Describe your company/organization environmental management policies and practices"
                value={formData.policiesDescription}
                onChange={(e) => handleInputChange("policiesDescription", e.target.value)}
                className="min-h-[200px] resize-none border-gray-300 bg-white"
              />
              {errors.policiesDescription && (
                <p className="text-red-600 text-sm mt-2">{errors.policiesDescription}</p>
              )}
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Document/Evidence Upload
                </h3>
                <p className="text-sm text-gray-600">
                  Upload supporting policy documents, ISO 14001 certificates, Biodiversity Action
                  Plans (BAPs), and Environmental Impact Assessments (EIAs).
                </p>
              </div>

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
    </div>
  );
}
