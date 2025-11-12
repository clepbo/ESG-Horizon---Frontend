import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssignTaskPayload, ITask, taskAssignmentService } from "../assignTask.service";

const invalidateTasks = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["allTasks"] });
  queryClient.invalidateQueries({ queryKey: ["companyTasks"] });
};

export const useAllTasks = () =>
  useQuery<ITask[], Error>({
    queryKey: ["allTasks"],
    queryFn: async () => {
      const data = await taskAssignmentService.getAll();
      return data ?? [];
    },
  });

export const useCompanyTasks = () =>
  useQuery<ITask[], Error>({
    queryKey: ["companyTasks"],
    queryFn: async () => {
      const data = await taskAssignmentService.getAll();
      console.log("Company tasks fetch result:", data);
      return data;
    },
    staleTime: 1000 * 60,
  });

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignTaskPayload) => taskAssignmentService.assignTask(payload),
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useApproveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskAssignmentService.approve(id),
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useRejectTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskAssignmentService.reject(id),
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useReassignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AssignTaskPayload> }) =>
      taskAssignmentService.reassign(id, payload),
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskAssignmentService.delete(id),
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useSendTaskReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskAssignmentService.sendReminder(id),
    onSuccess: () => invalidateTasks(queryClient),
  });
};
