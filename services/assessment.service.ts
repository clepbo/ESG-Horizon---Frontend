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
  // 1. Create assessment (only metadata)
  createAssessment: async (payload: {
    subsidiary: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
  }) => {
    const res = await api.post("/assessments", payload);
    return res.data; // { id: number }
  },

  // 2. Partial progress save
  saveProgress: async (assessmentId: number, path: string, data: any, lastSavedForm?: string) => {
    return api.post(`/assessments/${assessmentId}/save`, {
      path,
      data,
      lastSavedForm, // ← NEW: tells backend where user was
    });
  },

  // 3. Final submit of a group
  submitGroup: async (assessmentId: number, lastSavedForm?: string) => {
    return api.post(`/assessments/${assessmentId}/submit`, { lastSavedForm });
  },

  // Keep old ones for list/loading
  getAssessments: async () => (await api.get("/assessments")).data,
  getAssessment: async (id: number) => (await api.get(`/assessments/${id}`)).data,

  // saveAssessment: async (payload: {
  //   assessmentId?: number | null;
  //   data: Partial<AssessmentData>;
  // }): Promise<SaveAssessmentResponse> => {
  //   const { assessmentId, data: assessmentData } = payload;
  //   const dataWithSubsidiary = ensureSubsidiary(assessmentData);

  //   const url = assessmentId ? `/assessments/save/${assessmentId}` : "/assessments/save";

  //   return await api.post(url, dataWithSubsidiary);
  // },

  // submitAssessment: async (
  //   assessmentId: number | null | undefined,
  //   data: Partial<AssessmentData>
  // ): Promise<SubmitAssessmentResponse> => {
  //   const dataWithSubsidiary = ensureSubsidiary(data);

  //   const url = assessmentId ? `/assessments/submit/${assessmentId}` : "/assessments/submit";

  //   const response = await api.post(url, dataWithSubsidiary);
  //   return response;
  // },

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
