"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessment as useAssessmentQuery } from "@/services/hooks/assessment.hooks";
import AssessmentHub from "../hub/AssessmentHub";
import { LAST_SAVED_FORM_MAP } from "@/lib/lastSavedFormToRoute";

export default function ContinueAssessment() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const forceDisclosureParam = searchParams?.get("forceDisclosure");
  const forceDisclosure =
    forceDisclosureParam === "1" ||
    forceDisclosureParam === "true" ||
    searchParams?.get("view") === "disclosure";

  const assessmentId = Number(id);
  const { data, isLoading } = useAssessmentQuery(assessmentId);
  const { dispatch, state } = useAssessment();

  useEffect(() => {
    if (!data) return;

    // When forceDisclosure has view/step params, always re-process them even if the
    // assessment is already loaded — the user navigated here from the details modal
    // Edit button and expects to land on the specific form section.
    const viewParam = searchParams?.get("view");
    const stepParam = searchParams?.get("step");
    const hasDeepLink = forceDisclosure && viewParam;

    // If we've already loaded this assessment and transitioned away from the initial hub view, don't re-run
    // — unless we have a deep link that needs to override the current view
    if (state.assessmentId === assessmentId && state.currentView !== "hub" && !hasDeepLink) return;

    const assessment = data;
    const lastSavedForm = assessment.assessmentData?.lastSavedForm;

    const getNestedData = (obj: any, path: string[]) => {
      return path.reduce((acc, key) => (acc && acc[key] ? acc[key] : undefined), obj);
    };

    const scope1Data = getNestedData(assessment.assessmentData, ["environment", "ghg", "scope1"]);
    const scope2Data = getNestedData(assessment.assessmentData, ["environment", "ghg", "scope2"]);
    const scope3Data = getNestedData(assessment.assessmentData, ["environment", "ghg", "scope3"]);

    const stationarySources = scope1Data?.stationarySources;
    const mobileSources = scope1Data?.mobileSources;
    const processEmissions = scope1Data?.processEmissions;
    const fugitiveEmissions = scope1Data?.fugitiveEmissions;

    const mappedStationarySources = stationarySources
      ? {
          ...stationarySources,
          industrialProcesses:
            stationarySources.industrialProcesses || stationarySources.industrialprocess,
          oilGasOperations:
            stationarySources.oilGasOperations || stationarySources.oilgasoperations,
        }
      : undefined;

    dispatch({ type: "SET_CONTINUE_MODE", payload: true });
    dispatch({ type: "SET_ASSESSMENT_ID", payload: assessmentId });

    const envBase = assessment.assessmentData?.environment || {};
    const ghgBase = envBase?.ghg || {};
    const scope1Base = ghgBase?.scope1 || {};
    const scope2Base = ghgBase?.scope2 || {};
    const scope3Base = ghgBase?.scope3 || {};

    const payload = {
      ...assessment.assessmentData,
      assessmentId,
      subsidiary: assessment.subsidiary,
      startMonth: assessment.startMonth,
      startYear: assessment.startYear,
      endMonth: assessment.endMonth,
      endYear: assessment.endYear,
      status: assessment.status,
      environment: {
        ...envBase,
        ghg: {
          ...ghgBase,
          scope1: {
            ...scope1Base,
            // Prefer nested path; fall back to legacy top-level keys for older assessments
            stationarySources:
              mappedStationarySources ||
              scope1Base.stationarySources ||
              assessment.assessmentData?.stationarySources,
            mobileSources:
              mobileSources ||
              scope1Base.mobileSources ||
              assessment.assessmentData?.mobileSources,
            processEmissions:
              processEmissions ||
              scope1Base.processEmissions ||
              assessment.assessmentData?.processEmissions,
            fugitiveEmissions:
              fugitiveEmissions ||
              scope1Base.fugitiveEmissions ||
              assessment.assessmentData?.fugitiveEmissions,
          },
          scope2: {
            ...scope2Base,
            locationBased:
              scope2Data?.locationBased ||
              scope2Base.locationBased ||
              assessment.assessmentData?.locationBased,
            marketBased:
              scope2Data?.marketBased ||
              scope2Base.marketBased ||
              assessment.assessmentData?.marketBased,
          },
          scope3: {
            ...scope3Base,
            upstream:
              scope3Data?.upstream ||
              scope3Base.upstream ||
              assessment.assessmentData?.upstream,
            downstream:
              scope3Data?.downstream ||
              scope3Base.downstream ||
              assessment.assessmentData?.downstream,
          },
        },
      },
      businessInnovation:
        getNestedData(assessment.assessmentData, ["environment", "businessInnovation"]) ||
        assessment.assessmentData?.environment?.businessInnovation ||
        assessment.assessmentData?.businessInnovation ||
        assessment.assessmentData?.businessModel ||
        assessment.assessmentData?.businessModelAndInnovation,
      leadershipGovernance:
        getNestedData(assessment.assessmentData, ["environment", "leadershipGovernance"]) ||
        assessment.assessmentData?.environment?.leadershipGovernance ||
        assessment.assessmentData?.leadershipGovernance,
      activityMetrics:
        assessment.assessmentData?.foundationalData?.activityMetrics ||
        getNestedData(assessment.assessmentData, ["environment", "activityMetrics"]) ||
        assessment.assessmentData?.environment?.activityMetrics ||
        assessment.assessmentData?.activityMetrics,
    };

    dispatch({
      type: "LOAD_SAVED_DATA",
      payload,
    });

    if (forceDisclosure) {
      if (viewParam) {
        dispatch({ type: "SET_VIEW", payload: viewParam });
        if (stepParam) {
          dispatch({ type: "SET_TARGET_STEP", payload: stepParam });
        }
      } else {
        dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
      }
      return;
    }

    if (lastSavedForm && LAST_SAVED_FORM_MAP[lastSavedForm]) {
      const { view, step } = LAST_SAVED_FORM_MAP[lastSavedForm];
      dispatch({ type: "SET_VIEW", payload: view });
      if (step) {
        dispatch({ type: "SET_TARGET_STEP", payload: step });
      }
    } else {
      dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
    }
  }, [data, dispatch, assessmentId, state.assessmentId, state.currentView, forceDisclosure]);

  if (isLoading) return <div className="p-10">Loading...</div>;

  return <AssessmentHub />;
}
