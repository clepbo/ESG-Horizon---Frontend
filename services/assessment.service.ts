/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assessment: any;
  progress: AssessmentProgress[];
  scopeTotals: ScopeTotals;
  totals?: TotalsResponse;
}

const ensureSubsidiary = (data: Partial<AssessmentData>): Partial<AssessmentData> => {
  if (!data.subsidiary || data.subsidiary.trim() === "") {
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

  saveAssessment: async (payload: {
    assessmentId?: number | null;
    data: Partial<AssessmentData>;
  }): Promise<SaveAssessmentResponse> => {
    const { assessmentId, data: assessmentData } = payload;
    const dataWithSubsidiary = ensureSubsidiary(assessmentData);

    const url = assessmentId ? `/assessments/save/${assessmentId}` : "/assessments/save";

    return await api.post(url, dataWithSubsidiary);
  },

  submitAssessment: async (
    assessmentId: number | null | undefined,
    data: Partial<AssessmentData>
  ): Promise<SubmitAssessmentResponse> => {
    const dataWithSubsidiary = ensureSubsidiary(data);

    const url = assessmentId ? `/assessments/submit/${assessmentId}` : "/assessments/submit";

    const response = await api.post(url, dataWithSubsidiary);
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
