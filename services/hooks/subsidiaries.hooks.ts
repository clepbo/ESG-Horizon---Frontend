import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subsidiariesService, Subsidiary } from "../subsidiaries.service";
import { User } from "../user.service";

/**
 * Custom hook to fetch all subsidiaries.
 * @returns An object with data, loading state, and error.
 */
export const useAllSubsidiaries = () => {
  return useQuery<Subsidiary[]>({
    queryKey: ["subsidiaries"],
    queryFn: subsidiariesService.getAll,
  });
};

/**
 * Custom hook to fetch all company subsidiaries.
 * @returns An object with data, loading state, and error.
 */
export const useCompanySubsidiaries = () => {
  return useQuery<Subsidiary[]>({
    queryKey: ["companySubsidiaries"],
    queryFn: subsidiariesService.getCompanySubsidiaries,
  });
};

/**
 * Custom hook to fetch a specific subsidiary by ID.
 * @param subsidiaryId The ID of the subsidiary to fetch.
 * @returns An object with data, loading state, and error.
 */
export const useSubsidiary = (subsidiaryId: number) => {
  return useQuery<Subsidiary>({
    queryKey: ["subsidiary", subsidiaryId],
    queryFn: () => subsidiariesService.getSubsidiariesById(),
    enabled: !!subsidiaryId,
  });
};

/**
 * Custom hook to fetch all users for a specific subsidiary.
 * @param subsidiaryId The ID of the subsidiary to get users for.
 * @returns An object with data, loading state, and error.
 */
export const useSubsidiaryUsers = (subsidiaryId: number) => {
  return useQuery<User[]>({
    queryKey: ["subsidiaryUsers", subsidiaryId],
    queryFn: () => subsidiariesService.getCompanySubsidiaryUsers(subsidiaryId),
    // This query will only run if a valid subsidiaryId is provided.
    enabled: !!subsidiaryId,
  });
};

/**
 * Custom hook for creating a new subsidiary.
 * @returns A mutation object with mutate function and status.
 */
export const useCreateSubsidiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subsidiariesService.createSubsidiary,
    onSuccess: () => {
      // Invalidate the queries that list subsidiaries to ensure the UI updates
      queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
      queryClient.invalidateQueries({
        queryKey: ["companySubsidiaries"],
      });
    },
  });
};

/**
 * Custom hook for editing a subsidiary.
 * @returns A mutation object with mutate function and status.
 */
export const useEditSubsidiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subsidiariesService.editSubsidiaries,
    onSuccess: () => {
      // Invalidate the queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
      queryClient.invalidateQueries({
        queryKey: ["companySubsidiaries"],
      });
    },
  });
};

/**
 * Custom hook for deleting a subsidiary.
 * @returns A mutation object with mutate function and status.
 */
export const useDeleteSubsidiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subsidiariesService.deleteSubsidiaries(id),
    onSuccess: () => {
      // Invalidate the queries to remove the deleted subsidiary from the lists
      queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
      queryClient.invalidateQueries({
        queryKey: ["companySubsidiaries"],
      });
    },
  });
};
