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
    return res.data ?? res ?? [];
  },
};
