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
    if (!data?.data) return;

    // If we've already loaded this assessment and transitioned away from the initial hub view, don't re-run
    if (state.assessmentId === assessmentId && state.currentView !== "hub") return;

    const assessment = data.data;
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

    const payload = {
      ...assessment.assessmentData,
      assessmentId,
      subsidiary: assessment.subsidiary,
      startMonth: assessment.startMonth,
      startYear: assessment.startYear,
      endMonth: assessment.endMonth,
      endYear: assessment.endYear,
      status: assessment.status,
      stationarySources: mappedStationarySources || assessment.assessmentData?.stationarySources,
      mobileSources: mobileSources || assessment.assessmentData?.mobileSources,
      processEmissions: processEmissions || assessment.assessmentData?.processEmissions,
      fugitiveEmissions: fugitiveEmissions || assessment.assessmentData?.fugitiveEmissions,
      locationBased: scope2Data?.locationBased || assessment.assessmentData?.locationBased,
      marketBased: scope2Data?.marketBased || assessment.assessmentData?.marketBased,
      upstream: scope3Data?.upstream || assessment.assessmentData?.upstream,
      downstream: scope3Data?.downstream || assessment.assessmentData?.downstream,
      environment: {
        ...(assessment.assessmentData?.environment || {}),
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
        getNestedData(assessment.assessmentData, ["environment", "activityMetrics"]) ||
        assessment.assessmentData?.environment?.activityMetrics ||
        assessment.assessmentData?.activityMetrics,
    };

    dispatch({
      type: "LOAD_SAVED_DATA",
      payload,
    });

    if (forceDisclosure) {
      dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
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
