import api from "@/lib/api/axios";
import { AssessmentData } from "@/hooks/useAssessment";

interface SaveAssessmentResponse {
    message: string;
    data: AssessmentData;
}

interface SubmitAssessmentResponse {
    message: string;
}

export const assessmentService = {
    saveAssessment: async (
        payload: Partial<AssessmentData>
    ): Promise<SaveAssessmentResponse> => {
        const { data } = await api.post("/assessments/save", payload);
        return data;
    },

    submitAssessment: async (
        payload: Partial<AssessmentData>
    ): Promise<SubmitAssessmentResponse> => {
        const { data } = await api.post("/assessments/submit", payload);
        return data;
    },
};
