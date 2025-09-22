import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService, Company } from "../company.service";
import { User } from "../user.service";

/**
 * Custom hook to fetch the current company's profile details.
 * @returns An object with data, loading state, and error.
 */
export const useCompanyDetails = () => {
    return useQuery<Company>({
        queryKey: ["companyDetails"],
        queryFn: companyService.getDetails,
    });
};

/**
 * Custom hook to fetch all companies.
 * @returns An object with data, loading state, and error.
 */
export const useAllCompanies = () => {
    return useQuery<Company[]>({
        queryKey: ["companies"],
        queryFn: companyService.getAll,
    });
};

/**
 * Custom hook to fetch all users for a specific company.
 * @param companyId The ID of the company to get users for.
 * @returns An object with data, loading state, and error.
 */
export const useCompanyUsers = (companyId: string | number) => {
    return useQuery<User[]>({
        queryKey: ["companyUsers", companyId],
        queryFn: () => companyService.getUsers(companyId),
        // This query will only run if a valid companyId is provided.
        enabled: !!companyId,
    });
};

/**
 * Custom hook for inviting a new user.
 * @returns A mutation object with mutate function and status.
 */
export const useInviteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: companyService.invite,
        onSuccess: () => {
            // Invalidate the 'companyUsers' query to refetch the user list
            // after a new user is invited, keeping the UI up-to-date.
            queryClient.invalidateQueries({ queryKey: ["companyUsers"] });
        },
    });
};

/**
 * Custom hook for editing a company user.
 * @returns A mutation object with mutate function and status.
 */
export const useEditUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string | number;
            payload: Partial<User>;
        }) => companyService.editUser(id, payload),
        onSuccess: () => {
            // Invalidate the 'companyUsers' query to reflect the changes.
            queryClient.invalidateQueries({ queryKey: ["companyUsers"] });
        },
    });
};

/**
 * Custom hook for deleting a company user.
 * @returns A mutation object with mutate function and status.
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => companyService.deleteUser(id),
        onSuccess: () => {
            // Invalidate the 'companyUsers' query to remove the deleted user.
            queryClient.invalidateQueries({ queryKey: ["companyUsers"] });
        },
    });
};

/**
 * Custom hook for updating company details.
 * @returns A mutation object with mutate function and status.
 */
export const useUpdateCompanyDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string | number;
            payload: Partial<Company>;
        }) => companyService.updateDetails(id, payload),
        onSuccess: () => {
            // Invalidate both the companyDetails and companies queries to update the UI.
            queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
            queryClient.invalidateQueries({ queryKey: ["companies"] });
        },
    });
};

/** Hook for company setup (to create subs, deps, and users) */
export const useBulkCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // mutationFn: companyService.bulkCreate,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["companySubsidiaries"],
            });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["companyUsers"] });
        },
    });
};
