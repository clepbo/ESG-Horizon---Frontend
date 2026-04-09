import { useState, useEffect } from "react";
import { UpstreamProps } from "./UpstreamEmissionHome";
import { DownstreamTransportationAndDistribution } from "./downstream/DownstreamTransportationAndDistribution";
import { DocumentUpload } from "./downstream/Step2DocumentUpload";
import { UseOfSoldProducts } from "./downstream/UseOfSoldProducts";
import { EndOfLifeTreatment } from "./downstream/EndOdLifeTreatmentOfSoldProducts";
import { DownstreamLeasedAsset } from "./downstream/DownstreamLeasedAssets";
import { Franchise } from "./downstream/Franchises";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { Investments } from "./downstream/Investments";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { useAssessment } from "@/hooks/useAssessment";
import { TotalsResponse } from "@/services/assessment.service";
import { toast } from "react-toastify";

export default function DownstreamEmission({
  handleBacktoAssessment,
  handleBacktoGHG,
  backToDisclossureTopic,
  initialStep,
  onContinueToNextAssessment,
}: UpstreamProps) {
  const [step, setStep] = useState(() => {
    const parsed = Number(initialStep);
    return !isNaN(parsed) && parsed >= 0 && parsed <= 6 ? parsed : 0;
  });

  useEffect(() => {
    if (initialStep !== undefined) {
      const parsed = Number(initialStep);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
        setStep(parsed);
      }
    }
  }, [initialStep]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const { state, dispatch } = useAssessment();

  const { saveQuiet, saveAndSubmit } = useAssessmentFlow(
    "ghg-scope3-downstream",
    "environment.ghg.scope3.downstream"
  );

  function handleNext(val: number) {
    setStep(val);
  }

  async function handleSubmit(investmentsPayload?: any) {
    if (submitting) return;
    setSubmitting(true);
    const data = state.assessmentData.environment?.ghg?.scope3?.downstream;

    try {
      // Save all steps sequentially to avoid read-modify-write race conditions.
      // Each save must complete before the next starts so the DB state is consistent.
      if (data?.downstreamTransportationDistribution) {
        await saveQuiet(
          "environment.ghg.scope3.downstream.downstreamTransportationDistribution",
          data.downstreamTransportationDistribution
        );
      }
      if (data?.processingSoldProducts) {
        await saveQuiet(
          "environment.ghg.scope3.downstream.processingSoldProducts",
          data.processingSoldProducts
        );
      }
      if (data?.useOfSoldProducts) {
        await saveQuiet(
          "environment.ghg.scope3.downstream.useOfSoldProducts",
          data.useOfSoldProducts
        );
      }
      if (data?.endOfLifeTreatment) {
        await saveQuiet(
          "environment.ghg.scope3.downstream.endOfLifeTreatment",
          data.endOfLifeTreatment
        );
      }
      if (data?.downstreamLeasedAssets) {
        await saveQuiet(
          "environment.ghg.scope3.downstream.downstreamLeasedAssets",
          data.downstreamLeasedAssets
        );
      }
      if (data?.franchises) {
        await saveQuiet("environment.ghg.scope3.downstream.franchises", data.franchises);
      }
      const investData = investmentsPayload || data?.investments;
      const response = await saveAndSubmit(
        "environment.ghg.scope3.downstream.investments",
        investData || {}
      );
      setTotals(response?.totals ?? null);
      setShowSuccess(true);
    } catch (err) {
      toast.error("Submission failed");
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Downstream Emissions"
        sectionKey="downstreamEmissions"
        totals={totals ?? undefined}
        nextAssessment={onContinueToNextAssessment ? "Air Quality" : undefined}
        onContinue={handleBacktoGHG}
        onContinueAssessment={
          onContinueToNextAssessment ??
          (() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" }))
        }
        onBackToHub={handleBacktoAssessment}
      />
    );
  }

  if (step === 0) {
    return (
      <DownstreamTransportationAndDistribution
        onBack={handleBacktoGHG}
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
        onSubmit={handleSubmit}
        stepIndex={7}
        totalSteps={7}
        backToAssessment={handleBacktoAssessment}
        backToDisclosureTopics={backToDisclossureTopic}
        backToGHGEmissions={handleBacktoGHG}
        parentSubmitting={submitting}
      />
    );
  }
  return null;
}
