/* eslint-disable @typescript-eslint/no-explicit-any */
export function transformScopeDataForCharts(reportData: any) {
  if (!reportData) return [];

  return [
    {
      name: "Scope 1 (Direct)",
      value: parseFloat(reportData.percentage_emission_summary.scope1_emission_summary.toFixed(2)),
      color: "#FF6B3D",
    },
    {
      name: "Scope 2 (Indirect Energy)",
      value: parseFloat(reportData.percentage_emission_summary.scope2_emission_summary.toFixed(2)),
      color: "#3E9BFF",
    },
    {
      name: "Scope 3 (Value Chain)",
      value: parseFloat(reportData.percentage_emission_summary.scope3_emission_summary.toFixed(2)),
      color: "#9B4DFF",
    },
  ];
}

export function transformFuelMixForCharts(fuelMixData: any[]) {
  if (!fuelMixData || fuelMixData.length === 0) return [];

  return fuelMixData.map((item) => ({
    name: formatFuelType(item.fuelType),
    "Scope 1": item.scope1,
    "Scope 2": item.scope2,
    "Scope 3": item.scope3,
    total: item.total,
  }));
}

// Helper function for fuel type formatting
function formatFuelType(fuelType: string): string {
  const formatMap: { [key: string]: string } = {
    "diesel-ago": "Diesel",
    "aviation-fuel-jet-a1": "Aviation Fuel",
    "natural-gas": "Natural Gas",
    "produced-gas": "Produced Gas",
    eac: "EAC",
    ipp: "IPP",
    residual: "Residual",
    coolingSteam: "Cooling Steam",
  };

  return formatMap[fuelType] || fuelType;
}

export function formatLabel(input: string | undefined): string {
  if (!input) return "";

  // Replace underscores and hyphens with spaces
  const formatted = input.replace(/[_-]+/g, " ").toLowerCase();

  // Capitalize the first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
