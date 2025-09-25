import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";

export const useSaveAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assessmentService.saveAssessment,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["assessments"] });

            localStorage.setItem("esg-assessment-data", JSON.stringify(data));
            toast.success("Assessment data saved successfully!");
        },
        onError: () => {
            toast.error("Failed to save data. Please try again.");
        },
    });
};

export const useSubmitAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assessmentService.submitAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessments"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });

            localStorage.removeItem("esg-assessment-data");
            toast.success("Assessment submitted successfully!");
        },
        onError: () => {
            toast.error("Failed to submit assessment. Please try again.");
        },
    });
};