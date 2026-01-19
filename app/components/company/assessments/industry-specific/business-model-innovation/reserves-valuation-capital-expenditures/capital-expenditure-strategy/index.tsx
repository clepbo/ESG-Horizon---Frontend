"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Info } from "lucide-react";
import { toast } from "react-toastify";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import ReusableInput from "../../../environmental/water-management/components/ReusableInput";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface CapitalExpenditureStrategyProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
  onSubmit: (totals: TotalsResponse | null) => void;
}

export default function CapitalExpenditureStrategy({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: CapitalExpenditureStrategyProps) {
  const capexPercentage = useFormattedNumber("");

  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [capexDiscussion, setCapexDiscussion] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const current =
    "businessModelAndInnovation.reserveValuation.strategicCapitalAllocation.capitalExpenditureStrategy";
  const { saveNow, submitGroup } = useAssessmentFlow(current);

  // Scroll to top when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, _setFormData] = useState({
    capexPercentageUnit: "%",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!capexPercentage.rawValue) {
      newErrors.capexPercentage = "Value is required";
    }
    if (!capexDiscussion.trim()) {
      newErrors.capexDiscussion = "Discussion is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasCapexPercentage = capexPercentage.rawValue !== "";
    const hasCapexDiscussion = capexDiscussion.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasCapexPercentage, hasCapexDiscussion, hasEvidence]);
  }, [capexPercentage.rawValue, capexDiscussion, filesAndLinks]);

  // const handleInputChange = (field: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  // };

  const payload = {
    capexPercentage: Number(capexPercentage.rawValue),
    capexPercentageUnit: formData.capexPercentageUnit,
    capexDiscussion: capexDiscussion,
    filesAndLinks: filesAndLinks,
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    try {
      await saveNow(current, payload);
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 1000);
    } catch (_error) {
      console.log(_error);
      toast.error("Failed to save data");
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
    try {
      // Save data first
      await saveNow(current, payload);
      // Then submit the group
      await submitGroup();
      toast.success("Assessment completed successfully!");
      // onSubmit(null);
    } catch (error: any) {
      toast.error("Failed to submit assessment", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  const handlePrevious = () => {
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Capital Expenditure Strategy</h3>
            <p className="text-muted-foreground text-base">
              This form covers metric EM-EP-420a.4, which is a qualitative discussion of how climate
              factors influence capital expenditure.
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

            {/* Percentage of current Capital Expenditure (CAPEX) allocated to Gas or Renewable projects */}
            <ReusableInput
              label="Percentage of current Capital Expenditure (CAPEX) allocated to Gas or Renewable projects"
              tooltipTitle="Percentage of Current CAPEX Allocated to Gas or Renewable Projects"
              tooltipBody="Enter the portion of your current capital expenditure dedicated to gas, renewable, or other low-carbon projects. Use your financial planning or budgeting records to calculate this percentage."
              inputValue={capexPercentage.displayValue}
              unitValue=""
              onInputChange={(num) => {
                capexPercentage.handleChange(String(num));
                setErrors((prev) => ({ ...prev, capexPercentage: "" }));
              }}
              onUnitChange={() => {}}
              customUnit="%"
              error={errors.capexPercentage}
              formatNumbers={false}
              placeholder="e.g., 2,000,000,000"
            />

            {/* Discussion of CAPEX Strategy */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Discussion of CAPEX Strategy
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
                    <h6 className="font-semibold mb-1">Discussion of CAPEX Strategy</h6>
                    <p>
                      Provide a brief explanation of how your company’s capital expenditure
                      priorities support long-term climate goals. Describe shifts toward low-carbon
                      investments or changes in project funding.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <textarea
                value={capexDiscussion}
                onChange={(e) => {
                  setCapexDiscussion(e.target.value);
                  setErrors((prev) => ({ ...prev, capexDiscussion: "" }));
                }}
                placeholder="e.g., Our CAPEX strategy prioritizes low-cost, low-carbon intensity barrels. The FIA's gas flaring penalties have accelerated investment in gas utilization projects, shifting capital from pure exploration to development of gas infrastructure..."
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.capexDiscussion ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.capexDiscussion && (
                <p className="text-sm text-red-500">{errors.capexDiscussion}</p>
              )}
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Provide a clear narrative on how your investment decisions (e.g., exploration,
                acquisition, development) are shaped by factors like carbon taxes, emissions trading
                schemes, and long-term demand scenarios for oil and gas.
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
