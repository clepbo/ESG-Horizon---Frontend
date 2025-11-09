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

export function computeProgressPercent({
  stepIndex,
  totalSteps,
  fieldsCompleted,
  totalFields,
}: {
  stepIndex: number;
  totalSteps: number;
  fieldsCompleted: number;
  totalFields: number;
}) {
  const overallProgress = (stepIndex - 1) / totalSteps;
  const inputProgress = totalFields > 0 ? fieldsCompleted / totalFields : 0;
  return Math.round((overallProgress + inputProgress / totalSteps) * 100);
}

export function getAssessmentProgressForTable(assessment: any): number {
  const lastSavedForm: string = assessment.assessmentData?.lastSavedForm || "";
  if (!lastSavedForm) return 0;

  const cleaned = lastSavedForm.replace(/^ghg-/, ""); // remove prefix
  const parts = cleaned.split("-");

  // map group keys
  const groupMap: Record<string, string> = {
    "stationary-sources": "stationarySources",
    "mobile-sources": "mobileSources",
    "fugitive-emissions": "fugitiveEmissions",
    "process-emissions": "processEmissions",
    "location-based": "locationBased",
    "market-based": "marketBased",
  };

  const groupKey = groupMap[parts.slice(0, 2).join("-")];
  if (!groupKey) return 0;

  const formKey = camelCase(parts.slice(2).join("-"));
  const group = assessment.assessmentData?.[groupKey];
  if (!group) return 0;

  const form = group[formKey];
  if (!form) return 0;

  return form.progressPercent ?? 0;
}

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
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

export const formattedDate = (date: string): string => {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "n/a";
  }

  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface SourceDataForCalculation {
  volume: number | string;
  emissionFactor: number;
}

export function calculateTCO2eForSource(data: SourceDataForCalculation): number {
  const { volume, emissionFactor } = data;

  const numericalVolume = Number(volume);
  if (isNaN(numericalVolume) || numericalVolume <= 0 || emissionFactor < 0) {
    return 0;
  }

  const kgCO2e = numericalVolume * emissionFactor;

  const tCO2e = kgCO2e / 1000;

  return parseFloat(tCO2e.toFixed(3));
}

export function formatTCO2eOutput(tCO2eValue: number): string {
  if (tCO2eValue === 0) {
    return "0.000 tCO2e";
  }
  return `${tCO2eValue.toFixed(3)} tCO2e`;
}

export function formatStatus(status: any | any[]): string {
  if (!status) return "";
  const words = status
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.join(" ");
}
