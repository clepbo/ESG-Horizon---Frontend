import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentService, SubmitAssessmentResponse } from "@/services/assessment.service";
import { AssessmentData } from "@/hooks/useAssessment";

export const useAssessments = () => {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: assessmentService.getAssessments,
  });
};

export const useAssessment = (assessmentId: number) => {
  return useQuery({
    queryKey: ["assessment", assessmentId],
    queryFn: () => assessmentService.getAssessment(assessmentId),
    enabled: !!assessmentId,
  });
};

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<number, Error>({
    mutationFn: assessmentService.createAssessment,
    onSuccess: (assessmentId) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      console.log("Created assessment with ID:", assessmentId);
    },
    onError: () => {
      toast.error("Failed to create a new assessment.");
    },
  });
};

export const useSaveAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: AssessmentData },
    Error,
    { assessmentId: number; data: Partial<AssessmentData> }
  >({
    mutationFn: assessmentService.saveAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment data saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save data. Please try again.");
    },
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SubmitAssessmentResponse,
    Error,
    { assessmentId: number; data: Partial<AssessmentData> }
  >({
    mutationFn: assessmentService.submitAssessment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
    onError: () => {
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

export const useUnapproveAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { assessmentId: number; rejectionReason: string }>(
    {
      mutationFn: ({ assessmentId, rejectionReason }) =>
        assessmentService.unapproveAssessment(assessmentId, rejectionReason),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["assessments"] });
        toast.success("Assessment marked as unapproved.");
      },
      onError: () => {
        toast.error("Failed to mark assessment as unapproved.");
      },
    }
  );
};
