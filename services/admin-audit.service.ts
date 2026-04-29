import api from "@/lib/api/axios";

export interface AuditLog {
  id: string;
  createdAt: string;
  userId: number | null;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  module: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  status: string;
  metadata: any;
  ipAddress: string | null;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: { name: string };
  };
}

export interface AuditLogResponse {
  items: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditKpi {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  color?: string;
}

export const adminAuditService = {
  getLogs: async (params: any): Promise<AuditLogResponse> => {
    const { data } = await api.get("/admin/audit", { params });
    return data;
  },

  getKpis: async (): Promise<AuditKpi[]> => {
    const { data } = await api.get("/admin/audit/kpis");
    return data;
  },
};
