import { useQuery } from "@tanstack/react-query";
import { mockUsers as users } from "@/mockData/users";

import type { User } from "@/mockData/users";

export async function fetchMockUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(users), 300);
  });
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchMockUsers,
    staleTime: 1000 * 60 * 5,
  });
}

// hooks/useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { mockUsers } from "@/mockData/users";

const fetchMockUsers = async () => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockUsers;
};

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchMockUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
