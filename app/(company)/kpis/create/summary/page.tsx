"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GeneralTargetData } from "@/types/target";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { TargetPayload } from "@/types/target/index";
import { useBaseline } from "@/app/(company)/components/ranking/services";
import { EmissionDataResponse, EmissionDataResponseGeneral } from "../type";
import { CalculateEmissionPercentage, calculateTotal } from "../utils";
import { GeneralTargetSummary } from "../components/general/GeneralTargetSummary";
import { SuccessModal } from "../components/SuccessModal";
import { toast } from "react-toastify";

export default function SummaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.company?.id;
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // State for data
  const [targetData, setTargetData] = useState<GeneralTargetData | null>(null);
  const [emissionData, setEmissionData] = useState<EmissionDataResponseGeneral>({
    startYear: 0,
    endYear: 0,
    totals: 0,
  });

  const base = useBaseline(companyId);

  useEffect(() => {
    if (base.isSuccess && base.data) {
      setEmissionData(base.data);
    }
  }, [base.isSuccess, base.data]);

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem("generalTargetSummary");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded target data:", parsedData); // Debug log
        setTargetData(parsedData);
      } catch (error) {
        console.error("Error parsing stored data:", error);
        router.push("/kpis/create");
      }
    } else {
      // If no data in localStorage, redirect back to form
      router.push("/kpis/create");
    }
  }, [router]);

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

    // Calculate year difference
    const yearDiff =
      targetData && base.data?.startYear
        ? Math.abs((targetData.targetYear ?? 0) - (base.data.startYear ?? 0))
        : 0;

    // Calculate reduction and annual rate
    const reduction = calculateTotal(
      emissionData?.totals,
      CalculateEmissionPercentage(targetData?.reductionPercentage ?? 0, emissionData?.totals)
    );

    const annualRateValue = yearDiff > 0 ? (+reduction / yearDiff).toFixed(3) : "0";

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
    mutationFn: async (targetDataPayload: TargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      return await api.post(`/target`, targetDataPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseline"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      // Clear localStorage after successful creation
      localStorage.removeItem("generalTargetSummary");
    },
   onError: (error: any) => { const serverMessage = error?.response?.data?.message || error.message || "Unknown error"; toast.error(serverMessage); },
  });

  const handlePrevious = () => {
    // Navigate back to form page - data will be preserved in localStorage
    router.push("/kpis/create");
  };

  const handleSetTarget = async () => {
    if (!targetData || !base.data) {
      console.error("Missing target data or baseline data");
      toast.error("Missing target data or baseline data");
      return;
    }

    const uniqueName = `Carbon Target ${base.data.startYear}-${targetData.targetYear} - ${Date.now()}`;

    try {
      console.log("Submitting with target emission:", calculatedTargetEmission);

      const targetPayload: TargetPayload = {
        name: targetData.name || uniqueName,
        type: "GENERAL",
        description: targetData.description || "General emissions reduction target",
        baselineYear: Number(base.data.startYear),
        targetYear: targetData.targetYear!,
        targetEmission: calculatedTargetEmission,
        baselineYearEmission: emissionData?.totals,
        currentEmission: null,
        reductionPercentage: targetData.reductionPercentage || 0,
      };

      await createTarget.mutateAsync(targetPayload);

      // Open success modal instead of immediate redirect
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to create target:", error);
      toast.error("Failed to create target. Please try again.");
      throw new Error(`Error: ${error}`);
    }
  };

  const handleModalContinue = () => {
    setIsSuccessModalOpen(false);
    router.push("/kpis");
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Show loading state while data is being loaded
  if (!targetData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading target data...</div>
      </div>
    );
  }

  // Show loading state while baseline data is loading
  if (base.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading baseline data...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 lg:mt-20">
      <GeneralTargetSummary
        annualRate={Number(annualRate)}
        reductionPercentage={targetData.reductionPercentage || 0}
        baselineEmission={emissionData?.totals ?? 0}
        targetEmission={calculatedTargetEmission}
        targetYear={targetData.targetYear ?? 0}
        baselineYear={emissionData?.startYear || 0}
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
