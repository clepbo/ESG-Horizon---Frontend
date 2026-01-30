import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  departmentService,
  Department,
  DepartmentUser,
  CreateDepartment,
  UpdateDepartment,
} from "../department.service";

/**
 * Custom hook to fetch all departments for a company.
 * @param companyId The ID of the company to get departments for.
 * @returns An object with data, loading state, and error.
 */
export const useCompanyDepartments = (companyId: string | number) => {
  return useQuery<Department[]>({
    queryKey: ["departments", companyId],
    queryFn: () => departmentService.getAll(companyId),
    // This query will only run if a valid companyId is provided.
    enabled: !!companyId,
  });
};

/**
 * Custom hook to fetch all users for a specific department.
 * @param departmentId The ID of the department to get users for.
 * @returns An object with data, loading state, and error.
 */
export const useDepartmentUsers = (departmentId: string | number) => {
  return useQuery<DepartmentUser[]>({
    queryKey: ["departmentUsers", departmentId],
    queryFn: () => departmentService.getUsers(departmentId),
    // This query will only run if a valid departmentId is provided.
    enabled: !!departmentId,
  });
};

/**
 * Custom hook for creating a new department.
 * @returns A mutation object with mutate function and status.
 */
// Corrected Hook
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string | number;
      payload?: CreateDepartment;
    }) => departmentService.create(companyId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["departments", Number(variables.companyId)],
      });
    },
  });
};

/**
 * Custom hook for updating an existing department.
 * @returns A mutation object with mutate function and status.
 */
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload?: UpdateDepartment }) =>
      departmentService.update(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate the specific department and all departments queries to reflect the changes.
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({
        queryKey: ["department", variables.id],
      });
    },
  });
};

/**
 * Custom hook for deleting a department.
 * @returns A mutation object with mutate function and status.
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => departmentService.delete(id),
    onSuccess: () => {
      // Invalidate all departments queries to remove the deleted item from the list.
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
