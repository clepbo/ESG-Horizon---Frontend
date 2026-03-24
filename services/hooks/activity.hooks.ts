import { useQuery } from "@tanstack/react-query";
import { activityService, type ActivityItem } from "@/services/activity.service";

export const useActivities = () => {
  return useQuery<ActivityItem[]>({
    queryKey: ["activities"],
    queryFn: activityService.getActivities,
  });
};
