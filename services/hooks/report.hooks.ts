import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";

export const useReport = (assessmentId?: number | null) => {
  return useQuery({
    queryKey: ["report", assessmentId],
    queryFn: async () => {
      const res = await api.get(`/report/${assessmentId}`);
      // Backend wraps as { message, data } — unwrap if needed
      return res.data ?? res;
    },
    enabled: !!assessmentId,
    refetchOnWindowFocus: false,
  });
};
