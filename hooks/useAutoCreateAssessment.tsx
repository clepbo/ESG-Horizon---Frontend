import { useEffect } from "react";
import { useCreateAssessment } from "@/services/hooks/assessment.hooks";
import { useAssessment } from "@/hooks/useAssessment";

export const useAutoCreateAssessment = () => {
  const { state, dispatch } = useAssessment();
  const { mutateAsync: createAssessment } = useCreateAssessment();

  useEffect(() => {
    // Create only if this is a *brand new* assessment
    if (!state.assessmentData.assessmentId) {
      createAssessment()
        .then((newId) => {
          dispatch({ type: "SET_ASSESSMENT_ID", payload: newId });
        })
        .catch((err) => console.error("Failed to auto-create assessment", err));
    }
  }, [state.assessmentData.assessmentId, createAssessment, dispatch]);
};
