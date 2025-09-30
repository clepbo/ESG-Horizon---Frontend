import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    assessmentService,
    SubmitAssessmentResponse,
} from "@/services/assessment.service";
import { AssessmentData } from "@/hooks/useAssessment";

export const useAssessments = () => {
    return useQuery({
        queryKey: ["assessments"],
        queryFn: assessmentService.getAssessments,
    });
};

export const useCreateAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation<number, Error>({
        mutationFn: assessmentService.createAssessment,
        onSuccess: (assessmentId) => {
            queryClient.invalidateQueries({ queryKey: ["assessments"] });
            toast.info("New assessment started.");
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
