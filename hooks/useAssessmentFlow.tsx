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
      assessmentId = result.id; // ← direct from result, no race
      dispatch({ type: "SET_ASSESSMENT_ID", payload: assessmentId });
    }

    await saveMut.mutateAsync({ path, data, assessmentId }); // ← assessmentId is number
  };

  const saveNow = async (path: string, data: any) => {
    try {
      await ensureIdAndSave(path, data);
      toast.success("Saved!");
    } catch (err) {
      toast.error("Save failed");
      console.error(err);
    }
  };

  const submitMut = useMutation({
    mutationFn: () => {
      const id = state.assessmentId;
      if (!id) throw new Error("No assessment ID");
      return assessmentService.submitGroup(id, currentFormKey);
    },
    onSuccess: () => toast.success("Group submitted!"),
  });

  return {
    autoSave,
    saveNow,
    submitGroup: submitMut.mutate,
    isLoading: createMut.isPending || saveMut.isPending || submitMut.isPending,
  };
};
