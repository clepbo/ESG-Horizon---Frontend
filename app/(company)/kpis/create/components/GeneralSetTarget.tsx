/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useBaselineOptions, useCompanyTargets } from "@/app/(company)/components/ranking/services";
import { formatNumberWithCommas } from "@/app/(company)/reports-and-analytics/components/utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Textarea } from "@/app/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { GeneralTargetData } from "@/types/target";
import { BaselineOption, CompanyTargetSummary, targetRangesOverlap } from "@/types/target/index";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { EmissionDataResponseGeneral } from "../type";
import { CalculateEmissionPercentage, calculateTotal, toShortMonth } from "../utils";
import CustomTooltip from "./CustomTooltip";
import { TooltipMessage } from "./TooltipMessage";

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

  const [selectedBaselineId, setSelectedBaselineId] = useState<number | null>(null);
  const [emissionData, setEmissionData] = useState<EmissionDataResponseGeneral>({
    startYear: 0,
    endYear: 0,
    totals: 0,
  });

  const baselineOptionsQuery = useBaselineOptions(companyId);
  const companyTargetsQuery = useCompanyTargets(companyId);
  const existingTargets = useMemo(() => companyTargetsQuery.data ?? [], [companyTargetsQuery.data]);

  const targetYear = data?.targetYear ?? null;
  const isOptionDisabled = useCallback(
    (option: BaselineOption): boolean => {
      if (!targetYear || typeof targetYear !== "number") return false;
      const baselineYear = Number(option.startYear) || 0;
      return existingTargets.some((t: CompanyTargetSummary) =>
        targetRangesOverlap(baselineYear, targetYear, t.baselineYear, t.targetYear)
      );
    },
    [targetYear, existingTargets]
  );
  const getOverlapLabel = useCallback(
    (option: BaselineOption): string => {
      if (!targetYear || typeof targetYear !== "number") return "";
      const baselineYear = Number(option.startYear) || 0;
      const overlapping = existingTargets.find((t: CompanyTargetSummary) =>
        targetRangesOverlap(baselineYear, targetYear, t.baselineYear, t.targetYear)
      );
      return overlapping ? ` (overlaps ${overlapping.baselineYear}–${overlapping.targetYear})` : "";
    },
    [targetYear, existingTargets]
  );

  useEffect(() => {
    if (!baselineOptionsQuery.isSuccess || !baselineOptionsQuery.data?.length) return;
    const options = baselineOptionsQuery.data;
    const firstEnabled = options.find((o) => !isOptionDisabled(o));
    setSelectedBaselineId((current) => {
      if (current !== null) {
        const selected = options.find((o) => o.assessmentId === current);
        if (selected && isOptionDisabled(selected)) return firstEnabled?.assessmentId ?? null;
        return current;
      }
      return firstEnabled?.assessmentId ?? options[0]?.assessmentId ?? null;
    });
  }, [
    baselineOptionsQuery.isSuccess,
    baselineOptionsQuery.data,
    targetYear,
    companyTargetsQuery.data,
    isOptionDisabled,
  ]);

  useEffect(() => {
    if (!baselineOptionsQuery.data || !baselineOptionsQuery.data.length || !selectedBaselineId) {
      return;
    }

    const selected = baselineOptionsQuery.data.find(
      (option: BaselineOption) => option.assessmentId === selectedBaselineId
    );

    if (!selected) return;

    const startYearNumber = Number(selected.startYear) || 0;

    setEmissionData({
      startYear: startYearNumber,
      endYear: Number(selected.endYear) || 0,
      totals: selected.totalEmission ?? 0,
    });

    // Keep the form's baselineYear in sync with the selected baseline assessment
    if (data.baselineYear !== startYearNumber) {
      onChange({
        ...data,
        baselineYear: startYearNumber,
      });
    }
  }, [baselineOptionsQuery.data, selectedBaselineId, data, onChange]);

  console.log("Emission Data in GeneralTargetForm:", emissionData);

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
      const baseEmission = emissionData?.totals || 0;
      const targetEmission = baseEmission * (1 - reduction / 100);
      const totalReduction = baseEmission * (reduction / 100);
      updated.targetEmission = Math.round(targetEmission);
      updated.totalReduction = Math.round(totalReduction);
    }

    onChange(updated);
  };

  // In your form component's handleContinue function:
  const handleContinue = () => {
    if (data.reductionPercentage && selectedBaselineId && emissionData?.totals && data.targetYear) {
      // Calculate target emission (same calculation)
      const calculatedTargetEmission = data?.reductionPercentage
        ? emissionData?.totals * (1 - data?.reductionPercentage / 100)
        : 0;

      console.log("Saving to localStorage:", {
        // Debug log
        reductionPercentage: data.reductionPercentage,
        baselineEmission: emissionData?.totals,
        calculatedTargetEmission: calculatedTargetEmission,
      });

      const selected =
        baselineOptionsQuery.data?.find(
          (option: BaselineOption) => option.assessmentId === selectedBaselineId
        ) ?? null;

      const baselineYear = selected ? Number(selected.startYear) || 0 : emissionData?.startYear;
      const baselineEmission = selected ? selected.totalEmission : (emissionData?.totals ?? 0);
      const baselinePeriodLabel = selected
        ? `${toShortMonth(selected.startMonth)} ${selected.startYear} – ${toShortMonth(selected.endMonth)} ${selected.endYear}`
        : undefined;

      // Save to localStorage, including the chosen baseline assessment metadata
      const storageData = {
        ...data,
        targetEmission: calculatedTargetEmission, // Make sure this is included
        baselineEmission,
        baselineYear: baselineYear || 0,
        baselineAssessmentId: selected?.assessmentId ?? null,
        baselinePeriodLabel,
      };

      localStorage.setItem("generalTargetSummary", JSON.stringify(storageData));

      router.push("/kpis/create/summary");
    }
  };

  // Calculate values for display (same as original)
  const calculatedTargetEmission = data?.reductionPercentage
    ? emissionData?.totals * (1 - data?.reductionPercentage / 100)
    : 0;

  const totalRed = calculateTotal(
    emissionData?.totals,
    CalculateEmissionPercentage(data.reductionPercentage ?? 0, emissionData?.totals)
  );

  const baselineYearForDiff = emissionData?.startYear || 0;
  const yearDifference =
    data && baselineYearForDiff ? Math.abs(baselineYearForDiff - (data.targetYear ?? 0)) : 0;

  const reduction = calculateTotal(
    emissionData?.totals,
    CalculateEmissionPercentage(data.reductionPercentage ?? 0, emissionData?.totals)
  );

  const annualRate = yearDifference > 0 ? (+reduction / yearDifference).toFixed(3) : "0";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-lg">General Reduction Target from KPI</div>
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
              <Label htmlFor="baselineAssessment">
                Baseline Assessment{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Baseline Assessment"}
                      message={
                        "Choose which completed assessment period to use as your baseline for this target."
                      }
                    />
                  }
                />{" "}
              </Label>
              {baselineOptionsQuery.isLoading ? (
                <div className="flex h-10 items-center text-sm text-gray-500">
                  Loading baseline options...
                </div>
              ) : !baselineOptionsQuery.data || baselineOptionsQuery.data.length === 0 ? (
                <div className="text-xs text-red-600 space-y-1">
                  <p>No completed assessments with emissions data were found.</p>
                  <Link
                    href="/assessments/new-assessment"
                    className="text-teal-600 underline font-medium hover:text-teal-700"
                  >
                    Go to Assessments
                  </Link>
                </div>
              ) : (
                <select
                  id="baselineAssessment"
                  value={selectedBaselineId ?? ""}
                  onChange={(e) =>
                    setSelectedBaselineId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {baselineOptionsQuery.data.map((option: BaselineOption) => {
                    const disabled = isOptionDisabled(option);
                    const overlapLabel = getOverlapLabel(option);
                    const periodLabel = `${toShortMonth(option.startMonth)} ${option.startYear} – ${toShortMonth(option.endMonth)} ${option.endYear}`;
                    return (
                      <option
                        key={option.assessmentId}
                        value={option.assessmentId}
                        disabled={disabled}
                      >
                        {periodLabel}
                        {overlapLabel}
                      </option>
                    );
                  })}
                </select>
              )}
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
                  .filter((year) => year >= (emissionData?.startYear || currentYear))
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
                Baseline ({emissionData?.startYear || "—"})
              </Label>
              <div className="text-sm text-gray-900 font-semibold">
                {formatNumberWithCommas(emissionData?.totals)} tCO₂e
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
                    CalculateEmissionPercentage(data.reductionPercentage ?? 0, emissionData?.totals)
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
          disabled={
            !data?.reductionPercentage ||
            !selectedBaselineId ||
            !emissionData?.totals ||
            !data?.targetYear
          }
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
}
