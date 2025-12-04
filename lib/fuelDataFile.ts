export interface FuelOption {
  value: string;
  label: string;
  emissionFactor: number; // in kg CO2e
  source: string;
}

export interface UnitOption {
  value: string;
  label: string;
}

// Define the structure for a single source entry in your state
export interface SourceData {
  id: string;
  fuelType: string;
  volume: number | string;
  unit: string;
  emissionFactor: number;
  source: string;
}

export const allFuels: FuelOption[] = [
  // Scope 1: Stationary Sources
  {
    value: "diesel-ago",
    label: "Diesel (Automotive Gas Oil - AGO)",
    emissionFactor: 2.68,
    source: "IPCC 2006, Vintage: 2006",
  },
  {
    value: "natural-gas",
    label: "Natural Gas",
    emissionFactor: 2.05,
    source: "IEA (Emission Factors 2023), IPCC",
  },
  {
    value: "petrol",
    label: "Petrol (PMS)",
    emissionFactor: 2.31,
    source: "IPCC (2006 Guidelines), EPA (GHG Emission Factors Hub)",
  },
  {
    value: "low-pour-fuel-oil",
    label: "Low Pour Fuel Oil (LPFO)",
    emissionFactor: 3.07,
    source: "IPCC (assumes similar density to residual fuel oil)",
  },
  {
    value: "heavy-fuel-oil",
    label: "Heavy Fuel Oil (HFO) / Residual Fuel Oil",
    emissionFactor: 3.07,
    source: "IPCC, EPA (assumes average density)",
  },
  {
    value: "coal",
    label: "Coal",
    emissionFactor: 2.41,
    source: "EPA, IPCC (Varies significantly by coal type)",
  },
  {
    value: "biomass",
    label: "Biomass (Wood/Wood Waste)",
    emissionFactor: 0,
    source: "IPCC (2006 Guidelines), GHG Protocol",
  },
  { value: "lpg", label: "LPG", emissionFactor: 2.92, source: "IPCC 2006" },
  {
    value: "kerosene",
    label: "Kerosene",
    emissionFactor: 2.53,
    source: "IPCC 2006",
  },
  {
    value: "coke",
    label: "Coke (e.g., metallurgical coke)",
    emissionFactor: 3.12,
    source: "IPCC 2006",
  },
  {
    value: "produced-gas",
    label: "Produced (Lease) Gas",
    emissionFactor: 2.05,
    source: "GHG Protocol",
  },
  {
    value: "crude-oil",
    label: "Crude Oil",
    emissionFactor: 3.09,
    source: "IPCC 2006",
  },
  {
    value: "pipeline-gas",
    label: "Natural Gas (Pipeline Gas)",
    emissionFactor: 2.05,
    source: "GHG Protocol",
  },
  {
    value: "propane-butane-mix",
    label: "Liquefied Petroleum Gas (LPG/Propane-Butane mix)",
    emissionFactor: 2.92,
    source: "IPCC 2006",
  },

  // Scope 1: Mobile Sources
  {
    value: "cng",
    label: "Compressed Natural Gas (CNG)",
    emissionFactor: 2.05,
    source: "IEA (Emission Factors 2023), IPCC",
  },
  {
    value: "lng",
    label: "Liquefied Natural Gas (LNG)",
    emissionFactor: 2.76,
    source: "IPCC 2006",
  },
  {
    value: "autogas-lpg",
    label: "Liquefied Petroleum Gas (LPG/Autogas)",
    emissionFactor: 2.92,
    source: "IPCC 2006",
  },
  {
    value: "biodiesel",
    label: "Biodiesel or Blended Fuels",
    emissionFactor: 0.1,
    source: "EPA, Varies based on blend ratio",
  },
  {
    value: "electric",
    label: "Electric (EV)",
    emissionFactor: 0,
    source: "GHG Protocol",
  },
  {
    value: "hybrid",
    label: "Hybrid (Petrol/Diesel + Electric)",
    emissionFactor: 2.1,
    source: "Estimated, depends on usage and model",
  },
  {
    value: "aviation-fuel-jet-a1",
    label: "Aviation Turbine Fuel (Jet A-1)",
    emissionFactor: 3.15,
    source: "IPCC 2006",
  },
  {
    value: "aviation-gasoline",
    label: "Aviation Gasoline (AvGas)",
    emissionFactor: 2.45,
    source: "IPCC 2006",
  },
  {
    value: "marine-gas-oil",
    label: "Marine Gas Oil (MGO)",
    emissionFactor: 3.2,
    source: "IPCC 2006",
  },
  {
    value: "heavy-fuel-oil-marine",
    label: "Heavy Fuel Oil (HFO/IFO 180, IFO 380)",
    emissionFactor: 3.12,
    source: "IPCC 2006",
  },
  {
    value: "lng-marine",
    label: "Liquefied Natural Gas (LNG) Marine",
    emissionFactor: 2.76,
    source: "IPCC 2006",
  },
  {
    value: "cng-marine",
    label: "Compressed Natural Gas (CNG) Marine",
    emissionFactor: 2.05,
    source: "IPCC 2006",
  },
  {
    value: "dual-fuel",
    label: "Dual Fuel (Diesel + LNG mix)",
    emissionFactor: 2.5,
    source: "Estimated",
  },

  // Scope 1: Process Emission
  // {
  //   value: "ammonia",
  //   label: "Ammonia",
  //   emissionFactor: 1.6,
  //   source: "GHG Protocol, Varies by production method",
  // },
  // {
  //   value: "urea",
  //   label: "Urea",
  //   emissionFactor: 0.8,
  //   source: "GHG Protocol, Varies by production method",
  // },
  // {
  //   value: "nitric-acid",
  //   label: "Nitric Acid",
  //   emissionFactor: 2.3,
  //   source: "GHG Protocol, Varies by production method",
  // },
  // {
  //   value: "methane-process",
  //   label: "Methane (from livestock)",
  //   emissionFactor: 28,
  //   source: "IPCC AR5, Varies by animal type",
  // },
  // {
  //   value: "nitrous-oxide",
  //   label: "Nitrous Oxide (from manure)",
  //   emissionFactor: 265,
  //   source: "IPCC AR5",
  // },

  // Scope 1: Fugitive Emission
  // {
  //   value: "fugitive-methane",
  //   label: "Methane (CH₄) Fugitive",
  //   emissionFactor: 28,
  //   source: "IPCC AR5, Varies by source",
  // },
  // {
  //   value: "fugitive-co2",
  //   label: "Carbon Dioxide (CO₂) Fugitive",
  //   emissionFactor: 1,
  //   source: "IPCC AR5",
  // },
  // {
  //   value: "ethane",
  //   label: "Ethane (C₂H₆)",
  //   emissionFactor: 28,
  //   source: "IPCC AR5",
  // },
  // {
  //   value: "propane",
  //   label: "Propane (C₃H₈)",
  //   emissionFactor: 28,
  //   source: "IPCC AR5",
  // },
  // {
  //   value: "butanes",
  //   label: "Butanes (C₄H₁₀)",
  //   emissionFactor: 28,
  //   source: "IPCC AR5",
  // },
  // {
  //   value: "h2s",
  //   label: "Hydrogen Sulfide (H₂S)",
  //   emissionFactor: 1,
  //   source: "GHG Protocol",
  // },

  // Scope 3: Downstream Emissions
  {
    value: "crude-oil-s3",
    label: "Crude Oil (Scope 3)",
    emissionFactor: 3.09,
    source: "GHG Protocol, Use of Sold Products",
  },
  {
    value: "metals",
    label: "Metals (Scope 3)",
    emissionFactor: 1.5,
    source: "GHG Protocol, End-of-Life",
  },
  {
    value: "plastics",
    label: "Plastics (Scope 3)",
    emissionFactor: 3.0,
    source: "GHG Protocol, End-of-Life",
  },
  {
    value: "glass",
    label: "Glass (Scope 3)",
    emissionFactor: 0.5,
    source: "GHG Protocol, End-of-Life",
  },
  {
    value: "paper",
    label: "Paper & Cardboard (Scope 3)",
    emissionFactor: 1.0,
    source: "GHG Protocol, End-of-Life",
  },
  {
    value: "textiles",
    label: "Textiles (Scope 3)",
    emissionFactor: 1.2,
    source: "GHG Protocol, End-of-Life",
  },
  {
    value: "electronics",
    label: "Electronics / E-Waste (Scope 3)",
    emissionFactor: 2.5,
    source: "GHG Protocol, End-of-Life",
  },
];

// Map of categories to an array of fuel values
export const sectionFuelMapping: {
  stationary: Record<string, string[]>;
  mobile: Record<string, string[]>;
  process: Record<string, string[]>;
  fugitive: Record<string, string[]>;
  downstream: Record<string, string[]>;
} = {
  // Scope 1: Stationary Sources
  stationary: {
    dieselGenerators: [
      "diesel-ago",
      "natural-gas",
      "petrol",
      "low-pour-fuel-oil",
      "heavy-fuel-oil",
      "coal",
      "biomass",
      "coke",
    ],
    gasTurbines: ["natural-gas", "lpg", "diesel-ago", "kerosene"],
    boilerFurnaces: [
      "diesel-ago",
      "natural-gas",
      "petrol",
      "low-pour-fuel-oil",
      "heavy-fuel-oil",
      "coal",
      "biomass",
    ],
    onShoreProduction: [
      "produced-gas",
      "low-pour-fuel-oil",
      "heavy-fuel-oil",
      "crude-oil",
      "diesel-ago",
      "pipeline-gas",
      "propane-butane-mix",
    ],
  },
  // Scope 1: Mobile Sources
  mobile: {
    vehicleFleet: [
      "diesel-ago",
      "petrol",
      "cng",
      "lng",
      "autogas-lpg",
      "biodiesel",
      "electric",
      "hybrid",
    ],
    carsBuses: [
      "diesel-ago",
      "petrol",
      "cng",
      "lng",
      "autogas-lpg",
      "biodiesel",
      "electric",
      "hybrid",
    ],
    forkliftFuelType: [
      "diesel-ago",
      "petrol",
      "cng",
      "lng",
      "autogas-lpg",
      "biodiesel",
      "electric",
      "hybrid",
    ],
    heavyDutyFuelType: [
      "diesel-ago",
      "petrol",
      "cng",
      "lng",
      "autogas-lpg",
      "biodiesel",
      "electric",
      "hybrid",
    ],
    tractorFuelType: [
      "diesel-ago",
      "petrol",
      "cng",
      "lng",
      "autogas-lpg",
      "biodiesel",
      "electric",
      "hybrid",
    ],
    air: ["aviation-fuel-jet-a1", "aviation-gasoline"],
    marine: ["marine-gas-oil", "heavy-fuel-oil-marine", "lng-marine", "cng-marine", "dual-fuel"],
  },
  // Scope 1: Process Emission
  process: {
    fertilizerProduction: ["ammonia", "urea", "nitric-acid"],
    petrochemicalProduction: [
      "methanol",
      "ethylene",
      "propylene",
      "polyethylene",
      "polypropylene",
      "vcm",
      "pvc",
      "formaldehyde",
    ],
    livestockAndAgriculture: ["methane-process", "nitrous-oxide"], // Placeholder for livestock emissions
  },
  // Scope 1: Fugitive Emission
  fugitive: {
    equipmentLeaks: ["fugitive-methane", "fugitive-co2", "ethane", "propane", "butanes", "h2s"], // Placeholder for equipment leaks
    // You can add more detailed fugitive categories here
  },
  // Scope 3: Downstream Emissions
  downstream: {
    useOfSoldProducts: [
      "crude-oil-s3",
      "metals",
      "natural-gas",
      "ngl",
      "naphtha",
      "fuel-oil",
      "gasoline-blendstock",
    ], // Use new keys
    endOfLifeTreatment: [
      "plastics",
      "metals",
      "glass",
      "paper",
      "textiles",
      "electronics",
      "organic-materials",
    ], // Use new keys
  },
};

// Create a lookup map for quick access
const fuelLookup = new Map(allFuels.map((fuel) => [fuel.value, fuel]));

// Unit options from provided screenshot
export const unitOptions: UnitOption[] = [
  { value: "litre", label: "Litre (L)" },
  { value: "scm", label: "Standard Cubic Meter (Scm)" },
  { value: "tonne", label: "Tonne (t)" },
];

/**
 * Helper function to retrieve fuel options based on a category key.
 * It now iterates through all sections (stationary, mobile, etc.)
 * @param categoryKey The key for the desired fuel category (e.g., "dieselGenerators").
 * @returns An array of FuelOption objects.
 */
export function getFuelOptions(categoryKey: string): FuelOption[] {
  // Combine all categories into a single iterable object
  const allSections = {
    ...sectionFuelMapping.stationary,
    ...sectionFuelMapping.mobile,
    ...sectionFuelMapping.process,
    ...sectionFuelMapping.fugitive,
    ...sectionFuelMapping.downstream,
  };

  if (allSections.hasOwnProperty(categoryKey)) {
    const fuelValues = allSections[categoryKey];
    return fuelValues.map((value) => fuelLookup.get(value)).filter(Boolean) as FuelOption[];
  }

  return [];
}

/**
 * Helper function to get emission factor and source for a specific fuel type.
 * Note: The categoryKey is no longer needed here, as the fuelValue is unique.
 * @param fuelValue The fuel type value
 * @returns Object with emissionFactor and source, or defaults
 */
export function getFuelDetails(fuelValue: string): {
  emissionFactor: number;
  source: string;
} {
  const fuel = fuelLookup.get(fuelValue);

  // Return a default object if the fuel isn't found
  return {
    emissionFactor: fuel?.emissionFactor || 0,
    source: fuel?.source || "N/A",
  };
}
