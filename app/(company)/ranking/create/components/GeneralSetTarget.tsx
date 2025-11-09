"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Textarea } from "@/app/components/ui/textarea";
// import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { GeneralTargetData } from "@/types/target";
import { FaCaretRight } from "react-icons/fa";
import { GeneralTargetSummary } from "./general/GeneralTargetSummary";
import { SuccessModal } from "./SuccessModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { TargetPayload } from "@/types/target/index";
import { useRouter } from "next/navigation";
import { useBaseline } from "@/app/(company)/components/ranking/services";
import CustomTooltip from "./CustomTooltip";
import { TooltipMessage } from "./TooltipMessage";
import { CalculateEmissionPercentage, calculateTotal } from "../utils";

export interface GeneralTargetFormProps {
  data: GeneralTargetData;
  onChange: (data: GeneralTargetData) => void;
  onComplete?: (data: GeneralTargetData) => void;
}

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i);

export default function GeneralTargetForm({ data, onChange, onComplete }: GeneralTargetFormProps) {
  const [step, setStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;

  const router = useRouter();

  const base = useBaseline(companyId);

  const createTarget = useMutation({
    mutationFn: async (targetData: TargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      return await api.post(`/target`, targetData);
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
      // Auto-calculate target emission when percentage changes using actual baseline
      if (processedValue !== null && data.baselineYear && data.targetYear) {
        const baselineEmission = base?.data?.totalSum || 0; // Use actual baseline
        const targetEmission = baselineEmission * (1 - processedValue / 100);
        const totalReduction = baselineEmission * (processedValue / 100);

        onChange({
          ...data,
          reductionPercentage: processedValue,
          targetEmission: Math.round(targetEmission),
          totalReduction: Math.round(totalReduction),
        });
        return;
      }
    }

    if (field === "baselineYear" || field === "targetYear") {
      processedValue = value === "" ? null : Number(value);
    }

    // Handle targetEmission changes from formatted input
    if (field === "targetEmission") {
      processedValue = value === "" ? null : Number(value);
    }

    onChange({
      ...data,
      [field]: processedValue,
    });
  };

  const handleContinue = () => {
    if (step === 0) {
      // Validate required fields before proceeding
      // if (data.reductionPercentage && data.baselineYear && data.targetYear) {
      setStep(1);
      // }
    }
  };

  const handlePrevious = () => {
    setStep(0);
  };

  const handleSetTarget = async () => {
    const uniqueName = `Carbon Target ${base?.data?.startYear}-${data.targetYear}`;
    try {
      // Prepare the target payload
      const targetPayload: TargetPayload = {
        name: data.name || uniqueName,
        type: "GENERAL",
        description: data.description || "General emissions reduction target",
        baselineYear: Number(base?.data?.startYear),
        targetYear: data.targetYear!,
        reductionPercentage: data.reductionPercentage || 0,
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

  const yearDifference =
    data && base?.data?.startYear ? (base.data.startYear ?? 0) - (data.targetYear ?? 0) : 0;

 
  const reduction = calculateTotal(
    base?.data?.totalSum,
    CalculateEmissionPercentage(
      data.reductionPercentage ?? 0,
      base?.data?.totalSum
    )
  )
  const annualRate = (+reduction / yearDifference).toFixed(3);

  // const totalReduction = Math.abs(
  //   CalculateEmissionPercentage(data.reductionPercentage ?? 0, base?.data?.totalSum) /
  //   yearDifference
  // );

  const handleModalContinue = () => {
    // Close the modal
    setIsSuccessModalOpen(false);

    // You can add additional logic here for what happens after modal "Continue"
    // For example: reset the form, navigate away, etc.
    router.push("/ranking");
    console.log("Modal continue clicked - target setup complete!");
  };

  // console.log("DT", totalReduction);

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Calculate dynamic values for display
  const calculatedTargetEmission = data?.reductionPercentage
    ? base?.data?.totalSum * (1 - data?.reductionPercentage / 100)
    : 0;

  return (
    <>
      {step === 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="text-lg">General Reduction Target</div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Set your overall emissions reduction target across all scopes
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reductionPercentage" className="">Reduction Percentage (%) <CustomTooltip detail={<TooltipMessage title={"Reduction Percentage"} message={"The amount you aim to reduce your emissions by, compared to your baseline year (e.g., 20% reduction)."} />} /> </Label>
                  <Input
                    id="reductionPercentage"
                    type="number"
                    placeholder="e.g. 30"
                    value={data?.reductionPercentage ?? ""}
                    onChange={(e) => handleInputChange("reductionPercentage", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baselineYear">Baseline Year <CustomTooltip detail={<TooltipMessage title={"Baseline Year"} message={"The reference year used to measure progress — typically the year you first started tracking emissions."} />} /> </Label>
                  <select
                    id="baselineYear"
                    disabled
                    value={base?.data?.startYear ?? ""}
                    // onChange={(e) => handleInputChange("baselineYear", e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetYear">Target Year <CustomTooltip detail={<TooltipMessage title={"Target Year"} message={"The year by which your company plans to achieve the set reduction goal."} />} /></Label>
                  <select
                    id="targetYear"
                    value={data?.targetYear ?? ""}
                    onChange={(e) => handleInputChange("targetYear", e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select year</option>
                    {years
                      .filter((year) => year >= (base?.data?.startYear ?? currentYear)) // 👈 filter from baseline year
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
                    Baseline ({base?.data?.startYear}){" "}
                  </Label>
                  <div className="text-sm text-gray-900 font-semibold">
                    {" "}
                    {base?.data?.totalSum} tCO₂e
                  </div>
                </div>
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label className="flex items-center">
                    Target: ({data?.targetYear || 0})
                    <CustomTooltip
                      detail={
                        <TooltipMessage
                          title={"Target"}
                          message={`This shows the company's emission goal 
                      for the target year (${data?.targetYear}) after applying the emissions's reduction percentage. A 20% reduction from the
                      baseline of 26,830 means: 26,830 * (1 - reduction %/100) = 21,464 tCO₂e. Your own results to: ${CalculateEmissionPercentage(data?.reductionPercentage ?? 0, base?.data?.totalSum)} tCO₂e`}
                        />
                      }
                    />{" "}
                  </Label>
                  <div className="text-sm text-primary font-semibold">
                    {CalculateEmissionPercentage(
                      data.reductionPercentage ?? 0,
                      base?.data?.totalSum
                    )}{" "}
                    tCO₂e
                  </div>
                </div>
                <hr className="text-gray-300" />
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>
                    Total Reduction:{" "}
                    <CustomTooltip
                      detail={
                        <TooltipMessage
                          title={"Total"}
                          message={`The total (displayed as –5,366 tCO₂e) represents the amount of emissions the company needs to cut to reach its target.

It is calculated as:Target – Baseline = 21,464 – 26,830 = –5,366 tCO₂e.

The negative sign (in red) indicates a reduction in emissions.`}
                        />
                      }
                    />
                  </Label>
                  <div className="text-sm text-red-500 font-semibold">
                    {calculateTotal(
                      base?.data?.totalSum,
                      CalculateEmissionPercentage(
                        data.reductionPercentage ?? 0,
                        base?.data?.totalSum
                      )
                    )}{" "}
                    tCO₂e
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
              disabled={!data?.reductionPercentage || !base?.data?.startYear || !data?.targetYear}
            >
              Continue
            </CustomButton>
          </div>
        </div>
      )}

      {step === 1 &&
        (base.isLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <div className="text-lg text-gray-600">Calculating your target summary...</div>
              </div>
            </CardContent>
          </Card>
        ) : base.error ? (
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
            annualRate={Number(annualRate)}
            reductionPercentage={data?.reductionPercentage || 0}
            baselineEmission={base?.data?.totalSum ?? 0}
            targetEmission={calculatedTargetEmission ?? 0}
            targetYear={data?.targetYear ?? 0}
            baselineYear={base?.data?.startYear || 0}
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
    </>
  );
}
