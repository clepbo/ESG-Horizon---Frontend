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
import { EmissionDataResponse, ScopeTargetData } from "../type";
import { calculateTimelineYear, toShortMonth } from "../utils";
import CustomTooltip from "./CustomTooltip";
import { years } from "./GeneralSetTarget";
import { TooltipMessage } from "./TooltipMessage";
import { Target } from "@/app/(company)/components/types/target";
import { Info } from "lucide-react";

interface SetTargetByScopeProps {
  existingTarget?: Target | null;
  onComplete?: (data: any) => void;
}

export default function SetTargetByScope({ existingTarget, onComplete }: SetTargetByScopeProps) {
  const isEdit = !!existingTarget;
  const didPrepopulate = useRef(false);

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
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
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

  // Prepopulate scope data from existing target when editing
  useEffect(() => {
    if (!existingTarget || !existingTarget.scopeTargets?.length || didPrepopulate.current) return;
    didPrepopulate.current = true;

    const findScope = (name: string) =>
      existingTarget.scopeTargets.find((st) => st.scope === name);

    const s1 = findScope("SCOPE1");
    const s2 = findScope("SCOPE2");
    const s3 = findScope("SCOPE3");

    setScopeTargetData({
      scope1: {
        reductionPercentage: s1?.reductionPercentage ?? null,
        baselineYear: s1?.baselineYear ?? existingTarget.baselineYear ?? null,
        targetYear: s1?.targetYear ?? existingTarget.targetYear ?? null,
        description: existingTarget.description ?? "",
        targetEmission: s1?.targetEmission ?? null,
        totalReduction: (s1?.baselineYearEmission ?? 0) - (s1?.targetEmission ?? 0),
      },
      scope2: {
        reductionPercentage: s2?.reductionPercentage ?? null,
        baselineYear: s2?.baselineYear ?? existingTarget.baselineYear ?? null,
        targetYear: s2?.targetYear ?? existingTarget.targetYear ?? null,
        description: "",
        targetEmission: s2?.targetEmission ?? null,
        totalReduction: (s2?.baselineYearEmission ?? 0) - (s2?.targetEmission ?? 0),
      },
      scope3: {
        reductionPercentage: s3?.reductionPercentage ?? null,
        baselineYear: s3?.baselineYear ?? existingTarget.baselineYear ?? null,
        targetYear: s3?.targetYear ?? existingTarget.targetYear ?? null,
        description: "",
        targetEmission: s3?.targetEmission ?? null,
        totalReduction: (s3?.baselineYearEmission ?? 0) - (s3?.targetEmission ?? 0),
      },
    });
  }, [existingTarget]);

  const scope1TargetYear = scopeTargetData.scope1.targetYear ?? null;
  const isOptionDisabled = useCallback(
    (option: BaselineOption): boolean => {
      if (scope1TargetYear == null || typeof scope1TargetYear !== "number") return false;
      const baselineYear = Number(option.startYear) || 0;
      // Only check overlap against other SCOPE targets — GENERAL and SCOPE are independent
      return existingTargets
        .filter((t: CompanyTargetSummary) => t.type === "SCOPE")
        .some((t: CompanyTargetSummary) => {
          if (isEdit && t.id === existingTarget?.id) return false;
          return targetRangesOverlap(baselineYear, scope1TargetYear, t.baselineYear, t.targetYear);
        });
    },
    [scope1TargetYear, existingTargets, isEdit, existingTarget?.id]
  );
  const getOverlapLabel = useCallback(
    (option: BaselineOption): string => {
      if (scope1TargetYear == null || typeof scope1TargetYear !== "number") return "";
      const baselineYear = Number(option.startYear) || 0;
      const overlapping = existingTargets.find((t: CompanyTargetSummary) => {
        if (isEdit && t.id === existingTarget?.id) return false;
        return targetRangesOverlap(baselineYear, scope1TargetYear, t.baselineYear, t.targetYear);
      });
      return overlapping ? ` (overlaps ${overlapping.baselineYear}–${overlapping.targetYear})` : "";
    },
    [scope1TargetYear, existingTargets, isEdit, existingTarget?.id]
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

  // Show prerequisite modal when baseline data cannot support target creation
  useEffect(() => {
    if (!baselineOptionsQuery.isSuccess) return;

    // No baseline options available at all
    if (!baselineOptionsQuery.data?.length) {
      setShowPrerequisiteModal(true);
      return;
    }

    // Baseline loaded but has no scoped emissions (startYear > 0 ensures sync completed)
    if (
      selectedBaselineId &&
      baselineByScope.isSuccess &&
      emissionData.startYear > 0 &&
      !emissionData.ghg_total_emissions
    ) {
      setShowPrerequisiteModal(true);
    }
  }, [
    baselineOptionsQuery.isSuccess,
    baselineOptionsQuery.data,
    selectedBaselineId,
    baselineByScope.isSuccess,
    emissionData.startYear,
    emissionData.ghg_total_emissions,
  ]);

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
        // Pass edit info so scope summary page knows to PATCH
        ...(isEdit && existingTarget ? { targetId: existingTarget.id } : {}),
      };

      if (onComplete) {
        // BOTH mode — pass data up to TargetSetting, skip navigation
        onComplete(scopeSummaryData);
      } else {
        localStorage.setItem("scopeTargetSummary", JSON.stringify(scopeSummaryData));
        router.push("/kpis/create/scope-summary");
      }
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
              <Label htmlFor={`${scope}-baselineYear`}>
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
                    id={`${scope}-baselineYear`}
                    type="number"
                    value={emissionData?.startYear || ""}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed"
                  />
                  {scope === "scope1" && (() => {
                    const sel = baselineOptionsQuery.data?.find(
                      (o: BaselineOption) => o.assessmentId === selectedBaselineId
                    );
                    if (!sel?.submittedAt && !sel?.approvedAt) return null;
                    const fmt = (v: string) =>
                      new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                    return (
                      <p className="text-xs text-gray-500 mt-1">
                        {sel.submittedAt && <>Submitted: {fmt(sel.submittedAt)}</>}
                        {sel.submittedAt && sel.approvedAt && <> &middot; </>}
                        {sel.approvedAt && <span className="text-green-600">Approved: {fmt(sel.approvedAt)}</span>}
                      </p>
                    );
                  })()}
                </>
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
              <Select
                value={scopeData.targetYear?.toString() ?? ""}
                onValueChange={(val) => handleScopeInputChange(scope, "targetYear", val)}
              >
                <SelectTrigger id={`${scope}-targetYear`} className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years
                    .filter((year) => year >= Number(emissionData?.startYear))
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

      {/* Prerequisite modal — shown when baseline data is missing or has no emissions */}
      {showPrerequisiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 space-y-4 text-center">
            <Info className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">Baseline Data Required</h2>
            <p className="text-gray-600 text-sm">
              To set scope-based reduction targets, you need a completed baseline assessment
              with calculated emissions data. Please ensure the following are in place:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-1 pl-4">
              <li>&#x2022; At least one approved assessment</li>
              <li>&#x2022; Emissions data calculated per scope (total &gt; 0 tCO₂e)</li>
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
