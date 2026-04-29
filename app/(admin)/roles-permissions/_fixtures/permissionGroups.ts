import type { RolePermissionKey } from "../../components/RolePermissionPill";

export interface GroupPermission {
  label: string;
  minRole: RolePermissionKey;
  plus: boolean; // "+" notation meaning the role and above
}

export interface PermissionGroupCard {
  id: string;
  title: string;
  items: GroupPermission[];
}

export const permissionGroups: PermissionGroupCard[] = [
  {
    id: "user_mgmt",
    title: "User Management",
    items: [
      { label: "Invite users", minRole: "Sub", plus: true },
      { label: "Edit user profile", minRole: "Sub", plus: true },
      { label: "Suspend user", minRole: "Sub", plus: true },
      { label: "Delete user", minRole: "Super", plus: false },
      { label: "Assign roles", minRole: "Super", plus: false },
    ],
  },
  {
    id: "data_reports",
    title: "Data & Reports",
    items: [
      { label: "View reports", minRole: "All", plus: false },
      { label: "Submit data", minRole: "Officer", plus: true },
      { label: "Approve reports", minRole: "Sub", plus: true },
      { label: "Lock data", minRole: "Super", plus: false },
    ],
  },
  {
    id: "platform_config",
    title: "Platform Config",
    items: [
      { label: "Edit algorithm", minRole: "Super", plus: false },
      { label: "Manage pillars", minRole: "Super", plus: false },
      { label: "Edit assessments", minRole: "Super", plus: false },
      { label: "Audit trail", minRole: "Sub", plus: true },
    ],
  },
];
