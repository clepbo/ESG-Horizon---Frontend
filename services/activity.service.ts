import api from "@/lib/api/axios";

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  type: string | null;
  status: string | null;
  date: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const activityService = {
  getActivities: async (): Promise<ActivityItem[]> => {
    const res = await api.get("/company/esg/activities");
    const items = res.data ?? res ?? [];
    return items.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description ?? "",
      type: a.type ?? null,
      status: a.status ?? null,
      date: a.createdAt,
      user: a.createdBy
        ? {
            firstName: a.createdBy.first_name,
            lastName: a.createdBy.last_name,
            email: a.createdBy.email,
          }
        : { firstName: "Unknown", lastName: "", email: "" },
    }));
  },
};
