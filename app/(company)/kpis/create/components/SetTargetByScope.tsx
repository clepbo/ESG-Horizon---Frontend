/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { formatWithCommas } from "@/app/(company)/components/ranking/FormatNumberFigures";
import {
  useBaselineByScope,
  useBaselineOptions,
  useCompanyTargets,
} from "@/app/(company)/components/ranking/services";
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
import { EmissionDataResponse, ScopeTargetData } from "../type";
import { calculateTimelineYear, toShortMonth } from "../utils";
import CustomTooltip from "./CustomTooltip";
import { years } from "./GeneralSetTarget";
import { TooltipMessage } from "./TooltipMessage";

export default function SetTargetByScope() {
  const [scopeTargetData, setScopeTargetData] = useState<ScopeTargetData>({
    scope1: {
      reductionPercentage: null,
      baselineYear: null,
      targetYear: null,
      description: "",
      targetEmission: null,
      totalReduction: null,
    },
    scope2: {
      reductionPercentage: null,
      baselineYear: null,
      targetYear: null,
      description: "",
      targetEmission: null,
      totalReduction: null,
    },
    scope3: {
      reductionPercentage: null,
      baselineYear: null,
      targetYear: null,
      description: "",
      targetEmission: null,
      totalReduction: null,
    },
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedBaselineId, setSelectedBaselineId] = useState<number | null>(null);
  const [emissionData, setEmissionData] = useState<EmissionDataResponse>({
    startYear: 0,
    endYear: 0,
    ghg_scope_one: 0,
    ghg_scope_two: 0,
    ghg_scope_three: 0,
    ghg_total_emissions: 0,
  });

  const router = useRouter();
  const { user } = useAuth();
  const companyId = user?.company?.id;

  const baselineOptionsQuery = useBaselineOptions(companyId);
  const baselineByScope = useBaselineByScope(companyId, selectedBaselineId ?? undefined);
  const companyTargetsQuery = useCompanyTargets(companyId);
  const base: EmissionDataResponse | undefined = baselineByScope?.data;
  const existingTargets = useMemo(() => companyTargetsQuery.data ?? [], [companyTargetsQuery.data]);

  const scope1TargetYear = scopeTargetData.scope1.targetYear ?? null;
  const isOptionDisabled = useCallback(
    (option: BaselineOption): boolean => {
      if (scope1TargetYear == null || typeof scope1TargetYear !== "number") return false;
      const baselineYear = Number(option.startYear) || 0;
      return existingTargets.some((t: CompanyTargetSummary) =>
        targetRangesOverlap(baselineYear, scope1TargetYear, t.baselineYear, t.targetYear)
      );
    },
    [scope1TargetYear, existingTargets]
  );
  const getOverlapLabel = useCallback(
    (option: BaselineOption): string => {
      if (scope1TargetYear == null || typeof scope1TargetYear !== "number") return "";
      const baselineYear = Number(option.startYear) || 0;
      const overlapping = existingTargets.find((t: CompanyTargetSummary) =>
        targetRangesOverlap(baselineYear, scope1TargetYear, t.baselineYear, t.targetYear)
      );
      return overlapping ? ` (overlaps ${overlapping.baselineYear}–${overlapping.targetYear})` : "";
    },
    [scope1TargetYear, existingTargets]
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
    scope1TargetYear,
    companyTargetsQuery.data,
    isOptionDisabled,
  ]);

  // Update scoped emissions when the selected baseline changes
  useEffect(() => {
    if (baselineByScope.isSuccess && base) {
      setEmissionData(base);
    }
  }, [baselineByScope.isSuccess, base]);

  // Set default baseline year from API if available for all scopes
  useEffect(() => {
    if (emissionData?.startYear) {
      setScopeTargetData((prev) => ({
        scope1: {
          ...prev.scope1,
          baselineYear: prev.scope1.baselineYear || emissionData.startYear,
        },
        scope2: {
          ...prev.scope2,
          baselineYear: prev.scope2.baselineYear || emissionData.startYear,
        },
        scope3: {
          ...prev.scope3,
          baselineYear: prev.scope3.baselineYear || emissionData.startYear,
        },
      }));
    }
  }, [emissionData?.startYear]);

  const handleScopeInputChange = (
    scope: keyof ScopeTargetData,
    field: keyof GeneralTargetData,
    value: string | number
  ) => {
    let processedValue: any = value;

    if (field === "reductionPercentage") {
      processedValue = value === "" ? null : Number(value);
      // Auto-calculate target emission when percentage changes using scope-specific baseline
      if (processedValue !== null) {
        const scopeBaselineEmission = getScopeBaselineEmission(scope);
        const targetEmission = scopeBaselineEmission * (1 - processedValue / 100);
        const totalReduction = scopeBaselineEmission - targetEmission;

        setScopeTargetData((prev) => ({
          ...prev,
          [scope]: {
            ...prev[scope],
            reductionPercentage: processedValue,
            targetEmission: Math.round(targetEmission),
            totalReduction: Math.round(totalReduction),
          },
        }));
        return;
      }
    }

    if (field === "baselineYear" || field === "targetYear") {
      processedValue = value === "" ? null : Number(value);
    }

    if (field === "targetEmission") {
      processedValue = value === "" ? null : Number(value);
    }

    setScopeTargetData((prev) => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [field]: processedValue,
      },
    }));
  };

  // Get baseline data for each scope
  const getScopeBaselineEmission = (scope: "scope1" | "scope2" | "scope3"): number => {
    switch (scope) {
      case "scope1":
        return emissionData?.ghg_scope_one || 0;
      case "scope2":
        return emissionData?.ghg_scope_two || 0;
      case "scope3":
        return emissionData?.ghg_scope_three || 0;
      default:
        return 0;
    }
  };

  const handleContinue = () => {
    // Validate required fields for scopes 1 and 2 before proceeding
    const isScope1Valid =
      scopeTargetData.scope1.reductionPercentage &&
      scopeTargetData.scope1.baselineYear &&
      scopeTargetData.scope1.targetYear;
    const isScope2Valid =
      scopeTargetData.scope2.reductionPercentage &&
      scopeTargetData.scope2.baselineYear &&
      scopeTargetData.scope2.targetYear;

    if (isScope1Valid && isScope2Valid) {
      // Calculate all scope data for storage
      const scopeSummaryData = {
        scopeTargetData,
        emissionData: {
          startYear: emissionData?.startYear,
          endYear: emissionData?.endYear,
          totals: {
            total: emissionData?.ghg_total_emissions || 0,
            scope1: emissionData?.ghg_scope_one || 0,
            scope2: emissionData?.ghg_scope_two || 0,
            scope3: emissionData?.ghg_scope_three || 0,
          },
        },
        baselineSelection: (() => {
          const selected =
            baselineOptionsQuery.data?.find(
              (option: BaselineOption) => option.assessmentId === selectedBaselineId
            ) ?? null;
          if (!selected) return null;
          return {
            baselineAssessmentId: selected.assessmentId,
            baselineYear: Number(selected.startYear) || emissionData?.startYear,
            baselinePeriodLabel: `${toShortMonth(selected.startMonth)} ${selected.startYear} – ${toShortMonth(selected.endMonth)} ${selected.endYear}`,
          };
        })(),
        calculations: {
          scope1: {
            targetEmission: calculateScopeTargetEmission("scope1"),
            totalReduction: calculateScopeTotalReduction("scope1"),
            timeline: calculateTimelineYear(
              emissionData?.startYear,
              scopeTargetData.scope1.targetYear ?? emissionData?.startYear
            ),
            annualRate: calculateScopeAnnualRate("scope1"),
          },
          scope2: {
            targetEmission: calculateScopeTargetEmission("scope2"),
            totalReduction: calculateScopeTotalReduction("scope2"),
            timeline: calculateTimelineYear(
              emissionData?.startYear,
              scopeTargetData.scope2.targetYear ?? emissionData?.startYear
            ),
            annualRate: calculateScopeAnnualRate("scope2"),
          },
          scope3: {
            targetEmission: calculateScopeTargetEmission("scope3"),
            totalReduction: calculateScopeTotalReduction("scope3"),
            timeline: calculateTimelineYear(
              emissionData?.startYear,
              scopeTargetData.scope3.targetYear ?? emissionData?.startYear
            ),
            annualRate: calculateScopeAnnualRate("scope3"),
          },
        },
      };

      // Save to localStorage
      localStorage.setItem("scopeTargetSummary", JSON.stringify(scopeSummaryData));

      // Navigate to scope summary page
      router.push("/kpis/create/scope-summary");
    }
  };

  // Helper functions for calculations
  const calculateScopeTargetEmission = (scope: "scope1" | "scope2" | "scope3"): number => {
    const reductionPercentage = scopeTargetData[scope]?.reductionPercentage;
    const baselineEmission = getScopeBaselineEmission(scope);
    return reductionPercentage ? baselineEmission * (1 - reductionPercentage / 100) : 0;
  };

  const calculateScopeTotalReduction = (scope: "scope1" | "scope2" | "scope3"): number => {
    const baselineEmission = getScopeBaselineEmission(scope);
    const targetEmission = calculateScopeTargetEmission(scope);
    return baselineEmission - targetEmission;
  };

  const calculateScopeAnnualRate = (scope: "scope1" | "scope2" | "scope3"): number => {
    const totalReduction = calculateScopeTotalReduction(scope);
    const timeline = calculateTimelineYear(
      emissionData?.startYear,
      scopeTargetData[scope]?.targetYear ?? emissionData?.startYear
    );
    return Number(timeline) > 0 ? totalReduction / Number(timeline) : 0;
  };

  // Render individual scope card
  const renderScopeCard = (
    scope: "scope1" | "scope2" | "scope3",
    title: string,
    description: string
  ) => {
    const scopeData = scopeTargetData[scope];
    const baselineEmission = getScopeBaselineEmission(scope);
    const targetEmission = calculateScopeTargetEmission(scope);
    const totalReduction = calculateScopeTotalReduction(scope);

    return (
      <Card key={scope}>
        <CardHeader>
          <div className="text-lg">{title}</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">{description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${scope}-reductionPercentage`}>
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
                id={`${scope}-reductionPercentage`}
                type="number"
                placeholder="e.g. 30"
                value={scopeData?.reductionPercentage ?? ""}
                onChange={(e) =>
                  handleScopeInputChange(scope, "reductionPercentage", e.target.value)
                }
                onWheel={(e) => e.currentTarget.blur()}
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
                        "Choose which completed assessment period to use as your baseline for these scope targets."
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
              <Label htmlFor={`${scope}-targetYear`}>
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
                />{" "}
              </Label>
              <select
                id={`${scope}-targetYear`}
                value={scopeData.targetYear ?? ""}
                onChange={(e) => handleScopeInputChange(scope, "targetYear", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years
                  .filter((year) => year >= Number(emissionData?.startYear))
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${scope}-description`}>Description (Optional)</Label>
            <Textarea
              id={`${scope}-description`}
              placeholder="Describe your scope-based reduction strategy..."
              value={scopeData.description}
              onChange={(e) => handleScopeInputChange(scope, "description", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>

        <div>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Target Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 w-full">
            <div className="flex flex-col w-full gap-2">
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label className="flex items-center gap-1">
                  Baseline ({emissionData?.startYear || "N/A"})
                </Label>
                <div className="text-sm text-gray-900 font-semibold">
                  {formatWithCommas(baselineEmission)} tCO₂e
                </div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label className="flex items-center">
                  Target: ({scopeData.targetYear || 0})
                  <CustomTooltip
                    detail={
                      <TooltipMessage
                        title={"Target"}
                        message={`This shows the company's emission goal for the target year (${scopeData.targetYear}) after applying the emissions's reduction percentage.`}
                      />
                    }
                  />{" "}
                </Label>
                {targetEmission > 0 && (
                  <div className="text-sm text-primary font-semibold">
                    {formatWithCommas(targetEmission)} tCO₂e
                  </div>
                )}
              </div>
              <hr className="text-gray-300" />
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>
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
                  -{formatWithCommas(totalReduction)} tCO₂e
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {baselineByScope.isLoading && (
        <div className="text-center py-4">Loading baseline data...</div>
      )}
      {baselineByScope.isError && (
        <div className="text-center py-4 text-red-500">Error loading baseline data</div>
      )}

      {renderScopeCard(
        "scope1",
        "Scope 1 Target",
        "Direct emissions from owned or controlled sources"
      )}
      {renderScopeCard("scope2", "Scope 2 Target", "Indirect emission from purchased energy")}
      {renderScopeCard("scope3", "Scope 3 Target", "All other indirect emissions in value chain")}

      <div className="flex justify-center">
        <CustomButton
          icon={<FaCaretRight />}
          onClick={handleContinue}
          className="text-white px-6 py-2"
          disabled={
            !scopeTargetData.scope1.reductionPercentage ||
            !scopeTargetData.scope1.baselineYear ||
            !scopeTargetData.scope1.targetYear ||
            !scopeTargetData.scope2.reductionPercentage ||
            !scopeTargetData.scope2.baselineYear ||
            !scopeTargetData.scope2.targetYear ||
            !selectedBaselineId ||
            baselineByScope.isLoading
          }
        >
          {baselineByScope.isLoading ? "Loading Baseline..." : "Continue"}
        </CustomButton>
      </div>
    </div>
  );
}
