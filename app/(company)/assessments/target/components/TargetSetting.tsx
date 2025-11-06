"use client";

import { GeneralTargetData, TargetType } from "@/types/target";
import { Suspense, useState } from "react";
import { TargetTypeSelector } from "./TargetTypeSelector";
import GeneralTargetForm from "./GeneralSetTarget";
// import SetTargetByScope from "./SetTargetByScope";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          <TargetTypeSelector selectedType={selectedType} onTypeChange={setSelectedType} />

          {selectedType === "general" && (
            <Suspense fallback={<CardSkeleton />}>
              <GeneralTargetForm data={generalTargetData} onChange={setGeneralTargetData} />
            </Suspense>
          )}

          {/* {selectedType === "scope" && (
            <div className="text-center py-12 text-gray-500">
              <Suspense fallback={<Skeleton />}>
                <SetTargetByScope />
              </Suspense>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
