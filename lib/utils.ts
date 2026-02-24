import { FileMetadata } from "@/hooks/useAssessment";
import { userService } from "@/services/user.service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileData } from "@/app/components/company/assessments/AdditionalFileUpload";
import { formatNumberFull } from "@/lib/numberFormat";

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
  return Math.min(Math.round((overallProgress + inputProgress / totalSteps) * 100), 100);
}

export function getAssessmentProgressForTable(assessment: any): number {
  const cap = (v: number) => Math.min(Math.round(v), 100);
  const { assessmentData, progress } = assessment || {};
  if (typeof progress === "number" && progress > 0) return cap(progress);
  if (assessmentData?.overallProgress && assessmentData.overallProgress > 0)
    return cap(assessmentData.overallProgress);

  // Use ProgressTrackingService to calculate actual progress from all topics
  if (assessmentData) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ProgressTrackingService } = require("@/lib/assessmentCompletionUtils");
      const service = new ProgressTrackingService();
      const overall = service.getOverallCompletion(assessmentData);
      if (overall.completionPercentage > 0) {
        return Math.round(overall.completionPercentage);
      }
    } catch {
      // Fallback to legacy logic if import fails
      console.warn("ProgressTrackingService not available, using legacy logic");
    }
  }

  // fallback to legacy logic for GHG forms
  if (!assessmentData) return 0;
  const lastSavedForm: string = assessmentData.lastSavedForm || "";
  if (!lastSavedForm) return 0;

  const cleaned = lastSavedForm.replace(/^ghg-/, "");

  const parts = cleaned.split("-");

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

  const formKeyMap: Record<string, string[]> = {
    stationarySources: [
      "electricityHeat",
      "oilGasOperations",
      "industrialProcesses",
      "otherCombustion",
      "emergencyGenerators",
      "refrigerationAC",
    ],
    mobileSources: [
      "companyOwnedVehicles",
      "employeeTransportation",
      "businessTravel",
      "logistics",
    ],
    fugitiveEmissions: ["fugitiveSources"],
    processEmissions: ["processSources"],
    locationBased: ["electricity", "cooling", "steam", "heating"],
    marketBased: ["electricityIPP", "electricityEAC", "residual", "coolingSteam"],
  };

  const group = assessmentData[groupKey];
  if (!group) return 0;

  const rawFormKey = camelCase(parts.slice(2).join("-"));
  let form = group[rawFormKey];

  if (!form) {
    const possibleKeys = formKeyMap[groupKey];
    for (const key of possibleKeys) {
      if (group[key]?.progressPercent) {
        form = group[key];
        break;
      }
    }
  }

  return form?.progressPercent ?? 0;
}

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
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

  if (isNaN(numberValue) || !isFinite(numberValue)) {
    return "0";
  }

  return numberValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
};

export const formattedDate = (date: string, includeTime: boolean = true): string => {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "n/a";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return dateObj.toLocaleString("en-US", options);
};

// interface SourceDataForCalculation {
//   volume: number | string;
//   emissionFactor: number;
// }

// export function calculateTCO2eForSource(data: SourceDataForCalculation): number {
//   const { volume, emissionFactor } = data;

//   const numericalVolume = Number(volume);
//   if (isNaN(numericalVolume) || numericalVolume <= 0 || emissionFactor < 0) {
//     return 0;
//   }

//   const kgCO2e = numericalVolume * emissionFactor;

//   const tCO2e = kgCO2e / 1000;

//   return parseFloat(tCO2e.toFixed(2));
// }

// export function formatTCO2eOutput(tCO2eValue: number): string {
//   if (tCO2eValue === 0) {
//     return "0.000 tCO2e";
//   }
//   return `${tCO2eValue} tCO2e`;
// }
export interface SourceDataForCalculation {
  volume: string | number;
  emissionFactor: number;
  unit?: string;
  isInTonnes?: boolean;
}

export function calculateTCO2eForSource(data: SourceDataForCalculation): number {
  const { volume, emissionFactor, unit, isInTonnes = false } = data;

  const numericalVolume = Number(volume);
  if (isNaN(numericalVolume) || numericalVolume <= 0 || emissionFactor < 0) {
    return 0;
  }

  let tCO2e: number;

  const lowerUnit = unit?.toLowerCase();

  if (isInTonnes || lowerUnit === "tonne" || lowerUnit === "tonnes" || lowerUnit === "ton") {
    tCO2e = numericalVolume * emissionFactor;
  } else {
    // Default for kg, litre, scm, etc.
    const kgCO2e = numericalVolume * emissionFactor;
    tCO2e = kgCO2e / 1000;
  }

  return parseFloat(tCO2e.toFixed(4)); // Use 4 decimals for precision
}

export function formatCO2e(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = Number(value);
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
}

export function formatTCO2eOutput(tCO2eValue: number): string {
  if (tCO2eValue === 0 || isNaN(tCO2eValue)) {
    return "0.00 tCO2e";
  }
  return `${formatNumberFull(tCO2eValue, { minimumFractionDigits: 2 })} tCO2e`;
}

export function formatStatus(status: any | any[]): string {
  if (!status) return "";
  if (status === "submitted_approved") {
    return "Submitted-Approved";
  }
  if (status === "unapproved_rejected") {
    return "Declined";
  }
  const words = status
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.join(" ");
}
