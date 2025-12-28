// File: lib/assessmentCompletionUtils.ts
// FIXED VERSION - Only shows "in-progress" when actual data is filled

export type CompletionStatusType = "completed" | "in-progress" | "not-started";

export interface CompletionStatus {
  status: CompletionStatusType;
  completionPercentage: number;
}

/**
 * Safely get nested property from object
 */
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => {
    return current && typeof current === "object" ? current[key] : undefined;
  }, obj);
}

/**
 * Check if a value is considered "filled" (has meaningful data)
 */
function isFilled(value: any): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    // Check if object has any filled properties (excluding metadata)
    return Object.keys(value).some((key) => {
      if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "_id") return false;
      return isFilled(value[key]);
    });
  }
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

/**
 * Check if data object has any meaningful content (not just empty structure)
 */
function hasActualData(data: any): boolean {
  if (!data || typeof data !== "object") return false;

  const excludedKeys = ["status", "lastUpdated", "id", "createdAt", "updatedAt", "_id"];

  // Get all keys except metadata
  const meaningfulKeys = Object.keys(data).filter((key) => !excludedKeys.includes(key));

  if (meaningfulKeys.length === 0) return false;

  // Check if ANY of these keys have actual filled data
  return meaningfulKeys.some((key) => {
    const value = data[key];
    return isFilled(value);
  });
}

/**
 * Count total fields and filled fields in an object
 */
function calculateFieldCompletion(data: any): { total: number; filled: number } {
  if (!data || typeof data !== "object") {
    return { total: 0, filled: 0 };
  }

  const excludedKeys = ["status", "lastUpdated", "id", "createdAt", "updatedAt", "_id"];

  let total = 0;
  let filled = 0;

  Object.entries(data).forEach(([key, value]) => {
    if (excludedKeys.includes(key)) return;

    // If it's an array of objects (like facilities, vehicles, etc.)
    if (Array.isArray(value)) {
      if (value.length > 0) {
        total += 1;
        filled += 1;
      } else {
        total += 1;
      }
      return;
    }

    // If it's a nested object, recursively count its fields
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nested = calculateFieldCompletion(value);
      total += nested.total;
      filled += nested.filled;
      return;
    }

    // Simple field
    total += 1;
    if (isFilled(value)) {
      filled += 1;
    }
  });

  return { total, filled };
}

/**
 * Check data completion with status-based results
 */
function checkDataCompletion(data: any): CompletionStatus {
  if (!data || typeof data !== "object") {
    return { status: "not-started", completionPercentage: 0 };
  }

  // CRITICAL FIX: Check if there's any actual data first
  if (!hasActualData(data)) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const { total, filled } = calculateFieldCompletion(data);

  if (total === 0) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const completionPercentage = Math.round((filled / total) * 100);

  let status: CompletionStatusType;
  if (completionPercentage === 100) {
    status = "completed";
  } else if (completionPercentage > 0) {
    status = "in-progress";
  } else {
    status = "not-started";
  }

  return { status, completionPercentage };
}

/**
 * Check scope-specific completion for GHG emissions
 */
export function checkScopeCompletion(scopeTitle: string, assessmentData?: any): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  // Try multiple possible data paths
  const possiblePaths = [["environment", "ghg"], ["ghg"], ["assessmentData", "environment", "ghg"]];

  let ghgData = null;
  for (const path of possiblePaths) {
    const data = getNestedValue(assessmentData, path);
    if (data) {
      ghgData = data;
      break;
    }
  }

  if (!ghgData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  // Map scope titles to their data paths
  const scopeMapping: Record<string, string[]> = {
    "Stationary Sources": ["scope1", "stationarySources"],
    "Mobile Sources": ["scope1", "mobileSources"],
    "Process Emissions": ["scope1", "processEmissions"],
    "Fugitive Emissions": ["scope1", "fugitiveEmissions"],
    "Location-Based Scope 2 Emissions": ["scope2", "locationBased"],
    "Market-Based Scope 2 Emissions": ["scope2", "marketBased"],
    "Upstream Emissions (Categories 1-8)": ["scope3", "upstream"],
    "Downstream Emissions (Categories 9-15)": ["scope3", "downstream"],
  };

  const dataPath = scopeMapping[scopeTitle];
  if (!dataPath) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const scopeData = getNestedValue(ghgData, dataPath);

  // If no data exists at all, return not started
  if (!scopeData || Object.keys(scopeData).length === 0) {
    return { status: "not-started", completionPercentage: 0 };
  }

  // CRITICAL FIX: Check if there's actual meaningful data
  if (!hasActualData(scopeData)) {
    return { status: "not-started", completionPercentage: 0 };
  }

  return checkDataCompletion(scopeData);
}

/**
 * Check topic completion (for Disclosure Topics page)
 */
export function checkTopicCompletion(topicTitle: string, assessmentData?: any): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const topicDataPaths: Record<string, () => CompletionStatus> = {
    "Greenhouse Gas Emissions": () => checkGHGCompletion(assessmentData),
    "Air Quality": () => checkAirQualityCompletion(assessmentData),
    "Water and Wastewater Management": () => checkWaterManagementCompletion(assessmentData),
    "Biodiversity Impact": () => checkBiodiversityCompletion(assessmentData),
    "Community Relations": () => checkCommunityRelationsCompletion(assessmentData),
    "Security, Human Rights & Rights of Indigenous Peoples": () =>
      checkSecurityRightsCompletion(assessmentData),
    "Workforce Health & Safety": () => checkWorkforceHealthCompletion(assessmentData),
    "Reserves Valuation & Capital Expenditures": () =>
      checkReservesValuationCompletion(assessmentData),
    "Business Ethics & Transparency": () => checkBusinessEthicsCompletion(assessmentData),
  };

  const checker = topicDataPaths[topicTitle];
  if (checker) {
    return checker();
  }

  return { status: "not-started", completionPercentage: 0 };
}

/**
 * Check GHG completion - ALL scopes must be 100% complete
 */
function checkGHGCompletion(assessmentData: any): CompletionStatus {
  const possiblePaths = [["environment", "ghg"], ["ghg"]];

  let ghgData = null;
  for (const path of possiblePaths) {
    const data = getNestedValue(assessmentData, path);
    if (data) {
      ghgData = data;
      break;
    }
  }

  if (!ghgData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const scope1 = ghgData.scope1 || {};
  const scope2 = ghgData.scope2 || {};
  const scope3 = ghgData.scope3 || {};

  // Check each individual section
  const sections = [
    { name: "stationarySources", data: scope1.stationarySources },
    { name: "mobileSources", data: scope1.mobileSources },
    { name: "processEmissions", data: scope1.processEmissions },
    { name: "fugitiveEmissions", data: scope1.fugitiveEmissions },
    { name: "locationBased", data: scope2.locationBased },
    { name: "marketBased", data: scope2.marketBased },
    { name: "upstream", data: scope3.upstream },
    { name: "downstream", data: scope3.downstream },
  ];

  let totalSections = 0;
  let completedSections = 0;
  let partialSections = 0;

  sections.forEach((section) => {
    // Only count sections that have actual data
    if (section.data && hasActualData(section.data)) {
      totalSections += 1;
      const sectionCompletion = checkDataCompletion(section.data);

      if (sectionCompletion.status === "completed") {
        completedSections += 1;
      } else if (sectionCompletion.status === "in-progress") {
        partialSections += 1;
      }
    }
  });

  // If no sections have been started
  if (totalSections === 0) {
    return { status: "not-started", completionPercentage: 0 };
  }

  // Calculate overall completion based on 8 possible sections
  const completionPercentage = Math.round((completedSections / 8) * 100);

  let status: CompletionStatusType;
  if (completedSections === 8) {
    status = "completed";
  } else if (completedSections > 0 || partialSections > 0) {
    status = "in-progress";
  } else {
    status = "not-started";
  }

  return { status, completionPercentage };
}

function checkAirQualityCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["environment", "airQuality"]);
  return checkDataCompletion(data);
}

function checkWaterManagementCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["environment", "waterManagement"]);
  return checkDataCompletion(data);
}

function checkBiodiversityCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["environment", "biodiversity"]);
  return checkDataCompletion(data);
}

function checkCommunityRelationsCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["socialCapital", "communityRelations"]);
  return checkDataCompletion(data);
}

function checkSecurityRightsCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["socialCapital", "securityRights"]);
  return checkDataCompletion(data);
}

function checkWorkforceHealthCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["humanCapital", "workforceHealth"]);
  return checkDataCompletion(data);
}

function checkReservesValuationCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["businessModel", "reservesValuation"]);
  return checkDataCompletion(data);
}

function checkBusinessEthicsCompletion(assessmentData: any): CompletionStatus {
  const data = getNestedValue(assessmentData, ["businessModel", "businessEthics"]);
  return checkDataCompletion(data);
}

/**
 * Get badge styling and text based on status
 */
export function getCompletionBadgeVariant(status: CompletionStatus): {
  variant: string;
  text: string;
  className: string;
} {
  switch (status.status) {
    case "completed":
      return {
        variant: "success",
        text: "Completed",
        className: "bg-green-100 text-green-800 border-green-300",
      };
    case "in-progress":
      return {
        variant: "warning",
        text: "In Progress",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    case "not-started":
    default:
      return {
        variant: "default",
        text: "Not Started",
        className: "bg-gray-100 text-gray-600 border-gray-300",
      };
  }
}

/**
 * Helper function to check if status should show badge
 */
export function shouldShowBadge(status: CompletionStatus): boolean {
  return status.status === "completed" || status.status === "in-progress";
}

/**
 * Get border class based on status
 */
export function getCompletionBorderClass(status: CompletionStatus): string {
  switch (status.status) {
    case "completed":
      return "border-l-4 border-l-green-500";
    case "in-progress":
      return "border-l-4 border-l-yellow-500";
    case "not-started":
    default:
      return "border-l-4 border-l-gray-300";
  }
}
