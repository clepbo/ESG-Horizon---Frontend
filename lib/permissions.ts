import { USER_TYPES } from "@/app/constants/userTypes";
import { useAuth } from "@/context/AuthContext";

// ── Role shorthands (reduce repetition in the map) ──────────────────────────
const {
  SUPER_ADMIN,
  PLATFORM_SUBADMIN,
  PLATFORM_DATA_OFFICER,
  PLATFORM_VIEWER,
  COMPANY_ESG_ADMIN,
  COMPANY_ESG_SUBADMIN,
  COMPANY_ESG_DATA_OFFICER,
  COMPANY_ESG_VIEWER,
} = USER_TYPES;

/** All platform roles */
const PLATFORM_ALL = [SUPER_ADMIN, PLATFORM_SUBADMIN, PLATFORM_DATA_OFFICER, PLATFORM_VIEWER] as const;

/** All company ESG roles */
const COMPANY_ALL = [COMPANY_ESG_ADMIN, COMPANY_ESG_SUBADMIN, COMPANY_ESG_DATA_OFFICER, COMPANY_ESG_VIEWER] as const;

/** All roles across both tiers */
const ALL_ROLES = [...PLATFORM_ALL, ...COMPANY_ALL] as const;

/** Company admins only (admin + subadmin) */
const COMPANY_ADMINS = [COMPANY_ESG_ADMIN, COMPANY_ESG_SUBADMIN] as const;

/** Company contributors (admin + subadmin + data officer — everyone except viewer) */
const COMPANY_CONTRIBUTORS = [COMPANY_ESG_ADMIN, COMPANY_ESG_SUBADMIN, COMPANY_ESG_DATA_OFFICER] as const;

/** Platform admins (super + subadmin) */
const PLATFORM_ADMINS = [SUPER_ADMIN, PLATFORM_SUBADMIN] as const;

// ── Centralised permission map ──────────────────────────────────────────────
/**
 * Each key is an action name; the value is the set of roles allowed to perform it.
 * Add new actions here — components only need `can("actionName")`.
 */
const PERMISSION_MAP = {
  // ── Data Management ───────────────────────────────────────────────────────
  exportData: [
    SUPER_ADMIN, PLATFORM_SUBADMIN, PLATFORM_DATA_OFFICER,
    COMPANY_ESG_ADMIN, COMPANY_ESG_SUBADMIN, COMPANY_ESG_DATA_OFFICER,
  ],
  downloadReports: [
    SUPER_ADMIN, PLATFORM_SUBADMIN, PLATFORM_DATA_OFFICER,
    COMPANY_ESG_ADMIN, COMPANY_ESG_SUBADMIN, COMPANY_ESG_DATA_OFFICER,
  ],
  manageDataRetention: [SUPER_ADMIN, COMPANY_ESG_ADMIN],
  manageAutoBackup: [SUPER_ADMIN, COMPANY_ESG_ADMIN],

  // ── Company settings ──────────────────────────────────────────────────────
  toggleAssessmentReview: [SUPER_ADMIN, COMPANY_ESG_ADMIN],
  editCompanyProfile: [SUPER_ADMIN, COMPANY_ESG_ADMIN],
  manageDepartments: [SUPER_ADMIN, ...COMPANY_ADMINS],
  manageSubsidiaries: [SUPER_ADMIN, COMPANY_ESG_ADMIN],

  // ── Assessment actions ────────────────────────────────────────────────────
  createAssessment: [...COMPANY_CONTRIBUTORS],
  editAssessment: [...COMPANY_CONTRIBUTORS],
  submitAssessment: [...COMPANY_CONTRIBUTORS],
  approveAssessment: [...COMPANY_ADMINS],
  declineAssessment: [...COMPANY_ADMINS],
  deleteAssessment: [COMPANY_ESG_ADMIN],

  // ── Team management ───────────────────────────────────────────────────────
  inviteUser: [...COMPANY_ADMINS],
  editUser: [...COMPANY_ADMINS],
  editUserRole: [COMPANY_ESG_ADMIN],
  deactivateUser: [...COMPANY_ADMINS],
  viewTeamMembers: [...COMPANY_CONTRIBUTORS],

  // ── KPI / Targets ─────────────────────────────────────────────────────────
  createTarget: [...COMPANY_CONTRIBUTORS],
  editTarget: [...COMPANY_ADMINS],
  deleteTarget: [COMPANY_ESG_ADMIN],

  // ── Reports ───────────────────────────────────────────────────────────────
  viewReports: [...ALL_ROLES],
  generateReport: [
    SUPER_ADMIN, PLATFORM_SUBADMIN, PLATFORM_DATA_OFFICER,
    ...COMPANY_CONTRIBUTORS,
  ],
  generateAIReport: [SUPER_ADMIN, PLATFORM_SUBADMIN, ...COMPANY_ADMINS],

  // ── Platform Admin ────────────────────────────────────────────────────────
  approveCompany: [...PLATFORM_ADMINS],
  suspendCompany: [...PLATFORM_ADMINS],
  invitePlatformUser: [SUPER_ADMIN],
  viewAllCompanies: [SUPER_ADMIN, PLATFORM_SUBADMIN, PLATFORM_DATA_OFFICER],

  // ── Sidebar nav visibility ────────────────────────────────────────────────
  viewCompanyManagement: [SUPER_ADMIN, PLATFORM_SUBADMIN, PLATFORM_DATA_OFFICER],
  viewTeamsSettings: [SUPER_ADMIN, ...COMPANY_ADMINS],
  viewDepartmentsSettings: [SUPER_ADMIN, ...COMPANY_ADMINS],
  viewNewAssessment: [...COMPANY_CONTRIBUTORS],
} as const satisfies Record<string, readonly string[]>;

export type Permission = keyof typeof PERMISSION_MAP;

/** Pure function — check a role against an action without hooks. */
export function hasPermission(role: string | undefined, action: Permission): boolean {
  const allowed = PERMISSION_MAP[action];
  if (!allowed || !role) return false;
  return (allowed as readonly string[]).includes(role);
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
