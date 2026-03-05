import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


export const useAssessmentFlow = (currentFormKey: string, groupPath?: string) => {
  const { state, dispatch } = useAssessment();
  const queryClient = useQueryClient();
  const [savingManual, setSavingManual] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);

  // Ref to deduplicate parallel assessment creation calls
  const createPromiseRef = useRef<Promise<number> | null>(null);

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
    if (isPreviouslySubmitted) return;
    if (state.assessmentId) {
      saveMut.mutate({ path, data, assessmentId: state.assessmentId });
    }
  }, 1500);

  const ensureIdAndSave = async (path: string, data: any) => {
    let assessmentId: number = state.assessmentId ?? 0;

    if (!assessmentId) {
      // Deduplicate: if a creation is already in-flight, reuse its promise
      if (!createPromiseRef.current) {
        const meta = state.assessmentData;
        createPromiseRef.current = createMut
          .mutateAsync({
            subsidiary: meta.subsidiary || "Self",
            startMonth: meta.startMonth,
            startYear: meta.startYear,
            endMonth: meta.endMonth,
            endYear: meta.endYear,
          })
          .then((result) => {
            dispatch({ type: "SET_ASSESSMENT_ID", payload: result.id });
            return result.id;
          })
          .finally(() => {
            createPromiseRef.current = null;
          });
      }
      assessmentId = await createPromiseRef.current;
    }

    await saveMut.mutateAsync({ path, data, assessmentId });
  };

  const saveNow = async (path: string, data: any) => {
    setSavingManual(true);
    try {
      await ensureIdAndSave(path, data);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save data. Please try again.";
      if (msg.includes("submitted group")) {
        dispatch({ type: "SET_LOCKED_GROUP_ERROR", payload: msg });
      }
      throw err;
    } finally {
      setSavingManual(false);
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
    setSubmittingManual(true);
    try {
      const response = await submitMut.mutateAsync();
      if (groupPath) dispatch({ type: "ADD_SUBMITTED_GROUP", payload: groupPath });
      return response;
    } finally {
      setSubmittingManual(false);
    }
  };

  /** Save without triggering isSaving — for intermediate saves inside submit handlers */
  const saveQuiet = async (path: string, data: any) => {
    await ensureIdAndSave(path, data);
  };

  /** Save + submit in one call — only sets isSubmitting (not isSaving) */
  const saveAndSubmit = async (path: string, data: any) => {
    setSubmittingManual(true);
    try {
      await ensureIdAndSave(path, data);
      const response = await submitMut.mutateAsync();
      if (groupPath) dispatch({ type: "ADD_SUBMITTED_GROUP", payload: groupPath });
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || "";
      if (msg.includes("submitted group")) {
        dispatch({ type: "SET_LOCKED_GROUP_ERROR", payload: msg });
      }
      throw err;
    } finally {
      setSubmittingManual(false);
    }
  };

  const isAssignedTask = state.isAssignedTask || false;

  const assessmentStatus = state.assessmentData?.status || "";
  const lockedStatuses = ["approved", "submitted_approved"];
  const isAssessmentLocked = lockedStatuses.includes(assessmentStatus);

  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];
  const isPreviouslySubmitted = isAssessmentLocked && groupPath
    ? submittedGroups.includes(groupPath)
    : false;
  const handleAssignedTaskRedirect = () => {
    if (isAssignedTask) {
      dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
      return true;
    }
    return false;
  };

  const isGroupSubmitted = groupPath ? submittedGroups.includes(groupPath) : false;

  const getSubmitLabel = (hasExistingData: boolean, isSubmitting?: boolean): string => {
    const isUpdate = isGroupSubmitted;
    if (isSubmitting) return "Submitting...";
    if (isPreviouslySubmitted) return "Submitted";
    return isUpdate ? "Update" : "Submit";
  };

  return {
    autoSave,
    saveNow,
    saveQuiet,
    saveAndSubmit,
    submitGroup,
    isLoading: savingManual || submittingManual,
    isSaving: savingManual,
    isSubmitting: submittingManual,
    isPreviouslySubmitted,
    isAssignedTask,
    handleAssignedTaskRedirect,
    getSubmitLabel,
  };
};
