"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Textarea } from "@/app/components/ui/textarea";
import { GeneralTargetData } from "@/types/target";
import { FaCaretRight } from "react-icons/fa";
import { GeneralTargetSummary } from "./general/GeneralTargetSummary";
import { SuccessModal } from "./SuccessModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiUtil from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { GeneralTargetPayload } from "@/types/target/index";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatNumberFull } from "@/lib/numberFormat";

export interface GeneralTargetFormProps {
  data: GeneralTargetData;
  onChange: (data: GeneralTargetData) => void;
  onComplete?: (data: GeneralTargetData) => void;
  onSuccess?: () => void;
}

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i);

export default function GeneralTargetForm({
  data,
  onChange,
  onComplete,
  onSuccess,
}: GeneralTargetFormProps) {
  const [step, setStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showNoBaselineModal, setShowNoBaselineModal] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;

  const baseline = useQuery({
    queryKey: ["baseline", companyId],
    queryFn: () => {
      if (!companyId) throw new Error("Company ID not available");
      return apiUtil.get(`/target/baseline/${companyId}`);
    },
    enabled: !!companyId,
  });

  const router = useRouter();

  // Auto-populate baselineYear from the API baseline data
  useEffect(() => {
    if (baseline.data?.startYear && !data.baselineYear) {
      onChange({ ...data, baselineYear: baseline.data.startYear });
    }
  }, [baseline.data?.startYear, data, onChange]);

  // Show redirect modal if baseline fetch is complete but no baseline exists
  useEffect(() => {
    if (!baseline.isLoading && !baseline.error && baseline.data && !baseline.data.totalSum) {
      setShowNoBaselineModal(true);
    }
  }, [baseline.isLoading, baseline.error, baseline.data]);

  const createTarget = useMutation({
    mutationFn: async (targetData: GeneralTargetPayload) => {
      return apiUtil.post(`/target`, targetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseline"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
    },
  });

  // Use the formatting hook for targetEmission
  // const targetEmissionFormatter = useFormattedNumber(data.targetEmission || "");

  const handleInputChange = (field: keyof GeneralTargetData, value: string | number) => {
    let processedValue: any = value;

    if (field === "reductionPercentage") {
      processedValue = value === "" ? null : Number(value);
    }

    if (field === "baselineYear" || field === "targetYear") {
      processedValue = value === "" ? null : Number(value);
    }

    if (field === "targetEmission") {
      processedValue = value === "" ? null : Number(value);
    }

    // Update the field, then recalculate if reduction percentage is available
    const updated = { ...data, [field]: processedValue };
    const reduction = updated.reductionPercentage;
    if (reduction !== null && reduction !== undefined) {
      const baseEmission = baseline?.data?.totalSum || 0;
      const targetEmission = baseEmission * (1 - reduction / 100);
      const totalReduction = baseEmission * (reduction / 100);
      updated.targetEmission = Math.round(targetEmission);
      updated.totalReduction = Math.round(totalReduction);
    }

    onChange(updated);
  };

  const handleContinue = () => {
    if (step === 0) {
      // Validate required fields before proceeding
      if (data.reductionPercentage && data.baselineYear && data.targetYear) {
        setStep(1);
      }
    }
  };

  const handlePrevious = () => {
    setStep(0);
  };

  const handleSetTarget = async () => {
    const uniqueName = `Carbon Target ${data.baselineYear}-${data.targetYear}`;
    try {
      // Prepare the target payload
      const targetPayload: GeneralTargetPayload = {
        name: data.name || uniqueName,
        type: "GENERAL",
        description: data.description || "General emissions reduction target",
        baselineYear: Number(data.baselineYear!),
        targetYear: Number(data.targetYear!),
        reductionPercentage: data.reductionPercentage || 0,
        targetEmission: calculatedTargetEmission,
        baselineYearEmission: baseline?.data?.totalSum,
        currentEmission: baseline?.data?.totalSum,
      };

      // Call the mutation
      await createTarget.mutateAsync(targetPayload);

      // Call the onComplete callback with the data
      onComplete?.(data);

      // Open the success modal
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to create target:", error);
      throw new Error(`Error: ${error}`);
    }
  };

  const handleModalContinue = () => {
    setIsSuccessModalOpen(false);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/assessments/target");
    }
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Calculate dynamic values for display
  const baselineEmission = baseline?.data?.totalSum || 0;
  const calculatedTargetEmission = data?.reductionPercentage
    ? baselineEmission * (1 - data?.reductionPercentage / 100)
    : 0;
  const calculatedTotalReduction = data?.reductionPercentage
    ? baselineEmission * (data?.reductionPercentage / 100)
    : 0;

  // console.log("Gen", data?);
  return (
    <>
      {step === 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="text-lg">General Reduction Target Happening ...</div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Set your overall emissions reduction target across all scopes
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reductionPercentage">Reduction Percentage (%)</Label>
                  <Input
                    id="reductionPercentage"
                    type="number"
                    placeholder="e.g. 30"
                    value={data?.reductionPercentage ?? ""}
                    onChange={(e) => handleInputChange("reductionPercentage", e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baselineYear">Baseline Year</Label>
                  <Input
                    id="baselineYear"
                    type="number"
                    value={data?.baselineYear ?? baseline.data?.startYear ?? ""}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetYear">Target Year</Label>
                  <select
                    id="targetYear"
                    value={data?.targetYear ?? ""}
                    onChange={(e) => handleInputChange("targetYear", e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select year</option>
                    {years
                      .filter((year) => !data?.baselineYear || year > data.baselineYear)
                      .map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your general reduction strategy..."
                  value={data?.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Target Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <div className="flex flex-col w-full gap-2">
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label className="flex items-center gap-1">
                    Baseline {baseline?.data?.startYear} :
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Total GHG emissions recorded in the baseline year (tCO₂e)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="text-sm text-gray-900 font-semibold">
                    {" "}
                    {formatNumberFull(baseline?.data?.totalSum ?? 0)} tCO₂e
                  </div>
                </div>
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label className="flex items-center gap-1">
                    Target ({data?.targetYear || 0}):
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Formula: Baseline × (1 − Reduction% ÷ 100)</p>
                          <p className="text-xs text-gray-300 mt-1">
                            e.g. {baseline?.data?.totalSum ?? 0} × (1 −{" "}
                            {data?.reductionPercentage ?? 0} ÷ 100)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="text-sm text-primary font-semibold">
                    {formatNumberFull(calculatedTargetEmission)} tCO₂e
                  </div>
                </div>
                <hr className="text-gray-300" />
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>Total Reduction:</Label>
                  <div className="text-sm text-red-500 font-semibold">
                    -{formatNumberFull(calculatedTotalReduction)} tCO₂e
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <CustomButton
              icon={<FaCaretRight />}
              onClick={handleContinue}
              className="text-white px-6 py-2"
              disabled={!data?.reductionPercentage || !data?.baselineYear || !data?.targetYear}
            >
              Continue
            </CustomButton>
          </div>
        </div>
      )}

      {step === 1 &&
        (baseline.isLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <div className="text-lg text-gray-600">Calculating your target summary...</div>
              </div>
            </CardContent>
          </Card>
        ) : baseline.error ? (
          <Card>
            <CardContent className="flex justify-center items-center p-8">
              <div className="text-center">
                <div className="text-lg text-red-500 mb-2">Failed to load baseline data</div>
                <CustomButton onClick={handlePrevious} className="mt-4">
                  Go Back
                </CustomButton>
              </div>
            </CardContent>
          </Card>
        ) : (
          <GeneralTargetSummary
            reductionPercentage={data?.reductionPercentage || 0}
            baselineEmission={baseline?.data?.totalSum ?? 0}
            targetEmission={calculatedTargetEmission ?? 0}
            targetYear={data?.targetYear ?? 0}
            baselineYear={baseline?.data?.startYear || 0}
            onPrevious={handlePrevious}
            onSetTarget={handleSetTarget}
            isLoading={createTarget?.isPending}
          />
        ))}

      {/* Success Modal - rendered outside the step condition so it's always available */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
        onContinue={handleModalContinue}
      />

      {/* No-baseline redirect modal */}
      {showNoBaselineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 space-y-4 text-center">
            <Info className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">No Baseline Found</h2>
            <p className="text-gray-600 text-sm">
              You need to complete a Baseline Assessment before setting a target. Your baseline
              captures the emissions data used to calculate your reduction goal.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <CustomButton variant="outlined" onClick={() => setShowNoBaselineModal(false)}>
                Dismiss
              </CustomButton>
              <CustomButton onClick={() => router.push("/assessments/hub?setup=baseline")}>
                Create Baseline
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
