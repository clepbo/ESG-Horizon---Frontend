"use client";

import { GeneralTargetData, TargetType } from "@/types/target";
import { useState } from "react";
import { TargetTypeSelector } from "./TargetTypeSelector";
import GeneralTargetForm from "./GeneralSetTarget";
import SetTargetByScope from "./SetTargetByScope";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiUtil from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { BothTargetPayload } from "@/types/target/index";
import { useRouter } from "next/navigation";
import { SuccessModal } from "./SuccessModal";
import { FaCaretRight } from "react-icons/fa";
import { toast } from "react-toastify";

interface ScopeTargetFormData {
  scope1: { reductionPercentage: number | null; baselineYear: number | null; targetYear: number | null; description: string; targetEmission: number | null; totalReduction: number | null };
  scope2: { reductionPercentage: number | null; baselineYear: number | null; targetYear: number | null; description: string; targetEmission: number | null; totalReduction: number | null };
  scope3: { reductionPercentage: number | null; baselineYear: number | null; targetYear: number | null; description: string; targetEmission: number | null; totalReduction: number | null };
}

interface TargetSettingProps {
  onSuccess?: () => void;
}

export function TargetSetting({ onSuccess }: TargetSettingProps) {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;

  const [selectedType, setSelectedType] = useState<TargetType>("general");
  const [generalTargetData, setGeneralTargetData] = useState<GeneralTargetData>({
    reductionPercentage: null,
    baselineYear: null,
    targetYear: null,
    description: "",
    targetEmission: null,
    totalReduction: null,
  });

  // BOTH mode state — only scope data needed (general is derived)
  const [bothScopeDone, setBothScopeDone] = useState(false);
  const [bothScopeData, setBothScopeData] = useState<ScopeTargetFormData | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const baseline = useQuery({
    queryKey: ["baseline", companyId],
    queryFn: () => {
      if (!companyId) throw new Error("Company ID not available");
      return apiUtil.get(`/target/baseline/${companyId}`);
    },
    enabled: !!companyId && selectedType === "both",
  });

  const createBothTarget = useMutation({
    mutationFn: async (payload: BothTargetPayload) => {
      return apiUtil.post(`/target`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseline"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
    },
  });

  const handleScopeComplete = (data: ScopeTargetFormData) => {
    setBothScopeData(data);
    setBothScopeDone(true);
  };

  const handleSubmitBoth = async () => {
    if (!bothScopeData) return;

    const baselineEmission = baseline?.data?.totalSum || 0;
    const baselineYear = Number(bothScopeData.scope1.baselineYear) || 0;
    const targetYearVal = Number(bothScopeData.scope1.targetYear) || 0;

    if (targetYearVal <= baselineYear) {
      toast.error("Target year must be after baseline year");
      return;
    }

    // Derive overall general target from individual scope targets
    const s1Target = bothScopeData.scope1.targetEmission || 0;
    const s2Target = bothScopeData.scope2.targetEmission || 0;
    const s3Target = bothScopeData.scope3.targetEmission || 0;
    const totalTargetEmission = s1Target + s2Target + s3Target;
    const derivedReductionPct =
      baselineEmission > 0
        ? Math.round(((baselineEmission - totalTargetEmission) / baselineEmission) * 1000) / 10
        : bothScopeData.scope1.reductionPercentage || 0;

    const uniqueName = `Combined Target ${baselineYear}-${targetYearVal} - ${Date.now()}`;

    const payload: BothTargetPayload = {
      name: uniqueName,
      type: "BOTH",
      description: bothScopeData.scope1.description || "Combined general and scope-based target",
      baselineYear,
      targetYear: targetYearVal,
      reductionPercentage: derivedReductionPct,
      targetEmission: totalTargetEmission,
      baselineYearEmission: baselineEmission,
      currentEmission: baselineEmission,
      scopes: {
        scope1: {
          reductionPercentage: bothScopeData.scope1.reductionPercentage || 0,
          targetEmission: s1Target,
          baselineYearEmission: baselineEmission,
        },
        scope2: {
          reductionPercentage: bothScopeData.scope2.reductionPercentage || 0,
          targetEmission: s2Target,
          baselineYearEmission: baselineEmission,
        },
        scope3: {
          reductionPercentage: bothScopeData.scope3.reductionPercentage || 0,
          targetEmission: s3Target,
          baselineYearEmission: baselineEmission,
        },
      },
    };

    try {
      await createBothTarget.mutateAsync(payload);
      setIsSuccessModalOpen(true);
    } catch (error) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create target";
      toast.error(msg);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          <TargetTypeSelector selectedType={selectedType} onTypeChange={setSelectedType} />

          {selectedType === "general" && (
            <GeneralTargetForm
              data={generalTargetData}
              onChange={setGeneralTargetData}
              onSuccess={onSuccess}
            />
          )}

          {selectedType === "scope" && (
            <div className="text-center py-12 text-gray-500">
              <SetTargetByScope onSuccess={onSuccess} />
            </div>
          )}

          {selectedType === "both" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                Set your scope-level targets below. The overall company-wide reduction target will
                be automatically derived from your scope totals.
              </p>

              {!bothScopeDone ? (
                <SetTargetByScope onComplete={handleScopeComplete} />
              ) : (
                <>
                  <div className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700 flex items-center justify-between">
                    <span>
                      S1 / S2 / S3 scope targets saved — overall target will be derived automatically
                    </span>
                    <button
                      type="button"
                      className="text-xs underline text-teal-600 hover:text-teal-800 ml-4 shrink-0"
                      onClick={() => setBothScopeDone(false)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex justify-center pt-2">
                    <CustomButton
                      icon={<FaCaretRight />}
                      onClick={handleSubmitBoth}
                      disabled={createBothTarget.isPending}
                      className="text-white px-6 py-2"
                    >
                      {createBothTarget.isPending ? "Setting Target..." : "Set Both Targets"}
                    </CustomButton>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onContinue={handleModalContinue}
      />
    </div>
  );
}
