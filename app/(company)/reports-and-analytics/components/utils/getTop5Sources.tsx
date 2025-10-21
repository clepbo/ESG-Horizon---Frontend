interface FuelSource {
  fuelType: string;
  volume: number;
  percentage: number;
}

interface TopSources {
  breakdown: FuelSource[];
}

/**
 * Converts backend top_5_sources data into readable format.
 * Example: "produced-gas" → "Produced Gas"
 */
export function getReadableTopSources(data: TopSources) {
  if (!data?.breakdown || !Array.isArray(data.breakdown)) return [];

  const formatFuelType = (type: string) =>
    type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return data.breakdown.slice(0,5).map((item) => ({
    fuelType: formatFuelType(item.fuelType),
    volume: item.volume,
    percentage: parseFloat(item.percentage.toFixed(2)),
  }));
}


// utils/fuelTransformers.ts

export interface FuelBreakdownItem {
  fuelType: string;
  volume: number;
  percentage: number;
  originalType?: string;
}

export function transformFuelBreakdownData(
  breakdownData: Array<{
    fuelType: string;
    volume: number;
    percentage: number;
  }>,
  options: {
    limit?: number;
  } = {}
): FuelBreakdownItem[] {
  const { limit = 5 } = options;
  
  if (!breakdownData || !Array.isArray(breakdownData)) return [];
  
  return breakdownData.slice(0, limit).map(item => ({
    fuelType: formatFuelType(item.fuelType),
    volume: item.volume,
    percentage: parseFloat(item.percentage.toFixed(2)),
    originalType: item.fuelType
  }));
}

/**
 * Transforms fuel type by splitting on "-" and capitalizing each part
 */
function formatFuelType(fuelType: string): string {
  if (!fuelType || typeof fuelType !== 'string') return 'Unknown Fuel';
  
  return fuelType
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}