"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ElectricityHeatForm } from "./ElectricityHeat";
import { IndustrialProcessesForm } from "./IndustrialProcesses";
import { OilGasOperations } from "./OilGasOperations";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { BreadcrumbItemType } from "@/app/components/ui/CustomBreadcrumb";

interface StationarySourcesFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  onBackToHub: () => void;
  initialStep?: StepKey;
  onBackToDisclosureTopics?: () => void;
}

const steps = ["Electricity & Heat", "Industrial Processes", "Oil & Gas"];
type StepKey = "electricity-heat" | "industrial-processes" | "oil-gas";

export function StationarySourcesForm({
  onBack,
  onContinueToNextAssessment,
  onBackToHub,
  initialStep,
  _onBackToDisclosureTopics,
}: StationarySourcesFormProps) {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "electricity-heat");

  useEffect(() => {
    if (initialStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const isAssignedTask = state.isAssignedTask || false;

  const handleBackToOverview = () => {
    onBack();
  };

  const overviewBreadcrumb: BreadcrumbItemType[] = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Stationary Sources", onClick: handleBackToOverview },
  ];

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Stationary Sources"
        sectionKey="stationarySources"
        nextAssessment="Mobile Sources"
        totals={totals ?? undefined}
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={() => router.push("/assessments/new-assessment")}
      />
    );
  }

  if (currentStep === "electricity-heat") {
    return (
      <ElectricityHeatForm
        onBack={onBack}
        onNext={() => setCurrentStep("industrial-processes")}
        stepIndex={1}
        onBackToHub={onBackToHub}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Electricity & Heat Generation" }]}
      />
    );
  }

  if (currentStep === "industrial-processes") {
    return (
      <IndustrialProcessesForm
        onBack={() => setCurrentStep("electricity-heat")}
        onNext={() => setCurrentStep("oil-gas")}
        onBackToHub={onBackToHub}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Industrial Processes" }]}
      />
    );
  }

  if (currentStep === "oil-gas") {
    return (
      <OilGasOperations
        onBack={() => setCurrentStep("industrial-processes")}
        onSubmit={(totals) => {
          setTotals(totals);
          if (isAssignedTask) {
            dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
            onBack();
          } else {
            setShowSuccess(true);
            setIsSubmitted(true);
          }
        }}
        onBackToHub={onBackToHub}
        stepIndex={3}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
        breadcrumb={[...overviewBreadcrumb, { label: "Oil & Gas Operations" }]}
      />
    );
  }

  return null;
}
