"use client";

import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";

interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function CommunityRisk({
  onBack,
  onDisclosureTopics,
  onNext,
  stepIndex,
  totalSteps,
}: Props) {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    hcdtIncorporated: "",
    riskDescription: "",
  });

  const features = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onDisclosureTopics },
    { label: "Community Relations", onClick: onBack },
    { label: "Community Risk & Opportunity Management" },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Calculate progress
  const progress = useMemo(() => {
    const hasHcdtAnswer = formData.hcdtIncorporated !== "";
    const hasDescription = formData.riskDescription.trim() !== "";

    const completed = [hasHcdtAnswer, hasDescription].filter(Boolean).length;
    return completed;
  }, [formData.hcdtIncorporated, formData.riskDescription]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hcdtIncorporated) {
      newErrors.hcdtIncorporated = "Please select Yes or No";
    }

    if (!formData.riskDescription.trim()) {
      newErrors.riskDescription = "Risk management description is required";
    } else if (formData.riskDescription.trim().length < 50) {
      newErrors.riskDescription =
        "Please provide a more detailed description (at least 50 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      hcdtIncorporated: formData.hcdtIncorporated,
      riskDescription: formData.riskDescription,
      filesAndLinks: filesAndLinks,
    };

    setIsActionLoading(true);

    // Log the data
    console.log("=== Community Risk & Opportunity Management Data ===");
    console.log("HCDT Incorporated:", payload.hcdtIncorporated);
    console.log("Risk Description:", payload.riskDescription);
    console.log("Files and Links:", payload.filesAndLinks);
    console.log("Full Payload:", payload);
    console.log("=============================");

    // Simulate save delay
    setTimeout(() => {
      setIsActionLoading(false);
      setShowSaveSuccess(true);
      toast.success("Data logged successfully");

      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 1500);
    }, 1000);
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      hcdtIncorporated: formData.hcdtIncorporated,
      riskDescription: formData.riskDescription,
      filesAndLinks: filesAndLinks,
    };

    // Log the data
    console.log("=== Community Risk & Opportunity Management Data (Next) ===");
    console.log("HCDT Incorporated:", payload.hcdtIncorporated);
    console.log("Risk Description:", payload.riskDescription);
    console.log("Files and Links:", payload.filesAndLinks);
    console.log("Full Payload:", payload);
    console.log("====================================");

    onNext();
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
            <h3 className="text-2xl font-semibold">Community Risk & Opportunity Management</h3>
            <p className="text-muted-foreground text-base">
              Describe your organization's process for managing risks and opportunities related to
              the rights and interests of the communities where you operate.
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

            {/* HCDT Incorporation Question */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Have Host Community Development Trusts (HCDTs) been fully incorporated and funded
                  for all assets?
                </Label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="HCDT Incorporation Status"
                      message="Indicate whether your company has established and funded Host Community Development Trusts for all relevant oil and gas assets as required by the PIA 2021."
                    />
                  }
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hcdtIncorporated"
                      value="yes"
                      checked={formData.hcdtIncorporated === "yes"}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, hcdtIncorporated: e.target.value }));
                        setErrors((prev) => ({ ...prev, hcdtIncorporated: "" }));
                      }}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hcdtIncorporated"
                      value="no"
                      checked={formData.hcdtIncorporated === "no"}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, hcdtIncorporated: e.target.value }));
                        setErrors((prev) => ({ ...prev, hcdtIncorporated: "" }));
                      }}
                      className="w-4 h-4 text-primary"
                    />
                    <span>No</span>
                  </label>
                </div>
                {errors.hcdtIncorporated && (
                  <p className="text-sm text-red-500">{errors.hcdtIncorporated}</p>
                )}
              </div>
            </div>

            {/* Risk Management Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Description of Community Risk Management Process
                </Label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Community Risk Management Process"
                      message="Provide an overview of how your company identifies, evaluates, and manages risks related to local communities. This may include stakeholder engagement plans, grievance mechanisms, social impact assessments, conflict-prevention strategies, and processes for responding to community concerns. The goal is to show how your company protects community well-being while reducing operational and reputational risks."
                    />
                  }
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <Textarea
                  value={formData.riskDescription}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, riskDescription: e.target.value }));
                    setErrors((prev) => ({ ...prev, riskDescription: "" }));
                  }}
                  placeholder="e.g., Our primary process is the implementation of Host Community Development Trusts (HCDTs) as required by the PIA 2021, which funds community projects and provides a formal grievance mechanism..."
                  className={`min-h-37.5 ${errors.riskDescription ? "border-red-500" : ""}`}
                />
                {errors.riskDescription && (
                  <p className="text-sm text-red-500">{errors.riskDescription}</p>
                )}
                <p className="text-sm text-gray-500">
                  {formData.riskDescription.length} characters
                </p>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like Host Community Development Trust (HCDT) annual
                reports, community grievance logs and resolution records, and minutes from HCDT
                board meetings.
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
