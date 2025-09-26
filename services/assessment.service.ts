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
    // New endpoint to fetch all assessments for the company
    getAssessments: async () => {
        const { data } = await api.get("/assessments");
        return data.data;
    },
    
    // New endpoint to fetch a single assessment by ID
    getAssessment: async (assessmentId: string) => {
        const { data } = await api.get(`/assessments/${assessmentId}`);
        return data.data;
    },
    
    // New endpoint to create a new assessment and get an ID
    createAssessment: async (): Promise<{ assessmentId: string }> => {
        const { data } = await api.post("/assessments/create");
        return data;
    },

    // Updated to accept an assessmentId
    saveAssessment: async (
        // Note: This function expects a single payload object, not two separate arguments.
        payload: { assessmentId: string; data: Partial<AssessmentData> }
    ): Promise<SaveAssessmentResponse> => {
        const { assessmentId, data: assessmentData } = payload;
        const { data } = await api.post(`/assessments/${assessmentId}/save`, assessmentData);
        return data;
    },

    // Updated to accept an assessmentId
    submitAssessment: async (
        // Note: This function expects a single payload object, not two separate arguments.
        payload: { assessmentId: string; data: Partial<AssessmentData> }
    ): Promise<SubmitAssessmentResponse> => {
        const { assessmentId, data: assessmentData } = payload;
        const { data } = await api.post(`/assessments/${assessmentId}/submit`, assessmentData);
        return data;
    },
};



// import api from "@/lib/api/axios";
// import { AssessmentData } from "@/hooks/useAssessment";

// interface SaveAssessmentResponse {
//     message: string;
//     data: AssessmentData;
// }

// interface SubmitAssessmentResponse {
//     message: string;
// }

// export const assessmentService = {
//     saveAssessment: async (
//         payload: Partial<AssessmentData>
//     ): Promise<SaveAssessmentResponse> => {
//         const { data } = await api.post("/assessments/save", payload);
//         return data;
//     },

//     submitAssessment: async (
//         payload: Partial<AssessmentData>
//     ): Promise<SubmitAssessmentResponse> => {
//         const { data } = await api.post("/assessments/submit", payload);
//         return data;
//     },
// };
