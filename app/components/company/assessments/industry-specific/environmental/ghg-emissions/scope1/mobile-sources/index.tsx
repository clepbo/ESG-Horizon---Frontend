"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoadTransport } from "./RoadTransport";
import { VehicleEquipment } from "./VehicleEquipment";
import { MarineAviation } from "./MarineAviation";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { BreadcrumbItemType } from "@/app/components/ui/CustomBreadcrumb";

interface MobileSourcesFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  initialStep?: StepKey;
  onBackToDisclosureTopics?: () => void;
}

const steps = ["Road Transport", "Vehicle Equipment", "Marine & Aviation"];
type StepKey = "road-transport" | "vehicle-equipment" | "marine-aviation";

export function MobileSourcesForm({
  onBack,
  onContinueToNextAssessment,
  initialStep,
  onBackToDisclosureTopics,
}: MobileSourcesFormProps) {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep || "road-transport");
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
    { label: "Mobile Sources", onClick: handleBackToOverview },
  ];

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Mobile Sources"
        sectionKey="mobileSources"
        totals={totals ?? undefined}
        nextAssessment="Process Emissions"
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={() => router.push("/assessments/new-assessment")}
      />
    );
  }

  if (currentStep === "road-transport") {
    return (
      <RoadTransport
        onBack={onBack}
        onNext={() => setCurrentStep("vehicle-equipment")}
        onBackToHub={onBack}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Road Transportation" }]}
      />
    );
  }

  if (currentStep === "vehicle-equipment") {
    return (
      <VehicleEquipment
        onBack={() => setCurrentStep("road-transport")}
        onNext={() => setCurrentStep("marine-aviation")}
        onBackToHub={onBack}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Vehicle Equipment" }]}
      />
    );
  }

  if (currentStep === "marine-aviation") {
    return (
      <MarineAviation
        onBack={() => setCurrentStep("vehicle-equipment")}
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
        stepIndex={3}
        totalSteps={steps.length}
        isSubmitted={isSubmitted}
        breadcrumb={[...overviewBreadcrumb, { label: "Marine & Aviation" }]}
      />
    );
  }

  return null;
}
