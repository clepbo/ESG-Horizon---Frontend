"use client";

import {
  useBaseline,
  invalidateAllTargetQueries,
} from "@/app/(company)/components/ranking/services";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/axios";
import { GeneralTargetData } from "@/types/target";
import { GeneralTargetPayload } from "@/types/target/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import { GeneralTargetSummary } from "../components/general/GeneralTargetSummary";
import { SuccessModal } from "../components/SuccessModal";
import { EmissionDataResponseGeneral } from "../type";
import { CalculateEmissionPercentage, calculateTotal } from "../utils";

function getHasLocalBaseline(): boolean {
  try {
    const s = typeof window !== "undefined" ? localStorage.getItem("generalTargetSummary") : null;
    if (!s) return false;
    const p = JSON.parse(s);
    return !!p?.baselineEmission;
  } catch {
    return false;
  }
}

export default function SummaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [hasLocalBaseline, setHasLocalBaseline] = useState(getHasLocalBaseline);
  const [createError, setCreateError] = useState<string | null>(null);

  // State for data — targetId is set when editing an existing target
  const [targetId, setTargetId] = useState<number | null>(null);
  const isEdit = targetId !== null;
  const [targetData, setTargetData] = useState<GeneralTargetData | null>(null);
  const [emissionData, setEmissionData] = useState<EmissionDataResponseGeneral>({
    startYear: 0,
    endYear: 0,
    totals: 0,
  });

  const base = useBaseline(companyId, {
    enabled: !hasLocalBaseline,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem("generalTargetSummary");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded target data:", parsedData); // Debug log
        setTargetData(parsedData);

        // If editing, grab the target ID passed through from the form
        if (parsedData.targetId) {
          setTargetId(parsedData.targetId);
        }

        // Use the baselineEmission saved by the form page as the primary source
        // (the form already fetched and validated this from useBaseline)
        if (parsedData.baselineEmission) {
          setEmissionData((prev) => ({
            ...prev,
            startYear: parsedData.baselineYear || prev.startYear,
            totals: parsedData.baselineEmission,
          }));
          setHasLocalBaseline(true);
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

  // Also update from useBaseline if it returns valid data (as a fallback ONLY
  // for older localStorage entries that didn't include baselineEmission).
  useEffect(() => {
    if (!hasLocalBaseline && base.isSuccess && base.data && base.data.totals) {
      setEmissionData(base.data);
    }
  }, [hasLocalBaseline, base.isSuccess, base.data]);

  console.log("TDATA", targetData);
  // Use useMemo for calculations to ensure they update when dependencies change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { calculatedTargetEmission, annualRate, yearDifference } = useMemo(() => {
    if (!targetData || !emissionData) {
      return {
        calculatedTargetEmission: 0,
        annualRate: "0",
        yearDifference: 0,
      };
    }

    // Calculate target emission
    const targetEmission = targetData?.reductionPercentage
      ? emissionData?.totals * (1 - targetData?.reductionPercentage / 100)
      : 0;

    // Calculate year difference (use emissionData.startYear which comes from localStorage or useBaseline)
    const baseStartYear = emissionData?.startYear || base.data?.startYear || 0;
    const yearDiff =
      targetData && baseStartYear ? Math.abs((targetData.targetYear ?? 0) - baseStartYear) : 0;

    // Calculate reduction and annual rate
    const reduction = calculateTotal(
      emissionData?.totals,
      CalculateEmissionPercentage(targetData?.reductionPercentage ?? 0, emissionData?.totals)
    );

    const annualRateValue = yearDiff > 0 ? (+reduction / yearDiff).toFixed(2) : "0";

    console.log("Calculations:", {
      // Debug log
      baseline: emissionData?.totals,
      reductionPercentage: targetData?.reductionPercentage,
      calculatedTargetEmission: targetEmission,
      yearDifference: yearDiff,
    });

    return {
      calculatedTargetEmission: targetEmission,
      annualRate: annualRateValue,
      yearDifference: yearDiff,
    };
  }, [targetData, emissionData, base.data]);

  const createTarget = useMutation({
    mutationFn: async (targetDataPayload: GeneralTargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      if (targetId) {
        return await api.patch(`/target/${targetId}`, targetDataPayload);
      }
      return await api.post(`/target`, targetDataPayload);
    },
    onSuccess: () => {
      setCreateError(null);
      invalidateAllTargetQueries(queryClient);
      localStorage.removeItem("generalTargetSummary");
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
      localStorage.setItem("_autoOpenTarget", "general");
      router.push(returnTo);
    } else {
      router.push(isEdit ? "/kpis/create?edit=true" : "/kpis/create");
    }
  };

  const handleSetTarget = async () => {
    setCreateError(null);
    if (!targetData) {
      toast.error("Missing target data. Please go back and review your inputs.");
      return;
    }

    if (!emissionData?.totals) {
      setShowBaselineModal(true);
      return;
    }

    const baselineYear = emissionData?.startYear || base.data?.startYear || 0;
    if (targetData.targetYear && baselineYear && targetData.targetYear <= baselineYear) {
      toast.error("Target year must be after baseline year");
      return;
    }
    const uniqueName = `Carbon Target ${baselineYear}–${targetData.targetYear}`;

    try {
      const targetPayload: GeneralTargetPayload = {
        name: targetData.name || uniqueName,
        type: "GENERAL",
        description: targetData.description || "General emissions reduction target",
        baselineYear: Number(baselineYear),
        targetYear: Number(targetData.targetYear!),
        targetEmission: calculatedTargetEmission,
        baselineYearEmission: emissionData?.totals,
        currentEmission: emissionData?.totals,
        reductionPercentage: targetData.reductionPercentage || 0,
        ...(typeof targetData.baselineAssessmentId === "number" && {
          baselineAssessmentId: targetData.baselineAssessmentId,
        }),
      };

      await createTarget.mutateAsync(targetPayload);
      setIsSuccessModalOpen(true);
    } catch {
      // Error is shown via onError (inline Alert for 400, toast for others)
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

  if (loadError) {
    return (
      <div className="flex justify-center items-center min-h-64 px-4">
        <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Target summary not found</h2>
          <p className="mb-4 text-sm text-gray-600">
            We couldn&apos;t load your target details. Please go back to the target setup page and
            try again.
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

  // Show loading state while data is being loaded
  if (!targetData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading target data...</div>
      </div>
    );
  }

  // Show loading state while baseline data is loading (only when we don't have stored baseline)
  if (!hasLocalBaseline && base.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading baseline data...</div>
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
      <GeneralTargetSummary
        annualRate={Number(annualRate)}
        reductionPercentage={targetData.reductionPercentage || 0}
        baselineEmission={emissionData?.totals ?? 0}
        targetEmission={calculatedTargetEmission}
        targetYear={targetData.targetYear ?? 0}
        baselineYear={emissionData?.startYear || 0}
        baselinePeriodLabel={(targetData as any)?.baselinePeriodLabel}
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
              To set a reduction target, we first need your company&apos;s baseline emissions from a
              completed ESG assessment.
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
