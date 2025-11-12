import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { GeneralTargetData } from "@/types/target";
import { useEffect, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { years } from "./GeneralSetTarget";
import { ScopeSummary } from "./scope/ScopeTargetSummary";
import { SuccessModal } from "./SuccessModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { TargetPayload } from "@/types/target/index";
import { useRouter } from "next/navigation";
import { EmissionData } from "../type";
import CustomTooltip from "./CustomTooltip";
import { TooltipMessage } from "./TooltipMessage";
import { CalculateEmissionPercentage, calculateTimelineYear, calculateTotal } from "../utils";

interface ScopeData {
  scope: string;
  timeline: number;
  targetReduction: number;
  annualRate: number;
  reductionPercentage: number;
  baselineYear: number;
  targetYear: number;
  description: string;
  targetEmission: number;
  totalReduction: number;
}

interface ScopeTargetData {
  scope1: GeneralTargetData;
  scope2: GeneralTargetData;
  scope3: GeneralTargetData;
}

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
  const [step, setStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;

  const baseline = useQuery({
    queryKey: ["baseline", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const res = await api.get(`/target/baseline-scope/${companyId}`);
      return res;
    },
    enabled: !!companyId,
  });

  const base: EmissionData = baseline?.data;

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

  // console.log("BASELINE", baseline.data)
  // Get baseline data from the query
  const baselineData = baseline.data?.data || baseline.data;
  const baselineEmission =
    baselineData?.totalSum || baselineData?.totalEmissions || baselineData?.emissions || 26830;
  const baselineYear =
    baselineData?.startYear || baselineData?.baselineYear || baselineData?.year || 2024;

  const handleScopeInputChange = (
    scope: keyof ScopeTargetData,
    field: keyof GeneralTargetData,
    value: string | number
  ) => {
    let processedValue: any = value;

    if (field === "reductionPercentage") {
      processedValue = value === "" ? null : Number(value);
      // Auto-calculate target emission when percentage changes using actual baseline
      if (
        processedValue !== null &&
        scopeTargetData[scope].baselineYear &&
        scopeTargetData[scope].targetYear
      ) {
        const targetEmission = baselineEmission * (1 - processedValue / 100);
        const totalReduction = baselineEmission - targetEmission;

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
      processedValue = value === 0 ? null : Number(value);
    }

    // Handle targetEmission changes from formatted input
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

  // Set default baseline year from API if available for all scopes
  useEffect(() => {
    if (baselineYear) {
      setScopeTargetData((prev) => ({
        scope1: { ...prev.scope1, baselineYear: prev.scope1.baselineYear || baselineYear },
        scope2: { ...prev.scope2, baselineYear: prev.scope2.baselineYear || baselineYear },
        scope3: { ...prev.scope3, baselineYear: prev.scope3.baselineYear || baselineYear },
      }));
    }
  }, [baselineYear]);

  const handleContinue = () => {
    if (step === 0) {
      // Validate required fields for all scopes before proceeding
      const isScope1Valid =
        scopeTargetData.scope1.reductionPercentage &&
        scopeTargetData.scope1.baselineYear &&
        scopeTargetData.scope1.targetYear;
      const isScope2Valid =
        scopeTargetData.scope2.reductionPercentage &&
        scopeTargetData.scope2.baselineYear &&
        scopeTargetData.scope2.targetYear;
      const isScope3Valid =
        scopeTargetData.scope3.reductionPercentage &&
        scopeTargetData.scope3.baselineYear &&
        scopeTargetData.scope3.targetYear;

      if (isScope1Valid && isScope2Valid) {
        setStep(1);
      }
    }
  };

  const handlePrevious = () => {
    setStep(0);
  };

  const handleSetTarget = async () => {
    try {
      // Prepare the target payload with unique name and individual scope percentages
      const uniqueName = `Scope Target ${scopeTargetData.scope1.baselineYear}-${scopeTargetData.scope1.targetYear}-${Date.now()}`;
      const targetPayload: any = {
        name: uniqueName,
        type: "SCOPE",
        description: "Scope-based emissions reduction target",
        baselineYear: Number(scopeTargetData.scope1.baselineYear!),
        targetYear: scopeTargetData.scope1.targetYear!,
        scopes: {
          scope1: {
            reductionPercentage: scopeTargetData.scope1.reductionPercentage || 0,
          },
          scope2: {
            reductionPercentage: scopeTargetData.scope2.reductionPercentage || 0,
          },
          scope3: {
            reductionPercentage: scopeTargetData.scope3.reductionPercentage || 0,
          },
        },
      };

      // Call the mutation
      await createTarget.mutateAsync(targetPayload);

      // Open the success modal
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to create target:", error);
    }
  };

  const handleModalContinue = () => {
    // Close the modal
    setIsSuccessModalOpen(false);

    // Redirect to ranking page
    router.push("/ranking");
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Prepare scope data for summary

  const reductionScope1 = calculateTotal(
    base?.ghg_scope_one,
    CalculateEmissionPercentage(
      scopeTargetData?.scope1?.reductionPercentage ?? 0,
      base?.ghg_scope_one
    )
  );

  const scope1TargetEmission = scopeTargetData?.scope1?.reductionPercentage
    ? base?.ghg_scope_one * (1 - scopeTargetData?.scope1?.reductionPercentage / 100)
    : 0;

  const scope2TargetEmission = scopeTargetData?.scope2?.reductionPercentage
    ? base?.ghg_scope_two * (1 - scopeTargetData?.scope2?.reductionPercentage / 100)
    : 0;
  const scope3TargetEmission = scopeTargetData?.scope3?.reductionPercentage
    ? base?.ghg_scope_three * (1 - scopeTargetData?.scope3?.reductionPercentage / 100)
    : 0;

  const scope1Timeline = Number(
    calculateTimelineYear(
      baseline?.data?.startYear,
      scopeTargetData?.scope1?.targetYear ?? baseline?.data?.startYear
    )
  );

  const scope2Timeline = Number(
    calculateTimelineYear(
      baseline?.data?.startYear,
      scopeTargetData?.scope2?.targetYear ?? baseline?.data?.startYear
    )
  );
  const scope3Timeline = Number(
    calculateTimelineYear(
      baseline?.data?.startYear,
      scopeTargetData?.scope3?.targetYear ?? baseline?.data?.startYear
    )
  );

  const scopesData: ScopeData[] = [
    {
      scope: "Scope 1",
      timeline: scope1Timeline,
      targetReduction: Number(scope1TargetEmission),
      annualRate: Number(scope1TargetEmission) / scope1Timeline,

      reductionPercentage: scope1TargetEmission,
      baselineYear: scopeTargetData.scope1.baselineYear || 0,
      targetYear: scopeTargetData.scope1.targetYear || 0,
      description: scopeTargetData.scope1.description || "",
      targetEmission: scopeTargetData.scope1.targetEmission || 0,
      totalReduction: scopeTargetData.scope1.totalReduction || 0,
    },
    {
      scope: "Scope 2",
      timeline: scope2Timeline,

      targetReduction: Number(scope2TargetEmission),
      annualRate: Number(scope2TargetEmission / scope2Timeline),

      reductionPercentage: scopeTargetData.scope2.reductionPercentage || 0,
      baselineYear: scopeTargetData.scope2.baselineYear || 0,
      targetYear: scopeTargetData.scope2.targetYear || 0,
      description: scopeTargetData.scope2.description || "",
      targetEmission: scopeTargetData.scope2.targetEmission || 0,
      totalReduction: base?.ghg_scope_two ?? 0 - (scopeTargetData?.scope2?.targetEmission ?? 0),
    },
    {
      scope: "Scope 3",
      timeline: scope3Timeline,

      targetReduction: Number(scope3TargetEmission),
      annualRate: Number(scope3TargetEmission / scope3Timeline),

      reductionPercentage: scopeTargetData.scope3.reductionPercentage || 0,
      baselineYear: scopeTargetData.scope3.baselineYear || 0,
      targetYear: scopeTargetData.scope3.targetYear || 0,
      description: scopeTargetData.scope3.description || "",
      targetEmission: scopeTargetData.scope3.targetEmission || 0,
      totalReduction: scopeTargetData.scope3.totalReduction || 0,
    },
  ];

  if (step === 0) {
    return (
      <div className="space-y-6 text-left">
        {/* Show loading state for baseline */}
        {baseline.isLoading && <div className="text-center py-4">Loading baseline data...</div>}

        {baseline.isError && (
          <div className="text-center py-4 text-red-500">Error loading baseline data</div>
        )}

        {/* Scope 1 Card */}
        <Card>
          <CardHeader>
            <div className="text-lg">Scope 1 Target</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              Direct emissions from owned or controlled sources
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
                  value={scopeTargetData?.scope1?.reductionPercentage ?? ""}
                  onChange={(e) =>
                    handleScopeInputChange("scope1", "reductionPercentage", e.target.value)
                  }
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
                  id="scope1-baselineYear"
                  value={base?.startYear}
                  disabled
                  onChange={(e) => handleScopeInputChange("scope1", "baselineYear", e.target.value)}
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
                <Label htmlFor="scope1-targetYear">
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
                  id="scope1-targetYear"
                  value={scopeTargetData.scope1.targetYear ?? ""}
                  onChange={(e) => handleScopeInputChange("scope1", "targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years
                    .filter((year) => year >= Number(base?.startYear)) // 👈 filter from baseline year
                    .map((year) => (
                      <option key={year + 1} value={year + 1}>
                        {year + 1}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope1-description">Description (Optional)</Label>
              <Textarea
                id="scope1-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.scope1.description}
                onChange={(e) => handleScopeInputChange("scope1", "description", e.target.value)}
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
                    Baseline ({baseline?.data?.startYear})
                  </Label>
                  <div className="text-sm text-gray-900 font-semibold">
                    {" "}
                    {baseline?.data?.ghg_scope_one} tCO₂e
                  </div>
                </div>
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label className="flex items-center">
                    Target: ({scopeTargetData.scope1.targetYear || 0})
                    <CustomTooltip
                      detail={
                        <TooltipMessage
                          title={"Target"}
                          message={`This shows the company's emission goal 
                           for the target year (${scopeTargetData.scope1.targetYear}) after applying the emissions's reduction percentage. A 20% reduction from the
                           baseline of 26,830 means: 26,830 * (1 - reduction %/100) = 21,464 tCO₂e. Your own results to: ${CalculateEmissionPercentage(scopeTargetData.scope1.reductionPercentage ?? 0, baseline?.data?.ghg_scope_one)} tCO₂e`}
                        />
                      }
                    />{" "}
                  </Label>
                  <div className="text-sm text-primary font-semibold">
                    {CalculateEmissionPercentage(
                      scopeTargetData?.scope1?.reductionPercentage ?? 0,
                      baseline?.data?.ghg_scope_one
                    )}
                    tCO₂e
                  </div>
                </div>
                <hr className="text-gray-300" />
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>
                    Total Reduction:
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
                    {Number(
                      calculateTotal(
                        baseline?.data?.ghg_scope_one,
                        CalculateEmissionPercentage(
                          scopeTargetData?.scope1?.reductionPercentage ?? 0,
                          baseline?.data?.ghg_scope_one
                        )
                      )
                    )}
                    tCO₂e
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Scope 2 Card */}

        <Card>
          <CardHeader>
            <div className="text-lg">Scope 2 Target</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">Indirect emission from purchased energy.</p>

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
                  value={scopeTargetData?.scope2?.reductionPercentage ?? ""}
                  onChange={(e) =>
                    handleScopeInputChange("scope2", "reductionPercentage", e.target.value)
                  }
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
                  id="scope1-baselineYear"
                  value={base?.startYear}
                  disabled
                  onChange={(e) => handleScopeInputChange("scope2", "baselineYear", e.target.value)}
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
                <Label htmlFor="scope1-targetYear">
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
                  id="scope1-targetYear"
                  value={scopeTargetData.scope2.targetYear ?? ""}
                  onChange={(e) => handleScopeInputChange("scope2", "targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years
                    .filter((year) => year >= Number(base?.startYear))
                    .map((year) => (
                      <option key={year + 1} value={year + 1}>
                        {year + 1}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope1-description">Description (Optional)</Label>
              <Textarea
                id="scope1-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.scope2.description}
                onChange={(e) => handleScopeInputChange("scope1", "description", e.target.value)}
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
                  <Label className="flex items-center gap-1">Baseline ({base?.startYear})</Label>
                  <div className="text-sm text-gray-900 font-semibold">
                    {" "}
                    {base?.ghg_scope_two} tCO₂e
                  </div>
                </div>
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label className="flex items-center">
                    Target: ({scopeTargetData.scope2.targetYear || 0})
                    <CustomTooltip
                      detail={
                        <TooltipMessage
                          title={"Target"}
                          message={`This shows the company's emission goal 
                           for the target year (${scopeTargetData.scope2.targetYear}) after applying the emissions's reduction percentage. A 20% reduction from the
                           baseline of 26,830 means: 26,830 * (1 - reduction %/100) = 21,464 tCO₂e. Your own results to: ${CalculateEmissionPercentage(scopeTargetData.scope2.reductionPercentage ?? 0, base?.ghg_scope_two)} tCO₂e`}
                        />
                      }
                    />{" "}
                  </Label>
                  <div className="text-sm text-primary font-semibold">
                    {CalculateEmissionPercentage(
                      scopeTargetData?.scope2?.reductionPercentage ?? 0,
                      base?.ghg_scope_two
                    )}
                    tCO₂e
                  </div>
                </div>
                <hr className="text-gray-300" />
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>
                    Total Reduction:
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
                      base?.ghg_scope_two,
                      CalculateEmissionPercentage(
                        scopeTargetData?.scope2?.reductionPercentage ?? 0,
                        base?.ghg_scope_two
                      )
                    )}
                    tCO₂e
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Scope 3 Card */}
        <Card>
          <CardHeader>
            <div className="text-lg">Scope 3 Target</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">All other indirect emissions in value chain.</p>

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
                  value={scopeTargetData?.scope3?.reductionPercentage ?? ""}
                  onChange={(e) =>
                    handleScopeInputChange("scope3", "reductionPercentage", e.target.value)
                  }
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
                  id="scope1-baselineYear"
                  value={base?.startYear}
                  disabled
                  onChange={(e) => handleScopeInputChange("scope3", "baselineYear", e.target.value)}
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
                <Label htmlFor="scope3-targetYear">
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
                  id="scope1-targetYear"
                  value={scopeTargetData.scope3.targetYear ?? ""}
                  onChange={(e) => handleScopeInputChange("scope3", "targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years
                    .filter((year) => year >= Number(base?.startYear))
                    .map((year) => (
                      <option key={year + 1} value={year + 1}>
                        {year + 1}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope3-description">Description (Optional)</Label>
              <Textarea
                id="scope1-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.scope3.description}
                onChange={(e) => handleScopeInputChange("scope3", "description", e.target.value)}
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
                  <Label className="flex items-center gap-1">Baseline ({base?.startYear})</Label>
                  <div className="text-sm text-gray-900 font-semibold">
                    {" "}
                    {base?.ghg_scope_three} tCO₂e
                  </div>
                </div>
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label className="flex items-center">
                    Target: ({scopeTargetData.scope3.targetYear || 0})
                    <CustomTooltip
                      detail={
                        <TooltipMessage
                          title={"Target"}
                          message={`This shows the company's emission goal 
                           for the target year (${scopeTargetData.scope3.targetYear}) after applying the emissions's reduction percentage. A 20% reduction from the
                           baseline of 26,830 means: 26,830 * (1 - reduction %/100) = 21,464 tCO₂e. Your own results to: ${CalculateEmissionPercentage(scopeTargetData.scope3.reductionPercentage ?? 0, base?.ghg_scope_three)} tCO₂e`}
                        />
                      }
                    />{" "}
                  </Label>
                  <div className="text-sm text-primary font-semibold">
                    {CalculateEmissionPercentage(
                      scopeTargetData?.scope3?.reductionPercentage ?? 0,
                      base?.ghg_scope_three
                    )}
                    tCO₂e
                  </div>
                </div>
                <hr className="text-gray-300" />
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>
                    Total Reduction:
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
                      base?.ghg_scope_three,
                      CalculateEmissionPercentage(
                        scopeTargetData?.scope3?.reductionPercentage ?? 0,
                        base?.ghg_scope_three
                      )
                    )}
                    tCO₂e
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

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
              // !scopeTargetData.scope3.reductionPercentage ||
              // !scopeTargetData.scope3.baselineYear ||
              // !scopeTargetData.scope3.targetYear ||
              baseline.isLoading
            }
          >
            {baseline.isLoading ? "Loading Baseline..." : "Continue"}
          </CustomButton>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <>
        <ScopeSummary
          scopes={scopesData}
          onPrevious={handlePrevious}
          onSetTarget={handleSetTarget}
          isLoading={createTarget.isPending}
        />
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleModalClose}
          onContinue={handleModalContinue}
        />
      </>
    );
  }

  return null;
}
