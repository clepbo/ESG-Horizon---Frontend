import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assessmentService,
  SubmitAssessmentResponse,
  AssessmentProgress,
  ScopeTotals,
  TotalsResponse,
  SaveAssessmentResponse,
} from "@/services/assessment.service";
import { useAssessment as useAssessmentContext, AssessmentData } from "@/hooks/useAssessment";
import { useEffect } from "react";

interface RawAssessmentResponse {
  data: {
    id: number;
    assessmentData:
      | (AssessmentData & {
          __computed?: {
            progress?: AssessmentProgress[];
            scopeTotals?: ScopeTotals;
            totals?: TotalsResponse;
            computedAt?: string;
          };
        })
      | null;
    status: string;
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    subsidiary?: string;
    createdAt?: string;
    updatedAt?: string;
    rejection_reason?: string | null;
    reviewedAt?: string | null;
  };
}

const mapServerResponseToState = (rawResponse: RawAssessmentResponse): AssessmentData => {
  const rawAssessment = rawResponse.data;
  const assessmentData = (rawAssessment.assessmentData || {}) as AssessmentData;
  const computed = (assessmentData as any).__computed || {};

  return {
    ...assessmentData,
    id: rawAssessment.id,
    status: rawAssessment.status,
    progress: computed.progress || assessmentData.progress,
    scopeTotals: computed.scopeTotals || assessmentData.scopeTotals,
    totals: computed.totals || assessmentData.totals,
  };
};

export const useAssessments = () => {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: assessmentService.getAssessments,
  });
};

export const useAssessment = (assessmentId?: number) => {
  const { dispatch } = useAssessmentContext();

  const query = useQuery({
    queryKey: ["assessment", assessmentId],
    queryFn: () => assessmentService.getAssessment(assessmentId!),
    enabled: !!assessmentId,
  });

  useEffect(() => {
    if (query.data) {
      const flattenedData = mapServerResponseToState(query.data);
      dispatch({ type: "LOAD_SAVED_DATA", payload: flattenedData });
    }
  }, [query.data, dispatch]);

  return query;
};

export const useSaveAssessment = () => {
  const queryClient = useQueryClient();
  const { dispatch, state } = useAssessmentContext();

  return useMutation<
    SaveAssessmentResponse,
    Error,
    { assessmentId?: number | null; data: Partial<AssessmentData> }
  >({
    mutationFn: ({ assessmentId, data }) => {
      const dataWithProgress = { ...data, progress: state.assessmentData.progress };
      return assessmentService.saveAssessment({ assessmentId, data: dataWithProgress });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment data saved successfully!");

      const savedProgress = (response.data as any).assessmentData?.__computed?.progress || [];

      dispatch({
        type: "SET_COMPUTED_DATA",
        payload: {
          assessmentId: response.assessmentId,
          progress: savedProgress,
          scopeTotals: state.scopeTotals,
          totals: state.assessmentData.totals,
          status: response.data.status ?? "",
        },
      });
    },
    onError: () => {
      toast.error("Failed to save data. Please try again.");
    },
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  const { dispatch, state } = useAssessmentContext();

  return useMutation<
    SubmitAssessmentResponse,
    Error,
    { assessmentId?: number | null; data: Partial<AssessmentData> }
  >({
    mutationFn: async ({ assessmentId, data }) => {
      const dataWithProgress = { ...data, progress: state.assessmentData.progress };
      return assessmentService.submitAssessment(assessmentId, dataWithProgress);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      toast.success("Assessment submitted successfully!");

      dispatch({
        type: "SET_COMPUTED_DATA",
        payload: {
          assessmentId: response.assessment.id,
          progress: response.progress,
          scopeTotals: response.scopeTotals,
          totals: response.totals,
          status: response.assessment.status,
        },
      });
    },
    onError: (error) => {
      console.error("Assessment submission error:", error);
      toast.error("Failed to submit assessment. Please try again.");
    },
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: assessmentService.deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Draft assessment deleted successfully.");
    },
    onError: (error) => {
      const errorMessage =
        error.message ||
        "Failed to delete assessment. Only 'draft' status assessments can be deleted.";
      toast.error(errorMessage);
    },
  });
};

export const useApproveAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (assessmentId: number) => assessmentService.approveAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment approved. Report generation started.");
    },
    onError: () => {
      toast.error("Failed to approve assessment.");
    },
  });
};

export const useRejectAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: any },
    Error,
    { assessmentId: number; reason: string }
  >({
    mutationFn: ({ assessmentId, reason }) =>
      assessmentService.rejectAssessment(assessmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment rejected successfully.");
    },
    onError: () => {
      toast.error("Failed to reject assessment.");
    },
  });
};
