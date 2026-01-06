"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAssessment as useAssessmentContext } from "@/hooks/useAssessment";
import { useAssessment } from "@/services/hooks/assessment.hooks";
import AssessmentHub from "../hub/AssessmentHub";

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useAssessment(Number(id));
  const { dispatch, state } = useAssessmentContext();

  useEffect(() => {
    if (data?.data) {
      const assessmentId = Number(id);
      const assessmentData = data.data.assessmentData || {};
      const lastSavedForm = assessmentData.lastSavedForm;

      dispatch({ type: "SET_CONTINUE_MODE", payload: true });
      dispatch({ type: "SET_ASSESSMENT_ID", payload: assessmentId });
      dispatch({
        type: "LOAD_SAVED_DATA",
        payload: {
          ...assessmentData,
          assessmentId,
          subsidiary: data.data.subsidiary || assessmentData.subsidiary || "",
          startMonth: data.data.startMonth || assessmentData.startMonth || "",
          startYear: data.data.startYear || assessmentData.startYear || "",
          endMonth: data.data.endMonth || assessmentData.endMonth || "",
          endYear: data.data.endYear || assessmentData.endYear || "",
        },
      });

      if (lastSavedForm) {
        dispatch({ type: "SET_VIEW", payload: lastSavedForm });
      } else {
        dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
      }
    }
  }, [data, dispatch, id]);

  if (isLoading || !data?.data) {
    return <div className="p-10">Loading assessment...</div>;
  }

  if (state.currentView === "hub") {
    return <div className="p-10">Loading assessment...</div>;
  }

  return <AssessmentHub />;
}
