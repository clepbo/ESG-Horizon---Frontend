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
    const { data } = await api.get("/assessments");
    return data;
  },

  getAssessment: async (assessmentId: number) => {
    const { data } = await api.get(`/assessments/${assessmentId}`);
    return data;
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
    return await api.post(`/assessments/${assessmentId}/save`, assessmentData);
  },

  submitAssessment: async (payload: {
    assessmentId: number;
    data: Partial<AssessmentData>;
  }): Promise<SubmitAssessmentResponse> => {
    const { assessmentId, data: assessmentData } = payload;
    const response = await api.post(`/assessments/${assessmentId}/submit`, assessmentData);
    return response;
  },

  approveAssessment: async (assessmentId: number): Promise<{ message: string }> => {
    const response = await api.post(`/assessments/${assessmentId}/approve`);
    return response;
  },

  unapproveAssessment: async (
    assessmentId: number,
    rejectionReason: string
  ): Promise<{ message: string }> => {
    const response = await api.post(`/assessments/${assessmentId}/unapprove`, { rejectionReason });
    return response;
  },

  deleteAssessment: async (assessmentId: number): Promise<void> => {
    try {
      await api.delete(`/assessments/${assessmentId}`);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response
      ) {
        const status = (error.response as { status: number }).status;
        if (status >= 200 && status < 300) {
          return;
        }
      }
      throw error;
    }
  },
};
