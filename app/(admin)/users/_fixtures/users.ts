export type UserRole = "Super Admin" | "Sub Admin" | "Data Officer" | "Viewer";
export type UserStatus = "Active" | "Suspended" | "Pending";

export interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  company: string;
  lastActive: string; // human-readable for now — will become ISO once wired
  status: UserStatus;
  avatarColor: string; // seed color for initials circle
}

export const users: UserRow[] = [
  {
    id: "u_1",
    firstName: "Efeosasere",
    lastName: "Okoro",
    email: "efe@teasoo.com",
    role: "Super Admin",
    department: "Administration",
    company: "Teasoo",
    lastActive: "Now",
    status: "Active",
    avatarColor: "#0d9488",
  },
  {
    id: "u_2",
    firstName: "Kristin",
    lastName: "Watson",
    email: "sara.cruz@example.com",
    role: "Sub Admin",
    department: "Sustainability",
    company: "Teasoo",
    lastActive: "2h ago",
    status: "Active",
    avatarColor: "#f59e0b",
  },
  {
    id: "u_3",
    firstName: "Jenny",
    lastName: "Wilson",
    email: "jenny.wilson@example.com",
    role: "Sub Admin",
    department: "Digital",
    company: "GreenTech",
    lastActive: "Yesterday",
    status: "Active",
    avatarColor: "#f59e0b",
  },
  {
    id: "u_4",
    firstName: "Ngozi",
    lastName: "Okoro",
    email: "ngozi@barone.com",
    role: "Super Admin",
    department: "Investment",
    company: "Barone LLC",
    lastActive: "3 days ago",
    status: "Suspended",
    avatarColor: "#a855f7",
  },
  {
    id: "u_5",
    firstName: "Albert",
    lastName: "Flores",
    email: "albert.f@teasoo.com",
    role: "Sub Admin",
    department: "Administration",
    company: "Teasoo",
    lastActive: "5h ago",
    status: "Active",
    avatarColor: "#ec4899",
  },
];
