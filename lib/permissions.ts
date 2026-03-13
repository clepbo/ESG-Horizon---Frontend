import { USER_TYPES } from "@/app/constants/userTypes";
import { useAuth } from "@/context/AuthContext";

/**
 * Centralised permission map.
 * Each key is an action name; the value is the set of roles allowed to perform it.
 * Add new actions here — components only need `can("actionName")`.
 */
const PERMISSION_MAP: Record<string, readonly string[]> = {
  // Data Management tab
  exportData: [
    USER_TYPES.SUPER_ADMIN,
    USER_TYPES.PLATFORM_SUBADMIN,
    USER_TYPES.PLATFORM_DATA_OFFICER,
    USER_TYPES.COMPANY_ESG_ADMIN,
    USER_TYPES.COMPANY_ESG_SUBADMIN,
    USER_TYPES.COMPANY_ESG_DATA_OFFICER,
  ],
  downloadReports: [
    USER_TYPES.SUPER_ADMIN,
    USER_TYPES.PLATFORM_SUBADMIN,
    USER_TYPES.PLATFORM_DATA_OFFICER,
    USER_TYPES.COMPANY_ESG_ADMIN,
    USER_TYPES.COMPANY_ESG_SUBADMIN,
    USER_TYPES.COMPANY_ESG_DATA_OFFICER,
  ],
  manageDataRetention: [
    USER_TYPES.SUPER_ADMIN,
    USER_TYPES.COMPANY_ESG_ADMIN,
  ],
  manageAutoBackup: [
    USER_TYPES.SUPER_ADMIN,
    USER_TYPES.COMPANY_ESG_ADMIN,
  ],

  // Company settings
  toggleAssessmentReview: [
    USER_TYPES.SUPER_ADMIN,
    USER_TYPES.COMPANY_ESG_ADMIN,
  ],
};

export type Permission = keyof typeof PERMISSION_MAP;

/** Pure function — check a role against an action without hooks. */
export function hasPermission(role: string | undefined, action: Permission): boolean {
  const allowed = PERMISSION_MAP[action];
  if (!allowed || !role) return false;
  return allowed.includes(role);
}

/** Hook — returns a `can(action)` helper bound to the current user's role. */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role?.name;

  return {
    can: (action: Permission) => hasPermission(role, action),
    role,
  };
}
