/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Textarea } from "@/app/components/ui/textarea";
import { GeneralTargetData } from "@/types/target";
import { FaCaretRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useBaseline } from "@/app/(company)/components/ranking/services";
import CustomTooltip from "./CustomTooltip";
import { TooltipMessage } from "./TooltipMessage";
import { CalculateEmissionPercentage, calculateTotal } from "../utils";
import { formatNumberWithCommas } from "@/app/(company)/reports-and-analytics/components/utils/helpers";
import { EmissionDataResponse } from "../type";
import { useAuth } from "@/context/AuthContext";

export interface GeneralTargetFormProps {
  data: GeneralTargetData;
  onChange: (data: GeneralTargetData) => void;
  onComplete?: (data: GeneralTargetData) => void;
}

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i);

export default function GeneralTargetForm({ data, onChange, onComplete }: GeneralTargetFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const companyId = user?.company?.id;

  const [emissionData, setEmissionData] = useState<EmissionDataResponse>({
    startYear: 0,
    endYear: 0,
    totals: {
      total: 0,
      scope1: 0,
      scope2: 0,
      scope3: 0,
    },
  });

  const base = useBaseline(companyId);

  useEffect(() => {
    if (base.isSuccess) {
      setEmissionData(base?.data);
    }
  }, [base.isSuccess, base.data]);

  const handleInputChange = (field: keyof GeneralTargetData, value: string | number) => {
    let processedValue: any = value;

    if (field === "reductionPercentage") {
      processedValue = value === "" ? null : Number(value);
      if (processedValue !== null && data.baselineYear && data.targetYear) {
        const baselineEmission = emissionData?.totals?.total || 0;
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

    if (field === "targetEmission") {
      processedValue = value === "" ? null : Number(value);
    }

    onChange({
      ...data,
      [field]: processedValue,
    });
  };

  // In your form component's handleContinue function:
  const handleContinue = () => {
    if (data.reductionPercentage && base?.data?.startYear && data.targetYear) {
      // Calculate target emission (same calculation)
      const calculatedTargetEmission = data?.reductionPercentage
        ? emissionData?.totals?.total * (1 - data?.reductionPercentage / 100)
        : 0;

      console.log("Saving to localStorage:", {
        // Debug log
        reductionPercentage: data.reductionPercentage,
        baselineEmission: emissionData?.totals?.total,
        calculatedTargetEmission: calculatedTargetEmission,
      });

      // Save to localStorage
      const storageData = {
        ...data,
        targetEmission: calculatedTargetEmission, // Make sure this is included
        baselineEmission: emissionData?.totals?.total ?? 0,
        baselineYear: base.data.startYear || 0,
      };

      localStorage.setItem("generalTargetSummary", JSON.stringify(storageData));

      router.push("/kpis/create/summary");
    }
  };

  // Calculate values for display (same as original)
  const calculatedTargetEmission = data?.reductionPercentage
    ? emissionData?.totals?.total * (1 - data?.reductionPercentage / 100)
    : 0;

  const totalRed = calculateTotal(
    emissionData?.totals?.total,
    CalculateEmissionPercentage(data.reductionPercentage ?? 0, emissionData?.totals?.total)
  );

  const yearDifference =
    data && base?.data?.startYear
      ? Math.abs((base.data.startYear ?? 0) - (data.targetYear ?? 0))
      : 0;

  const reduction = calculateTotal(
    emissionData?.totals?.total,
    CalculateEmissionPercentage(data.reductionPercentage ?? 0, emissionData?.totals?.total)
  );

  const annualRate = yearDifference > 0 ? (+reduction / yearDifference).toFixed(3) : "0";

  return (
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
              <Label htmlFor="reductionPercentage" className="">
                Reduction Percentage (%){" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Reduction Percentage"}
                      message={
                        "The amount you aim to reduce your emissions by, compared to your baseline year (e.g., 20% reduction)."
                      }
                    />
                  }
                />{" "}
              </Label>
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
              <Label htmlFor="baselineYear">
                Baseline Year{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Baseline Year"}
                      message={
                        "The reference year used to measure progress — typically the year you first started tracking emissions."
                      }
                    />
                  }
                />{" "}
              </Label>
              <select
                id="baselineYear"
                disabled
                value={base?.data?.startYear ?? ""}
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
              <Label htmlFor="targetYear">
                Target Year{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Target Year"}
                      message={
                        "The year by which your company plans to achieve the set reduction goal."
                      }
                    />
                  }
                />
              </Label>
              <select
                id="targetYear"
                value={data?.targetYear ?? ""}
                onChange={(e) => handleInputChange("targetYear", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years
                  .filter((year) => year >= (base?.data?.startYear ?? currentYear))
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
                Baseline ({emissionData?.startYear})
              </Label>
              <div className="text-sm text-gray-900 font-semibold">
                {formatNumberWithCommas(emissionData?.totals?.total)} tCO₂e
              </div>
            </div>
            <div className="space-y-2 flex items-center justify-between w-full">
              <Label className="flex items-center">
                Target: ({data?.targetYear || 0})
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Target"}
                      message={`This shows the company's emission goal for the target year (${data?.targetYear}) after applying the emissions's reduction percentage.`}
                    />
                  }
                />
              </Label>
              {data.reductionPercentage && data.reductionPercentage > 0 && (
                <div className="text-sm text-primary font-semibold">
                  {formatNumberWithCommas(
                    CalculateEmissionPercentage(
                      data.reductionPercentage ?? 0,
                      emissionData?.totals?.total
                    )
                  )}
                  tCO₂e
                </div>
              )}
            </div>
            <hr className="text-gray-300" />
            <div className="space-y-2 flex items-center justify-between w-full">
              <Label>
                Total Reduction:{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Total"}
                      message={`The total represents the amount of emissions the company needs to cut to reach its target.`}
                    />
                  }
                />
              </Label>
              <div className="text-sm text-red-500 font-semibold">
                {formatNumberWithCommas(totalRed)}
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
  );
}
