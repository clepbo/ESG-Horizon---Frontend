import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";
import { useAssessment as useAssessmentContext } from "@/hooks/useAssessment";
import { useEffect } from "react";

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
      const data = query.data.data;
      dispatch({
        type: "LOAD_SAVED_DATA",
        payload: {
          ...data.assessmentData,
          id: data.id,
          status: data.status,
          lastSavedForm: data.assessmentData?.lastSavedForm,
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
