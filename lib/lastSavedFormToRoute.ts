// lib/lastSavedFormToRoute.ts
//
// Maps the `lastSavedForm` value stored in the database to the correct
// AssessmentHub view + sub-form step so "Continue" resumes at the right place.
//
// `view`  → dispatched as SET_VIEW in ContinueAssessment → used as initialView in DisclosureTopics
// `step`  → dispatched as SET_TARGET_STEP → used as initialForm (sub-form) inside the topic component

export const LAST_SAVED_FORM_MAP: Record<string, { view: string; form?: string; step?: string }> = {
  // ──────────────────────────────────────────────
  // ENVIRONMENTAL — GHG Emissions
  // ──────────────────────────────────────────────
  // Scope 1 — Stationary Sources
  "ghg-scope1-stationary-electricityheat": {
    view: "ghg-stationary-sources",
    step: "electricity-heat",
  },
  "ghg-scope1-stationary-industrialprocess": {
    view: "ghg-stationary-sources",
    step: "industrial-processes",
  },
  "ghg-scope1-stationary-oilgasoperations": {
    view: "ghg-stationary-sources",
    step: "oil-gas",
  },
  // Scope 1 — Mobile Sources
  "ghg-scope1-mobile-roadtransport": {
    view: "ghg-mobile-sources",
    step: "road-transport",
  },
  "ghg-scope1-mobile-vehicleequipment": {
    view: "ghg-mobile-sources",
    step: "vehicle-equipment",
  },
  "ghg-scope1-mobile-marineaviation": {
    view: "ghg-mobile-sources",
    step: "marine-aviation",
  },
  // Alternate key used by MarineAviation component
  "ghg-mobile-sources-marine-aviation": {
    view: "ghg-mobile-sources",
    step: "marine-aviation",
  },
  // Scope 1 — Process Emissions
  "ghg-scope1-process-cementmanufacturing": {
    view: "ghg-process-emissions",
    step: "cement-manufacturing",
  },
  "ghg-scope1-process-gasflaring": {
    view: "ghg-process-emissions",
    step: "gas-flaring",
  },
  // Alternate key used by GasFlaring component
  "ghg-process-emissions-gas-flaring": {
    view: "ghg-process-emissions",
    step: "gas-flaring",
  },
  // Scope 1 — Fugitive Emissions
  "ghg-scope1-fugitive-ventingnaturalgas": {
    view: "ghg-fugitive-emissions",
    step: "venting-natural-gas",
  },
  "ghg-scope1-fugitive-hfcleaks": {
    view: "ghg-fugitive-emissions",
    step: "hfc-leaks",
  },
  // Alternate key used by HFCLeaks component
  "ghg-fugitive-emissions-hfc-leaks": {
    view: "ghg-fugitive-emissions",
    step: "hfc-leaks",
  },
  // Scope 2 — Location-Based
  "ghg-scope2-location-purchasedelectricity": {
    view: "ghg-location-based",
    step: "electricity",
  },
  "ghg-scope2-location-purchasedcooling": {
    view: "ghg-location-based",
    step: "cooling",
  },
  "ghg-scope2-location-purchasedsteam": {
    view: "ghg-location-based",
    step: "steam",
  },
  "ghg-scope2-location-purchasedheating": {
    view: "ghg-location-based",
    step: "heating",
  },
  // Scope 2 — Market-Based
  "ghg-scope2-market-electricityipps": {
    view: "ghg-market-based",
    step: "electricityIPP",
  },
  "ghg-scope2-market-electricityipp": {
    view: "ghg-market-based",
    step: "electricityIPP",
  },
  "ghg-scope2-market-electricityeac": {
    view: "ghg-market-based",
    step: "electricityEAC",
  },
  "ghg-scope2-market-residual": {
    view: "ghg-market-based",
    step: "residual",
  },
  "ghg-scope2-market-coolingsteam": {
    view: "ghg-market-based",
    step: "coolingSteam",
  },
  // Scope 3 — Upstream
  "ghg-scope3-upstream-purchasedgoodsandservices": {
    view: "ghg-upstream-emissions",
    step: "0",
  },
  "ghg-scope3-upstream-capitalgoods": {
    view: "ghg-upstream-emissions",
    step: "1",
  },
  "ghg-scope3-upstream-energyrelatedactivities": {
    view: "ghg-upstream-emissions",
    step: "2",
  },
  "ghg-scope3-upstream-transportation": {
    view: "ghg-upstream-emissions",
    step: "3",
  },
  "ghg-scope3-upstream-waste": {
    view: "ghg-upstream-emissions",
    step: "4",
  },
  "ghg-scope3-upstream-businesstravel": {
    view: "ghg-upstream-emissions",
    step: "5",
  },
  "ghg-scope3-upstream-employeecommuting": {
    view: "ghg-upstream-emissions",
    step: "6",
  },
  // Alternate key used by EmployeeCommuting component
  "ghg-scope3-upstream-employee-commuting": {
    view: "ghg-upstream-emissions",
    step: "6",
  },
  "ghg-scope3-upstream-leasedassets": {
    view: "ghg-upstream-emissions",
    step: "7",
  },
  // Alternate key used by LeasedAssets component
  "ghg-scope3-upstream-leased-assets": {
    view: "ghg-upstream-emissions",
    step: "7",
  },
  // Scope 3 — Downstream
  "ghg-scope3-downstream-transportation": {
    view: "ghg-downstream-emissions",
    step: "0",
  },
  "ghg-scope3-downstream-processing": {
    view: "ghg-downstream-emissions",
    step: "1",
  },
  "ghg-scope3-downstream-use": {
    view: "ghg-downstream-emissions",
    step: "2",
  },
  "ghg-scope3-downstream-endoflife": {
    view: "ghg-downstream-emissions",
    step: "3",
  },
  // Alternate key used by EndOfLife component
  "ghg-scope3-end-of-life-treatment": {
    view: "ghg-downstream-emissions",
    step: "3",
  },
  "ghg-scope3-downstream-leasedassets": {
    view: "ghg-downstream-emissions",
    step: "4",
  },
  // Alternate key used by DownstreamLeasedAssets component
  "ghg-scope3-downstream-leased-assets": {
    view: "ghg-downstream-emissions",
    step: "4",
  },
  "ghg-scope3-downstream-franchises": {
    view: "ghg-downstream-emissions",
    step: "5",
  },
  // Alternate key used by Franchises component
  "ghg-scope3-franchises": {
    view: "ghg-downstream-emissions",
    step: "5",
  },
  "ghg-scope3-downstream-investments": {
    view: "ghg-downstream-emissions",
    step: "6",
  },
  // Alternate key used by Investments component
  "ghg-scope3-investments": {
    view: "ghg-downstream-emissions",
    step: "6",
  },
  // Alternate key used by UseOfSoldProducts component
  "ghg-scope3-use-of-sold-products": {
    view: "ghg-downstream-emissions",
    step: "2",
  },

  // ──────────────────────────────────────────────
  // ENVIRONMENTAL — Air Quality
  // ──────────────────────────────────────────────
  "environment.airQuality.airPollutantEmissions": {
    view: "air-quality",
  },

  // ──────────────────────────────────────────────
  // ENVIRONMENTAL — Biodiversity Impacts
  // ──────────────────────────────────────────────
  "environmental-management-policies": {
    view: "biodiversity",
    step: "environmental-management-policies",
  },
  "hydrocarbon-spills": {
    view: "biodiversity",
    step: "hydrocarbon-spills",
  },
  "reserves-in-sensitive-areas": {
    view: "biodiversity",
    step: "reserves-in-sensitive-areas",
  },

  // ──────────────────────────────────────────────
  // ENVIRONMENTAL — Water & Wastewater Management
  // ──────────────────────────────────────────────
  "freshwater-withdrawal-consumption": {
    view: "water-and-wastewater-management",
  },
  "produced-water-management": {
    view: "water-and-wastewater-management",
  },
  "chemical-disclosure": {
    view: "water-and-wastewater-management",
  },
  "water-quality-impacts": {
    view: "water-and-wastewater-management",
  },

  // ──────────────────────────────────────────────
  // SOCIAL CAPITAL — Community Relations
  // ──────────────────────────────────────────────
  "socialCapital.communityRelations.communityRisk": {
    view: "crs",
    step: "risk-&-opportunity-management",
  },
  "socialCapital.communityRelations.hcdtContribution": {
    view: "crs",
    step: "host-community-development-(pia)",
  },
  "socialCapital.communityRelations.disputeResolution": {
    view: "crs",
    step: "community-dispute-resolution",
  },
  "socialCapital.communityRelations.operationalDelays": {
    view: "crs",
    step: "operational-delays",
  },

  // ──────────────────────────────────────────────
  // SOCIAL CAPITAL — Security, Human Rights & Indigenous Peoples
  // ──────────────────────────────────────────────
  "socialCapital.securityRights.reservesAreaConflict": {
    view: "security-human-rights",
    step: "reserves-in-conflict",
  },
  "socialCapital.securityRights.reservesIndigenousLand": {
    view: "security-human-rights",
    step: "reserves-indigenous-land",
  },
  "socialCapital.securityRights.humanRightEngagement": {
    view: "security-human-rights",
    step: "human-rights-engagement",
  },

  // ──────────────────────────────────────────────
  // HUMAN CAPITAL — Workforce Health & Safety
  // ──────────────────────────────────────────────
  "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance.direct": {
    view: "workforce-health-and-safety",
    step: "health-safety-performance",
  },
  "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance.contract": {
    view: "workforce-health-and-safety",
    step: "health-safety-performance",
  },
  "humanCapital.workforceHealthAndSafety.riskAndOpportunityManagement.safetyManagementSystems": {
    view: "workforce-health-and-safety",
    step: "safety-management-systems",
  },

  // ──────────────────────────────────────────────
  // BUSINESS MODEL — Reserves Valuation & Capital Expenditures
  // ──────────────────────────────────────────────
  "businessInnovation.reservesValuationAndCapitalExpenditures.reservesSensitivityToCarbonPricing": {
    view: "reserves-valuation-capital-expenditures",
    step: "reserves-sensitivity-carbon-pricing",
  },
  "businessInnovation.reservesValuationAndCapitalExpenditures.embeddedCarbonInReserves": {
    view: "reserves-valuation-capital-expenditures",
    step: "embedded-carbon",
  },
  "businessInnovation.reservesValuationAndCapitalExpenditures.renewableEnergyInvestment": {
    view: "reserves-valuation-capital-expenditures",
    step: "renewable-energy-investment",
  },
  "businessInnovation.reservesValuationAndCapitalExpenditures.capitalExpenditureStrategy": {
    view: "reserves-valuation-capital-expenditures",
    step: "capital-expenditure-strategy",
  },

  // ──────────────────────────────────────────────
  // BUSINESS MODEL — Business Ethics & Transparency
  // ──────────────────────────────────────────────
  "businessInnovation.businessEthicsAndTransparency.reservesInCountriesWithHighCorruptionRisk": {
    view: "business-ethics-transparency",
    step: "reserves-countries-corruption-risk",
  },
  "businessInnovation.businessEthicsAndTransparency.antiCorruptionManagementSystem": {
    view: "business-ethics-transparency",
    step: "anti-corruption-management",
  },

  // ──────────────────────────────────────────────
  // LEADERSHIP & GOVERNANCE — Critical Incident Risk Management
  // ──────────────────────────────────────────────
  "leadershipGovernance.criticalIncidentRiskManagement.processSafetyEvents": {
    view: "critical-incident-risk-management",
    step: "process-safety-events",
  },
  "leadershipGovernance.criticalIncidentRiskManagement.catastrophicRiskManagementSystems": {
    view: "critical-incident-risk-management",
    step: "catastrophic-risk-management",
  },

  // ──────────────────────────────────────────────
  // LEADERSHIP & GOVERNANCE — Management of Legal & Regulatory Environment
  // ──────────────────────────────────────────────
  "leadershipGovernance.managementOfTheLegalAndRegulatoryEnvironment.publicPolicyEngagement": {
    view: "management-of-legal-and-regulatory-environment",
    step: "public-policy-engagement",
  },
  "leadershipGovernance.managementOfTheLegalAndRegulatoryEnvironment.boardAndManagementOversight": {
    view: "management-of-legal-and-regulatory-environment",
    step: "board-management-oversight",
  },

  // ──────────────────────────────────────────────
  // ACTIVITY METRICS
  // ──────────────────────────────────────────────
  "activityMetrics.productionVolume": {
    view: "activity-metrics",
    step: "production-volume",
  },
  "activityMetrics.offshoreSites": {
    view: "activity-metrics",
    step: "offshore-sites",
  },
  "activityMetrics.terrestrialSites": {
    view: "activity-metrics",
    step: "terrestrial-sites",
  },
};
