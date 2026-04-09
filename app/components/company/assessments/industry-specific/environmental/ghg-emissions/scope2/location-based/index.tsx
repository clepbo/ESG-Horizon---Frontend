"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PurchasedElectricityForm } from "./PurchaseElectricity";
import { PurchasedCoolingForm } from "./PurchasedCooling";
import { PurchasedSteamForm } from "./PurchasedSteam";
import { PurchasedHeatingForm } from "./PurchasedHeating";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { BreadcrumbItemType } from "@/app/components/ui/CustomBreadcrumb";

interface LocationBasedFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
  onBackToDisclosureTopics?: () => void;
}

const steps = [
  "Purchased Electricity",
  "Purchased Cooling",
  "Purchased Steam",
  "Purchased Heating",
];
type StepKey = "electricity" | "cooling" | "steam" | "heating";

export function LocationBasedForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
  onBackToDisclosureTopics: _onBackToDisclosureTopics,
}: LocationBasedFormProps) {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "electricity");
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
    { label: "Scope 2 - Location Based", onClick: handleBackToOverview },
  ];

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Location Based"
        sectionKey="scope2Location"
        totals={totals ?? undefined}
        nextAssessment="Market Based"
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={() => router.push("/assessments/new-assessment")}
      />
    );
  }

  if (currentStep === "electricity") {
    return (
      <PurchasedElectricityForm
        onBack={onBack}
        onNext={() => setCurrentStep("cooling")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Electricity" }]}
      />
    );
  }

  if (currentStep === "cooling") {
    return (
      <PurchasedCoolingForm
        onBack={() => setCurrentStep("electricity")}
        onNext={() => setCurrentStep("steam")}
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Cooling" }]}
      />
    );
  }

  if (currentStep === "steam") {
    return (
      <PurchasedSteamForm
        onBack={() => setCurrentStep("cooling")}
        onNext={() => setCurrentStep("heating")}
        onBackToHub={onBack}
        stepIndex={3}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Steam" }]}
      />
    );
  }

  if (currentStep === "heating") {
    return (
      <PurchasedHeatingForm
        onBack={() => setCurrentStep("steam")}
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
        breadcrumb={[...overviewBreadcrumb, { label: "Purchased Heating" }]}
      />
    );
  }

  return null;
}
