import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { GeneralTargetData } from "@/types/target";
import { useEffect, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { years } from "./GeneralSetTarget";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { EmissionDataResponse, ScopeTargetData } from "../type";
import CustomTooltip from "./CustomTooltip";
import { TooltipMessage } from "./TooltipMessage";
import { calculateTimelineYear } from "../utils";
import { useBaseline } from "@/app/(company)/components/ranking/services";
import { formatWithCommas } from "@/app/(company)/components/ranking/FormatNumberFigures";

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

  const router = useRouter();
  const { user } = useAuth();
  const companyId = user?.company?.id;

  const baseline = useBaseline(companyId);
  const base: EmissionDataResponse = baseline?.data;

  useEffect(() => {
    if (baseline.isSuccess) {
      setEmissionData(base);
    }
  }, [baseline.isSuccess, base]);

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
        return emissionData?.totals?.scope1 || 0;
      case "scope2":
        return emissionData?.totals?.scope2 || 0;
      case "scope3":
        return emissionData?.totals?.scope3 || 0;
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
        emissionData,
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
      router.push("/ranking/create/scope-summary");
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
                        "The reference year used to measure progress — typically the year you first started tracking emissions."
                      }
                    />
                  }
                />{" "}
              </Label>
              <select
                id={`${scope}-baselineYear`}
                value={emissionData?.startYear || ""}
                disabled
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
      {baseline.isLoading && <div className="text-center py-4">Loading baseline data...</div>}
      {baseline.isError && (
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
            baseline.isLoading
          }
        >
          {baseline.isLoading ? "Loading Baseline..." : "Continue"}
        </CustomButton>
      </div>
    </div>
  );
}
