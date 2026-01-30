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
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";

interface RenewableEnergyInvestmentProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function RenewableEnergyInvestment({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: RenewableEnergyInvestmentProps) {
  const investmentAmount = useFormattedNumber("");
  const revenueAmount = useFormattedNumber("");

  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projectDescription, setProjectDescription] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const current =
    "businessInnovation.reservesValuationAndCapitalExpenditures.renewableEnergyInvestment";
  const { saveNow } = useAssessmentFlow(current);

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.businessInnovation?.reservesValuationAndCapitalExpenditures
        ?.renewableEnergyInvestment;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.investmentAmount !== undefined) {
        investmentAmount.handleChange(String(existingData.investmentAmount));
      }
      if (existingData.revenueAmount !== undefined) {
        revenueAmount.handleChange(String(existingData.revenueAmount));
      }
      if (existingData.projectDescription !== undefined) {
        setProjectDescription(existingData.projectDescription);
      }

      setFilesAndLinks(existingData.filesAndLinks || []);
    }
  }, [
    state.assessmentData.environment?.businessInnovation?.reservesValuationAndCapitalExpenditures
      ?.renewableEnergyInvestment,
  ]);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, _setFormData] = useState({
    investmentAmountUnit: "NGN",
    revenueAmountUnit: "NGN",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!investmentAmount.rawValue) {
      newErrors.investmentAmount = "Amount is required";
    }
    if (!revenueAmount.rawValue) {
      newErrors.revenueAmount = "Amount is required";
    }
    if (!projectDescription.trim()) {
      newErrors.projectDescription = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasInvestmentAmount = investmentAmount.rawValue !== "";
    const hasRevenueAmount = revenueAmount.rawValue !== "";
    const hasProjectDescription = projectDescription.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasInvestmentAmount,
      hasRevenueAmount,
      hasProjectDescription,
      hasEvidence,
    ]);
  }, [investmentAmount.rawValue, revenueAmount.rawValue, projectDescription, filesAndLinks]);

  // const handleInputChange = (field: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  // };

  const payload = {
    investmentAmount: Number(investmentAmount.rawValue),
    investmentAmountUnit: formData.investmentAmountUnit,

    revenueAmount: Number(revenueAmount.rawValue),
    revenueAmountUnit: formData.revenueAmountUnit,

    projectDescription: projectDescription,

    filesAndLinks: filesAndLinks,
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "reservesValuationAndCapitalExpenditures",
          section: "renewableEnergyInvestment",
          data: payload,
        },
      });
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
    } catch (_error) {
      console.log(_error);
      toast.error("Failed to save data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_BUSINESS_INNOVATION",
        payload: {
          category: "reservesValuationAndCapitalExpenditures",
          section: "renewableEnergyInvestment",
          data: payload,
        },
      });
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save progress");
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
            <h3 className="text-2xl font-semibold">Renewable Energy Investment</h3>
            <p className="text-muted-foreground text-base">
              This form covers metric EM-EP-420a.3, detailing the investment in and revenue from
              renewable energy projects.
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

            {/* Investment in Renewable Energy */}
            <ReusableInput
              label="Investment in Renewable Energy"
              tooltipTitle="Investment in Renewable Energy"
              tooltipBody="Enter the total financial investment your company has made in renewable energy projects within the reporting period. Include direct project funding, equity stakes, or long-term renewable procurement commitments."
              inputValue={investmentAmount.displayValue}
              unitValue=""
              onInputChange={(num) => {
                investmentAmount.handleChange(String(num));
                setErrors((prev) => ({ ...prev, investmentAmount: "" }));
              }}
              onUnitChange={() => { }}
              customUnit="NGN"
              error={errors.investmentAmount}
              formatNumbers={false}
              placeholder="e.g., 2,000,000,000"
            />

            {/* Revenue from Renewable Energy Sales */}
            <ReusableInput
              label="Revenue from Renewable Energy Sales"
              tooltipTitle="Revenue from Renewable Energy Sales"
              tooltipBody="Enter the revenue generated from the sale of renewable electricity, certificates, or renewable-powered services. Use financial statements or project-level reports to provide accurate figures."
              inputValue={revenueAmount.displayValue}
              unitValue=""
              onInputChange={(num) => {
                revenueAmount.handleChange(String(num));
                setErrors((prev) => ({ ...prev, revenueAmount: "" }));
              }}
              onUnitChange={() => { }}
              customUnit="NGN"
              error={errors.revenueAmount}
              formatNumbers={false}
              placeholder="e.g., 0"
            />

            {/* Brief Description of Investment/Project */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Brief Description of Investment/Project
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
                    <h6 className="font-semibold mb-1">Brief Description of Investment/Project</h6>
                    <p>
                      Provide a short explanation of the renewable project or investment, including
                      its purpose, scale, and expected benefits. This helps contextualize your
                      company’s low-carbon transition activities.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <textarea
                value={projectDescription}
                onChange={(e) => {
                  setProjectDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, projectDescription: "" }));
                }}
                placeholder="e.g., Pilot solar power project for a production facility to reduce diesel consumption."
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.projectDescription ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.projectDescription && (
                <p className="text-sm text-red-500">{errors.projectDescription}</p>
              )}
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload capital expenditure records for the project, project contracts, and reports
                on facility diesel consumption (if applicable, to show benefits).
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
                onClick={handleNext}
                disabled={isSaving}
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
