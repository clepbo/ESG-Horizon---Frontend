/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Helper function to ensure subsidiary is set (use company name if empty)
const ensureSubsidiary = (data: Partial<AssessmentData>): Partial<AssessmentData> => {
  if (!data.subsidiary || data.subsidiary.trim() === "") {
    // If no subsidiary, we'll let the backend handle it or use a default
    // The frontend should have already set this in handleProceed
    return { ...data, subsidiary: data.subsidiary || "Self" };
  }
  return data;
};

export const assessmentService = {
  getAssessments: async () => {
    const { data } = await api.get("/assessments");
    return data;
  },

  getAssessment: async (assessmentId: number) => {
    const response = await api.get(`/assessments/${assessmentId}`);
    return response;
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
    const dataWithSubsidiary = ensureSubsidiary(assessmentData);
    return await api.post(`/assessments/${assessmentId}/save`, dataWithSubsidiary);
  },

  submitAssessment: async (payload: {
    assessmentId: number;
    data: Partial<AssessmentData>;
  }): Promise<SubmitAssessmentResponse> => {
    const { assessmentId, data: assessmentData } = payload;
    const dataWithSubsidiary = ensureSubsidiary(assessmentData);
    const response = await api.post(`/assessments/${assessmentId}/submit`, dataWithSubsidiary);
    return response;
  },

  approveAssessment: async (assessmentId: number): Promise<{ message: string; data: any }> => {
    const response = await api.post(`/assessments/${assessmentId}/approve`);
    return response;
  },

  rejectAssessment: async (
    assessmentId: number,
    reason: string
  ): Promise<{ message: string; data: any }> => {
    const response = await api.post(`/assessments/${assessmentId}/reject`, { reason });
    return response;
  },

  deleteAssessment: async (assessmentId: number): Promise<void> => {
    await api.delete(`/assessments/${assessmentId}`);
  },
};
