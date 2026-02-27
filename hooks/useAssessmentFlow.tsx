import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";

export const useAssessmentFlow = (currentFormKey: string) => {
  const { state, dispatch } = useAssessment();
  const queryClient = useQueryClient();

  const createMut = useMutation({
    mutationFn: assessmentService.createAssessment,
    onSuccess: (data) => {
      dispatch({ type: "SET_ASSESSMENT_ID", payload: data.id });
    },
  });

  const saveMut = useMutation({
    mutationFn: ({ path, data, assessmentId }: { path: string; data: any; assessmentId: number }) =>
      assessmentService.saveProgress(assessmentId, path, data, currentFormKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", state.assessmentId] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "";
      if (msg.includes("submitted group")) {
        dispatch({ type: "SET_LOCKED_GROUP_ERROR", payload: msg });
      }
    },
  });

  const autoSave = useDebouncedCallback((path: string, data: any) => {
    if (state.assessmentId) {
      saveMut.mutate({ path, data, assessmentId: state.assessmentId });
    }
  }, 1500);

  const ensureIdAndSave = async (path: string, data: any) => {
    let assessmentId: number = state.assessmentId ?? 0;

    if (!assessmentId) {
      const meta = state.assessmentData;
      const result = await createMut.mutateAsync({
        subsidiary: meta.subsidiary || "Self",
        startMonth: meta.startMonth,
        startYear: meta.startYear,
        endMonth: meta.endMonth,
        endYear: meta.endYear,
      });
      assessmentId = result.id;
      dispatch({ type: "SET_ASSESSMENT_ID", payload: assessmentId });
    }

    await saveMut.mutateAsync({ path, data, assessmentId });
  };

  const saveNow = async (path: string, data: any) => {
    try {
      await ensureIdAndSave(path, data);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save data. Please try again.";
      if (msg.includes("submitted group")) {
        dispatch({ type: "SET_LOCKED_GROUP_ERROR", payload: msg });
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  const submitMut = useMutation({
    mutationFn: () => assessmentService.submitGroup(state.assessmentId!, currentFormKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", state.assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });

  const submitGroup = async () => {
    try {
      const response = await submitMut.mutateAsync();
      toast.success("Section submitted successfully.");
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit assessment. Please try again.";
      toast.error(msg);
      throw err;
    }
  };

  const isAssignedTask = state.isAssignedTask || false;

  const assessmentStatus = state.assessmentData?.status;
  const isPreviouslySubmitted =
    assessmentStatus === "awaiting_review" ||
    assessmentStatus === "submitted_approved" ||
    assessmentStatus === "approved";

  const handleAssignedTaskRedirect = () => {
    if (isAssignedTask) {
      dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
      return true;
    }
    return false;
  };

  return {
    autoSave,
    saveNow,
    submitGroup,
    isLoading: createMut.isPending || saveMut.isPending || submitMut.isPending,
    isPreviouslySubmitted,
    isAssignedTask,
    handleAssignedTaskRedirect,
  };
};
