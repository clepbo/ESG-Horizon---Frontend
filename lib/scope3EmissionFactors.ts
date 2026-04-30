/**
 * Default emission factors used by the Scope 3 backend computation
 * (backend/src/assessment/computation/computation.service.ts → Scope3ComputationService).
 *
 * These are surfaced on the Scope 3 forms read-only so users can see
 * what factor is applied to their inputs. They are NOT user-editable
 * today — backend defaults are authoritative.
 */
export interface Scope3Factor {
  /** Numeric default factor */
  factor: number;
  /** Display unit, e.g. "kgCO₂e/$", "kgCO₂e/km" */
  unit: string;
  /** Short attribution for the user */
  source: string;
}

export const SCOPE3_EMISSION_FACTORS = {
  // Upstream
  goodsAndServices: {
    factor: 0.45,
    unit: "kgCO₂e/$",
    source: "Economic input-output (DEFRA)",
  },
  capitalGoods: {
    factor: 0.55,
    unit: "kgCO₂e/$",
    source: "Economic input-output (DEFRA)",
  },
  fuelConsumed: {
    factor: 0.55,
    unit: "kgCO₂e/L",
    source: "Upstream fuel lifecycle (DEFRA)",
  },
  groundTravel: {
    factor: 0.11,
    unit: "kgCO₂e/km",
    source: "DEFRA business travel (average car)",
  },
  airTravel: {
    factor: 0.35,
    unit: "kgCO₂e/km",
    source: "DEFRA business travel (short-haul air)",
  },
  employeeCommuting: {
    factor: 0.2,
    unit: "kgCO₂e/(person·km)",
    source: "DEFRA commuting (average mode)",
  },
  leasedElectricity: {
    factor: 0.526,
    unit: "kgCO₂e/kWh",
    source: "Nigerian grid average",
  },
  leasedFuel: {
    factor: 2.68,
    unit: "kgCO₂e/L",
    source: "DEFRA diesel",
  },
  // Downstream
  useOfSoldProducts: {
    factor: 0.526,
    unit: "kgCO₂e/kWh",
    source: "Nigerian grid average",
  },
} satisfies Record<string, Scope3Factor>;

export type Scope3FactorKey = keyof typeof SCOPE3_EMISSION_FACTORS;
