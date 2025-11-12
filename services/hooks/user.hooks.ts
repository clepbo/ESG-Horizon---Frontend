import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, User } from "../user.service";

/**
 * Custom hook to fetch the current authenticated user's details.
 * @returns A query object with the user data, loading state, and error.
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => userService.getCurrent(),
  });
};

/**
 * Custom hook for editing the current authenticated user's details.
 * Invalidates the `currentUser` and `allUsers` queries on success to keep data fresh.
 * @returns A mutation object with the mutate function and status.
 */
export const useEditCurrentUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.editCurrent,
    onSuccess: () => {
      // Invalidate the current user query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      // Invalidate the all users query as well, in case the user's details affect it
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};

/**
 * Custom hook to fetch a list of all users, with optional filtering parameters.
 * @param params Optional parameters to filter the list of users.
 * @returns A query object with the user list, loading state, and error.
 */
export const useAllUsers = (params?: Partial<User>) => {
  return useQuery({
    queryKey: ["allUsers", params],
    queryFn: () => userService.getAll(params),
  });
};

/**
 * Custom hook to fetch all available user roles.
 * @returns A query object with the list of user roles, loading state, and error.
 */
export const useAllUserRoles = () => {
  return useQuery({
    queryKey: ["allUserRoles"],
    queryFn: () => userService.getAllUserRoles(),
  });
};
