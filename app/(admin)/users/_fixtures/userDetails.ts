import type { UserRole, UserStatus } from "./users";

export const PERMISSIONS = [
  "User Management",
  "User Reports (view)",
  "Data & Reports (submit)",
  "Billing Access",
  "Platform Config",
  "Company Management",
  "Assessment Management",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company: string;
  department: string;
  contactPhone: string;
  avatarColor: string;
  permissions: Permission[];
}

export const userDetailsFixture: UserDetails = {
  id: "u_2",
  firstName: "Kristin",
  lastName: "Watson",
  email: "sara.cruz@example.com",
  role: "Super Admin",
  status: "Active",
  company: "ClearWatts Energy",
  department: "Administration",
  contactPhone: "(084) 555-0102",
  avatarColor: "#f59e0b",
  permissions: ["User Management", "User Reports (view)"],
};
