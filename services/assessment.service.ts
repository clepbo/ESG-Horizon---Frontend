import api from "@/lib/api/axios";
import { AssessmentData } from "@/hooks/useAssessment";

interface SaveAssessmentResponse {
    message: string;
    data: AssessmentData;
}

export interface TotalsBreakdown {
    [section: string]: {
        sum: number;
        [key: string]: { unit: string; value: number } | number;
    };
}

export interface TotalsResponse {
    totals: {
        sum: number;
        breakdown: TotalsBreakdown;
    };
    computedAt: string;
}
export interface SubmitAssessmentResponse {
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assessment: any;
    totals?: TotalsResponse;
}

export const assessmentService = {
    getAssessments: async () => {
        return await api.get("/assessments");
    },

    getAssessment: async (assessmentId: number) => {
        return await api.get(`/assessments/${assessmentId}`);
    },

    createAssessment: async (): Promise<number> => {
        const response = await api.post("/assessments/create");
        return response.assessmentId;
    },

    saveAssessment: async (payload: {
        assessmentId: number;
        data: Partial<AssessmentData>;
    }): Promise<SaveAssessmentResponse> => {
        const { assessmentId, data: assessmentData } = payload;
        return await api.post(
            `/assessments/${assessmentId}/save`,
            assessmentData
        );
    },

    submitAssessment: async (payload: {
        assessmentId: number;
        data: Partial<AssessmentData>;
    }): Promise<SubmitAssessmentResponse> => {
        const { assessmentId, data: assessmentData } = payload;
        const response = await api.post(
            `/assessments/${assessmentId}/submit`,
            assessmentData
        );
        return response;
    },
};
