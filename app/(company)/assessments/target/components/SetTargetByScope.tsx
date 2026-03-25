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
import { invalidateAllTargetQueries } from "@/app/(company)/components/ranking/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiUtil from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { ScopeTargetPayload } from "@/types/target/index";
import { useRouter } from "next/navigation";
import { formatNumberFull } from "@/lib/numberFormat";

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
  baselineEmission: number;
}

interface ScopeTargetData {
  scope1: GeneralTargetData;
  scope2: GeneralTargetData;
  scope3: GeneralTargetData;
}

interface SetTargetByScopeProps {
  onSuccess?: () => void;
  onComplete?: (data: ScopeTargetData) => void;
}

export default function SetTargetByScope({ onSuccess, onComplete }: SetTargetByScopeProps) {
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
      return await apiUtil.get(`/target/baseline/${companyId}`);
    },
    enabled: !!companyId,
  });

  const createTarget = useMutation({
    mutationFn: async (targetData: ScopeTargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      return await apiUtil.post(`/target`, targetData);
    },
    onSuccess: () => {
      invalidateAllTargetQueries(queryClient);
    },
  });

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
    }

    if (field === "baselineYear" || field === "targetYear") {
      processedValue = value === "" ? null : Number(value);
    }

    if (field === "targetEmission") {
      processedValue = value === "" ? null : Number(value);
    }

    // Update the field first, then recalculate if we have enough data
    setScopeTargetData((prev) => {
      const updated = {
        ...prev[scope],
        [field]: processedValue,
      };

      const reduction = updated.reductionPercentage;
      if (reduction !== null && reduction !== undefined) {
        const targetEmission = baselineEmission * (1 - reduction / 100);
        const totalReduction = baselineEmission - targetEmission;
        updated.targetEmission = Math.round(targetEmission);
        updated.totalReduction = Math.round(totalReduction);
      }

      return { ...prev, [scope]: updated };
    });
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

      if (isScope1Valid && isScope2Valid && isScope3Valid) {
        if (onComplete) {
          // BOTH mode — pass data up, skip inline summary step
          onComplete(scopeTargetData);
        } else {
          setStep(1);
        }
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
      const targetPayload: ScopeTargetPayload = {
        name: uniqueName,
        type: "SCOPE",
        description: "Scope-based emissions reduction target",
        baselineYear: Number(scopeTargetData.scope1.baselineYear!),
        targetYear: Number(scopeTargetData.scope1.targetYear!),
        scopes: {
          scope1: {
            reductionPercentage: scopeTargetData.scope1.reductionPercentage || 0,
            targetEmission: scopeTargetData.scope1.targetEmission || 0,
            baselineYearEmission: baselineEmission,
          },
          scope2: {
            reductionPercentage: scopeTargetData.scope2.reductionPercentage || 0,
            targetEmission: scopeTargetData.scope2.targetEmission || 0,
            baselineYearEmission: baselineEmission,
          },
          scope3: {
            reductionPercentage: scopeTargetData.scope3.reductionPercentage || 0,
            targetEmission: scopeTargetData.scope3.targetEmission || 0,
            baselineYearEmission: baselineEmission,
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

  // Prepare scope data for summary
  const scopesData: ScopeData[] = [
    {
      scope: "Scope 1",
      timeline: Math.abs(
        (scopeTargetData.scope1.targetYear || 0) - (scopeTargetData.scope1.baselineYear || 0)
      ),
      targetReduction: scopeTargetData.scope1.totalReduction || 0,
      annualRate:
        (scopeTargetData.scope1.totalReduction || 0) /
        Math.abs(
          (scopeTargetData.scope1.targetYear || 1) - (scopeTargetData.scope1.baselineYear || 0)
        ),
      reductionPercentage: scopeTargetData.scope1.reductionPercentage || 0,
      baselineYear: scopeTargetData.scope1.baselineYear || 0,
      targetYear: scopeTargetData.scope1.targetYear || 0,
      description: scopeTargetData.scope1.description || "",
      targetEmission: scopeTargetData.scope1.targetEmission || 0,
      totalReduction: scopeTargetData.scope1.totalReduction || 0,
      baselineEmission,
    },
    {
      scope: "Scope 2",
      timeline: Math.abs(
        (scopeTargetData.scope2.targetYear || 0) - (scopeTargetData.scope2.baselineYear || 0)
      ),
      targetReduction: scopeTargetData.scope2.totalReduction || 0,
      annualRate:
        (scopeTargetData.scope2.totalReduction || 0) /
        Math.abs(
          (scopeTargetData.scope2.targetYear || 1) - (scopeTargetData.scope2.baselineYear || 0)
        ),
      reductionPercentage: scopeTargetData.scope2.reductionPercentage || 0,
      baselineYear: scopeTargetData.scope2.baselineYear || 0,
      targetYear: scopeTargetData.scope2.targetYear || 0,
      description: scopeTargetData.scope2.description || "",
      targetEmission: scopeTargetData.scope2.targetEmission || 0,
      totalReduction: scopeTargetData.scope2.totalReduction || 0,
      baselineEmission,
    },
    {
      scope: "Scope 3",
      timeline: Math.abs(
        (scopeTargetData.scope3.targetYear || 0) - (scopeTargetData.scope3.baselineYear || 0)
      ),
      targetReduction: scopeTargetData.scope3.totalReduction || 0,
      annualRate:
        (scopeTargetData.scope3.totalReduction || 0) /
        Math.abs(
          (scopeTargetData.scope3.targetYear || 1) - (scopeTargetData.scope3.baselineYear || 0)
        ),
      reductionPercentage: scopeTargetData.scope3.reductionPercentage || 0,
      baselineYear: scopeTargetData.scope3.baselineYear || 0,
      targetYear: scopeTargetData.scope3.targetYear || 0,
      description: scopeTargetData.scope3.description || "",
      targetEmission: scopeTargetData.scope3.targetEmission || 0,
      totalReduction: scopeTargetData.scope3.totalReduction || 0,
      baselineEmission,
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
            <div className="text-lg text-left font-normal">Scope 1 Target</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600 text-left">
              Direct emissions from owned or controlled sources
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope1-reductionPercentage">Reduction Percentage (%)</Label>
                <Input
                  id="scope1-reductionPercentage"
                  type="number"
                  placeholder="e.g. 30"
                  value={scopeTargetData.scope1.reductionPercentage ?? ""}
                  onChange={(e) =>
                    handleScopeInputChange("scope1", "reductionPercentage", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope1-baselineYear">Baseline Year</Label>
                <Input
                  id="scope1-baselineYear"
                  type="number"
                  value={scopeTargetData.scope1.baselineYear ?? baselineYear ?? ""}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope1-targetYear">Target Year</Label>
                <select
                  id="scope1-targetYear"
                  value={scopeTargetData.scope1.targetYear ?? ""}
                  onChange={(e) => handleScopeInputChange("scope1", "targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years
                    .filter(
                      (year) =>
                        !scopeTargetData.scope1.baselineYear ||
                        year > scopeTargetData.scope1.baselineYear
                    )
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
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

            {/* Target Calculation */}
            <div className="flex flex-col w-full gap-2 justify-end">
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Baseline ({scopeTargetData.scope1.baselineYear || baselineYear}):</Label>
                <div className="text-sm text-gray-900 font-semibold">
                  {formatNumberFull(baselineEmission)} tCO₂e
                  {baseline.data && (
                    <span className="text-xs text-green-600 ml-2">✓ From your data</span>
                  )}
                </div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Target ({scopeTargetData.scope1.targetYear || 2030}):</Label>
                <div className="text-sm text-primary font-semibold">
                  {formatNumberFull(scopeTargetData.scope1.targetEmission || 0)} tCO₂e
                </div>
              </div>
              <hr className="text-gray-300" />
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Total Reduction:</Label>
                <div className="text-sm text-red-500 font-semibold">
                  -{formatNumberFull(scopeTargetData.scope1.totalReduction || 0)} tCO₂e
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope 2 Card */}
        <Card>
          <CardHeader>
            <div className="text-lg text-left font-normal">Scope 2 Target</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600 text-left">
              Indirect emissions from purchased energy
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope2-reductionPercentage">Reduction Percentage (%)</Label>
                <Input
                  id="scope2-reductionPercentage"
                  type="number"
                  placeholder="e.g. 30"
                  value={scopeTargetData.scope2.reductionPercentage ?? ""}
                  onChange={(e) =>
                    handleScopeInputChange("scope2", "reductionPercentage", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope2-baselineYear">Baseline Year</Label>
                <Input
                  id="scope2-baselineYear"
                  type="number"
                  value={scopeTargetData.scope2.baselineYear ?? baselineYear ?? ""}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope2-targetYear">Target Year</Label>
                <select
                  id="scope2-targetYear"
                  value={scopeTargetData.scope2.targetYear ?? ""}
                  onChange={(e) => handleScopeInputChange("scope2", "targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years
                    .filter(
                      (year) =>
                        !scopeTargetData.scope2.baselineYear ||
                        year > scopeTargetData.scope2.baselineYear
                    )
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope2-description">Description (Optional)</Label>
              <Textarea
                id="scope2-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.scope2.description}
                onChange={(e) => handleScopeInputChange("scope2", "description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Target Calculation */}
            <div className="flex flex-col w-full gap-2 justify-end">
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Baseline ({scopeTargetData.scope2.baselineYear || baselineYear}):</Label>
                <div className="text-sm text-gray-900 font-semibold">
                  {formatNumberFull(baselineEmission)} tCO₂e
                </div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Target ({scopeTargetData.scope2.targetYear || 2030}):</Label>
                <div className="text-sm text-primary font-semibold">
                  {formatNumberFull(scopeTargetData.scope2.targetEmission || 0)} tCO₂e
                </div>
              </div>
              <hr className="text-gray-300" />
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Total Reduction:</Label>
                <div className="text-sm text-red-500 font-semibold">
                  -{formatNumberFull(scopeTargetData.scope2.totalReduction || 0)} tCO₂e
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope 3 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left font-normal">Scope 3 Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600 text-left">
              All other indirect emissions in the value chain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope3-reductionPercentage">Reduction Percentage (%)</Label>
                <Input
                  id="scope3-reductionPercentage"
                  type="number"
                  placeholder="e.g. 30"
                  value={scopeTargetData.scope3.reductionPercentage ?? ""}
                  onChange={(e) =>
                    handleScopeInputChange("scope3", "reductionPercentage", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope3-baselineYear">Baseline Year</Label>
                <Input
                  id="scope3-baselineYear"
                  type="number"
                  value={scopeTargetData.scope3.baselineYear ?? baselineYear ?? ""}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope3-targetYear">Target Year</Label>
                <select
                  id="scope3-targetYear"
                  value={scopeTargetData.scope3.targetYear ?? ""}
                  onChange={(e) => handleScopeInputChange("scope3", "targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years
                    .filter(
                      (year) =>
                        !scopeTargetData.scope3.baselineYear ||
                        year > scopeTargetData.scope3.baselineYear
                    )
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope3-description">Description (Optional)</Label>
              <Textarea
                id="scope3-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.scope3.description}
                onChange={(e) => handleScopeInputChange("scope3", "description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Target Calculation */}
            <div className="flex flex-col w-full gap-2 justify-end">
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Baseline ({scopeTargetData.scope3.baselineYear || baselineYear}):</Label>
                <div className="text-sm text-gray-900 font-semibold">
                  {formatNumberFull(baselineEmission)} tCO₂e
                </div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Target ({scopeTargetData.scope3.targetYear || 2030}):</Label>
                <div className="text-sm text-primary font-semibold">
                  {formatNumberFull(scopeTargetData.scope3.targetEmission || 0)} tCO₂e
                </div>
              </div>
              <hr className="text-gray-300" />
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Total Reduction:</Label>
                <div className="text-sm text-red-500 font-semibold">
                  -{formatNumberFull(scopeTargetData.scope3.totalReduction || 0)} tCO₂e
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
              !scopeTargetData.scope1.reductionPercentage ||
              !scopeTargetData.scope1.baselineYear ||
              !scopeTargetData.scope1.targetYear ||
              !scopeTargetData.scope2.reductionPercentage ||
              !scopeTargetData.scope2.baselineYear ||
              !scopeTargetData.scope2.targetYear ||
              !scopeTargetData.scope3.reductionPercentage ||
              !scopeTargetData.scope3.baselineYear ||
              !scopeTargetData.scope3.targetYear ||
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
