// hooks/useAssessmentFlow.ts — FINAL, NO MORE ERRORS, WORKS FIRST CLICK
import { useMutation } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";

export const useAssessmentFlow = (currentFormKey: string) => {
  const { state, dispatch } = useAssessment();

  const createMut = useMutation({
    mutationFn: assessmentService.createAssessment,
    onSuccess: (data) => {
      dispatch({ type: "SET_ASSESSMENT_ID", payload: data.id });
    },
  });

  const saveMut = useMutation({
    mutationFn: ({ path, data, assessmentId }: { path: string; data: any; assessmentId: number }) =>
      assessmentService.saveProgress(assessmentId, path, data, currentFormKey),
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  const submitMut = useMutation({
    mutationFn: () => assessmentService.submitGroup(state.assessmentId!, currentFormKey),
    onSuccess: () => {
      // toast.success("Assessment Submitted!")
    },
  });

  const submitGroup = async () => {
    const response = await submitMut.mutateAsync();
    toast.success(`${currentFormKey.split("-").pop()?.replace(/([A-Z])/g, " $1").trim() || "Assessment"} submitted successfully`);
    return response;
  };

  const isAssignedTask = state.isAssignedTask || false;

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
    isAssignedTask,
    handleAssignedTaskRedirect,
  };
};
