import { FileMetadata } from "@/hooks/useAssessment";
import { userService } from "@/services/user.service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let logoutFunc: (() => void) | null = null;

export const registerLogout = (fn: () => void) => {
  logoutFunc = fn;
};

export const triggerLogout = () => {
  if (logoutFunc) logoutFunc();
};

export const formatRole = (role: string) => {
  if (!role) return;
  const role_strings = role.split("_");
  return role_strings.forEach((role) => role.charAt(0).toUpperCase());
};

const roleMappings: Record<string, string> = {
    super_admin: "Super Admin",
    platform_admin: "Platform Subadmin",
    platform_subadmin: "Platform Subadmin",
    platform_data_officer: "Platform Data Officer",
    platform_viewer: "Platform Viewer",
    company_esg_admin: "Company Admin",
    company_esg_subadmin: "Company Subadmin",
    company_esg_data_officer: "Company Data Officer",
    company_esg_viewer: "Company Viewer",
};

export function formatRoleName(roleKey: string): string {
  return roleMappings[roleKey] ?? roleKey;
}

export async function getRole() {
  const user = await userService.getCurrent();
  return user?.role?.name;
}

export function canAccess(
  userRole: string | undefined,
  allowedRoles: string[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export async function getCurrentUser() {
  const user = await userService.getCurrent();
  return user;
}

export function calculateProgress(
  fields: (string | FileMetadata | boolean | null | undefined)[]
) {
  const total = fields.length;
  const filled = fields.filter(Boolean).length;
  return { total, filled };
}

export const handleAxiosError = (
    error: unknown,
    defaultMessage?: string
): string => {
    let errorMessage = defaultMessage || "Request Failed. Please try again.";
    if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
            response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return errorMessage;
};
