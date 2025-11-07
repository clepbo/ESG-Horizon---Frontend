import apiUtil from "@/lib/api/axios";
import { ScopeTargetPayload, TargetPayload } from "@/types/target/index";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Custom hook that accepts companyId
export const useBaseline = (companyId?: number) => {
  return useQuery({
    queryKey: ["baseline", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const response = await apiUtil.get(`/target/baseline/${companyId}`);
      return response;
    },
    enabled: !!companyId,
  });
};

export const useCreateTarget = (companyId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetData: TargetPayload | ScopeTargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      const response = await apiUtil.post(`/target`, targetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseline"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
    },
  });
};
