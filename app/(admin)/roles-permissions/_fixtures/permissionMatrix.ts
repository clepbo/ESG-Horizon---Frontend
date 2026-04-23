import type { RoleKey } from "./roles";

export interface PermissionRow {
  key: string;
  label: string;
  grants: Record<RoleKey, boolean>;
}

export interface PermissionGroup {
  label: string;
  permissions: PermissionRow[];
}

// Helper so fixtures stay concise — pass the four booleans in column order.
const g = (
  key: string,
  label: string,
  [superAdmin, subAdmin, dataOfficer, viewer]: [boolean, boolean, boolean, boolean]
): PermissionRow => ({
  key,
  label,
  grants: {
    "Super Admin": superAdmin,
    "Sub Admin": subAdmin,
    "Data Officer": dataOfficer,
    Viewer: viewer,
  },
});

export const permissionMatrix: PermissionGroup[] = [
  {
    label: "User Management",
    permissions: [
      g("invite_users", "Invite users", [true, true, true, true]),
      g("edit_profile", "Edit profile", [true, true, true, false]),
      g("suspend_user", "Suspend user", [true, true, true, false]),
      g("delete_user", "Delete user", [true, true, false, false]),
      g("assign_roles", "Assign roles", [true, false, false, false]),
    ],
  },
  {
    label: "Data & Reports",
    permissions: [
      g("view_reports", "View reports", [true, true, true, true]),
      g("export_reports", "Export reports", [true, true, true, true]),
      g("submit_data", "Submit data", [true, true, false, false]),
      g("approve_reports", "Approve reports", [true, true, false, false]),
      g("lock_data", "Lock data", [true, false, false, false]),
    ],
  },
  {
    label: "Company Mgmt",
    permissions: [
      g("view_companies", "View companies", [true, true, true, true]),
      g("approve_company", "Approve company", [true, true, false, false]),
      g("suspend_company", "Suspend company", [true, false, false, false]),
      g("delete_company", "Delete company", [true, false, false, false]),
    ],
  },
  {
    label: "Platform Config",
    permissions: [
      g("view_algorithm", "View algorithm", [true, true, true, true]),
      g("edit_algorithm", "Edit algorithm", [true, true, false, false]),
      g("publish_algorithm", "Publish algorithm", [true, true, false, false]),
      g("manage_pillars", "Manage pillars", [true, true, false, false]),
      g("edit_assessments", "Edit assessments", [true, true, false, false]),
    ],
  },
  {
    label: "Assessment Mgmt",
    permissions: [
      g("view_assessments", "View assessments", [true, true, true, true]),
      g("add_questions", "Add questions", [true, true, false, false]),
      g("edit_questions", "Edit questions", [true, false, false, false]),
      g("publish_changes", "Publish changes", [true, false, false, false]),
    ],
  },
  {
    label: "Audit",
    permissions: [
      g("view_audit_trail", "View audit trail", [true, true, true, true]),
      g("export_audit_log", "Export audit log", [true, false, false, false]),
    ],
  },
];
