"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { TargetPayload } from "@/types/target/index";
import { useBaseline } from "@/app/(company)/components/ranking/services";
import { ScopeSummaryData } from "../type";
import { ScopeSummary } from "../components/scope-summary/ScopeTargetSummary";
import { SuccessModal } from "../components/SuccessModal";


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

  const baseline = useBaseline(companyId);

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem("scopeTargetSummary");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded scope target data:", parsedData);
        setSummaryData(parsedData);
      } catch (error) {
        console.error("Error parsing stored data:", error);
        router.push("/target/create");
      }
    } else {
      // If no data in localStorage, redirect back to form
      router.push("/target/create");
    }
  }, [router]);

  const createTarget = useMutation({
    mutationFn: async (targetData: TargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      return await api.post(`/target`, targetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseline"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      // Clear localStorage after successful creation
      localStorage.removeItem("scopeTargetSummary");
    },
  });

  const handlePrevious = () => {
    // Navigate back to form page - data will be preserved in localStorage
    router.push("/ranking/create");
  };

  const handleSetTarget = async () => {
    if (!summaryData || !baseline.data) {
      console.error("Missing summary data or baseline data");
      return;
    }

    const uniqueName = `Scope Target ${summaryData.scopeTargetData.scope1.baselineYear}-${summaryData.scopeTargetData.scope1.targetYear}-${Date.now()}`;
    
    try {
      const targetPayload: any = {
        name: uniqueName,
        type: "SCOPE",
        description: "Scope-based emissions reduction target",
        baselineYear: Number(summaryData.scopeTargetData.scope1.baselineYear!),
        targetYear: summaryData.scopeTargetData.scope1.targetYear!,
        scopes: {
          scope1: {
            reductionPercentage: summaryData.scopeTargetData.scope1.reductionPercentage || 0,
            targetEmission: summaryData.calculations.scope1.targetEmission,
            baselineYearEmission: summaryData.emissionData?.totals?.scope1,
            currentEmission: null,
          },
          scope2: {
            reductionPercentage: summaryData.scopeTargetData.scope2.reductionPercentage || 0,
            targetEmission: summaryData.calculations.scope2.targetEmission,
            baselineYearEmission: summaryData.emissionData?.totals?.scope2,
            currentEmission: null,
          },
          scope3: {
            reductionPercentage: summaryData.scopeTargetData.scope3.reductionPercentage || 0,
            targetEmission: summaryData.calculations.scope3.targetEmission,
            baselineYearEmission: summaryData.emissionData?.totals?.scope3,
            currentEmission: null,
          },
        },
      };

      console.log("Submitting scope target:", targetPayload);
      await createTarget.mutateAsync(targetPayload);
      
      // Open success modal
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to create scope target:", error);
      throw new Error(`Error: ${error}`);
    }
  };

  const handleModalContinue = () => {
    setIsSuccessModalOpen(false);
    router.push("/ranking");
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Prepare scope data for summary component
  const scopesData: ScopeData[] = summaryData ? [
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
  ] : [];

  if (!summaryData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading scope target data...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 lg:mt-20">
      <ScopeSummary
        scopes={scopesData}
        onPrevious={handlePrevious}
        onSetTarget={handleSetTarget}
        isLoading={createTarget.isPending}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
        onContinue={handleModalContinue}
      />
    </div>
  );
}