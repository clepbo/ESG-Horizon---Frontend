"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CementManufacturing } from "./CementManufacturing";
import { GasFlaring } from "./GasFlaring";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { BreadcrumbItemType } from "@/app/components/ui/CustomBreadcrumb";

interface ProcessEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
  onBackToDisclosureTopics?: () => void;
}

const steps = ["Cement Manufacturing", "Gas Flaring"];

type StepKey = "cement-manufacturing" | "gas-flaring";

export function ProcessEmissionsForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
}: ProcessEmissionsFormProps) {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "cement-manufacturing");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [_totals, setTotals] = useState<TotalsResponse | null>(null);

  const isAssignedTask = state.isAssignedTask || false;

  const handleBackToOverview = () => {
    onBack();
  };

  const overviewBreadcrumb: BreadcrumbItemType[] = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Process Emissions", onClick: handleBackToOverview },
  ];

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Process Emissions"
        sectionKey="processEmissions"
        totals={_totals ?? undefined}
        nextAssessment="Fugitive Emissions"
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={() => router.push("/assessments/new-assessment")}
      />
    );
  }

  if (currentStep === "cement-manufacturing") {
    return (
      <CementManufacturing
        onBack={onBack}
        onNext={() => setCurrentStep("gas-flaring")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Cement Manufacturing" }]}
      />
    );
  }

  if (currentStep === "gas-flaring") {
    return (
      <GasFlaring
        onBack={() => setCurrentStep("cement-manufacturing")}
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
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
        breadcrumb={[...overviewBreadcrumb, { label: "Gas Flaring" }]}
      />
    );
  }

  return null;
}
