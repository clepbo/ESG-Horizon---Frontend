// lib/lastSavedFormToRoute.ts
export const LAST_SAVED_FORM_MAP: Record<string, { view: string; form?: string; step?: string }> = {
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
  "ghg-scope1-process-cementmanufacturing": {
    view: "ghg-process-emissions",
    step: "cement-manufacturing",
  },
  "ghg-scope1-process-gasflaring": {
    view: "ghg-process-emissions",
    step: "gas-flaring",
  },
  "ghg-scope1-fugitive-ventingnaturalgas": {
    view: "ghg-fugitive-emissions",
    step: "venting-natural-gas",
  },
  "ghg-scope1-fugitive-hfcleaks": {
    view: "ghg-fugitive-emissions",
    step: "hfc-leaks",
  },
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
  "ghg-scope2-market-electricityipps": {
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
  "ghg-scope3-upstream-leasedassets": {
    view: "ghg-upstream-emissions",
    step: "7",
  },
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
  "ghg-scope3-downstream-leasedassets": {
    view: "ghg-downstream-emissions",
    step: "4",
  },
  "ghg-scope3-downstream-franchises": {
    view: "ghg-downstream-emissions",
    step: "5",
  },
  "ghg-scope3-downstream-investments": {
    view: "ghg-downstream-emissions",
    step: "6",
  },
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
  // Business Innovation
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
  "businessInnovation.businessEthicsAndTransparency.reservesInCountriesWithHighCorruptionRisk": {
    view: "business-ethics-transparency",
    step: "reserves-in-countries-with-high-corruption-risk",
  },
  "businessInnovation.businessEthicsAndTransparency.antiCorruptionManagementSystem": {
    view: "business-ethics-transparency",
    step: "anti-corruption-management-system",
  },
  // Human Capital
  "humanCapital.workforceHealthSafety.workforceHealthSafety": {
    view: "workforce-health-and-safety",
    step: "workforce-health-safety",
  },
  // Leadership & Governance
  "leadershipGovernance.criticalIncidentRiskManagement.catastrophicRiskManagementSystems": {
    view: "critical-incident-risk-management",
    step: "catastrophic-risk-management-systems",
  },
  "leadershipGovernance.criticalIncidentRiskManagement.processSafetyEvents": {
    view: "critical-incident-risk-management",
    step: "process-safety-events",
  },
  "leadershipGovernance.managementOfTheLegalAndRegulatoryEnvironment.boardAndManagementOversight": {
    view: "management-of-legal-and-regulatory-environment",
    step: "board-and-management-oversight",
  },
  "leadershipGovernance.managementOfTheLegalAndRegulatoryEnvironment.publicPolicyEngagement": {
    view: "management-of-legal-and-regulatory-environment",
    step: "public-policy-engagement",
  },
};
