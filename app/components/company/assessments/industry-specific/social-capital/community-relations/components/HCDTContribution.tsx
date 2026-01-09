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
import { useRouter } from "next/navigation";

interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function HCDTContribution({
  onBack,
  onDisclosureTopics,
  onNext,
  stepIndex,
  totalSteps,
}: Props) {
  const router = useRouter();
  const { saveNow } = useAssessmentFlow("socialCapital.communityRelations.hcdtContribution");

  const opexAmount = useFormattedNumber("");
  const hcdtAmount = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    opexUnit: "NGN",
    hcdtUnit: "NGN",
  });

  const features = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onDisclosureTopics },
    { label: "Community Relations", onClick: onBack },
    { label: "HCDT Contribution (PIA 2021)" },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Calculate progress
  const progress = useMemo(() => {
    const hasOpexAmount = opexAmount.rawValue !== "" && formData.opexUnit !== "";
    const hasHcdtAmount = hcdtAmount.rawValue !== "" && formData.hcdtUnit !== "";

    const completed = [hasOpexAmount, hasHcdtAmount].filter(Boolean).length;
    return completed;
  }, [opexAmount.rawValue, hcdtAmount.rawValue, formData.opexUnit, formData.hcdtUnit]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!opexAmount.rawValue) {
      newErrors.opexAmount = "OPEX amount is required";
    }
    if (!formData.opexUnit) {
      newErrors.opexUnit = "Unit is required";
    }

    if (!hcdtAmount.rawValue) {
      newErrors.hcdtAmount = "HCDT amount is required";
    }
    if (!formData.hcdtUnit) {
      newErrors.hcdtUnit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      opexAmount: Number(opexAmount.rawValue),
      opexUnit: formData.opexUnit,
      hcdtAmount: Number(hcdtAmount.rawValue),
      hcdtUnit: formData.hcdtUnit,
      filesAndLinks: filesAndLinks,
    };

    setIsActionLoading(true);

    try {
      await saveNow("socialCapital.communityRelations.hcdtContribution", payload);
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 1000);
    } catch (_error) {
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
      opexAmount: Number(opexAmount.rawValue),
      opexUnit: formData.opexUnit,
      hcdtAmount: Number(hcdtAmount.rawValue),
      hcdtUnit: formData.hcdtUnit,
      filesAndLinks: filesAndLinks,
    };

    try {
      await saveNow("socialCapital.communityRelations.hcdtContribution", payload);
      toast.success("Progress saved!");
      onNext();
    } catch (error) {
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
            <h3 className="text-2xl font-semibold">HCDT Contribution (PIA 2021)</h3>
            <p className="text-muted-foreground text-base">
              Report your company&apos;s annual contribution to the Host Community Development Trust
              (HCDT) as mandated by the Petroleum Industry Act (PIA) 2021.
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

            {/* Prior Year's Actual Operating Expenditure */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Prior Year&apos;s Actual Operating Expenditure (OPEX)
                </Label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Prior Year's Actual OPEX"
                      message="Enter the 3% OPEX basis from the preceding financial year as defined in the Petroleum Industry Act 2021."
                    />
                  }
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opexAmount">Amount</Label>
                    <Input
                      id="opexAmount"
                      type="text"
                      placeholder="e.g., 110,666,666,667"
                      value={opexAmount.displayValue}
                      onChange={(e) => {
                        opexAmount.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, opexAmount: "" }));
                      }}
                      className={errors.opexAmount ? "border-red-500" : ""}
                    />
                    {errors.opexAmount && (
                      <p className="text-sm text-red-500">{errors.opexAmount}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opexUnit">Unit</Label>
                    <Input
                      id="opexUnit"
                      type="text"
                      value={formData.opexUnit}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, opexUnit: e.target.value }));
                        setErrors((prev) => ({ ...prev, opexUnit: "" }));
                      }}
                      readOnly
                      className="bg-gray-50"
                    />
                    {errors.opexUnit && <p className="text-sm text-red-500">{errors.opexUnit}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Annual Contribution to HCDT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Total Annual Contribution to HCDT</Label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Total Annual Contribution to HCDT"
                      message="Enter the total amount paid into the established Host Community Development Trust fund(s) for the reporting year."
                    />
                  }
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hcdtAmount">Amount</Label>
                    <Input
                      id="hcdtAmount"
                      type="text"
                      placeholder="e.g., 3,500,000,000"
                      value={hcdtAmount.displayValue}
                      onChange={(e) => {
                        hcdtAmount.handleChange(e.target.value);
                        setErrors((prev) => ({ ...prev, hcdtAmount: "" }));
                      }}
                      className={errors.hcdtAmount ? "border-red-500" : ""}
                    />
                    {errors.hcdtAmount && (
                      <p className="text-sm text-red-500">{errors.hcdtAmount}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hcdtUnit">Unit</Label>
                    <Input
                      id="hcdtUnit"
                      type="text"
                      value={formData.hcdtUnit}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, hcdtUnit: e.target.value }));
                        setErrors((prev) => ({ ...prev, hcdtUnit: "" }));
                      }}
                      readOnly
                      className="bg-gray-50"
                    />
                    {errors.hcdtUnit && <p className="text-sm text-red-500">{errors.hcdtUnit}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload the audited HCDT financial statements, your annual PIA compliance report
                submitted to NUPRC, and evidence of the financial transfer to the HCDT account.
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
