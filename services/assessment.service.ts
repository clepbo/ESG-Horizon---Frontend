import api from "@/lib/api/axios";
import { AssessmentData } from "@/hooks/useAssessment";

export interface SaveAssessmentResponse {
  message: string;
  data: AssessmentData;
  assessmentId: number;
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
export interface AssessmentProgress {
  section: string;
  completed: boolean;
  progress: number;
}

export interface ScopeTotals {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface SubmitAssessmentResponse {
  message: string;
  assessment: any;
  progress: AssessmentProgress[];
  scopeTotals: ScopeTotals;
  totals?: TotalsResponse;
}

export const assessmentService = {
  createAssessment: async (payload: {
    subsidiary: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
  }) => {
    const res = await api.post("/assessments", payload);
    return res.data;
  },

  saveProgress: async (assessmentId: number, path: string, data: any, lastSavedForm?: string) => {
    return api.post(`/assessments/${assessmentId}/save`, {
      path,
      data,
      lastSavedForm,
    });
  },

  submitGroup: async (assessmentId: number, lastSavedForm?: string) => {
    return api.post(`/assessments/${assessmentId}/submit`, { lastSavedForm });
  },

  submitForReview: async (
    assessmentId: number,
    reviewerId?: number
  ): Promise<{ message: string; data: any }> => {
    return api.post(`/assessments/${assessmentId}/submit-for-review`, {
      reviewerId,
    });
  },

  getAssessments: async () => (await api.get("/assessments")).data,

  getAssessment: async (id: number) => {
    const res = await api.get(`/assessments/${id}`);
    return res.data;
  },

  approveAssessment: async (assessmentId: number): Promise<{ message: string; data: any }> => {
    const response = await api.post(`/assessments/${assessmentId}/approve`);
    return response;
  },

  declineAssessment: async (
    assessmentId: number,
    reason: string
  ): Promise<{ message: string; data: any }> => {
    const response = await api.post(`/assessments/${assessmentId}/decline`, { reason });
    return response;
  },

  deleteAssessment: async (assessmentId: number): Promise<void> => {
    await api.delete(`/assessments/${assessmentId}`);
  },

  generateReport: async (assessmentId: number): Promise<{ message: string; data: any }> => {
    const response = await api.post(`/report/generate/${assessmentId}`);
    return response;
  },
};
