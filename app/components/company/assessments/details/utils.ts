import type { FileWithMeta } from "./types";

/**
 * Extract files (supporting documents) from a data section.
 * Handles both `files: { [key]: FileMetadata }` and `additionalFields: FileMetadata[]` patterns.
 */
export function extractFiles(obj: any, section: string, target: FileWithMeta[]) {
  if (!obj) return;
  const push = (f: any) => {
    if (f?.url)
      target.push({
        name: f.name || "File",
        url: f.url,
        publicId: f.publicId,
        section,
        size: f.size,
        uploadedAt: f.uploadedAt || f.createdAt,
      });
  };
  if (obj.files && typeof obj.files === "object") {
    Object.values(obj.files).forEach(push);
  }
  if (Array.isArray(obj.additionalFields)) {
    obj.additionalFields.forEach(push);
  }
  if (Array.isArray(obj.filesAndLinks)) {
    obj.filesAndLinks.forEach(push);
  }
}

/**
 * Collect all files from the full Environmental pillar data tree.
 */
export function collectEnvironmentalFiles(env: any): FileWithMeta[] {
  const files: FileWithMeta[] = [];
  const ghg = env?.ghg || {};
  const scope1 = ghg.scope1 || {};
  const scope2 = ghg.scope2 || {};
  const scope3 = ghg.scope3 || {};
  const upstream = scope3.upstream || {};
  const downstream = scope3.downstream || {};

  // Scope 1
  extractFiles(scope1.stationarySources?.electricityHeat, "Stationary - Electricity & Heat", files);
  extractFiles(scope1.stationarySources?.industrialProcesses, "Stationary - Industrial", files);
  extractFiles(scope1.stationarySources?.oilGasOperations, "Stationary - Oil & Gas", files);
  extractFiles(scope1.mobileSources?.roadTransport, "Mobile - Road Transport", files);
  extractFiles(scope1.mobileSources?.vehicleEquipment, "Mobile - Vehicle Equipment", files);
  extractFiles(scope1.mobileSources?.marineAviation, "Mobile - Marine/Aviation", files);
  extractFiles(scope1.processEmissions?.cementManufacturing, "Process - Cement", files);
  extractFiles(scope1.processEmissions?.gasFlaring, "Process - Gas Flaring", files);
  extractFiles(scope1.fugitiveEmissions?.ventingNaturalGas, "Fugitive - Venting", files);
  extractFiles(scope1.fugitiveEmissions?.hfcLeaks, "Fugitive - HFC Leaks", files);

  // Scope 2
  extractFiles(scope2.locationBased?.electricity, "Scope 2 - Location Electricity", files);
  extractFiles(scope2.locationBased?.cooling, "Scope 2 - Location Cooling", files);
  extractFiles(scope2.locationBased?.steam, "Scope 2 - Location Steam", files);
  extractFiles(scope2.locationBased?.heating, "Scope 2 - Location Heating", files);
  extractFiles(scope2.marketBased?.ipps, "Scope 2 - Market IPPs", files);
  extractFiles(scope2.marketBased?.eac, "Scope 2 - Market EAC", files);
  extractFiles(scope2.marketBased?.residual, "Scope 2 - Market Residual", files);
  extractFiles(scope2.marketBased?.coolingSteam, "Scope 2 - Market Cooling/Steam", files);

  // Scope 3
  extractFiles(upstream.purchasedGoodsAndServices, "Scope 3 - Purchased Goods", files);
  extractFiles(upstream.capitalGoods, "Scope 3 - Capital Goods", files);
  extractFiles(upstream.fuelEnergyRelatedActivities, "Scope 3 - Fuel/Energy Related", files);
  extractFiles(upstream.upstreamTransportationDistribution, "Scope 3 - Upstream Transport", files);
  extractFiles(upstream.wasteGeneratedInOperations, "Scope 3 - Waste in Ops", files);
  extractFiles(upstream.businessTravel, "Scope 3 - Business Travel", files);
  extractFiles(upstream.employeeCommuting, "Scope 3 - Employee Commuting", files);
  extractFiles(upstream.upstreamLeasedAssets, "Scope 3 - Upstream Leased", files);
  extractFiles(downstream.downstreamTransportationDistribution, "Scope 3 - Downstream Transport", files);
  extractFiles(downstream.processingSoldProducts, "Scope 3 - Processing Sold", files);
  extractFiles(downstream.useOfSoldProducts, "Scope 3 - Use of Sold", files);
  extractFiles(downstream.endOfLifeTreatment, "Scope 3 - End of Life", files);
  extractFiles(downstream.downstreamLeasedAssets, "Scope 3 - Downstream Leased", files);
  extractFiles(downstream.franchises, "Scope 3 - Franchises", files);
  extractFiles(downstream.investments, "Scope 3 - Investments", files);

  return files;
}

/**
 * Collect all files across all pillars.
 */
export function collectAllFiles(assessmentData: any): FileWithMeta[] {
  const files: FileWithMeta[] = [];

  // Environmental
  files.push(...collectEnvironmentalFiles(assessmentData.environment));

  // Add other pillars as their tabs are implemented
  // Social Capital, Human Capital, Business Model, Leadership files
  // will be collected from their respective data paths

  return files;
}
