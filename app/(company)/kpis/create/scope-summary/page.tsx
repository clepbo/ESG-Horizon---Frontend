"use client";

import { ScopeSummary } from "@/app/(company)/assessments/target/components/scope/ScopeTargetSummary";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/axios";
import { ScopeTargetPayload } from "@/types/target/index";
import { invalidateAllTargetQueries } from "@/app/(company)/components/ranking/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import { SuccessModal } from "../components/SuccessModal";
import { ScopeSummaryData } from "../type";

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

export default function ScopeSummaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<ScopeSummaryData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const isEdit = targetId !== null;

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem("scopeTargetSummary");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded scope target data:", parsedData);
        setSummaryData(parsedData);
        if (parsedData.targetId) {
          setTargetId(parsedData.targetId);
        }
      } catch (error) {
        console.error("Error parsing stored data:", error);
        setLoadError(true);
      }
    } else {
      // If no data in localStorage, show an inline error state instead of redirecting
      setLoadError(true);
    }
  }, [router]);

  const createTarget = useMutation({
    mutationFn: async (targetData: ScopeTargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      if (targetId) {
        return await api.patch(`/target/${targetId}`, targetData);
      }
      return await api.post(`/target`, targetData);
    },
    onSuccess: () => {
      setCreateError(null);
      invalidateAllTargetQueries(queryClient);
      localStorage.removeItem("scopeTargetSummary");
    },
    onError: (error: any) => {
      if (error._toastShown) return;
      const status = error?.response?.status;
      const serverMessage =
        error?.response?.data?.message || error?.message || "Something went wrong.";
      const isOverlapError =
        status === 400 || /already exists|overlapping|cannot create/i.test(String(serverMessage));
      if (serverMessage && isOverlapError) {
        setCreateError(serverMessage);
        return;
      }
      toast.error(serverMessage);
    },
  });

  const handlePrevious = () => {
    const returnTo = localStorage.getItem("_targetReturnTo");
    if (returnTo && returnTo !== "/kpis/create") {
      // Came from an embedded flow (e.g. /assessments/target) — signal it to reopen the form
      localStorage.setItem("_autoOpenTarget", "scope");
      router.push(returnTo);
    } else {
      router.push(isEdit ? "/kpis/create?edit=true" : "/kpis/create");
    }
  };

  const handleSetTarget = async () => {
    setCreateError(null);
    if (!summaryData) {
      toast.error("Missing summary data. Please go back and complete the form.");
      return;
    }

    const uniqueName = `Scope Target ${summaryData.scopeTargetData.scope1.baselineYear}–${summaryData.scopeTargetData.scope1.targetYear}`;

    const scopes = summaryData.scopeTargetData;
    const invalidScopes = ["scope1", "scope2", "scope3"].filter((key) => {
      const k = key as "scope1" | "scope2" | "scope3";
      const s = scopes[k];
      return !!s.baselineYear && !!s.targetYear && s.targetYear <= s.baselineYear;
    });
    if (invalidScopes.length > 0) {
      toast.error("Each scope's target year must be after its baseline year");
      return;
    }

    try {
      const s1Year = Number(summaryData.scopeTargetData.scope1.baselineYear!);
      const s2Year = Number(summaryData.scopeTargetData.scope2.baselineYear!);
      const s3Year = Number(summaryData.scopeTargetData.scope3.baselineYear!);
      const s1TYear = Number(summaryData.scopeTargetData.scope1.targetYear!);
      const s2TYear = Number(summaryData.scopeTargetData.scope2.targetYear!);
      const s3TYear = Number(summaryData.scopeTargetData.scope3.targetYear!);

      const targetPayload: ScopeTargetPayload = {
        name: uniqueName,
        type: "SCOPE",
        description: "Scope-based emissions reduction target",
        baselineYear: Math.min(s1Year, s2Year, s3Year),
        targetYear: Math.max(s1TYear, s2TYear, s3TYear),
        scopes: {
          scope1: {
            reductionPercentage: summaryData.scopeTargetData.scope1.reductionPercentage || 0,
            targetEmission: summaryData.calculations.scope1.targetEmission,
            baselineYearEmission: summaryData.emissionData?.totals?.scope1,
            baselineYear: s1Year,
            targetYear: s1TYear,
          },
          scope2: {
            reductionPercentage: summaryData.scopeTargetData.scope2.reductionPercentage || 0,
            targetEmission: summaryData.calculations.scope2.targetEmission,
            baselineYearEmission: summaryData.emissionData?.totals?.scope2,
            baselineYear: s2Year,
            targetYear: s2TYear,
          },
          scope3: {
            reductionPercentage: summaryData.scopeTargetData.scope3.reductionPercentage || 0,
            targetEmission: summaryData.calculations.scope3.targetEmission,
            baselineYearEmission: summaryData.emissionData?.totals?.scope3,
            baselineYear: s3Year,
            targetYear: s3TYear,
          },
        },
        ...(typeof summaryData.baselineSelection?.baselineAssessmentId === "number" && {
          baselineAssessmentId: summaryData.baselineSelection.baselineAssessmentId,
        }),
      };

      await createTarget.mutateAsync(targetPayload);
      setIsSuccessModalOpen(true);
    } catch {
      // Error shown via mutation onError (inline Alert for 400, toast for others)
    }
  };

  const handleModalContinue = () => {
    setIsSuccessModalOpen(false);
    const returnTo = localStorage.getItem("_targetReturnTo");
    localStorage.removeItem("_targetReturnTo");
    router.push(returnTo ?? "/kpis");
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Prepare scope data for summary component
  const scopesData: ScopeData[] = summaryData
    ? [
        {
          scope: "Scope 1",
          timeline: summaryData.calculations.scope1.timeline,
          targetReduction: summaryData.calculations.scope1.totalReduction,
          annualRate: summaryData.calculations.scope1.annualRate,
          reductionPercentage: summaryData.scopeTargetData.scope1.reductionPercentage || 0,
          baselineYear: summaryData.scopeTargetData.scope1.baselineYear || 0,
          targetYear: summaryData.scopeTargetData.scope1.targetYear || 0,
          description: summaryData.scopeTargetData.scope1.description || "",
          targetEmission: summaryData.calculations.scope1.targetEmission,
          totalReduction: summaryData.calculations.scope1.totalReduction,
          baselineEmission: summaryData.emissionData?.totals?.scope1 || 0,
        },
        {
          scope: "Scope 2",
          timeline: summaryData.calculations.scope2.timeline,
          targetReduction: summaryData.calculations.scope2.totalReduction,
          annualRate: summaryData.calculations.scope2.annualRate,
          reductionPercentage: summaryData.scopeTargetData.scope2.reductionPercentage || 0,
          baselineYear: summaryData.scopeTargetData.scope2.baselineYear || 0,
          targetYear: summaryData.scopeTargetData.scope2.targetYear || 0,
          description: summaryData.scopeTargetData.scope2.description || "",
          targetEmission: summaryData.calculations.scope2.targetEmission,
          totalReduction: summaryData.calculations.scope2.totalReduction,
          baselineEmission: summaryData.emissionData?.totals?.scope2 || 0,
        },
        {
          scope: "Scope 3",
          timeline: summaryData.calculations.scope3.timeline,
          targetReduction: summaryData.calculations.scope3.totalReduction,
          annualRate: summaryData.calculations.scope3.annualRate,
          reductionPercentage: summaryData.scopeTargetData.scope3.reductionPercentage || 0,
          baselineYear: summaryData.scopeTargetData.scope3.baselineYear || 0,
          targetYear: summaryData.scopeTargetData.scope3.targetYear || 0,
          description: summaryData.scopeTargetData.scope3.description || "",
          targetEmission: summaryData.calculations.scope3.targetEmission,
          totalReduction: summaryData.calculations.scope3.totalReduction,
          baselineEmission: summaryData.emissionData?.totals?.scope3 || 0,
        },
      ]
    : [];

  if (loadError) {
    return (
      <div className="flex justify-center items-center min-h-64 px-4">
        <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Scope target summary not found
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            We couldn&apos;t load your scope target details. Please go back to the target setup page
            and try again.
          </p>
          <button
            type="button"
            onClick={() => router.push("/kpis/create")}
            className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Back to Target Setup
          </button>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading scope target data...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 lg:mt-20 max-w-3xl px-4 space-y-6">
      {createError && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot create this target</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="mb-3">{createError}</p>
            <p className="text-sm text-amber-800 mb-3">
              Choose a different baseline or target year, or manage your existing targets.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreateError(null);
                  router.push("/kpis/create");
                }}
                className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Change years
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateError(null);
                  router.push("/kpis");
                }}
                className="inline-flex items-center rounded-md border border-amber-600 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
              >
                View existing targets
              </button>
              <button
                type="button"
                onClick={() => setCreateError(null)}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      <ScopeSummary
        scopes={scopesData}
        baselinePeriodLabel={summaryData.baselineSelection?.baselinePeriodLabel}
        onPrevious={handlePrevious}
        onSetTarget={handleSetTarget}
        isLoading={createTarget.isPending}
        isEdit={isEdit}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
        onContinue={handleModalContinue}
      />

      {showBaselineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              You need a baseline assessment first
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Scope-based targets depend on your baseline emissions by scope. Please complete an ESG
              assessment to generate this data before setting scope targets.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowBaselineModal(false)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => router.push("/assessments/new-assessment")}
                className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Go to Assessments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
