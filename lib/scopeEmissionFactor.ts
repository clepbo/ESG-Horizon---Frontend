export interface ScopeEmissionFactor {
  category: string;
  factor: number;
  unit: string;
  isInTonnes?: boolean;
}

export const SCOPE_EMISSION_FACTORS: Record<string, ScopeEmissionFactor> = {
  cement: {
    category: "cement",
    factor: 0.4985,
    unit: "t cement",
    isInTonnes: true,
  },
  "gas-volume": {
    category: "gas-volume",
    factor: 2.6,
    unit: "m³ gas",
    isInTonnes: false,
  },
  "carbon-content": {
    category: "carbon-content",
    factor: 1.2,
    unit: "m³ ammonia",
    isInTonnes: false,
  },
  "venting-natural-gas": {
    category: "venting-natural-gas",
    factor: 0.656,
    unit: "m³",
    isInTonnes: false,
  },
  "refrigerant-added": {
    category: "refrigerant-added",
    factor: 1300,
    unit: "kg",
    isInTonnes: false,
  },
  electricity: {
    category: "electricity",
    factor: 0.526,
    unit: "kWh",
    isInTonnes: false,
  },
  residual: {
    category: "residual",
    factor: 0.526,
    unit: "kWh",
    isInTonnes: false,
  },
  cooling: {
    category: "cooling",
    factor: 0.25,
    unit: "kWh",
    isInTonnes: false,
  },
  steam: {
    category: "steam",
    factor: 0.25,
    unit: "kWh",
    isInTonnes: false,
  },
  heating: {
    category: "heating",
    factor: 0.25,
    unit: "kWh",
    isInTonnes: false,
  },
  diesel: {
    category: "diesel",
    factor: 2.68,
    unit: "litre",
    isInTonnes: false,
  },
  "natural-gas": {
    category: "natural-gas",
    factor: 2.75,
    unit: "kg",
    isInTonnes: false,
  },
  refrigerants: {
    category: "refrigerants",
    factor: 1.3,
    unit: "kg",
    isInTonnes: false,
  },
};

export function getScopeEmissionFactor(
  category: keyof typeof SCOPE_EMISSION_FACTORS
): ScopeEmissionFactor | null {
  return SCOPE_EMISSION_FACTORS[category] || null;
}
