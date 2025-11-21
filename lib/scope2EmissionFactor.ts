export interface Scope2EmissionFactor {
  category: "electricity" | "cooling" | "steam" | "heating";
  factor: number;
  unit: string;
}

export const SCOPE2_EMISSION_FACTORS: Record<string, Scope2EmissionFactor> = {
  electricity: {
    category: "electricity",
    factor: 0.526,
    unit: "kWh",
  },
  cooling: {
    category: "cooling",
    factor: 0.25,
    unit: "kWh",
  },
  steam: {
    category: "steam",
    factor: 0.25,
    unit: "KWh",
  },
  heating: {
    category: "heating",
    factor: 0.25,
    unit: "KWh",
  },
};

export function getScope2EmissionFactor(
  category: keyof typeof SCOPE2_EMISSION_FACTORS
): Scope2EmissionFactor | null {
  return SCOPE2_EMISSION_FACTORS[category] || null;
}
