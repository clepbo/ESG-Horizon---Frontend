import api from "@/lib/api/axios";

export const adminDisclosureService = {
  // Sectors
  getSectors: async () => {
    const { data } = await api.get("/admin/manage/sectors");
    return data;
  },
  getSector: async (id: number) => {
    const { data } = await api.get(`/admin/manage/sectors/${id}`);
    return data;
  },
  getIndustriesBySector: async (sectorId: number) => {
    const { data } = await api.get(`/admin/manage/sectors/${sectorId}/industries`);
    return data;
  },
  createSector: async (payload: { name: string; description?: string; code?: string }) => {
    const { data } = await api.post("/admin/manage/sectors", payload);
    return data;
  },
  updateSector: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/sectors/${id}`, payload);
    return data;
  },
  deleteSector: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/sectors/${id}`);
    return data;
  },

  // Industries
  createIndustry: async (payload: { name: string; sectorId: number; description?: string }) => {
    const { data } = await api.post("/admin/manage/industries", payload);
    return data;
  },
  updateIndustry: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/industries/${id}`, payload);
    return data;
  },
  deleteIndustry: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/industries/${id}`);
    return data;
  },

  // Pillars
  getPillars: async () => {
    const { data } = await api.get("/admin/manage/pillars");
    return data;
  },
  createPillar: async (payload: any) => {
    const { data } = await api.post("/admin/manage/pillars", payload);
    return data;
  },
  updatePillar: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/pillars/${id}`, payload);
    return data;
  },
  deletePillar: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/pillars/${id}`);
    return data;
  },

  // Topics
  getTopics: async (industryId: number, pillarId?: number) => {
    const { data } = await api.get("/admin/manage/topics", {
      params: { industryId, pillarId },
    });
    return data;
  },
  createTopic: async (payload: any) => {
    const { data } = await api.post("/admin/manage/topics", payload);
    return data;
  },
  updateTopic: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/topics/${id}`, payload);
    return data;
  },
  deleteTopic: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/topics/${id}`);
    return data;
  },

  // Subtopics
  getSubtopics: async (topicId: number) => {
    const { data } = await api.get("/admin/manage/subtopics", {
      params: { topicId },
    });
    return data;
  },
  createSubtopic: async (payload: any) => {
    const { data } = await api.post("/admin/manage/subtopics", payload);
    return data;
  },
  updateSubtopic: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/subtopics/${id}`, payload);
    return data;
  },
  deleteSubtopic: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/subtopics/${id}`);
    return data;
  },

  // Metrics
  getMetrics: async (subtopicId: number) => {
    const { data } = await api.get("/admin/manage/metrics", {
      params: { subtopicId },
    });
    return data;
  },
  createMetric: async (payload: any) => {
    const { data } = await api.post("/admin/manage/metrics", payload);
    return data;
  },
  updateMetric: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/metrics/${id}`, payload);
    return data;
  },
  deleteMetric: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/metrics/${id}`);
    return data;
  },

  // Submetrics
  getSubmetrics: async (metricId: number) => {
    const { data } = await api.get("/admin/manage/submetrics", {
      params: { metricId },
    });
    return data;
  },
  createSubmetric: async (payload: any) => {
    const { data } = await api.post("/admin/manage/submetrics", payload);
    return data;
  },
  updateSubmetric: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/submetrics/${id}`, payload);
    return data;
  },
  deleteSubmetric: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/submetrics/${id}`);
    return data;
  },

  // Submetric Details
  getSubmetricDetails: async (submetricId: number) => {
    const { data } = await api.get("/admin/manage/submetric-details", {
      params: { submetricId },
    });
    return data;
  },
  createSubmetricDetail: async (payload: any) => {
    const { data } = await api.post("/admin/manage/submetric-details", payload);
    return data;
  },
  updateSubmetricDetail: async (id: number, payload: any) => {
    const { data } = await api.patch(`/admin/manage/submetric-details/${id}`, payload);
    return data;
  },
  deleteSubmetricDetail: async (id: number) => {
    const { data } = await api.delete(`/admin/manage/submetric-details/${id}`);
    return data;
  },

  // Full Hierarchy
  getIndustryHierarchy: async (industryId: number) => {
    const { data } = await api.get(`/admin/manage/industry-hierarchy/${industryId}`);
    return data;
  },
  getAuditLogs: async (entityType?: string, entityId?: number) => {
    const { data } = await api.get("/admin/manage/audit-logs", {
      params: { entityType, entityId },
    });
    return data;
  },
};
