import api from "@/lib/api/axios";
import {
  BaselineOption,
  CompanyTargetSummary,
  ScopeTargetPayload,
  TargetPayload,
} from "@/types/target/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASELINE_STALE_MS = 2 * 60 * 1000; // 2 minutes – avoid refetch when navigating back

export type UseBaselineOptions = {
  /** When false, the baseline request is not sent (e.g. when summary already has local baseline). */
  enabled?: boolean;
  /** How long the result is considered fresh; reduces slow refetches. */
  staleTime?: number;
};

// Custom hook that accepts companyId and optional query options
export const useBaseline = (companyId?: number, options?: UseBaselineOptions) => {
  const enabled = options?.enabled !== undefined ? options.enabled && !!companyId : !!companyId;
  return useQuery({
    queryKey: ["baseline", companyId],
    queryFn: async () => {
      const response = await api.get(`/target/baseline/${companyId}`);
      return response;
    },
    enabled,
    refetchOnWindowFocus: false,
    staleTime: options?.staleTime ?? BASELINE_STALE_MS,
  });
};
export const useBaselineByScope = (companyId?: number, assessmentId?: number) => {
  return useQuery({
    queryKey: ["baseline-scope", companyId, assessmentId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const url = assessmentId
        ? `/target/baseline-scope/${companyId}?assessmentId=${assessmentId}`
        : `/target/baseline-scope/${companyId}`;
      const response = await api.get(url);

      return response;
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  });
};

export const useBaselineOptions = (companyId?: number) => {
  return useQuery({
    queryKey: ["baseline-options", companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Company ID not available");
      }

      const data = await api.get<BaselineOption[]>(`/target/baseline-options`);
      return data as unknown as BaselineOption[];
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
      return response ?? null;
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

/** Fetch all company targets (for overlap checks when creating a new target). */
export const useCompanyTargets = (companyId?: number) => {
  return useQuery({
    queryKey: ["targets", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const data = await api.get<CompanyTargetSummary[]>(`/target`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  });
};

/** Fetch all company targets with full detail (for the target logs table). */
export const useAllTargets = (companyId?: number) => {
  return useQuery({
    queryKey: ["all-targets", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID not available");
      const data = await api.get(`/target`);
      return (Array.isArray(data) ? data : []) as import("@/app/(company)/components/types/target").Target[];
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false,
  });
};
