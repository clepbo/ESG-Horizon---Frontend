import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessment.service";
import { AssessmentData } from "@/hooks/useAssessment";

// Hook to fetch all assessments
export const useAssessments = () => {
    return useQuery({
        queryKey: ["assessments"],
        queryFn: assessmentService.getAssessments,
    });
};

// Hook to create a new assessment
export const useCreateAssessment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: assessmentService.createAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessments"] });
        },
        onError: () => {
            toast.error("Failed to create a new assessment.");
        },
    });
};

// Updated hook for saving, now without localStorage
export const useSaveAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
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

// Updated hook for submitting, now without localStorage
export const useSubmitAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assessmentService.submitAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessments"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
            toast.success("Assessment submitted successfully!");
        },
        onError: () => {
            toast.error("Failed to submit assessment. Please try again.");
        },
    });
};



// import { toast } from "react-toastify";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { assessmentService } from "@/services/assessment.service";

// export const useSaveAssessment = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: assessmentService.saveAssessment,
//         onSuccess: (data) => {
//             queryClient.invalidateQueries({ queryKey: ["assessments"] });

//             localStorage.setItem("esg-assessment-data", JSON.stringify(data));
//             toast.success("Assessment data saved successfully!");
//         },
//         onError: () => {
//             toast.error("Failed to save data. Please try again.");
//         },
//     });
// };

// export const useSubmitAssessment = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: assessmentService.submitAssessment,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["assessments"] });
//             queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });

//             localStorage.removeItem("esg-assessment-data");
//             toast.success("Assessment submitted successfully!");
//         },
//         onError: () => {
//             toast.error("Failed to submit assessment. Please try again.");
//         },
//     });
// };