import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AddTaskCommentPayload,
  AssignTaskPayload,
  FrontendTask,
  ITask,
  TaskAssignment,
  taskAssignmentService,
  TaskComment,
} from "../assignTask.service";

function mapTaskResponseToFrontend(tasksFromApi: ITask[]): FrontendTask[] {
  return tasksFromApi.map((task) => ({
    id: task.id,
    taskName: task.taskName,
    dueDate: task.dueDate ?? "Unknown",
    status: task.status,
    assignedTo: task.assignments?.length
      ? task.assignments
          .map((a: TaskAssignment) =>
            `${a.user?.first_name ?? ""} ${a.user?.last_name ?? ""}`.trim()
          )
          .join(", ")
      : "—",
    dateAssigned: task.createdAt ?? "Unknown",
    description: task.description ?? "",
    priority: task.priority ?? "medium",
    progress: task.progress ?? 0,
    departments: task.departments ?? [],
    teamMembers:
      task.assignments?.map((a) =>
        `${a.user?.first_name ?? ""} ${a.user?.last_name ?? ""}`.trim()
      ) ?? [],
    topics: task.assignments?.flatMap((a) => a.topics) ?? [],
    comments: task.comments ?? [],
  }));
}

function mapMyTasksResponseToFrontend(tasksFromApi: any[]): FrontendTask[] {
  return tasksFromApi.map((item) => {
    // Handle case where task is wrapped in a "task" property
    const task = item.task || item;
    
    // Extract topics from top-level property or assignments
    const allTopics = item.topics || task.assignments?.flatMap((assignment: any) => assignment.topics || []) || [];

    // Get creator name from createdBy field
    const creatorName = task.createdBy
      ? `${task.createdBy.first_name || ""} ${task.createdBy.last_name || ""}`.trim()
      : "Unknown";

    // Extract user IDs from assignments
    const assignedUserIds = task.assignments?.map((a: any) => a.userId) || [];

    return {
      id: task.id,
      taskName: task.taskName,
      dueDate: task.dueDate ?? "Unknown",
      status: task.status,
      assignedTo: creatorName, // Using this field to store creator name for display
      dateAssigned: task.createdAt ?? "Unknown",
      description: task.description ?? "",
      priority: task.priority ?? "medium",
      progress: task.progress ?? 0,
      departments: task.departments ?? [],
      teamMembers:
        task.assignments?.map((a: any) =>
          `${a.user?.first_name ?? ""} ${a.user?.last_name ?? ""}`.trim()
        ) ?? [],
      topics: allTopics,
      comments: task.comments ?? [],
      assignedUserIds, // Store user IDs for filtering
    };
  });
}

const invalidateTasks = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["allTasks"] });
  queryClient.invalidateQueries({ queryKey: ["companyTasks"] });
  queryClient.invalidateQueries({ queryKey: ["myTasks"] });
};

export const useAllTasks = () =>
  useQuery<FrontendTask[], Error>({
    queryKey: ["allTasks"],
    queryFn: async () => {
      const data = await taskAssignmentService.getAll();
      return mapTaskResponseToFrontend(data);
    },
  });

export const useCompanyTasks = () =>
  useQuery<FrontendTask[], Error>({
    queryKey: ["companyTasks"],
    queryFn: async () => {
      const data = await taskAssignmentService.getCompany();
      return mapTaskResponseToFrontend(data);
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

export const useEditTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AssignTaskPayload> }) =>
      taskAssignmentService.edit(id, payload),
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useAddTaskComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddTaskCommentPayload }) =>
      taskAssignmentService.addComment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["taskComments", variables.id] });
    },
  });
};

export const useTaskComments = (taskId: number) =>
  useQuery<TaskComment[], Error>({
    queryKey: ["taskComments", taskId],
    queryFn: () => taskAssignmentService.getComments(taskId),
    enabled: !!taskId,
  });
// export const useMyTasks = () =>
//   useQuery<FrontendTask[], Error>({
//     queryKey: ["myTasks"],
//     queryFn: async () => {
//       const data = await taskAssignmentService.getMyTasks();
//       return mapTaskResponseToFrontend(data);
//     },
//   });
export const useMyTasks = () =>
  useQuery<FrontendTask[], Error>({
    queryKey: ["myTasks"],
    queryFn: async () => {
      const data = await taskAssignmentService.getMyTasks();
      console.log("Raw API response for my-tasks:", data);
      // Use the specialized mapping function for my-tasks endpoint
      return mapMyTasksResponseToFrontend(data);
    },
  });
