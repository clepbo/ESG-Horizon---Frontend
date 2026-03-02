import React from "react";
import WaterAndWastemanagamentCards from "./components/WaterAndWastemanagamentCards";

interface AirQualityProps {
  backToDisclosureTopics: () => void;
  backToAssessmentHub: () => void;
  onContinueToNextAssessment?: () => void;
}
export default function WaterAndWastewaterManagement({
  backToDisclosureTopics,
  backToAssessmentHub,
  onContinueToNextAssessment,
}: AirQualityProps) {
  const [step, setStep] = React.useState<number>(0);

  if (step === 0) {
    return (
      <WaterAndWastemanagamentCards
        backToDisclosureTopics={backToDisclosureTopics}
        backToAssessmentHub={backToAssessmentHub}
        handleCardClick={() => setStep(1)}
        onContinueToNextAssessment={onContinueToNextAssessment}
      />
    );
  }
  //   if (step === 1) {
  //     return (
  //       <div>
  //         <AirQualityForm
  //           backToDisclosureTopics={backToDisclosureTopics}
  //           backToAssessmentHub={backToAssessmentHub}
  //           backToAirQualityCard={() => setStep(0)}
  //         />
  //       </div>
  //     );
  //   }

  return <h3> Water and waste </h3>;
}
