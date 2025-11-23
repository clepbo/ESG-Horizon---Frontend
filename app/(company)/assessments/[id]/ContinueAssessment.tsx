"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessment as useAssessmentQuery } from "@/services/hooks/assessment.hooks";
import AssessmentHub from "../hub/AssessmentHub";
import { LAST_SAVED_FORM_MAP } from "@/lib/lastSavedFormToRoute";

export default function ContinueAssessment() {
  const { id } = useParams<{ id: string }>();
  const assessmentId = Number(id);
  const { data, isLoading } = useAssessmentQuery(assessmentId);
  const { dispatch, state } = useAssessment();

  useEffect(() => {
    if (!data?.data || state.assessmentId) return;

    const assessment = data.data;
    const lastSavedForm = assessment.assessmentData?.lastSavedForm;

    const getNestedData = (obj: any, path: string[]) => {
      return path.reduce((acc, key) => (acc && acc[key] ? acc[key] : undefined), obj);
    };

    const scope1Data = getNestedData(assessment.assessmentData, ["environment", "ghg", "scope1"]);

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

    const scope2Data = getNestedData(assessment.assessmentData, ["environment", "ghg", "scope2"]);

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
    };

    console.log("Dispatching LOAD_SAVED_DATA with payload:", payload);

    dispatch({
      type: "LOAD_SAVED_DATA",
      payload,
    });

    if (lastSavedForm && LAST_SAVED_FORM_MAP[lastSavedForm]) {
      const { view, step } = LAST_SAVED_FORM_MAP[lastSavedForm];
      dispatch({ type: "SET_VIEW", payload: view });
      if (step) {
        dispatch({ type: "SET_TARGET_STEP", payload: step });
      }
    } else {
      dispatch({ type: "SET_VIEW", payload: "disclosure" });
    }
  }, [data, dispatch, assessmentId, state.assessmentId]);

  if (isLoading) return <div className="p-10">Loading...</div>;

  return <AssessmentHub />;
}
