import { useQuery } from "@tanstack/react-query";
import { mockUsers as users } from "@/lib/mockData/users";
import type { User } from "@/lib/mockData/users";

export async function fetchMockUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(users), 300);
  });
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchMockUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
