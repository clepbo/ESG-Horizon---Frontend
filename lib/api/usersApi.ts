// lib/api/usersApi.ts
import { mockUsers, User } from "@/mockData/users";

const USE_MOCK = true;

export async function fetchUsers(): Promise<User[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUsers), 300); // Simulate delay
    });
  }

  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}
