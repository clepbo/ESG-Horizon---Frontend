"use client";

import { GeneralTargetData, TargetType } from "@/types/target";
import { useState, useEffect } from "react";
import { TargetTypeSelector } from "./TargetTypeSelector";
import GeneralTargetForm from "./GeneralSetTarget";
import SetTargetByScope from "./SetTargetByScope";
import { useBaseline } from "@/app/(company)/components/ranking/services";
import { useAuth } from "@/context/AuthContext";
import StartAssessment from "./StartAssessment";
import { usePathname } from "next/navigation";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";

export function TargetSetting() {
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
  const isScopeSummaryPage = pathname.includes("/kpis/create/scope-summary");
  const isGeneralSummaryPage = pathname.includes("/kpis/create/summary");

  useEffect(() => {
    const storedData = localStorage.getItem("generalTargetSummary");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setGeneralTargetData(parsedData);
    }
  }, []);

  const { user } = useAuth();
  const baseline = useBaseline(user?.company?.id);

  // If we're on summary pages, don't render the main target setting UI
  if (isScopeSummaryPage || isGeneralSummaryPage) {
    return null; // The summary pages will handle their own rendering
  }

  if (baseline.isLoading) {
    return <PageSkeleton />;
  }

  if (baseline?.data?.startYear?.length < 2 || !baseline?.data) {
    return <StartAssessment />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDataChange = (newData: GeneralTargetData) => {
    setGeneralTargetData(newData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          <TargetTypeSelector selectedType={selectedType} onTypeChange={setSelectedType} />

          {selectedType === "general" && (
            <GeneralTargetForm data={generalTargetData} onChange={setGeneralTargetData} />
          )}

          {selectedType === "scope" && (
            <div className="text-center py-12 text-gray-500">
              <SetTargetByScope />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
