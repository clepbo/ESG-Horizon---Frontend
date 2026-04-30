/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useBaselineOptions, useCompanyTargets } from "@/app/(company)/components/ranking/services";
import { formatNumberWithCommas } from "@/app/(company)/reports-and-analytics/components/utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { GeneralTargetData } from "@/types/target";
import { BaselineOption, CompanyTargetSummary, targetRangesOverlap } from "@/types/target/index";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { EmissionDataResponseGeneral } from "../type";
import { CalculateEmissionPercentage, calculateTotal, toShortMonth } from "../utils";
import CustomTooltip from "./CustomTooltip";
import { TooltipMessage } from "./TooltipMessage";
import { Target } from "@/app/(company)/components/types/target";
import { Info } from "lucide-react";

export interface GeneralTargetFormProps {
  data: GeneralTargetData;
  onChange: (data: GeneralTargetData) => void;
  onComplete?: (data: GeneralTargetData) => void;
  existingTarget?: Target | null;
}

const currentYear = new Date().getFullYear();
export const years = Array.from(
  { length: 2060 - (currentYear - 10) + 1 },
  (_, i) => currentYear - 10 + i
);

export default function GeneralTargetForm({
  data,
  onChange,
  onComplete,
  existingTarget,
}: GeneralTargetFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const companyId = user?.company?.id;

  const isEdit = !!existingTarget;
  const didPrepopulate = useRef(false);

  const [selectedBaselineId, setSelectedBaselineId] = useState<number | null>(null);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [emissionData, setEmissionData] = useState<EmissionDataResponseGeneral>({
    startYear: 0,
    endYear: 0,
    totals: 0,
  });

  const baselineOptionsQuery = useBaselineOptions(companyId);
  const companyTargetsQuery = useCompanyTargets(companyId);
  const existingTargets = useMemo(() => companyTargetsQuery.data ?? [], [companyTargetsQuery.data]);

  // Prepopulate form from existing target when editing
  useEffect(() => {
    if (!existingTarget || !existingTarget.generalTarget || didPrepopulate.current) return;
    didPrepopulate.current = true;

    const gt = existingTarget.generalTarget;
    onChange({
      reductionPercentage: gt.reductionPercentage ?? null,
      baselineYear: existingTarget.baselineYear ?? null,
      targetYear: existingTarget.targetYear ?? null,
      description: existingTarget.description ?? "",
      targetEmission: gt.targetEmission ?? null,
      totalReduction: (gt.baselineYearEmission ?? 0) - (gt.targetEmission ?? 0),
    });
  }, [existingTarget, onChange]);

  const targetYear = data?.targetYear ?? null;
  const isOptionDisabled = useCallback(
    (option: BaselineOption): boolean => {
      if (!targetYear || typeof targetYear !== "number") return false;
      const baselineYear = Number(option.startYear) || 0;
      // Only check overlap against other GENERAL targets — GENERAL and SCOPE are independent
      return existingTargets
        .filter((t: CompanyTargetSummary) => t.type === "GENERAL")
        .some((t: CompanyTargetSummary) => {
          if (isEdit && t.id === existingTarget?.id) return false;
          return targetRangesOverlap(baselineYear, targetYear, t.baselineYear, t.targetYear);
        });
    },
    [targetYear, existingTargets, isEdit, existingTarget?.id]
  );
  const getOverlapLabel = useCallback(
    (option: BaselineOption): string => {
      if (!targetYear || typeof targetYear !== "number") return "";
      const baselineYear = Number(option.startYear) || 0;
      const overlapping = existingTargets
        .filter((t: CompanyTargetSummary) => t.type === "GENERAL")
        .find((t: CompanyTargetSummary) => {
          if (isEdit && t.id === existingTarget?.id) return false;
          return targetRangesOverlap(baselineYear, targetYear, t.baselineYear, t.targetYear);
        });
      return overlapping ? ` (overlaps ${overlapping.baselineYear}–${overlapping.targetYear})` : "";
    },
    [targetYear, existingTargets, isEdit, existingTarget?.id]
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

  // Show prerequisite modal when baseline data cannot support target creation
  useEffect(() => {
    if (!baselineOptionsQuery.isSuccess) return;

    // No baseline options available at all
    if (!baselineOptionsQuery.data?.length) {
      setShowPrerequisiteModal(true);
      return;
    }

    // Baseline selected but has no emissions (startYear > 0 ensures sync has completed)
    if (selectedBaselineId && emissionData.startYear > 0 && !emissionData.totals) {
      setShowPrerequisiteModal(true);
    }
  }, [
    baselineOptionsQuery.isSuccess,
    baselineOptionsQuery.data,
    selectedBaselineId,
    emissionData.startYear,
    emissionData.totals,
  ]);

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

  const handleContinue = () => {
    if (data.reductionPercentage && selectedBaselineId && emissionData?.totals && data.targetYear) {
      const calculatedTargetEmission = data?.reductionPercentage
        ? emissionData?.totals * (1 - data?.reductionPercentage / 100)
        : 0;

      const selected =
        baselineOptionsQuery.data?.find(
          (option: BaselineOption) => option.assessmentId === selectedBaselineId
        ) ?? null;

      const baselineYear = selected ? Number(selected.startYear) || 0 : emissionData?.startYear;
      const baselineEmission = selected ? selected.totalEmission : (emissionData?.totals ?? 0);
      const baselinePeriodLabel = selected
        ? `${toShortMonth(selected.startMonth)} ${selected.startYear} – ${toShortMonth(selected.endMonth)} ${selected.endYear}`
        : undefined;

      const storageData = {
        ...data,
        targetEmission: calculatedTargetEmission,
        baselineEmission,
        baselineYear: baselineYear || 0,
        baselineAssessmentId: selected?.assessmentId ?? null,
        baselinePeriodLabel,
        // Pass edit info so the summary page knows to PATCH
        ...(isEdit && existingTarget ? { targetId: existingTarget.id } : {}),
      };

      if (onComplete) {
        // BOTH mode — pass data up to TargetSetting, skip navigation
        onComplete(storageData as any);
      } else {
        localStorage.setItem("generalTargetSummary", JSON.stringify(storageData));
        router.push("/kpis/create/summary");
      }
    }
  };

  // Calculate values for display
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
          <div className="text-lg">
            {isEdit ? "Edit General Reduction Target" : "General Reduction Target from KPI"}
          </div>
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
                onWheel={(e) => e.currentTarget.blur()}
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
                        "The reference year from your most recent completed assessment. This is automatically set."
                      }
                    />
                  }
                />
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
                <>
                  <Input
                    id="baselineYear"
                    type="number"
                    value={emissionData?.startYear || ""}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed"
                  />
                  {(() => {
                    const sel = baselineOptionsQuery.data?.find(
                      (o: BaselineOption) => o.assessmentId === selectedBaselineId
                    );
                    if (!sel?.submittedAt && !sel?.approvedAt) return null;
                    const fmt = (v: string) =>
                      new Date(v).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    return (
                      <p className="text-xs text-gray-500 mt-1">
                        {sel.submittedAt && <>Submitted: {fmt(sel.submittedAt)}</>}
                        {sel.submittedAt && sel.approvedAt && <> &middot; </>}
                        {sel.approvedAt && (
                          <span className="text-green-600">Approved: {fmt(sel.approvedAt)}</span>
                        )}
                      </p>
                    );
                  })()}
                </>
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
              <Select
                value={data?.targetYear?.toString() ?? ""}
                onValueChange={(val) => handleInputChange("targetYear", val)}
              >
                <SelectTrigger id="targetYear" className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years
                    .filter((year) => year >= (emissionData?.startYear || currentYear))
                    .map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Baseline"}
                      message={
                        "Total GHG emissions recorded in the baseline year (tCO₂e). This is the reference point for measuring your reduction progress."
                      }
                    />
                  }
                />
              </Label>
              <div className="text-sm text-gray-900 font-semibold">
                {formatNumberWithCommas(emissionData?.totals)} tCO₂e
              </div>
            </div>
            <div className="space-y-2 flex items-center justify-between w-full">
              <Label className="flex items-center gap-1">
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
              <Label className="flex items-center gap-1">
                Total Reduction:
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

      {/* Prerequisite modal — shown when baseline data is missing or has no emissions */}
      {showPrerequisiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 space-y-4 text-center">
            <Info className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">Baseline Data Required</h2>
            <p className="text-gray-600 text-sm">
              To set a reduction target, you need a completed baseline assessment with calculated
              emissions data. Please ensure the following are in place:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-1 pl-4">
              <li>&#x2022; At least one approved assessment</li>
              <li>&#x2022; Emissions data calculated (total &gt; 0 tCO₂e)</li>
              <li>&#x2022; A valid reporting period (baseline year)</li>
            </ul>
            <div className="flex gap-3 justify-center pt-2">
              <CustomButton variant="outlined" onClick={() => setShowPrerequisiteModal(false)}>
                Dismiss
              </CustomButton>
              <CustomButton onClick={() => router.push("/assessments/new-assessment")}>
                Go to Assessments
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
