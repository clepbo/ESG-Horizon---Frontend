import {
  mockDepartments,
  mockTeamUsers,
  Department,
  TeamUser,
} from "@/lib/mockData/mockDepartment";

const USE_MOCK = true;

export async function fetchDepartments(): Promise<Department[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDepartments), 300); // Simulate delay
    });
  }

  const res = await fetch("/api/departments");
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export async function fetchTeamUsers(): Promise<TeamUser[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTeamUsers), 300); // Simulate delay
    });
  }

  const res = await fetch("/api/team-users");
  if (!res.ok) throw new Error("Failed to fetch team users");
  return res.json();
}
