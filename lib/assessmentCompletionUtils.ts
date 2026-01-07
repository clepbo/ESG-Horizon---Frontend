export type CompletionStatusType = "completed" | "in-progress" | "not-started";

export interface CompletionStatus {
  status: CompletionStatusType;
  completionPercentage: number;
}

interface TopicConfig {
  path: string[][];
  subComponents?: string[];
  type: "simple" | "multi-component";
}

const TOPIC_CONFIGURATIONS: Record<string, TopicConfig> = {
  "Greenhouse Gas Emissions": {
    path: [["environment", "ghg"], ["ghg"]],
    subComponents: [
      "scope1.stationarySources",
      "scope1.mobileSources",
      "scope1.processEmissions",
      "scope1.fugitiveEmissions",
      "scope2.locationBased",
      "scope2.marketBased",
      "scope3.upstream",
      "scope3.downstream",
    ],
    type: "multi-component",
  },
  "Air Quality": {
    path: [["environment", "airQuality"]],
    type: "simple",
  },
  "Water and Wastewater Management": {
    path: [["environment", "waterManagement", "waterAndProducedWaterManagement"]],
    subComponents: [
      "freshwaterWithdrawals",
      "producedWater",
      "chemicalDisclosure",
      "waterQualityImpacts",
    ],
    type: "multi-component",
  },
  "Biodiversity Impact": {
    path: [
      ["environment", "biodiversity"],
      ["environment", "biodiversityImpact"],
      ["biodiversity"],
      ["biodiversityImpact"],
    ],
    subComponents: [
      "environmentalManagement|environmental_management|environmentalManagementPolicies",
      "hydrocarbonSpills|hydrocarbon_spills",
      "reservesSensitiveAreas|reserves_sensitive_areas|reservesInSensitiveAreas",
    ],
    type: "multi-component",
  },
  "Community Relations": {
    path: [["socialCapital", "communityRelations"]],
    type: "simple",
  },
  "Security, Human Rights & Rights of Indigenous Peoples": {
    path: [["socialCapital", "securityRights"]],
    type: "simple",
  },
  "Workforce Health & Safety": {
    path: [["humanCapital", "workforceHealth"]],
    type: "simple",
  },
  "Reserves Valuation & Capital Expenditures": {
    path: [["businessModel", "reservesValuation"]],
    type: "simple",
  },
  "Business Ethics & Transparency": {
    path: [["businessModel", "businessEthics"]],
    type: "simple",
  },
};

/**
 * Mapping for scope titles (GHG specific)
 */
const SCOPE_MAPPING: Record<string, string[]> = {
  "Stationary Sources": ["scope1", "stationarySources"],
  "Mobile Sources": ["scope1", "mobileSources"],
  "Process Emissions": ["scope1", "processEmissions"],
  "Fugitive Emissions": ["scope1", "fugitiveEmissions"],
  "Location-Based Scope 2 Emissions": ["scope2", "locationBased"],
  "Market-Based Scope 2 Emissions": ["scope2", "marketBased"],
  "Upstream Emissions (Categories 1-8)": ["scope3", "upstream"],
  "Downstream Emissions (Categories 9-15)": ["scope3", "downstream"],
};

/**
 * Mapping for sub-component titles
 */
const SUB_COMPONENT_MAPPING: Record<string, string[]> = {
  "Freshwater Withdrawal & Consumption": [
    "environment",
    "waterManagement",
    "waterAndProducedWaterManagement",
    "freshwaterWithdrawalAndConsumption",
  ],
  "Produced Water Management": [
    "environment",
    "waterManagement",
    "waterAndProducedWaterManagement",
    "producedWaterManagement",
  ],

  // Water Management - Hydraulic Fracturing Impacts section
  "Chemical Disclosure": [
    "environment",
    "waterManagement",
    "hydraulicFracturingImpacts",
    "chemicalDisclosure",
  ],
  "Water Quality Impacts": [
    "environment",
    "waterManagement",
    "hydraulicFracturingImpacts",
    "waterQualityImpacts",
  ],
  // Biodiversity Impact
  "Environmental Management Policies": [
    "environment",
    "biodiversityImpact",
    "environmentalManagement",
  ],
  "Hydrocarbon Spills": ["environment", "biodiversityImpact", "hydrocarbonSpills"],
  "Reserves in Sensitive Areas": ["environment", "biodiversityImpact", "reservesSensitiveAreas"],
};

/**
 * Safely get nested property from object
 */
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => {
    return current && typeof current === "object" ? current[key] : undefined;
  }, obj);
}

/**
 * Get nested value with support for dot notation
 */
function getNestedValueDotNotation(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && typeof current === "object" ? current[key] : undefined;
  }, obj);
}

/**
 * Try multiple possible property names (separated by |)
 */
function getValueWithAlternatives(obj: any, alternatives: string): any {
  const names = alternatives.split("|");
  for (const name of names) {
    if (obj[name] !== undefined) {
      return obj[name];
    }
  }
  return undefined;
}

/**
 * Check if a value is considered "filled" (has meaningful data)
 * IMPORTANT: 0, false, empty arrays, and empty objects are NOT considered filled
 */
function isFilled(value: any): boolean {
  // Explicitly empty values
  if (value === null || value === undefined || value === "") return false;

  // Numbers: only non-zero numbers are considered filled
  if (typeof value === "number") return value !== 0;

  // Booleans: only true is considered filled (false is default/unchecked state)
  if (typeof value === "boolean") return value === true;

  // Arrays: must have items
  if (Array.isArray(value)) return value.length > 0;

  // Objects: check if any nested values are filled
  if (typeof value === "object") {
    return Object.keys(value).some((key) => {
      if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "_id") return false;
      return isFilled(value[key]);
    });
  }

  // Strings: must have content after trimming
  if (typeof value === "string") return value.trim().length > 0;

  return true;
}

/**
 * Check if data object has any meaningful content (not just empty structure)
 */
function hasActualData(data: any): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  const excludedKeys = [
    "status",
    "lastUpdated",
    "id",
    "createdAt",
    "updatedAt",
    "_id",
    "progress",
    "totalEmission",
  ];
  const meaningfulKeys = Object.keys(data).filter((key) => !excludedKeys.includes(key));

  if (meaningfulKeys.length === 0) {
    return false;
  }

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

  const excludedKeys = [
    "status",
    "lastUpdated",
    "id",
    "createdAt",
    "updatedAt",
    "_id",
    "progress",
    "totalEmission",
  ];
  let total = 0;
  let filled = 0;

  Object.entries(data).forEach(([key, value]) => {
    if (excludedKeys.includes(key)) return;

    if (Array.isArray(value)) {
      total += 1;
      if (value.length > 0) filled += 1;
      return;
    }

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nested = calculateFieldCompletion(value);
      total += nested.total;
      filled += nested.filled;
      return;
    }

    total += 1;
    if (isFilled(value)) filled += 1;
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
 * Generic function to check multi-component topics
 */
function checkMultiComponentCompletion(
  topicData: any,
  subComponentPaths: string[],
  isSubmitted: boolean,
  submittedGroups: string[] = []
): CompletionStatus {
  if (!topicData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  let componentsWithData = 0;
  let completedComponents = 0;
  let partialComponents = 0;

  subComponentPaths.forEach((componentPath) => {
    // Check if path contains alternatives (separated by |)
    let componentData;
    if (componentPath.includes("|")) {
      const basePath = componentPath.split(".").slice(0, -1).join(".");
      const alternatives = componentPath.split(".").pop()!;
      const baseData = basePath ? getNestedValueDotNotation(topicData, basePath) : topicData;
      componentData = baseData ? getValueWithAlternatives(baseData, alternatives) : undefined;
    } else {
      componentData = getNestedValueDotNotation(topicData, componentPath);
    }

    if (componentData && hasActualData(componentData)) {
      componentsWithData += 1;
      const componentCompletion = checkDataCompletion(componentData);

      if (componentCompletion.status === "completed") {
        completedComponents += 1;
      } else if (componentCompletion.status === "in-progress") {
        partialComponents += 1;
      }
    }
  });

  if (componentsWithData === 0) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const totalComponents = subComponentPaths.length;
  const completionPercentage = Math.round((completedComponents / totalComponents) * 100);

  let status: CompletionStatusType;

  if (isSubmitted && submittedGroups.length > 0) {
    if (completedComponents === totalComponents) {
      status = "completed";
    } else if (componentsWithData > 0) {
      status = "in-progress";
    } else {
      status = "not-started";
    }
  } else {
    if (completedComponents === totalComponents) {
      status = "completed";
    } else if (completedComponents > 0 || partialComponents > 0) {
      status = "in-progress";
    } else {
      status = "not-started";
    }
  }
  return { status, completionPercentage };
}

/**
 * Get data from multiple possible paths
 */
function getDataFromPaths(assessmentData: any, paths: string[][]): any {
  for (const path of paths) {
    const data = getNestedValue(assessmentData, path);
    if (data) return data;
  }
  return null;
}

/**
 * Check if assessment is submitted
 */
function isAssessmentSubmitted(assessmentData: any): boolean {
  const status = assessmentData?.status;
  return status === "awaiting_review" || status === "submitted_approved" || status === "approved";
}

/**
 * Check scope-specific completion for GHG emissions
 */
export function checkScopeCompletion(scopeTitle: string, assessmentData?: any): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const ghgConfig = TOPIC_CONFIGURATIONS["Greenhouse Gas Emissions"];
  const ghgData = getDataFromPaths(assessmentData, ghgConfig.path);

  if (!ghgData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const dataPath = SCOPE_MAPPING[scopeTitle];
  if (!dataPath) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const scopeData = getNestedValue(ghgData, dataPath);

  if (!scopeData || Object.keys(scopeData).length === 0) {
    return { status: "not-started", completionPercentage: 0 };
  }

  if (!hasActualData(scopeData)) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const isSubmitted = isAssessmentSubmitted(assessmentData);

  // Check if this specific scope was actually submitted
  const submittedGroups = assessmentData?.submittedGroups || [];
  const scopePath = dataPath.join(".");
  const isScopeSubmitted = submittedGroups.some((group: string) => group.includes(scopePath));

  if (isSubmitted && isScopeSubmitted) {
    return { status: "completed", completionPercentage: 100 };
  }

  return checkDataCompletion(scopeData);
}

/**
 * Check sub-component completion for topics with multiple sub-forms
 */
export function checkSubComponentCompletion(
  componentTitle: string,
  assessmentData?: any
): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const isSubmitted = isAssessmentSubmitted(assessmentData);
  const submittedGroups = assessmentData?.submittedGroups || [];
  const dataPath = SUB_COMPONENT_MAPPING[componentTitle];

  if (!dataPath) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const componentData = getNestedValue(assessmentData, dataPath);

  if (!componentData || !hasActualData(componentData)) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const completion = checkDataCompletion(componentData);

  // Check if this specific component was submitted
  const componentPath = dataPath.join(".");
  const isComponentSubmitted = submittedGroups.some((group: string) =>
    group.includes(componentPath)
  );

  if (isSubmitted && isComponentSubmitted && completion.status !== "not-started") {
    return { status: "completed", completionPercentage: 100 };
  }

  return completion;
}

/**
 * Check topic completion (for Disclosure Topics page)
 */
export function checkTopicCompletion(topicTitle: string, assessmentData?: any): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const config = TOPIC_CONFIGURATIONS[topicTitle];
  if (!config) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const isSubmitted = isAssessmentSubmitted(assessmentData);
  const submittedGroups = assessmentData?.submittedGroups || [];
  const topicData = getDataFromPaths(assessmentData, config.path);

  if (!topicData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  // Handle simple topics (single form)
  if (config.type === "simple") {
    if (!hasActualData(topicData)) {
      return { status: "not-started", completionPercentage: 0 };
    }

    const completion = checkDataCompletion(topicData);

    // If the assessment is submitted and this topic has data, mark it as completed
    if (isSubmitted && completion.status !== "not-started") {
      // Check if this specific topic was submitted
      const isTopicSubmitted = config.path.some((pathOption) => {
        const topicPath = pathOption.join(".");
        return submittedGroups.some((group: string) => group.includes(topicPath));
      });

      if (isTopicSubmitted || submittedGroups.length > 0) {
        return { status: "completed", completionPercentage: 100 };
      }
    }

    return completion;
  }

  // Handle multi-component topics
  if (config.type === "multi-component" && config.subComponents) {
    // Special handling for GHG Emissions - check scope-level completion
    if (topicTitle === "Greenhouse Gas Emissions") {
      const scopeTitles = Object.keys(SCOPE_MAPPING);
      let completedScopes = 0;
      let scopesWithData = 0;

      scopeTitles.forEach((scopeTitle) => {
        const scopeStatus = checkScopeCompletion(scopeTitle, assessmentData);
        if (scopeStatus.status !== "not-started") {
          scopesWithData++;
          if (scopeStatus.status === "completed") {
            completedScopes++;
          }
        }
      });

      if (scopesWithData === 0) {
        return { status: "not-started", completionPercentage: 0 };
      }

      const completionPercentage = Math.round((completedScopes / scopeTitles.length) * 100);

      if (completedScopes === scopeTitles.length) {
        return { status: "completed", completionPercentage: 100 };
      } else if (completedScopes > 0 || scopesWithData > 0) {
        return { status: "in-progress", completionPercentage };
      } else {
        return { status: "not-started", completionPercentage: 0 };
      }
    }

    // For other multi-component topics, check sub-component level completion
    const subComponentTitles = Object.keys(SUB_COMPONENT_MAPPING).filter((title) => {
      const path = SUB_COMPONENT_MAPPING[title];
      // Check if this sub-component belongs to the current topic
      return config.path.some((topicPath) => {
        return topicPath.every((segment, index) => path[index] === segment);
      });
    });

    if (subComponentTitles.length > 0) {
      let completedComponents = 0;
      let componentsWithData = 0;

      subComponentTitles.forEach((componentTitle) => {
        const componentStatus = checkSubComponentCompletion(componentTitle, assessmentData);
        if (componentStatus.status !== "not-started") {
          componentsWithData++;
          if (componentStatus.status === "completed") {
            completedComponents++;
          }
        }
      });

      if (componentsWithData === 0) {
        return { status: "not-started", completionPercentage: 0 };
      }

      const completionPercentage = Math.round(
        (completedComponents / subComponentTitles.length) * 100
      );

      if (completedComponents === subComponentTitles.length) {
        return { status: "completed", completionPercentage: 100 };
      } else if (completedComponents > 0 || componentsWithData > 0) {
        return { status: "in-progress", completionPercentage };
      } else {
        return { status: "not-started", completionPercentage: 0 };
      }
    }

    // Fallback to the existing logic if no sub-components found
    const result = checkMultiComponentCompletion(
      topicData,
      config.subComponents,
      isSubmitted,
      submittedGroups
    );

    if (isSubmitted && result.status === "completed") {
      return { status: "completed", completionPercentage: 100 };
    }

    if (isSubmitted && result.status !== "not-started") {
      return { status: "in-progress", completionPercentage: result.completionPercentage };
    }

    return result;
  }

  return { status: "not-started", completionPercentage: 0 };
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
