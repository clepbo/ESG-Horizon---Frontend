"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAssessment as useAssessmentContext } from "@/hooks/useAssessment";
import { useAssessment } from "@/services/hooks/assessment.hooks";
import AssessmentHub from "../hub/AssessmentHub";

export default function AssessmentPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useAssessment(Number(id));
    const { dispatch } = useAssessmentContext();

    useEffect(() => {
        if (data) {
            dispatch({ type: "SET_ASSESSMENT_ID", payload: data.id });
            dispatch({ type: "LOAD_SAVED_DATA", payload: data.assessmentData });
            dispatch({ type: "SET_VIEW", payload: "ghg-stationary-sources" });
        }
    }, [data, dispatch]);

    if (isLoading) return <div className="p-10">Loading assessment...</div>;

    return <AssessmentHub />;
}
