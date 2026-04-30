"use client";

import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api/axios";
import { BothTargetPayload } from "@/types/target/index";
import { invalidateAllTargetQueries } from "@/app/(company)/components/ranking/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatWithCommas } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { AlertCircle, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCaretLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { SuccessModal } from "../components/SuccessModal";
import { ScopeSummaryData } from "../type";

export default function BothSummaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const isEdit = targetId !== null;

  const [generalData, setGeneralData] = useState<any | null>(null);
  const [scopeData, setScopeData] = useState<ScopeSummaryData | null>(null);

  useEffect(() => {
    const rawGeneral = localStorage.getItem("generalTargetSummary");
    const rawScope = localStorage.getItem("scopeTargetSummary");

    if (!rawGeneral || !rawScope) {
      setLoadError(true);
      return;
    }
    try {
      const g = JSON.parse(rawGeneral);
      const s = JSON.parse(rawScope);
      setGeneralData(g);
      setScopeData(s);
      if (g.targetId) setTargetId(g.targetId);
    } catch {
      setLoadError(true);
    }
  }, []);

  const createTarget = useMutation({
    mutationFn: async (payload: BothTargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      if (targetId) {
        try {
          return await api.patch(`/target/${targetId}`, payload);
        } catch (err: any) {
          // Stale targetId (e.g. after a DB wipe) — fall through to POST.
          if (err?.response?.status === 404) {
            setTargetId(null);
            return await api.post(`/target`, payload);
          }
          throw err;
        }
      }
      return await api.post(`/target`, payload);
    },
    onSuccess: () => {
      setCreateError(null);
      invalidateAllTargetQueries(queryClient);
      localStorage.removeItem("generalTargetSummary");
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

  const handleSetTarget = async () => {
    setCreateError(null);
    if (!generalData || !scopeData) {
      toast.error("Missing target data. Please go back and complete both sections.");
      return;
    }

    const baselineYear = Number(generalData.baselineYear) || 0;
    const targetYearVal = Number(generalData.targetYear) || 0;
    if (targetYearVal <= baselineYear) {
      toast.error("Target year must be after baseline year");
      return;
    }

    const uniqueName = generalData.name || `Combined Target ${baselineYear}–${targetYearVal}`;

    const payload: BothTargetPayload = {
      name: uniqueName,
      type: "BOTH",
      description: generalData.description || "Combined general and scope-based target",
      baselineYear,
      targetYear: targetYearVal,
      reductionPercentage: generalData.reductionPercentage || 0,
      targetEmission: generalData.targetEmission ?? null,
      baselineYearEmission: generalData.baselineEmission || 0,
      currentEmission: generalData.baselineEmission || null,
      scopes: {
        scope1: {
          reductionPercentage: scopeData.scopeTargetData.scope1.reductionPercentage || 0,
          targetEmission: scopeData.calculations.scope1.targetEmission,
          baselineYearEmission: scopeData.emissionData?.totals?.scope1,
        },
        scope2: {
          reductionPercentage: scopeData.scopeTargetData.scope2.reductionPercentage || 0,
          targetEmission: scopeData.calculations.scope2.targetEmission,
          baselineYearEmission: scopeData.emissionData?.totals?.scope2,
        },
        scope3: {
          reductionPercentage: scopeData.scopeTargetData.scope3.reductionPercentage || 0,
          targetEmission: scopeData.calculations.scope3.targetEmission,
          baselineYearEmission: scopeData.emissionData?.totals?.scope3,
        },
      },
      ...(typeof generalData.baselineAssessmentId === "number" && {
        baselineAssessmentId: generalData.baselineAssessmentId,
      }),
    };

    try {
      await createTarget.mutateAsync(payload);
      setIsSuccessModalOpen(true);
    } catch {
      // handled by onError
    }
  };

  const handlePrevious = () => {
    router.push(isEdit ? "/kpis/create?edit=true" : "/kpis/create");
  };

  const handleModalContinue = () => {
    setIsSuccessModalOpen(false);
    const returnTo = localStorage.getItem("_targetReturnTo");
    localStorage.removeItem("_targetReturnTo");
    router.push(returnTo ?? "/kpis");
  };

  if (loadError) {
    return (
      <div className="flex justify-center items-center min-h-64 px-4">
        <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Target summary not found</h2>
          <p className="mb-4 text-sm text-gray-600">
            We couldn&apos;t load your target details. Please go back and complete both sections.
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

  if (!generalData || !scopeData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading target data...</div>
      </div>
    );
  }

  const totalReduction = (generalData.baselineEmission || 0) - (generalData.targetEmission || 0);
  const yearsDiff = Math.abs((generalData.targetYear || 0) - (generalData.baselineYear || 0));
  const annualRate = yearsDiff > 0 ? totalReduction / yearsDiff : 0;

  return (
    <div className="mx-auto mt-8 lg:mt-20 max-w-3xl px-4 space-y-6">
      {createError && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot create this target</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="mb-3">{createError}</p>
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
                onClick={() => setCreateError(null)}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* General section */}
      <Card className="shadow-md border border-gray-100">
        <CardHeader className="pb-2 border-b border-gray-100">
          <p className="text-sm font-bold tracking-wide text-gray-800 uppercase">
            General Target Summary
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="text-center space-y-3">
            <TrendingDown className="mx-auto text-green-600" />
            <h6 className="text-2xl font-semibold text-gray-900">
              {formatWithCommas(generalData.reductionPercentage)}% Reduction Target
            </h6>
            {generalData.baselinePeriodLabel && (
              <p className="text-sm text-gray-700">
                Baseline period:{" "}
                <span className="font-semibold">{generalData.baselinePeriodLabel}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col divide-y divide-gray-100 mx-4">
            <div className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Baseline emission</span>
              <span className="font-semibold">
                {formatWithCommas(generalData.baselineEmission || 0)} tCO₂e
              </span>
            </div>
            <div className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">
                Target emission ({generalData.targetYear})
              </span>
              <span className="font-semibold text-green-600">
                {formatWithCommas(generalData.targetEmission || 0)} tCO₂e
              </span>
            </div>
            <div className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Total reduction</span>
              <span className="font-semibold text-red-600">
                -{formatWithCommas(totalReduction)} tCO₂e
              </span>
            </div>
            <div className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Timeline</span>
              <span className="font-semibold">{yearsDiff} years</span>
            </div>
            <div className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Annual rate</span>
              <span className="font-semibold text-red-600">
                {formatWithCommas(annualRate)} tCO₂e/yr
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope section */}
      <Card className="shadow-md border border-gray-100">
        <CardHeader className="pb-2 border-b border-gray-100">
          <p className="text-sm font-bold tracking-wide text-gray-800 uppercase">
            Scope Targets Summary
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {(["scope1", "scope2", "scope3"] as const).map((key, i) => {
            const label = `Scope ${i + 1}`;
            const sd = scopeData.scopeTargetData[key];
            const calc = scopeData.calculations[key];
            return (
              <div key={key} className="space-y-1">
                <h6 className="text-sm font-semibold text-gray-800">{label}</h6>
                <div className="flex flex-col divide-y divide-gray-100 ml-2">
                  <div className="py-2 flex justify-between text-sm">
                    <span className="text-gray-500">Reduction</span>
                    <span className="font-semibold">
                      {formatWithCommas(sd.reductionPercentage)}%
                    </span>
                  </div>
                  <div className="py-2 flex justify-between text-sm">
                    <span className="text-gray-500">Target year</span>
                    <span className="font-semibold">{sd.targetYear}</span>
                  </div>
                  <div className="py-2 flex justify-between text-sm">
                    <span className="text-gray-500">Target emission</span>
                    <span className="font-semibold text-green-600">
                      {formatWithCommas(calc.targetEmission)} tCO₂e
                    </span>
                  </div>
                  <div className="py-2 flex justify-between text-sm">
                    <span className="text-gray-500">Total reduction</span>
                    <span className="font-semibold text-red-600">
                      -{formatWithCommas(calc.totalReduction)} tCO₂e
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <CustomButton
          icon={<FaCaretLeft className="mr-2" />}
          variant="outlined"
          onClick={handlePrevious}
          className="px-6 py-2"
        >
          Previous
        </CustomButton>
        <CustomButton onClick={handleSetTarget} disabled={createTarget.isPending}>
          {createTarget.isPending
            ? isEdit
              ? "Updating Target..."
              : "Setting Target..."
            : isEdit
              ? "Update Target"
              : "Set Both Targets"}
        </CustomButton>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onContinue={handleModalContinue}
      />
    </div>
  );
}
