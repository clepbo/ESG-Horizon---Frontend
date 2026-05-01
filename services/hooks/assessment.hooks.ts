import { toast } from "react-toastify";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";
import { useAssessment as useAssessmentContext } from "@/hooks/useAssessment";
import { useEffect } from "react";

/**
 * Approve / decline / submit all change an assessment's status AND trigger
 * server-side report regeneration + ESG re-scoring. The dashboard, report
 * detail, and target progress views are derived from those recomputed values,
 * so a single ["assessments"] invalidation isn't enough — we also need to
 * refresh the singular assessment query (used by the details modal) and the
 * three downstream caches.
 */
function invalidateAfterStatusChange(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["assessments"] });
  queryClient.invalidateQueries({ queryKey: ["assessment"] });
  queryClient.invalidateQueries({ queryKey: ["company-dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["report"] });
  queryClient.invalidateQueries({ queryKey: ["targets-with-progress"] });
}

export const useAssessments = () => {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: assessmentService.getAssessments,
    staleTime: 30_000,
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
      const assessment = query.data;
      dispatch({
        type: "LOAD_SAVED_DATA",
        payload: {
          ...assessment.assessmentData,
          id: assessment.id,
          status: assessment.status,
          lastSavedForm: assessment.assessmentData?.lastSavedForm,
        },
      });
    }
  }, [query.data, dispatch]);

  return query;
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: assessmentService.deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.info("Draft assessment has been deleted.");
    },
    onError: (error: any) => {
      if (error._toastShown) return;
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
      invalidateAfterStatusChange(queryClient);
      toast.success("Assessment approved and report regenerated.");
    },
    onError: (error: any) => {
      if (error._toastShown) return;
      toast.error("Failed to approve assessment.");
    },
  });
};

export const useDeclineAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: any },
    Error,
    { assessmentId: number; reason: string }
  >({
    mutationFn: ({ assessmentId, reason }) =>
      assessmentService.declineAssessment(assessmentId, reason),
    onSuccess: () => {
      invalidateAfterStatusChange(queryClient);
      toast.success("Assessment rejected successfully.");
    },
    onError: (error: any) => {
      if (error._toastShown) return;
      toast.error("Failed to reject assessment.");
    },
  });
};

export const useSubmitForReview = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: any },
    Error,
    { assessmentId: number; reviewerId?: number }
  >({
    mutationFn: ({ assessmentId, reviewerId }) =>
      assessmentService.submitForReview(assessmentId, reviewerId),
    onSuccess: (data) => {
      invalidateAfterStatusChange(queryClient);
      const status = data?.data?.status;
      toast.success(
        status === "submitted_approved"
          ? "Assessment submitted successfully."
          : "Assessment submitted for review."
      );
    },
    onError: (error: any) => {
      if (error._toastShown) return;
      toast.error("Failed to submit assessment.");
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; data: any }, Error, number>({
    mutationFn: (assessmentId: number) => assessmentService.generateReport(assessmentId),
    onSuccess: () => {
      invalidateAfterStatusChange(queryClient);
      toast.success("Report generated successfully.");
    },
    onError: (error: any) => {
      if (error._toastShown) return;
      toast.error("Failed to generate report.");
    },
  });
};
