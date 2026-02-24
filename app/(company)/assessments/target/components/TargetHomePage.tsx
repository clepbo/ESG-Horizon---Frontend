"use client";

import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Edit, Plus } from "lucide-react";
import React, { useState } from "react";
import { TargetSetting } from "./TargetSetting";
import InitialTargetPage from "./InitialTargetPage";
import PerformanceOverview from "@/app/(company)/components/ranking/PerformanceOverview";
import { useGetLatestTarget } from "@/app/(company)/components/ranking/services";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";

export default function TargetHomePage() {
  const [showForm, setShowForm] = useState(false);

  const { user } = useAuth();
  const companyId = user?.company?.id;
  const queryClient = useQueryClient();

  const latestTarget = useGetLatestTarget(companyId);
  const hasTarget = !!latestTarget?.data;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["latest-target", companyId] });
    setShowForm(false);
  };

  if (latestTarget.isLoading) {
    return (
      <section className="grid gap-4 lg:gap-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h6 className="font-semibold text-gray-900">Reduction Targets</h6>
            <small className="text-gray-500">
              Track emissions reduction and other ESG commitments
            </small>
          </div>
        </div>
        <CardSkeleton />
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:gap-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          {hasTarget && !showForm ? (
            <>
              <h6 className="font-semibold text-gray-900">Reduction Targets</h6>
              <small className="text-gray-500">
                Track emissions reduction and other ESG commitments
              </small>
            </>
          ) : (
            <>
              <h6 className="font-semibold text-gray-900">Set Reduction Targets</h6>
              <small className="text-gray-500">Define your ESG goals and monitor progress.</small>
            </>
          )}
        </div>
        {!showForm &&
          (hasTarget ? (
            <CustomButton icon={<Edit />} onClick={() => setShowForm(true)}>
              Edit Target
            </CustomButton>
          ) : (
            <CustomButton icon={<Plus />} onClick={() => setShowForm(true)}>
              Set Target
            </CustomButton>
          ))}
      </div>

      {/* Scene 1 — no target set yet */}
      {!hasTarget && !showForm && <InitialTargetPage onSetTarget={() => setShowForm(true)} />}

      {/* Scenes 2-4 — target creation form */}
      {showForm && <TargetSetting onSuccess={handleSuccess} />}

      {/* Scene 6 — target exists, show performance dashboard */}
      {hasTarget && !showForm && <PerformanceOverview />}
    </section>
  );
}
