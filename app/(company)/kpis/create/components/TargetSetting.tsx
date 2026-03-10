"use client";

import { GeneralTargetData, TargetType } from "@/types/target";
import { useState, useEffect } from "react";
import { TargetTypeSelector } from "./TargetTypeSelector";
import GeneralTargetForm from "./GeneralSetTarget";
import SetTargetByScope from "./SetTargetByScope";
import { useBaseline, useGetLatestTarget } from "@/app/(company)/components/ranking/services";
import { useAuth } from "@/context/AuthContext";
import StartAssessment from "./StartAssessment";
import { usePathname, useSearchParams } from "next/navigation";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";
import { Target } from "@/app/(company)/components/types/target";
import { useRouter } from "next/navigation";
import { FaCaretLeft } from "react-icons/fa";

interface TargetSettingProps {
  /**
   * When provided (embedded mode from TargetHomePage), locks the form to this
   * target type and hides the TargetTypeSelector.
   */
  targetType?: "general" | "scope";
  /** When true, fetches the latest target and prepopulates forms for editing. */
  isEdit?: boolean;
  /** Pre-populated target data for edit mode (passed from parent, avoids extra fetch). */
  existingTarget?: Target | null;
  /** Called after a successful create/update (e.g. to refresh parent data). */
  onSuccess?: () => void;
  /** Called when "Go back" is clicked. Falls back to router.back() if not provided. */
  onBack?: () => void;
}

export function TargetSetting({
  targetType: targetTypeProp,
  isEdit: isEditProp,
  existingTarget: existingTargetProp,
  onSuccess,
  onBack,
}: TargetSettingProps = {}) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TargetType>(targetTypeProp ?? "general");
  const [generalTargetData, setGeneralTargetData] = useState<GeneralTargetData>({
    reductionPercentage: null,
    baselineYear: null,
    targetYear: null,
    description: "",
    targetEmission: null,
    totalReduction: null,
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditMode = isEditProp ?? searchParams.get("edit") === "true";

  // Embedded mode: targetType is fixed from parent — no selector needed.
  const isEmbedded = !!targetTypeProp;

  const isScopeSummaryPage = pathname.includes("/kpis/create/scope-summary");
  const isGeneralSummaryPage = pathname.includes("/kpis/create/summary");
  const isBothSummaryPage = pathname.includes("/kpis/create/both-summary");

  const { user } = useAuth();
  const companyId = user?.company?.id;
  const baseline = useBaseline(companyId);

  // In standalone KPI flow: fetch the latest target for pre-population when editing.
  // In embedded mode: parent passes existingTarget directly to avoid an extra request.
  const latestTargetQuery = useGetLatestTarget(!isEmbedded && isEditMode ? companyId : undefined);
  const existingTarget: Target | null =
    existingTargetProp !== undefined
      ? (existingTargetProp ?? null)
      : isEditMode
        ? (latestTargetQuery.data ?? null)
        : null;

  // When rendered in embedded mode (assessments page), save the caller's URL so
  // the summary pages can navigate back here instead of going to /kpis.
  useEffect(() => {
    if ((onBack || onSuccess) && typeof window !== "undefined") {
      localStorage.setItem("_targetReturnTo", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-select the matching form type when editing (standalone flow only)
  useEffect(() => {
    if (!isEmbedded && existingTarget) {
      if (existingTarget.type === "SCOPE") setSelectedType("scope");
      else if (existingTarget.type === "BOTH") setSelectedType("both");
      else setSelectedType("general");
    }
  }, [existingTarget, isEmbedded]);

  useEffect(() => {
    const storedData = localStorage.getItem("generalTargetSummary");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setGeneralTargetData(parsedData);
    }
  }, []);

  // BOTH mode: scope form completes → derive general target → save both to localStorage → navigate
  const handleScopeCompleteForBoth = (scopeSummaryData: any) => {
    const totalBaseline = scopeSummaryData.emissionData?.totals?.total || 0;
    const s1Target = scopeSummaryData.calculations.scope1.targetEmission || 0;
    const s2Target = scopeSummaryData.calculations.scope2.targetEmission || 0;
    const s3Target = scopeSummaryData.calculations.scope3.targetEmission || 0;
    const totalTarget = s1Target + s2Target + s3Target;
    const reductionPercentage =
      totalBaseline > 0
        ? Math.round(((totalBaseline - totalTarget) / totalBaseline) * 1000) / 10
        : 0;

    const generalData = {
      baselineYear: scopeSummaryData.emissionData?.startYear,
      targetYear: scopeSummaryData.scopeTargetData.scope1.targetYear,
      baselineEmission: totalBaseline,
      targetEmission: Math.round(totalTarget),
      reductionPercentage,
      description:
        scopeSummaryData.scopeTargetData.scope1.description ||
        "Combined general and scope-based target",
      baselinePeriodLabel: scopeSummaryData.baselineSelection?.baselinePeriodLabel,
      baselineAssessmentId: scopeSummaryData.baselineSelection?.baselineAssessmentId,
      _targetType: "BOTH",
      ...(scopeSummaryData.targetId ? { targetId: scopeSummaryData.targetId } : {}),
    };

    localStorage.setItem("generalTargetSummary", JSON.stringify(generalData));
    localStorage.setItem("scopeTargetSummary", JSON.stringify(scopeSummaryData));
    router.push(isEditMode ? "/kpis/create/both-summary?edit=true" : "/kpis/create/both-summary");
  };

  // If we're on summary pages, don't render the main target setting UI
  if (isScopeSummaryPage || isGeneralSummaryPage || isBothSummaryPage) {
    return null;
  }

  const isLatestTargetLoading = !isEmbedded && isEditMode && latestTargetQuery.isLoading;

  if (baseline.isLoading || isLatestTargetLoading) {
    return <PageSkeleton />;
  }

  if (baseline?.data?.startYear?.length < 2 || !baseline?.data) {
    return <StartAssessment />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : router.back())}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <FaCaretLeft className="text-xs" />
          Go back
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          {!isEmbedded && (
            <TargetTypeSelector selectedType={selectedType} onTypeChange={setSelectedType} />
          )}

          {selectedType === "general" && (
            <GeneralTargetForm
              data={generalTargetData}
              onChange={setGeneralTargetData}
              existingTarget={isEditMode ? existingTarget : undefined}
            />
          )}

          {selectedType === "scope" && (
            <SetTargetByScope existingTarget={isEditMode ? existingTarget : undefined} />
          )}

          {selectedType === "both" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Set your scope-level targets below. The overall company-wide reduction target will
                be automatically derived from your scope totals.
              </p>
              <SetTargetByScope
                existingTarget={isEditMode ? existingTarget : undefined}
                onComplete={handleScopeCompleteForBoth}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
