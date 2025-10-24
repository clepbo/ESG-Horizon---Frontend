import { useQuery } from "@tanstack/react-query";
import apiUtil from "@/lib/api/axios";

export function useReport() {
  return useQuery({
    queryKey: ["report"],
    queryFn: async () => {
      try {
        const data = await apiUtil.get("/report");
        return data; // already the actual response body
      } catch (error) {
        console.error("Error fetching report:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useSingleReport(id: number) {
  return useQuery({
    queryKey: ["single-report", id],
    queryFn: async () => {
      const response = await apiUtil.get(`/report/${id}`);
      // console.log("RES", response)
      return response;
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
