import React, { useState } from "react";
import { PurchasedGoodsAndServices } from "./upstream/PurchasedGoodsAndServices";
import { CapitalGoods } from "./upstream/CapitalGoods";
import { EnergyRelatedActivities } from "./upstream/EnergyRelatedActivities";
import { UpstreamTransportationAndDistribution } from "./upstream/UpstreamTransportationAndDistribution";
import { WasteGeneratedInOperations } from "./upstream/WasteGeneratedInOperations";
import { BusinessTravel } from "./upstream/BusinessTravel";
import { EmployeeCommuting } from "./upstream/EmployeeCommuting";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { LeasedAssets } from "./upstream/LeasedAssets";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { useAssessment } from "@/hooks/useAssessment";
import { TotalsResponse } from "@/services/assessment.service";
import { toast } from "react-toastify";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const { state, dispatch } = useAssessment();

  const { saveNow, submitGroup } = useAssessmentFlow("ghg-scope3-upstream");

  function handleNext(val: number) {
    setStep(val);
  }

  async function handleSubmit() {
    const data = state.assessmentData.environment?.ghg?.scope3?.upstream;

    try {
      // Bulk save all steps in the group before submitting
      if (data?.purchasedGoodsAndServices) {
        await saveNow(
          "environment.ghg.scope3.upstream.purchasedGoodsAndServices",
          data.purchasedGoodsAndServices
        );
      }
      if (data?.capitalGoods) {
        await saveNow("environment.ghg.scope3.upstream.capitalGoods", data.capitalGoods);
      }
      if (data?.fuelEnergyRelatedActivities) {
        await saveNow(
          "environment.ghg.scope3.upstream.fuelEnergyRelatedActivities",
          data.fuelEnergyRelatedActivities
        );
      }
      if (data?.upstreamTransportationDistribution) {
        await saveNow(
          "environment.ghg.scope3.upstream.upstreamTransportationDistribution",
          data.upstreamTransportationDistribution
        );
      }
      if (data?.wasteGeneratedInOperations) {
        await saveNow(
          "environment.ghg.scope3.upstream.wasteGeneratedInOperations",
          data.wasteGeneratedInOperations
        );
      }
      if (data?.businessTravel) {
        await saveNow("environment.ghg.scope3.upstream.businessTravel", data.businessTravel);
      }
      if (data?.employeeCommuting) {
        await saveNow("environment.ghg.scope3.upstream.employeeCommuting", data.employeeCommuting);
      }
      if (data?.upstreamLeasedAssets) {
        await saveNow(
          "environment.ghg.scope3.upstream.upstreamLeasedAssets",
          data.upstreamLeasedAssets
        );
      }

      const response = await submitGroup();
      setTotals(response?.totals ?? null);
      setShowSuccess(true);
    } catch (err) {
      toast.error("Submission failed");
      console.error("Submission failed:", err);
    }
  }

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Upstream Emissions"
        sectionKey="upstream"
        totals={totals ?? undefined}
        onContinue={handleBacktoGHG}
        onContinueAssessment={() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" })}
        onBackToHub={handleBacktoAssessment}
      />
    );
  }

  if (step === 0) {
    return (
      <PurchasedGoodsAndServices
        onBack={handleBacktoGHG}
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
        onSubmit={handleSubmit}
        stepIndex={8}
        totalSteps={8}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
      />
    );
  }
  return null;
}
