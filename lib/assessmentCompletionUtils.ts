import { COMPUTED_KEYS } from "./assessmentStatusUtils";

export type CompletionStatusType = "completed" | "in-progress" | "not-started";

export interface CompletionStatus {
  status: CompletionStatusType;
  completionPercentage: number;
}

interface FieldConfig {
  optional?: boolean;
  weight?: number;
  validator?: (value: any) => boolean;
}

interface ComponentConfig {
  path: string[];
  fields?: Record<string, FieldConfig>;
  requiredFields?: string[];
  optionalFields?: string[];
  minCompletionThreshold?: number;
}

interface TopicDefinition {
  id: string;
  name: string;
  type: "simple" | "multi-component";
  path: string[][];
  components?: ComponentConfig[];
  completionStrategy?: "all" | "any" | "threshold" | "weighted";
  threshold?: number;
}

// ========================================
// CENTRALIZED TOPIC CONFIGURATIONS
// ========================================

const TOPIC_DEFINITIONS: TopicDefinition[] = [
  // Activity Metrics
  {
    id: "activity-metrics",
    name: "Activity Metrics",
    type: "multi-component",
    path: [["activityMetrics"], ["foundationalData", "activityMetrics"]],
    completionStrategy: "all",
    components: [
      {
        path: ["productionVolume"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["assetPortfolio", "offshoreSites"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["assetPortfolio", "terrestrialSites"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
    ],
  },
  // Greenhouse Gas Emissions
  {
    id: "ghg-emissions",
    name: "Greenhouse Gas Emissions",
    type: "multi-component",
    path: [["environment", "ghg"], ["ghg"]],
    completionStrategy: "all",
    components: [
      {
        path: ["scope1", "stationarySources"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["scope1", "mobileSources"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["scope1", "processEmissions"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["scope1", "fugitiveEmissions"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["scope2", "locationBased"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["scope2", "marketBased"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["scope3", "upstream"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
      {
        path: ["scope3", "downstream"],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
      },
    ],
  },

  // Air Quality
  {
    id: "air-quality",
    name: "Air Quality",
    type: "simple",
    path: [["environment", "airQuality"]],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        requiredFields: [],
        optionalFields: ["filesAndLinks", "notes"],
        minCompletionThreshold: 80,
      },
    ],
  },

  // Water and Wastewater Management
  {
    id: "water-management",
    name: "Water and Wastewater Management",
    type: "multi-component",
    path: [["environment", "waterManagement"]],
    completionStrategy: "threshold",
    threshold: 75,
    components: [
      {
        path: ["waterAndProducedWaterManagement", "freshwaterWithdrawals"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["waterAndProducedWaterManagement", "producedWaterManagement"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["hydraulicFracturingImpacts", "chemicalDisclosure"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["hydraulicFracturingImpacts", "waterQualityImpacts"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
    ],
  },

  // Biodiversity Impact
  {
    id: "biodiversity-impact",
    name: "Biodiversity Impact",
    type: "multi-component",
    path: [["environment", "biodiversityImpact"]],
    completionStrategy: "threshold",
    threshold: 75,
    components: [
      {
        path: ["environmentalManagement", "environmentalManagementPolicies"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["environmentalManagement", "hydrocarbonSpills"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["environmentalManagement", "reservesInSensitiveAreas"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
    ],
  },

  // Community Relations
  {
    id: "community-relations",
    name: "Community Relations",
    type: "simple",
    path: [["socialCapital", "communityRelations"]],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
        minCompletionThreshold: 80,
      },
    ],
  },

  // Security, Human Rights & Rights of Indigenous Peoples
  {
    id: "security-rights",
    name: "Security, Human Rights & Rights of Indigenous Peoples",
    type: "simple",
    path: [["socialCapital", "securityRights"]],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
        minCompletionThreshold: 80,
      },
    ],
  },

  // Workforce Health & Safety
  {
    id: "workforce-health",
    name: "Workforce Health & Safety",
    type: "simple",
    path: [
      ["humanCapital", "workforceHealth"],
      ["humanCapital", "riskAndOpportunityManagement"],
    ],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
        minCompletionThreshold: 80,
      },
    ],
  },

  // Reserves Valuation & Capital Expenditures
  {
    id: "reserves-valuation",
    name: "Reserves Valuation & Capital Expenditures",
    type: "multi-component",
    path: [
      ["businessModelAndInnovation", "reserveValuation"],
      ["businessModel", "reservesValuation"],
    ],
    completionStrategy: "threshold",
    threshold: 75,
    components: [
      {
        path: ["climateImpact", "reserveSensitivity"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["climateImpact", "embeddedCarbonInReserve"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["strategicCapitalAllocation", "renewableEnergyInvestment"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["strategicCapitalAllocation", "capitalExpenditureStrategy"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
    ],
  },

  // Business Ethics & Transparency
  {
    id: "business-ethics",
    name: "Business Ethics & Transparency",
    type: "multi-component",
    path: [
      ["businessModelAndInnovation", "businessEthics"],
      ["businessModel", "businessEthics"],
    ],
    completionStrategy: "threshold",
    threshold: 75,
    components: [
      {
        path: ["geopoliticalCorruptionRisk", "reservesInCountries"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
      {
        path: ["antiCorruptionManagement", "managementSystem"],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
      },
    ],
  },

  // Critical Incident Risk Management
  {
    id: "critical-incident",
    name: "Critical Incident Risk Management",
    type: "simple",
    path: [["leadershipGovernance", "criticalIncident"]],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
        minCompletionThreshold: 80,
      },
    ],
  },

  // Management of the Legal & Regulatory Environment
  {
    id: "legal-regulatory",
    name: "Management of the Legal & Regulatory Environment",
    type: "simple",
    path: [["leadershipGovernance", "legalRegulatory"]],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        requiredFields: [],
        optionalFields: ["filesAndLinks"],
        minCompletionThreshold: 80,
      },
    ],
  },
];

// ========================================
// COMPLETION CALCULATION ENGINE
// ========================================

class CompletionCalculator {
  private config: TopicDefinition;

  constructor(config: TopicDefinition) {
    this.config = config;
  }

  calculate(assessmentData: any, isSubmitted: boolean = false): CompletionStatus {
    const topicData = this.getTopicData(assessmentData);

    if (!topicData) {
      return { status: "not-started", completionPercentage: 0 };
    }

    if (!this.hasActualData(topicData)) {
      return { status: "not-started", completionPercentage: 0 };
    }

    const result =
      this.config.type === "simple"
        ? this.calculateSimpleCompletion(topicData, isSubmitted)
        : this.calculateMultiComponentCompletion(topicData, isSubmitted);

    return result;
  }

  private getTopicData(assessmentData: any): any {
    for (const path of this.config.path) {
      const data = this.getNestedValue(assessmentData, path);
      if (data) {
        return data;
      }
    }
    return null;
  }

  private calculateSimpleCompletion(topicData: any, isSubmitted: boolean): CompletionStatus {
    const component = this.config.components?.[0];
    if (!component) {
      return { status: "not-started", completionPercentage: 0 };
    }

    const completion = this.calculateComponentCompletion(topicData, component, "");

    if (
      isSubmitted &&
      completion.completionPercentage >= (component.minCompletionThreshold || 100)
    ) {
      return { status: "completed", completionPercentage: 100 };
    }

    return completion;
  }

  private calculateMultiComponentCompletion(
    topicData: any,
    _isSubmitted: boolean
  ): CompletionStatus {
    if (!this.config.components || this.config.components.length === 0) {
      return { status: "not-started", completionPercentage: 0 };
    }

    const componentResults = this.config.components.map((component) => {
      const componentData =
        component.path.length > 0 ? this.getNestedValue(topicData, component.path) : topicData;

      return this.calculateComponentCompletion(componentData, component, component.path.join("."));
    });

    const completedCount = componentResults.filter((r) => r.status === "completed").length;
    const inProgressCount = componentResults.filter((r) => r.status === "in-progress").length;
    const totalComponents = this.config.components.length;

    const overallPercentage = Math.round(
      componentResults.reduce((sum, r) => sum + r.completionPercentage, 0) / totalComponents
    );

    switch (this.config.completionStrategy) {
      case "all":
        if (completedCount === totalComponents) {
          return { status: "completed", completionPercentage: 100 };
        } else if (completedCount > 0 || inProgressCount > 0) {
          return { status: "in-progress", completionPercentage: overallPercentage };
        }
        return { status: "not-started", completionPercentage: 0 };

      case "threshold":
        const threshold = this.config.threshold || 80;

        if (overallPercentage >= threshold) {
          return { status: "completed", completionPercentage: 100 };
        } else if (overallPercentage > 0) {
          return { status: "in-progress", completionPercentage: overallPercentage };
        }
        return { status: "not-started", completionPercentage: 0 };

      case "any":
        if (completedCount > 0) {
          return { status: "completed", completionPercentage: 100 };
        } else if (inProgressCount > 0) {
          return { status: "in-progress", completionPercentage: overallPercentage };
        }
        return { status: "not-started", completionPercentage: 0 };

      default:
        return { status: "in-progress", completionPercentage: overallPercentage };
    }
  }

  private calculateComponentCompletion(
    data: any,
    component: ComponentConfig,
    _componentPath: string
  ): CompletionStatus {
    if (!data || !this.hasActualData(data)) {
      return { status: "not-started", completionPercentage: 0 };
    }

    const requiredFields = component.requiredFields || [];
    const optionalFields = component.optionalFields || [];
    const allFields = [...requiredFields, ...optionalFields];

    if (allFields.length === 0) {
      return this.calculateFieldBasedCompletion(data);
    }

    let filledRequired = 0;
    let filledOptional = 0;

    requiredFields.forEach((field) => {
      const value = this.getNestedValue(data, field.split("."));
      if (this.isFilled(value)) filledRequired++;
    });

    optionalFields.forEach((field) => {
      const value = this.getNestedValue(data, field.split("."));
      if (this.isFilled(value)) filledOptional++;
    });

    const requiredPercentage =
      requiredFields.length > 0 ? (filledRequired / requiredFields.length) * 100 : 100;

    const optionalPercentage =
      optionalFields.length > 0 ? (filledOptional / optionalFields.length) * 20 : 0;

    const totalPercentage = Math.min(100, Math.round(requiredPercentage + optionalPercentage));

    let status: CompletionStatusType;
    if (totalPercentage === 100 && filledRequired === requiredFields.length) {
      status = "completed";
    } else if (totalPercentage > 0) {
      status = "in-progress";
    } else {
      status = "not-started";
    }

    return { status, completionPercentage: totalPercentage };
  }

  private calculateFieldBasedCompletion(data: any): CompletionStatus {
    const { total, filled } = this.countFields(data);

    if (total === 0) {
      return { status: "not-started", completionPercentage: 0 };
    }

    const percentage = Math.round((filled / total) * 100);

    let status: CompletionStatusType;
    if (percentage === 100) {
      status = "completed";
    } else if (percentage > 0) {
      status = "in-progress";
    } else {
      status = "not-started";
    }

    return { status, completionPercentage: percentage };
  }

  private countFields(data: any): { total: number; filled: number; details: any } {
    if (!data || typeof data !== "object") {
      return { total: 0, filled: 0, details: {} };
    }

    let total = 0;
    let filled = 0;
    const details: any = {};

    Object.entries(data).forEach(([key, value]) => {
      if (COMPUTED_KEYS.has(key)) return;

      if (Array.isArray(value)) {
        total += 1;
        const isFilled = value.length > 0;
        if (isFilled) filled += 1;
        details[key] = { type: "array", filled: isFilled, length: value.length };
      } else if (typeof value === "object" && value !== null) {
        const nested = this.countFields(value);
        total += nested.total;
        filled += nested.filled;
        details[key] = { type: "object", ...nested };
      } else {
        total += 1;
        const isFilled = this.isFilled(value);
        if (isFilled) filled += 1;
        details[key] = { type: typeof value, filled: isFilled };
      }
    });

    return { total, filled, details };
  }

  private isFilled(value: any): boolean {
    if (value === null || value === undefined) return false;

    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === "") return false;
      if (trimmed === "yes" || trimmed === "no") return true; // ✅ Both valid!
      return trimmed.length > 0;
    }

    if (typeof value === "number") return true; // ✅ 0 is valid!
    if (typeof value === "boolean") return true; // ✅ false is valid!

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      return Object.keys(value).some((key) => this.isFilled(value[key]));
    }

    return true;
  }

  private hasActualData(data: any): boolean {
    if (!data || typeof data !== "object") return false;

    const meaningfulKeys = Object.keys(data).filter((key) => !COMPUTED_KEYS.has(key));

    return meaningfulKeys.some((key) => this.isFilled(data[key]));
  }

  private getNestedValue(obj: any, path: string[]): any {
    return path.reduce((current, key) => {
      return current && typeof current === "object" ? current[key] : undefined;
    }, obj);
  }
}

// ========================================
// SERVICE LAYER
// ========================================

export class ProgressTrackingService {
  private calculators: Map<string, CompletionCalculator>;
  private definitions: TopicDefinition[];

  constructor(definitions: TopicDefinition[] = TOPIC_DEFINITIONS) {
    this.definitions = definitions;
    this.calculators = new Map();
    definitions.forEach((def) => {
      this.calculators.set(def.id, new CompletionCalculator(def));
    });
  }

  getTopicCompletion(topicId: string, assessmentData: any): CompletionStatus {
    const calculator = this.calculators.get(topicId);
    if (!calculator) {
      return { status: "not-started", completionPercentage: 0 };
    }

    const isSubmitted = this.isAssessmentSubmitted(assessmentData);
    return calculator.calculate(assessmentData, isSubmitted);
  }

  getAllTopicsCompletion(assessmentData: any): Record<string, CompletionStatus> {
    const results: Record<string, CompletionStatus> = {};

    this.calculators.forEach((calculator, topicId) => {
      results[topicId] = this.getTopicCompletion(topicId, assessmentData);
    });

    return results;
  }

  getOverallCompletion(assessmentData: any): CompletionStatus {
    const allStatuses = this.getAllTopicsCompletion(assessmentData);
    const statuses = Object.values(allStatuses);

    const completedCount = statuses.filter((s) => s.status === "completed").length;
    const inProgressCount = statuses.filter((s) => s.status === "in-progress").length;
    const totalCount = statuses.length;

    const avgPercentage = Math.round(
      statuses.reduce((sum, s) => sum + s.completionPercentage, 0) / totalCount
    );

    let status: CompletionStatusType;
    if (completedCount === totalCount) {
      status = "completed";
    } else if (completedCount > 0 || inProgressCount > 0) {
      status = "in-progress";
    } else {
      status = "not-started";
    }

    return { status, completionPercentage: avgPercentage };
  }

  private isAssessmentSubmitted(assessmentData: any): boolean {
    const status = assessmentData?.status;
    return status === "awaiting_review" || status === "submitted_approved" || status === "approved";
  }
}

// ========================================
// REACT HOOK
// ========================================

import { useMemo } from "react";

export function useProgressTracking(assessmentData: any) {
  const service = useMemo(() => new ProgressTrackingService(), []);

  const topicsCompletion = useMemo(
    () => service.getAllTopicsCompletion(assessmentData),
    [assessmentData, service]
  );

  const overallCompletion = useMemo(
    () => service.getOverallCompletion(assessmentData),
    [assessmentData, service]
  );

  const getTopicCompletion = (topicId: string) =>
    service.getTopicCompletion(topicId, assessmentData);

  return {
    topicsCompletion,
    overallCompletion,
    getTopicCompletion,
  };
}

// ========================================
// BACKWARD COMPATIBILITY FUNCTIONS
// ========================================

const TOPIC_NAME_TO_ID: Record<string, string> = {
  "Activity Metrics": "activity-metrics",
  "Greenhouse Gas Emissions": "ghg-emissions",
  "Air Quality": "air-quality",
  "Water and Wastewater Management": "water-management",
  "Biodiversity Impact": "biodiversity-impact",
  "Community Relations": "community-relations",
  "Security, Human Rights & Rights of Indigenous Peoples": "security-rights",
  "Workforce Health & Safety": "workforce-health",
  "Reserves Valuation & Capital Expenditures": "reserves-valuation",
  "Business Ethics & Transparency": "business-ethics",
  "Critical Incident Risk Management": "critical-incident",
  "Management of the Legal & Regulatory Environment": "legal-regulatory",
};

const globalService = new ProgressTrackingService();

export function checkTopicCompletion(topicTitle: string, assessmentData?: any): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const topicId = TOPIC_NAME_TO_ID[topicTitle];
  if (!topicId) {
    return { status: "not-started", completionPercentage: 0 };
  }

  return globalService.getTopicCompletion(topicId, assessmentData);
}

export function checkScopeCompletion(scopeTitle: string, assessmentData?: any): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const scopeMap: Record<string, { path: string[] }> = {
    "Stationary Sources": { path: ["environment", "ghg", "scope1", "stationarySources"] },
    "Mobile Sources": { path: ["environment", "ghg", "scope1", "mobileSources"] },
    "Process Emissions": { path: ["environment", "ghg", "scope1", "processEmissions"] },
    "Fugitive Emissions": { path: ["environment", "ghg", "scope1", "fugitiveEmissions"] },
    "Location-Based Scope 2 Emissions": { path: ["environment", "ghg", "scope2", "locationBased"] },
    "Market-Based Scope 2 Emissions": { path: ["environment", "ghg", "scope2", "marketBased"] },
    "Upstream Emissions (Categories 1-8)": { path: ["environment", "ghg", "scope3", "upstream"] },
    "Downstream Emissions (Categories 9-15)": {
      path: ["environment", "ghg", "scope3", "downstream"],
    },
  };

  const scopeInfo = scopeMap[scopeTitle];
  if (!scopeInfo) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const scopeData = scopeInfo.path.reduce((current: any, key: string) => {
    return current && typeof current === "object" ? current[key] : undefined;
  }, assessmentData);

  if (!scopeData) {
    const altPath = ["ghg", ...scopeInfo.path.slice(2)];
    const altData = altPath.reduce((current: any, key: string) => {
      return current && typeof current === "object" ? current[key] : undefined;
    }, assessmentData);

    if (!altData) {
      return { status: "not-started", completionPercentage: 0 };
    }
  }

  const calculator = new CompletionCalculator({
    id: `temp-scope-${scopeTitle.replace(/\s+/g, "-").toLowerCase()}`,
    name: scopeTitle,
    type: "simple",
    path: [scopeInfo.path, scopeInfo.path.slice(1)],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        optionalFields: ["filesAndLinks", "notes"],
        minCompletionThreshold: 80,
      },
    ],
  });

  const isSubmitted =
    assessmentData?.status === "awaiting_review" ||
    assessmentData?.status === "submitted_approved" ||
    assessmentData?.status === "approved";

  return calculator.calculate(assessmentData, isSubmitted);
}

export function checkSubComponentCompletion(
  componentTitle: string,
  assessmentData?: any
): CompletionStatus {
  if (!assessmentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const componentMap: Record<string, { topicId: string; path: string[] }> = {
    // Activity Metrics sub-components
    "Production Volumes": {
      topicId: "activity-metrics",
      path: ["activityMetrics", "productionVolume"],
    },
    "Offshore Sites": {
      topicId: "activity-metrics",
      path: ["activityMetrics", "assetPortfolio", "offshoreSites"],
    },
    "Terrestrial Sites": {
      topicId: "activity-metrics",
      path: ["activityMetrics", "assetPortfolio", "terrestrialSites"],
    },
    // Water Management sub-components
    "Freshwater Withdrawal & Consumption": {
      topicId: "water-management",
      path: [
        "environment",
        "waterManagement",
        "waterAndProducedWaterManagement",
        "freshwaterWithdrawals",
      ],
    },
    "Produced Water Management": {
      topicId: "water-management",
      path: [
        "environment",
        "waterManagement",
        "waterAndProducedWaterManagement",
        "producedWaterManagement",
      ],
    },
    "Chemical Disclosure": {
      topicId: "water-management",
      path: ["environment", "waterManagement", "hydraulicFracturingImpacts", "chemicalDisclosure"],
    },
    "Water Quality Impacts": {
      topicId: "water-management",
      path: ["environment", "waterManagement", "hydraulicFracturingImpacts", "waterQualityImpacts"],
    },
    // Biodiversity Impact sub-components
    "Environmental Management Policies": {
      topicId: "biodiversity-impact",
      path: [
        "environment",
        "biodiversityImpact",
        "environmentalManagement",
        "environmentalManagementPolicies",
      ],
    },
    "Hydrocarbon Spills": {
      topicId: "biodiversity-impact",
      path: ["environment", "biodiversityImpact", "environmentalManagement", "hydrocarbonSpills"],
    },
    "Reserves in Sensitive Areas": {
      topicId: "biodiversity-impact",
      path: [
        "environment",
        "biodiversityImpact",
        "environmentalManagement",
        "reservesInSensitiveAreas",
      ],
    },
    // Reserves Valuation sub-components
    "Reserves Sensitivity to Carbon Pricing": {
      topicId: "reserves-valuation",
      path: [
        "businessModelAndInnovation",
        "reserveValuation",
        "climateImpact",
        "reserveSensitivity",
      ],
    },
    "Embedded Carbon in Reserves": {
      topicId: "reserves-valuation",
      path: [
        "businessModelAndInnovation",
        "reserveValuation",
        "climateImpact",
        "embeddedCarbonInReserve",
      ],
    },
    "Renewable Energy Investment": {
      topicId: "reserves-valuation",
      path: [
        "businessModelAndInnovation",
        "reserveValuation",
        "strategicCapitalAllocation",
        "renewableEnergyInvestment",
      ],
    },
    "Capital Expenditure Strategy": {
      topicId: "reserves-valuation",
      path: [
        "businessModelAndInnovation",
        "reserveValuation",
        "strategicCapitalAllocation",
        "capitalExpenditureStrategy",
      ],
    },
    // Business Ethics sub-components
    "Reserves in Countries with High Corruption Risk": {
      topicId: "business-ethics",
      path: [
        "businessModelAndInnovation",
        "businessEthics",
        "geopoliticalCorruptionRisk",
        "reservesInCountries",
      ],
    },
    "Anti-Corruption Management System": {
      topicId: "business-ethics",
      path: [
        "businessModelAndInnovation",
        "businessEthics",
        "antiCorruptionManagement",
        "managementSystem",
      ],
    },
    // Workforce Health & Safety sub-components
    "Health & Safety Performance": {
      topicId: "workforce-health",
      path: ["humanCapital", "riskAndOpportunityManagement", "healthAndSafetyPerformance"],
    },
    "Safety Management Systems": {
      topicId: "workforce-health",
      path: [
        "humanCapital",
        "workforceHealthAndSafety",
        "riskAndOpportunityManagement",
        "safetyManagementSystems",
      ],
    },
  };

  const componentInfo = componentMap[componentTitle];
  if (!componentInfo) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const componentData = componentInfo.path.reduce((current: any, key: string) => {
    return current && typeof current === "object" ? current[key] : undefined;
  }, assessmentData);

  if (!componentData) {
    return { status: "not-started", completionPercentage: 0 };
  }

  const calculator = new CompletionCalculator({
    id: `temp-${componentInfo.topicId}`,
    name: componentTitle,
    type: "simple",
    path: [componentInfo.path],
    completionStrategy: "threshold",
    threshold: 80,
    components: [
      {
        path: [],
        optionalFields: ["filesAndLinks", "notes"],
        minCompletionThreshold: 80,
      },
    ],
  });

  const isSubmitted =
    assessmentData?.status === "awaiting_review" ||
    assessmentData?.status === "submitted_approved" ||
    assessmentData?.status === "approved";

  return calculator.calculate(assessmentData, isSubmitted);
}

// ========================================
// DEBUGGING HELPERS
// ========================================

export function getTopicBreakdown(topicId: string, assessmentData: any): any {
  const service = new ProgressTrackingService();
  const definition = TOPIC_DEFINITIONS.find((d) => d.id === topicId);

  if (!definition) {
    return { error: "Topic not found", topicId };
  }

  const completion = service.getTopicCompletion(topicId, assessmentData);

  return {
    topicId,
    name: definition.name,
    type: definition.type,
    strategy: definition.completionStrategy,
    threshold: definition.threshold,
    completion,
    componentCount: definition.components?.length || 0,
    components: definition.components?.map((comp, idx) => ({
      index: idx,
      path: comp.path.join("."),
      requiredFields: comp.requiredFields?.length || 0,
      optionalFields: comp.optionalFields?.length || 0,
    })),
  };
}

export function getAvailableTopics(): Array<{ id: string; name: string }> {
  return TOPIC_DEFINITIONS.map((d) => ({ id: d.id, name: d.name }));
}

export function validateAssessmentData(assessmentData: any): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!assessmentData) {
    issues.push("Assessment data is null or undefined");
    return { valid: false, issues, suggestions };
  }

  if (typeof assessmentData !== "object") {
    issues.push("Assessment data must be an object");
    return { valid: false, issues, suggestions };
  }

  const expectedRootKeys = [
    "environment",
    "socialCapital",
    "humanCapital",
    "businessModel",
    "businessModelAndInnovation",
    "status",
  ];
  const hasAnyExpectedKey = expectedRootKeys.some((key) => key in assessmentData);

  if (!hasAnyExpectedKey) {
    suggestions.push(
      "Assessment data does not contain expected root keys: " + expectedRootKeys.join(", ")
    );
  }

  TOPIC_DEFINITIONS.forEach((def) => {
    const hasData = def.path.some((pathOption) => {
      const data = pathOption.reduce((current: any, key: string) => {
        return current && typeof current === "object" ? current[key] : undefined;
      }, assessmentData);
      return !!data;
    });

    if (!hasData) {
      suggestions.push(`No data found for topic: ${def.name} (${def.id})`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

// UI Helper functions
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
        className: "bg-green-600 text-white border-green-300",
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

export function shouldShowBadge(status: CompletionStatus): boolean {
  return status.status === "completed" || status.status === "in-progress";
}

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
