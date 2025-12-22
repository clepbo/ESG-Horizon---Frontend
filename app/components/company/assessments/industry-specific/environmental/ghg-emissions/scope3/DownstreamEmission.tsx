import { useState } from "react";
import { UpstreamProps } from "./UpstreamEmissionHome";
import { DownstreamTransportationAndDistribution } from "./downstream/DownstreamTransportationAndDistribution";
import { DocumentUpload } from "./downstream/Step2DocumentUpload";
import { UseOfSoldProducts } from "./downstream/UseOfSoldProducts";
import { EndOfLifeTreatment } from "./downstream/EndOdLifeTreatmentOfSoldProducts";
import { DownstreamLeasedAsset } from "./downstream/DownstreamLeasedAssets";
import { Franchise } from "./downstream/Franchises";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { Investments } from "./downstream/Investments";

export default function DownstreamEmission({
  handleBacktoAssessment,
  handleBacktoGHG,
  backToDisclossureTopic,
}: UpstreamProps) {
  const [step, setStep] = useState(0);

  const { submitGroup } = useAssessmentFlow("ghg-scope3-downstream");

  function handleNext(val: number) {
    setStep(val);
  }

  async function handleFinalNext() {
    await submitGroup();
    handleBacktoGHG();
  }

  if (step === 0) {
    return (
      <DownstreamTransportationAndDistribution
        onBack={() => handleNext(0)}
        onNext={() => handleNext(1)}
        stepIndex={1}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 1) {
    return (
      <DocumentUpload
        onBack={() => handleNext(0)}
        onNext={() => handleNext(2)}
        stepIndex={2}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToParentSection={handleBacktoGHG}
      />
    );
  }
  if (step === 2) {
    return (
      <UseOfSoldProducts
        onBack={() => handleNext(1)}
        onNext={() => handleNext(3)}
        stepIndex={3}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 3) {
    return (
      <EndOfLifeTreatment
        onBack={() => handleNext(2)}
        onNext={() => handleNext(4)}
        stepIndex={4}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 4) {
    return (
      <DownstreamLeasedAsset
        onBack={() => handleNext(3)}
        onNext={() => handleNext(5)}
        stepIndex={5}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 5) {
    return (
      <Franchise
        onBack={() => handleNext(4)}
        onNext={() => handleNext(6)}
        stepIndex={6}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 6) {
    return (
      <Investments
        onBack={() => handleNext(5)}
        onNext={handleFinalNext}
        stepIndex={7}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
}
