import { FileMetadata } from "@/hooks/useAssessment";
import { userService } from "@/services/user.service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileData } from "@/app/components/company/assessments/AdditionalFileUpload";
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
  platform_admin: "Platform SubAdmin",
  platform_subadmin: "Platform SubAdmin",
  platform_data_officer: "Platform Data Officer",
  platform_viewer: "Platform Viewer",
  company_esg_admin: "Company Admin",
  company_esg_subadmin: "Company SubAdmin",
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

export function canAccess(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export async function getCurrentUser() {
  const user = await userService.getCurrent();
  return user;
}

export function calculateProgress(fields: (string | FileMetadata | boolean | null | undefined)[]) {
  const total = fields.length;
  const filled = fields.filter(Boolean).length;
  return { total, filled };
}

export const handleAxiosError = (error: unknown, defaultMessage?: string): string => {
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

export const normalizeFiles = (files: FileData[]): FileMetadata[] =>
  files.map((f) => ({
    name: f.name,
    size: f.size ?? 0,
    lastModified: f.lastModified ?? Date.now(),
    url: f.url ?? "",
    publicId: f.publicId ?? "",
  }));

export const formatNumberToTwoDecimals = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const numberValue = Number(value);

  // Check if the conversion resulted in a valid, finite number
  if (isNaN(numberValue) || !isFinite(numberValue)) {
    // If invalid, return "N/A" or "0" depending on desired UX for dashboard scores
    return "0";
  }

  // Use toLocaleString with 'undefined' to automatically use the user's system locale.
  return numberValue.toLocaleString(undefined, {
    minimumFractionDigits: 0, // Allows 12.00 to become "12"
    maximumFractionDigits: 2, // Ensures a max of two decimals
    useGrouping: false, // Prevents thousands separators (e.g., 1,000)
  });
};
