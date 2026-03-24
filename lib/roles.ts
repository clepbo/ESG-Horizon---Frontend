import { USER_TYPES } from "@/app/constants/userTypes";
import { useAuth } from "@/context/AuthContext";

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

// ── Role groups (mirror backend role.constants.ts) ───────────────────────────

export const PLATFORM_ROLES = [
  SUPER_ADMIN,
  PLATFORM_SUBADMIN,
  PLATFORM_DATA_OFFICER,
  PLATFORM_VIEWER,
] as const;

export const COMPANY_ROLES = [
  COMPANY_ESG_ADMIN,
  COMPANY_ESG_SUBADMIN,
  COMPANY_ESG_DATA_OFFICER,
  COMPANY_ESG_VIEWER,
] as const;

export const ALL_ROLES = [...PLATFORM_ROLES, ...COMPANY_ROLES] as const;

export const DATA_WRITE_ROLES = [
  SUPER_ADMIN,
  PLATFORM_SUBADMIN,
  PLATFORM_DATA_OFFICER,
  COMPANY_ESG_ADMIN,
  COMPANY_ESG_SUBADMIN,
  COMPANY_ESG_DATA_OFFICER,
] as const;

export const VALIDATOR_ROLES = [
  SUPER_ADMIN,
  PLATFORM_SUBADMIN,
  COMPANY_ESG_ADMIN,
  COMPANY_ESG_SUBADMIN,
] as const;

export const USER_MANAGEMENT_ROLES = [
  SUPER_ADMIN,
  PLATFORM_SUBADMIN,
  COMPANY_ESG_ADMIN,
  COMPANY_ESG_SUBADMIN,
] as const;

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRoles() {
  const { user } = useAuth();
  const role = user?.role?.name;

  const is = (list: readonly string[]) => !!role && list.includes(role);

  return {
    role,
    isSuperAdmin: role === SUPER_ADMIN,
    isPlatform: is(PLATFORM_ROLES),
    isPlatformAdmin: is([SUPER_ADMIN, PLATFORM_SUBADMIN]),
    isCompanyAdmin: role === COMPANY_ESG_ADMIN,
    isCompanyLeader: is([COMPANY_ESG_ADMIN, COMPANY_ESG_SUBADMIN]),
    canWriteData: is(DATA_WRITE_ROLES),
    isValidator: is(VALIDATOR_ROLES),
    canManageUsers: is(USER_MANAGEMENT_ROLES),
  };
}
