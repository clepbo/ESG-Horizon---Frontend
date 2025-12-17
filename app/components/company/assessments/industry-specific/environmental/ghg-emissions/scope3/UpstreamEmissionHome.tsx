import React, { useState } from "react";
import { PurchasedGoodsAndServices } from "./upstream/PurchasedGoodsAndServices";
import { CapitalGoods } from "./upstream/CapitalGoods";
import { EnergyRelatedActivities } from "./upstream/EnergyRelatedActivities";
import { UpstreamTransportationAndDistribution } from "./upstream/UpstreamTransportationAndDistribution";
import { WasteGeneratedInOperations } from "./upstream/WasteGeneratedInOperations";
import { BusinessTravel } from "./upstream/BusinessTravel";
import { EmployeeCommuting } from "./upstream/EmployeeCommuting";
import { LeasedAssets } from "./upstream/LeasedAssets";

export interface UpstreamProps {
  handleBacktoAssessment: () => void;
  handleBacktoGHG: () => void;
  backToDisclossureTopic: () => void;
}
export default function UpstreamEmissionHome({
  handleBacktoAssessment,
  handleBacktoGHG,
  backToDisclossureTopic,
}: UpstreamProps) {
  const [step, setStep] = useState(0);

  function handleNext(val: number) {
    setStep(val);
  }

  if (step === 0) {
    return (
      <PurchasedGoodsAndServices
        onBack={() => handleNext(0)}
        onNext={() => handleNext(1)}
        stepIndex={1}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 1) {
    return (
      <CapitalGoods
        onBack={() => handleNext(0)}
        onNext={() => handleNext(2)}
        stepIndex={2}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 2) {
    return (
      <EnergyRelatedActivities
        onBack={() => handleNext(1)}
        onNext={() => handleNext(3)}
        stepIndex={3}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 3) {
    return (
      <UpstreamTransportationAndDistribution
        onBack={() => handleNext(2)}
        onNext={() => handleNext(4)}
        stepIndex={4}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 4) {
    return (
      <WasteGeneratedInOperations
        onBack={() => handleNext(3)}
        onNext={() => handleNext(5)}
        stepIndex={5}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 5) {
    return (
      <BusinessTravel
        onBack={() => handleNext(4)}
        onNext={() => handleNext(6)}
        stepIndex={6}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 6) {
    return (
      <EmployeeCommuting
        onBack={() => handleNext(5)}
        onNext={() => handleNext(7)}
        stepIndex={7}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  if (step === 7) {
    return (
      <LeasedAssets
        onBack={() => handleNext(6)}
        onNext={() => handleNext(7)}
        stepIndex={8}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
}
