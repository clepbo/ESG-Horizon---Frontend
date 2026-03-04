"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VentingNaturalGas } from "./VentingNaturalGas";
import { HFCLeaks } from "./HFCLeaks";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { BreadcrumbItemType } from "@/app/components/ui/CustomBreadcrumb";

interface FugitiveEmissionsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
  onBackToDisclosureTopics?: () => void;
}

const steps = ["venting-natural-gas", "hfc-leaks"] as const;
type StepKey = (typeof steps)[number];

export function FugitiveEmissionsForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
  onBackToDisclosureTopics,
}: FugitiveEmissionsFormProps) {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "venting-natural-gas");
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
    { label: "Fugitive Emissions", onClick: handleBackToOverview },
  ];

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Fugitive Emissions"
        sectionKey="fugitiveEmissions"
        totals={totals ?? undefined}
        nextAssessment="Location-Based"
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={() => router.push("/assessments/new-assessment")}
      />
    );
  }

  if (currentStep === "venting-natural-gas") {
    return (
      <VentingNaturalGas
        onBack={onBack}
        onNext={() => setCurrentStep("hfc-leaks")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Venting Natural Gas" }]}
      />
    );
  }

  if (currentStep === "hfc-leaks") {
    return (
      <HFCLeaks
        onBack={() => setCurrentStep("venting-natural-gas")}
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
        breadcrumb={[...overviewBreadcrumb, { label: "HFC Leaks" }]}
      />
    );
  }
}
