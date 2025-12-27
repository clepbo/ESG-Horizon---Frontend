import api from "@/lib/api/axios";
import { ScopeTargetPayload, TargetPayload } from "@/types/target/index";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Custom hook that accepts companyId
export const useBaseline = (companyId?: number) => {
  return useQuery({
    queryKey: ["baseline", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const response = await api.get(`/target/baseline/${companyId}`);

      return response;
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  });
};
export const useBaselineByScope = (companyId?: number) => {
  return useQuery({
    queryKey: ["baseline", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const response = await api.get(`/target/baseline-scope/${companyId}`);

      return response;
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  });
};

// console.log(" Baseline by Scope", data );

export const useCreateTarget = (companyId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetData: TargetPayload | ScopeTargetPayload) => {
      if (!companyId) throw new Error("Company ID not available");
      const response = await api.post(`/target`, targetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseline"] });
      queryClient.invalidateQueries({ queryKey: ["targets"] });
    },
  });
};

export const useGetLatestTarget = (companyId?: number) => {
  return useQuery({
    queryKey: ["latest-target", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const response = await api.get(`/target/latest`);

      return response;
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  });
};
