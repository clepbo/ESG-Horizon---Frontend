import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";
import { useAssessment as useAssessmentContext } from "@/hooks/useAssessment";
import { useEffect } from "react";

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
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment approved. Report generation started.");
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
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
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
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
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
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Report generated successfully.");
    },
    onError: (error: any) => {
      if (error._toastShown) return;
      toast.error("Failed to generate report.");
    },
  });
};
