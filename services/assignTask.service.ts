import api from "@/lib/api/axios";

export interface TaskAssignment {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  topics: string[];
}

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "approved"
  | "declined"
  | "on_hold";

export interface ITask {
  id: number;
  taskName: string;
  dueDate: string;
  status: TaskStatus;
  createdAt?: string;
  createdById?: number;
  assignments?: TaskAssignment[];
  description?: string;
  priority?: "low" | "medium" | "high";
  progress?: number;
  departments?: string[];
  teamMembers?: string[];
  topics?: string[];
  comments?: TaskComment[];
}

export interface FrontendTask {
  id: number;
  taskName: string;
  assignedTo: string;
  assignedToEmail?: string;
  dateAssigned: string;
  dueDate: string;
  status: TaskStatus;
  description?: string;
  priority?: "low" | "medium" | "high";
  departments?: string[];
  teamMembers?: string[];
  topics?: string[];
  progress?: number;
  sendEmail?: boolean;
  assignedUserIds?: number[]; // IDs of users assigned to this task
  assessmentId?: number;
}

export interface AssignTaskPayload {
  taskName: string;
  dueDate: string;
  userIds: number[];
  topics: string[];
  sendEmail?: boolean;
  comment?: string;
}

export interface EditTaskPayload {
  taskName?: string;
  dueDate?: string;
  userIds?: number[];
  topics?: string[];
  sendEmail?: boolean;
  comment?: string;
}

export interface AddTaskCommentPayload {
  commenter: string;
  comment: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  commenter: string;
  comment: string;
  createdAt: string;
}

export interface TaskStartResponse {
  id: number;
  taskId?: number;
  assessmentId: number;
  startedAt: string;
  message?: string;
  data?: {
    assessmentId?: number;
  };
  taskAssignment?: {
    assessmentId?: number;
  };
  assessment?: {
    id?: number;
  };
}

export const taskAssignmentService = {
  assignTask: async (payload: AssignTaskPayload) => {
    const { data } = await api.post("/tasks/assign", payload);
    return data;
  },
  getAll: async (): Promise<ITask[]> => {
    const response = await api.get("/tasks/all");
    return response ?? [];
  },
  getCompany: async (): Promise<ITask[]> => {
    const response = await api.get("/tasks/company");
    return response ?? [];
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
  edit: async (id: number, payload: EditTaskPayload) => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
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
  addComment: async (id: number, payload: AddTaskCommentPayload) => {
    const { data } = await api.post(`/tasks/${id}/comments`, payload);
    return data;
  },
  getComments: async (id: number): Promise<TaskComment[]> => {
    if (!id) return [];
    const data = await api.get(`/tasks/${id}/comments`);
    return data ?? [];
  },
  getMyTasks: async (): Promise<ITask[]> => {
    const response = await api.get("/tasks/my-tasks");
    return response ?? [];
  },
  startTask: async (taskId: number): Promise<TaskStartResponse> => {
    const response = await api.post(`/tasks/${taskId}/start`);
    console.log("Raw API response from /tasks/start:", response);

    // Handle if response is an array - take first element
    const data = Array.isArray(response) ? response[0] : response?.data || response;

    return data;
  },
};
