export type RoleStatus = "Active" | "Draft";
export type RoleKey = "Super Admin" | "Sub Admin" | "Data Officer" | "Viewer";

export interface RolePermissionSummary {
  label: string;
  granted: boolean;
}

export interface RoleDefinition {
  key: RoleKey;
  accentColor: string; // top border of the role card
  status: RoleStatus;
  description: string;
  usersAssigned: number;
  permissionsGranted: number;
  permissionsTotal: number;
  highlights: RolePermissionSummary[]; // top 3 permissions shown on the card
}

export const TOTAL_PERMISSIONS = 42;

export const roles: RoleDefinition[] = [
  {
    key: "Super Admin",
    accentColor: "#ef4444",
    status: "Active",
    description:
      "Unrestricted platform access. All permissions granted. Assign with extreme caution.",
    usersAssigned: 1,
    permissionsGranted: TOTAL_PERMISSIONS,
    permissionsTotal: TOTAL_PERMISSIONS,
    highlights: [
      { label: "Full system access", granted: true },
      { label: "Algorithm configuration", granted: true },
      { label: "Assessment management", granted: true },
    ],
  },
  {
    key: "Sub Admin",
    accentColor: "#3b82f6",
    status: "Active",
    description:
      "Day-to-day admin. Manages orgs, approves submissions, generates reports. No system config access.",
    usersAssigned: 4,
    permissionsGranted: 28,
    permissionsTotal: TOTAL_PERMISSIONS,
    highlights: [
      { label: "Sub Admin", granted: true },
      { label: "Report approval", granted: true },
      { label: "Algorithm config", granted: false },
    ],
  },
  {
    key: "Data Officer",
    accentColor: "#a855f7",
    status: "Active",
    description: "ESG data entry and performance monitoring. Cannot approve or manage users.",
    usersAssigned: 12,
    permissionsGranted: 14,
    permissionsTotal: TOTAL_PERMISSIONS,
    highlights: [
      { label: "Submit ESG data", granted: true },
      { label: "View reports", granted: true },
      { label: "User management", granted: false },
    ],
  },
  {
    key: "Viewer",
    accentColor: "#111827",
    status: "Active",
    description:
      "Read-only access. Ideal for auditors, investors, and board members who need visibility only.",
    usersAssigned: 18,
    permissionsGranted: 6,
    permissionsTotal: TOTAL_PERMISSIONS,
    highlights: [
      { label: "View all dashboards", granted: true },
      { label: "Export reports", granted: true },
      { label: "Any write action", granted: false },
    ],
  },
];
