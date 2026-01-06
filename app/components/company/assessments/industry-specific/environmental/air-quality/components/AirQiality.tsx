import React from "react";
import AirQualityCard from "./AirQualityCard";
import AirQualityForm from "./AirQualityForm";
import { SuccessScreen } from "../../../../SuccessScreen";
import { useAssessment } from "@/hooks/useAssessment";

interface AirQualityProps {
  backToDisclosureTopics: () => void;
  backToAssessmentHub: () => void;
}
export default function AirQiality({
  backToDisclosureTopics,
  backToAssessmentHub,
}: AirQualityProps) {
  const [step, setStep] = React.useState<number>(0);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const { dispatch } = useAssessment();

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Air Pollutant Emissions"
        nextAssessment="Water and Wastewater Management"
        onContinue={backToDisclosureTopics}
        onContinueAssessment={() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" })}
        breadcrumbs={[
          {
            label: "Disclosure topics",
            onClick: () => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" }),
          },
        ]}
        onBackToHub={backToAssessmentHub}
      />
    );
  }

  if (step === 0) {
    return (
      <AirQualityCard
        backToDisclosureTopics={backToDisclosureTopics}
        backToAssessmentHub={backToAssessmentHub}
        handleCardClick={() => setStep(1)}
      />
    );
  }
  if (step === 1) {
    return (
      <div>
        <AirQualityForm
          backToDisclosureTopics={backToDisclosureTopics}
          backToAssessmentHub={backToAssessmentHub}
          backToAirQualityCard={() => setStep(0)}
          onSubmit={() => setShowSuccess(true)}
        />
      </div>
    );
  }

  return null;
}
