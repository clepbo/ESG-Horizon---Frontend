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

interface TargetSettingProps {
  /** When true, fetches the latest target and prepopulates forms for editing. */
  isEdit?: boolean;
  /** Called after a successful create/update (e.g. to refresh parent data). */
  onSuccess?: () => void;
}

export function TargetSetting({ isEdit: isEditProp, onSuccess }: TargetSettingProps = {}) {
  const [selectedType, setSelectedType] = useState<TargetType>("general");
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

  const isScopeSummaryPage = pathname.includes("/kpis/create/scope-summary");
  const isGeneralSummaryPage = pathname.includes("/kpis/create/summary");

  const { user } = useAuth();
  const companyId = user?.company?.id;
  const baseline = useBaseline(companyId);
  const latestTargetQuery = useGetLatestTarget(isEditMode ? companyId : undefined);
  const existingTarget: Target | null = isEditMode ? (latestTargetQuery.data ?? null) : null;

  // Pre-select the matching form type when editing
  useEffect(() => {
    if (existingTarget) {
      setSelectedType(existingTarget.type === "SCOPE" ? "scope" : "general");
    }
  }, [existingTarget]);

  useEffect(() => {
    const storedData = localStorage.getItem("generalTargetSummary");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setGeneralTargetData(parsedData);
    }
  }, []);

  // If we're on summary pages, don't render the main target setting UI
  if (isScopeSummaryPage || isGeneralSummaryPage) {
    return null;
  }

  if (baseline.isLoading || (isEditMode && latestTargetQuery.isLoading)) {
    return <PageSkeleton />;
  }

  if (baseline?.data?.startYear?.length < 2 || !baseline?.data) {
    return <StartAssessment />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          {/* When editing, lock to the existing target type; otherwise show the selector */}
          {isEditMode && existingTarget ? null : (
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
            <div className="text-center py-12 text-gray-500">
              <SetTargetByScope existingTarget={isEditMode ? existingTarget : undefined} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
