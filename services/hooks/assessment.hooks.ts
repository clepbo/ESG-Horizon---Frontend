import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; 
import { 
  assessmentService, 
  SubmitAssessmentResponse,
  AssessmentProgress,
  ScopeTotals,
  TotalsResponse,
  SaveAssessmentResponse,
} from "@/services/assessment.service";
import { useAssessment as useAssessmentContext, AssessmentData } from "@/hooks/useAssessment"; 

interface RawAssessmentResponse {
  data: {
    id: number;
    assessmentData: AssessmentData & {
      __computed?: {
        progress?: AssessmentProgress[];
        scopeTotals?: ScopeTotals;
        totals?: TotalsResponse;
        computedAt?: string;
      }
    } | null;
    status: string;
  };
}

/**
 * Maps the raw, nested server response format into the flat AssessmentData
 * structure expected by the useAssessment reducer.
 */
const mapServerResponseToState = (rawResponse: RawAssessmentResponse): AssessmentData => {
  const rawAssessment = rawResponse.data;
  const assessmentData = (rawAssessment.assessmentData || {}) as AssessmentData;
  const computed = (assessmentData as any).__computed || {};

  return {
    ...assessmentData,
    id: rawAssessment.id,
    status: rawAssessment.status,
    // Prioritize computed fields from __computed (backend storage)
    progress: computed.progress || assessmentData.progress,
    scopeTotals: computed.scopeTotals || assessmentData.scopeTotals,
    totals: computed.totals || assessmentData.totals,
  };
}

export const useAssessments = () => {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: assessmentService.getAssessments,
  });
};

/**
 * React Query hook to fetch a single assessment and load it into the global state.
 */
export const useAssessment = (assessmentId: number) => {
  // Use the aliased context hook to get dispatch
  const { dispatch } = useAssessmentContext();
  
  const options = { 
  queryKey: ["assessment", assessmentId] as const,
  queryFn: () => assessmentService.getAssessment(assessmentId),
  enabled: !!assessmentId,
  onSuccess: (response: RawAssessmentResponse) => { 
    const flattenedData = mapServerResponseToState(response);
    dispatch({ type: "LOAD_SAVED_DATA", payload: flattenedData });
  },
};

return useQuery<RawAssessmentResponse, Error, RawAssessmentResponse, readonly [string, number]>(options);

};

/**
 * Mutation hook to save an assessment draft.
 */
export const useSaveAssessment = () => {
  const queryClient = useQueryClient();
  // Use the aliased context hook
  const { dispatch, state } = useAssessmentContext(); 

  return useMutation< 
    SaveAssessmentResponse,
    Error,
    { assessmentId?: number | null; data: Partial<AssessmentData> }
  >({
    mutationFn: ({ assessmentId, data }) => {
      // Send the current progress from the state in the payload for backend context
      const dataWithProgress = { ...data, progress: state.assessmentData.progress };
      return assessmentService.saveAssessment({ assessmentId, data: dataWithProgress });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment data saved successfully!");
      
      // Extract saved progress (which is re-calculated by the backend on save)
      const savedProgress = (response.data as any).assessmentData?.__computed?.progress || [];

      // Update state with new ID, status, and the updated progress array
      dispatch({ 
        type: "SET_COMPUTED_DATA", 
        payload: { 
          assessmentId: response.assessmentId, 
          progress: savedProgress, 
          scopeTotals: state.scopeTotals, 
          totals: state.assessmentData.totals, 
          status: response.data.status ?? "",
        } 
      });
    },
    onError: () => {
      toast.error("Failed to save data. Please try again.");
    },
  });
};

/**
 * Mutation hook to submit an assessment for approval, triggering final computations.
 */
export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  // Use the aliased context hook
  const { dispatch, state } = useAssessmentContext();

  return useMutation<
    SubmitAssessmentResponse,
    Error,
    { assessmentId?: number | null; data: Partial<AssessmentData> }
  >({
    mutationFn: async ({ assessmentId, data }) => {
      // Send the current progress from the state in the payload
      const dataWithProgress = { ...data, progress: state.assessmentData.progress };
      return assessmentService.submitAssessment(assessmentId, dataWithProgress);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      toast.success("Assessment submitted successfully!");

      // Update state with all computed data (progress, scopeTotals, totals) from the backend response
      dispatch({ 
        type: "SET_COMPUTED_DATA", 
        payload: { 
          assessmentId: response.assessment.id, 
          progress: response.progress, 
          scopeTotals: response.scopeTotals, 
          totals: response.totals,
          status: response.assessment.status, 
        } 
      });
    },
    onError: (error) => {
      console.error("Assessment submission error:", error);
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

export const useRejectAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


// import { toast } from "react-toastify";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { 
//   assessmentService, 
//   SubmitAssessmentResponse,
//   AssessmentProgress,
//   ScopeTotals,
//   TotalsResponse
// } from "@/services/assessment.service";
// import { AssessmentData } from "@/hooks/useAssessment";

// interface RawAssessmentResponse {
//   data: {
//     id: number;
//     assessmentData: AssessmentData & {
//       __computed?: {
//         progress?: AssessmentProgress[];
//         scopeTotals?: ScopeTotals;
//         totals?: TotalsResponse;
//         computedAt?: string;
//       }
//     } | null;
//     status: string;
//   };
// }

// const mapServerResponseToState = (rawResponse: RawAssessmentResponse): AssessmentData => {
//   const rawAssessment = rawResponse.data;
//   const assessmentData = (rawAssessment.assessmentData || {}) as AssessmentData;
//   const computed = (assessmentData as any).__computed || {};

//   return {
//     ...assessmentData,
//     id: rawAssessment.id,
//     status: rawAssessment.status,
//     // Flatten computed fields from __computed (backend storage) onto AssessmentData
//     progress: computed.progress || assessmentData.progress,
//     scopeTotals: computed.scopeTotals || assessmentData.scopeTotals,
//     totals: computed.totals || assessmentData.totals,
//   };
// }

// export const useAssessments = () => {
//   return useQuery({
//     queryKey: ["assessments"],
//     queryFn: assessmentService.getAssessments,
//   });
// };

// // export const useAssessment = (assessmentId: number) => {
// //   return useQuery({
// //     queryKey: ["assessment", assessmentId],
// //     queryFn: () => assessmentService.getAssessment(assessmentId),
// //     enabled: !!assessmentId,
// //   });
// // };

// export const useAssessment = (assessmentId: number) => {
//   // Use useAssessment to get dispatch
//   const { dispatch } = useAssessment();
  
//   return useQuery<RawAssessmentResponse>({
//     queryKey: ["assessment", assessmentId],
//     queryFn: () => assessmentService.getAssessment(assessmentId),
//     enabled: !!assessmentId,
//     onSuccess: (response) => {
//       // Map and load the flattened data into the state
//       const flattenedData = mapServerResponseToState(response);
//       dispatch({ type: "LOAD_SAVED_DATA", payload: flattenedData });
//     }
//   });
// };

// // export const useSaveAssessment = () => {
// //   const queryClient = useQueryClient();

// //   return useMutation<
// //     { message: string; data: AssessmentData },
// //     Error,
// //     { assessmentId: number; data: Partial<AssessmentData> }
// //   >({
// //     mutationFn: assessmentService.saveAssessment,
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["assessments"] });
// //       toast.success("Assessment data saved successfully!");
// //     },
// //     onError: () => {
// //       toast.error("Failed to save data. Please try again.");
// //     },
// //   });
// // };

// // export const useSubmitAssessment = (assessmentId?: number) => {
// //   const queryClient = useQueryClient();
  
// //   return useMutation<
// //     SubmitAssessmentResponse,
// //     Error,
// //     { assessmentId: number; data: Partial<AssessmentData> }
// //   >({
// //     mutationFn: async ({ assessmentId, data }) => {
// //       // Calculate progress and scope totals before submission
// //       const progress = calculateAssessmentProgress(data);
// //       const scopeTotals = calculateScopeTotals(data);
      
// //       // Include progress and scope totals in the submission
// //       const submissionData = {
// //         ...data,
// //         metadata: {
// //           progress,
// //           scopeTotals,
// //           submittedAt: new Date().toISOString()
// //         }
// //       };
      
// //       return assessmentService.submitAssessment(assessmentId, submissionData);
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["assessments"] });
// //       queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
// //       toast.success("Assessment submitted successfully!");
// //     },
// //     onError: (error) => {
// //       console.error("Assessment submission error:", error);
// //       toast.error("Failed to submit assessment. Please try again.");
// //     },
// //   });
// // };

// export const useSaveAssessment = () => {
//   const queryClient = useQueryClient();
//   // 💡 NEW: Get state and dispatch from context
//   const { dispatch, state } = useAssessment(); 

//   return useMutation< 
//     // 💡 CHANGE: Update response type to match backend { message, data: {status, assessmentData}, assessmentId }
//     { message: string; data: { status: string, assessmentData: any }; assessmentId: number },
//     Error,
//     { assessmentId?: number | null; data: Partial<AssessmentData> }
//   >({
//     mutationFn: ({ assessmentId, data }) => {
//       // 💡 CRITICAL: Send the current progress from the state in the payload
//       const dataWithProgress = { ...data, progress: state.data.progress };
//       return assessmentService.saveAssessment({ assessmentId, data: dataWithProgress });
//     },
//     onSuccess: (response) => {
//       queryClient.invalidateQueries({ queryKey: ["assessments"] });
//       toast.success("Assessment data saved successfully!");
      
//       // 💡 NEW: Extract saved progress and update state using SET_COMPUTED_DATA
//       const savedProgress = (response.data as any).assessmentData?.__computed?.progress || [];

//       dispatch({ 
//         type: "SET_COMPUTED_DATA", 
//         payload: { 
//           assessmentId: response.assessmentId, 
//           progress: savedProgress, 
//           scopeTotals: state.scopeTotals, // Retain existing totals (not computed on save)
//           totals: state.data.totals, // Retain existing totals (not computed on save)
//           status: response.data.status,
//         } 
//       });
//     },
//     onError: () => {
//       toast.error("Failed to save data. Please try again.");
//     },
//   });
// };

// export const useSubmitAssessment = () => { // Removed optional assessmentId parameter from hook declaration
//   const queryClient = useQueryClient();
//   // 💡 NEW: Get state and dispatch from context
//   const { dispatch, state } = useAssessment();

//   return useMutation<
//     SubmitAssessmentResponse,
//     Error,
//     { assessmentId?: number | null; data: Partial<AssessmentData> }
//   >({
//     mutationFn: async ({ assessmentId, data }) => {
//       // 💡 CRITICAL CHANGE: Remove local calculation logic (calculateAssessmentProgress, calculateScopeTotals)
//       // The backend handles the computation and returns the final totals.
      
//       // Send the current progress from the state in the payload
//       const dataWithProgress = { ...data, progress: state.data.progress };
      
//       // Pass the optional ID to the service
//       return assessmentService.submitAssessment(assessmentId, dataWithProgress);
//     },
//     onSuccess: (response) => {
//       queryClient.invalidateQueries({ queryKey: ["assessments"] });
//       queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
//       toast.success("Assessment submitted successfully!");

//       // 💡 NEW: Update state with all computed data from the backend
//       dispatch({ 
//         type: "SET_COMPUTED_DATA", 
//         payload: { 
//           assessmentId: response.assessment.id, 
//           progress: response.progress, 
//           scopeTotals: response.scopeTotals, 
//           totals: response.totals,
//           status: response.assessment.status, 
//         } 
//       });
//     },
//     onError: (error) => {
//       console.error("Assessment submission error:", error);
//       toast.error("Failed to submit assessment. Please try again.");
//     },
//   });
// };

// export const useDeleteAssessment = () => {
//   const queryClient = useQueryClient();

//   return useMutation<void, Error, number>({
//     mutationFn: assessmentService.deleteAssessment,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["assessments"] });
//       toast.success("Draft assessment deleted successfully.");
//     },
//     onError: (error) => {
//       const errorMessage =
//         error.message ||
//         "Failed to delete assessment. Only 'draft' status assessments can be deleted.";
//       toast.error(errorMessage);
//     },
//   });
// };

// export const useApproveAssessment = () => {
//   const queryClient = useQueryClient();

//   return useMutation<{ message: string }, Error, number>({
//     mutationFn: (assessmentId: number) => assessmentService.approveAssessment(assessmentId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["assessments"] });
//       toast.success("Assessment approved. Report generation started.");
//     },
//     onError: () => {
//       toast.error("Failed to approve assessment.");
//     },
//   });
// };

// export const useRejectAssessment = () => {
//   const queryClient = useQueryClient();

//   return useMutation<
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     { message: string; data: any },
//     Error,
//     { assessmentId: number; reason: string }
//   >({
//     mutationFn: ({ assessmentId, reason }) =>
//       assessmentService.rejectAssessment(assessmentId, reason),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["assessments"] });
//       toast.success("Assessment rejected successfully.");
//     },
//     onError: () => {
//       toast.error("Failed to reject assessment.");
//     },
//   });
// };
