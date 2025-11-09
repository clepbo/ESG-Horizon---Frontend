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
  progress: number; // 0-100
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

  // saveAssessment: async (payload: {
  //   assessmentId: number;
  //   data: Partial<AssessmentData>;
  // }): Promise<SaveAssessmentResponse> => {
  //   const { assessmentId, data: assessmentData } = payload;
  //   const dataWithSubsidiary = ensureSubsidiary(assessmentData);
  //   return await api.post(`/assessments/${assessmentId}/save`, dataWithSubsidiary);
  // },

  // submitAssessment: async (assessmentId: number, data: Partial<AssessmentData>): Promise<SubmitAssessmentResponse> => {
  //   const dataWithSubsidiary = ensureSubsidiary(data);
  //   const response = await api.post(`/assessments/${assessmentId}/submit`, dataWithSubsidiary);
  //   return response;
  // },

  saveAssessment: async (payload: {
    // 💡 assessmentId is now optional/nullable
    assessmentId?: number | null; 
    data: Partial<AssessmentData>;
  }): Promise<SaveAssessmentResponse> => {
    const { assessmentId, data: assessmentData } = payload;
    const dataWithSubsidiary = ensureSubsidiary(assessmentData);
    
    // 💡 NEW URL LOGIC: Use /save or /save/:id
    const url = assessmentId 
      ? `/assessments/save/${assessmentId}` 
      : "/assessments/save";

    // Backend returns { message, data: assessment, assessmentId: number }
    return await api.post(url, dataWithSubsidiary); 
  },

  submitAssessment: async (
    // 💡 assessmentId is now optional/nullable
    assessmentId: number | null | undefined, 
    data: Partial<AssessmentData>
  ): Promise<SubmitAssessmentResponse> => {
    const dataWithSubsidiary = ensureSubsidiary(data);
    
    // 💡 NEW URL LOGIC: Use /submit or /submit/:id
    const url = assessmentId 
      ? `/assessments/submit/${assessmentId}` 
      : "/assessments/submit";
      
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
