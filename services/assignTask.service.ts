import api from "@/lib/api/axios";

export interface TaskAssignment {
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  topics: string[];
}

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "approved"
  | "rejected"
  | "on_hold";

export interface ITask {
  id: number;
  taskName: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  createdById: number;
  assignments: TaskAssignment[];
  description?: string;
  priority?: "low" | "medium" | "high";
}

export interface AssignTaskPayload {
  taskName: string;
  dueDate: string;
  userIds: number[];
  topics: string[];
}

export const taskAssignmentService = {
  assignTask: async (payload: AssignTaskPayload) => {
    const { data } = await api.post("/tasks/assign", payload);
    return data;
  },
  getAll: async (): Promise<ITask[]> => {
    const response = await api.get("/tasks/company");
    const tasks = response.data;

    if (!tasks || !Array.isArray(tasks)) {
      console.warn("Expected array but got:", tasks);
      return [];
    }

    return tasks;
  },
  approve: async (id: number) => {
    const { data } = await api.patch(`/tasks/${id}/approve`);
    return data;
  },
  reject: async (id: number) => {
    const { data } = await api.patch(`/tasks/${id}/reject`);
    return data;
  },
  reassign: async (id: number, payload: Partial<AssignTaskPayload>) => {
    const { data } = await api.patch(`/tasks/${id}/reassign`, payload);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
  sendReminder: async (id: number) => {
    const { data } = await api.post(`/tasks/${id}/reminder`);
    return data;
  },
};
