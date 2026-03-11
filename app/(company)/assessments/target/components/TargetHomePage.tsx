"use client";

import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLatestTargetPair } from "@/app/(company)/components/ranking/services";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import { useState, useEffect } from "react";
import { ChevronDown, Edit, Eye, Plus } from "lucide-react";
import InitialTargetPage from "./InitialTargetPage";
import PerformanceOverview, { ViewMode } from "@/app/(company)/components/ranking/PerformanceOverview";
import TargetLogsTable from "./TargetLogsTable";
import { TargetSetting } from "@/app/(company)/kpis/create/components/TargetSetting";

type TargetFormType = "general" | "scope";

export default function TargetHomePage() {
  const { user } = useAuth();
  const companyId = user?.company?.id;
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<TargetFormType>("general");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: pair, isLoading } = useLatestTargetPair(companyId);

  const hasGeneral = !!pair?.general;
  const hasScope = !!pair?.scope;
  const hasAny = hasGeneral || hasScope;

  const [activeView, setActiveView] = useState<ViewMode>("general");

  // Sync activeView when pair data arrives
  useEffect(() => {
    if (pair) {
      setActiveView(pair.general ? "general" : "scope");
    }
  }, [pair]);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["latest-target-pair", companyId] });
    queryClient.invalidateQueries({ queryKey: ["all-targets", companyId] });
    setShowForm(false);
  };

  const openForm = (type: TargetFormType) => {
    setFormType(type);
    setShowForm(true);
    setDropdownOpen(false);
  };

  // Reopen form when returning via "Previous" from a summary page
  useEffect(() => {
    const autoOpen = localStorage.getItem("_autoOpenTarget") as TargetFormType | null;
    if (autoOpen === "general" || autoOpen === "scope") {
      localStorage.removeItem("_autoOpenTarget");
      openForm(autoOpen);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
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
          {hasAny && !showForm ? (
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

        {/* Action dropdown */}
        {!showForm && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              Targets
              <ChevronDown className="h-4 w-4" />
            </button>

            {dropdownOpen && (
              <>
                {/* backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-gray-100 bg-white shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => openForm("general")}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {hasGeneral ? (
                        <Edit className="h-3.5 w-3.5 text-teal-600" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-gray-400" />
                      )}
                      {hasGeneral ? "Edit General Target" : "Add General Target"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openForm("scope")}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {hasScope ? (
                        <Edit className="h-3.5 w-3.5 text-purple-600" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-gray-400" />
                      )}
                      {hasScope ? "Edit Scope Target" : "Add Scope Target"}
                    </button>

                    {hasGeneral && hasScope && (
                      <>
                        <div className="my-1 border-t border-gray-100" />
                        <button
                          type="button"
                          onClick={() => { setActiveView("general"); setDropdownOpen(false); }}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 ${activeView === "general" ? "text-teal-700 font-medium" : "text-gray-700"}`}
                        >
                          <Eye className="h-3.5 w-3.5 text-teal-600" />
                          View General Target
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveView("scope"); setDropdownOpen(false); }}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 ${activeView === "scope" ? "text-purple-700 font-medium" : "text-gray-700"}`}
                        >
                          <Eye className="h-3.5 w-3.5 text-purple-600" />
                          View Scope Targets
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* No targets yet */}
      {!hasAny && !showForm && <InitialTargetPage onSetTarget={() => openForm("general")} />}

      {/* Form */}
      {showForm && (
        <TargetSetting
          targetType={formType}
          isEdit={formType === "general" ? hasGeneral : hasScope}
          existingTarget={formType === "general" ? pair?.general : pair?.scope}
          onSuccess={handleSuccess}
          onBack={() => setShowForm(false)}
        />
      )}

      {/* Dashboard */}
      {hasAny && !showForm && (
        <>
          <PerformanceOverview pair={pair ?? { general: null, scope: null }} activeView={activeView} />
          <TargetLogsTable />
        </>
      )}
    </section>
  );
}
