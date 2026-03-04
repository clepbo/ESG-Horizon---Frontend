"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ElectricityIppsForm } from "./ElectricityIpps";
import { ElectricityEACForm } from "./ElectricityEac";
import { ResidualForm } from "./Residual";
import { CoolingSteamForm } from "./CoolingSteam";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { BreadcrumbItemType } from "@/app/components/ui/CustomBreadcrumb";

interface MarketBasedFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
  onBackToDisclosureTopics?: () => void;
}

const steps = [
  "Purchased Electricity (IPPs)",
  "Purchased Electricity (EACs/RECs)",
  "Purchased Residual",
  "Purchased Cooling/Steam",
];

type StepKey = "electricityIPP" | "electricityEAC" | "residual" | "coolingSteam";

export function MarketBasedForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
  onBackToDisclosureTopics,
}: MarketBasedFormProps) {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "electricityIPP");
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
    { label: "Scope2 - Market Based", onClick: handleBackToOverview },
  ];

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Market Based"
        sectionKey="marketBased"
        totals={totals ?? undefined}
        nextAssessment="Scope3"
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={() => router.push("/assessments/new-assessment")}
      />
    );
  }

  if (currentStep === "electricityIPP") {
    return (
      <ElectricityIppsForm
        onBack={onBack}
        onNext={() => setCurrentStep("electricityEAC")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Electricity (IPPs)" }]}
      />
    );
  }

  if (currentStep === "electricityEAC") {
    return (
      <ElectricityEACForm
        onBack={() => setCurrentStep("electricityIPP")}
        onNext={() => setCurrentStep("residual")}
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Electricity (EACs/RECs)" }]}
      />
    );
  }

  if (currentStep === "residual") {
    return (
      <ResidualForm
        onBack={() => setCurrentStep("electricityEAC")}
        onNext={() => setCurrentStep("coolingSteam")}
        onBackToHub={onBack}
        stepIndex={3}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Residual" }]}
      />
    );
  }

  if (currentStep === "coolingSteam") {
    return (
      <CoolingSteamForm
        onBack={() => setCurrentStep("residual")}
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
        stepIndex={4}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Cooling/Steam" }]}
      />
    );
  }

  return null;
}
