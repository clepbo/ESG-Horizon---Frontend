"use client";

import { TotalsResponse, ScopeTotals, AssessmentProgress } from "@/services/assessment.service";
import React, { createContext, useContext, useReducer, type ReactNode } from "react";

export interface FileData {
  id?: string;
  name: string;
  size?: number;
  lastModified?: number;
  url?: string;
  publicId?: string;
  file?: File | null;
}

export interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
  url?: string;
  publicId?: string;
  isDeleting?: boolean;
}

export interface SourceData {
  id: string;
  fuelType: string;
  volume: string;
  unit: string;
  emissionFactor: number;
  source: string;
}

export interface AssessmentData {
  id?: number;
  status?: string;
  assessmentId?: number;
  subsidiary: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  lastSavedForm?: string;
  progress?: any;
  scopeTotals?: ScopeTotals;
  totals?: TotalsResponse;
  assessmentData?: {
    overallProgress?: number;
  };

  // Scope 1
  stationarySources?: {
    electricityHeat?: {
      dieselGenerators?: SourceData[];
      gasTurbines?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      customFiles?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    industrialProcesses?: {
      boilerFurnaces?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    oilGasOperations?: {
      onShoreProduction?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
  };
  mobileSources?: {
    roadTransport?: {
      vehicleFleet?: SourceData[];
      carsBuses?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    vehicleEquipment?: {
      forkliftFuelType: SourceData[];
      heavyDutyFuelType: SourceData[];
      tractorFuelType: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    marineAviation?: {
      air: SourceData[];
      marine: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
  };
  processEmissions?: {
    cementManufacturing?: {
      cementQuantity: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };

    gasFlaring?: {
      gasVolume: number;
      carbonContent: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
  };
  fugitiveEmissions?: {
    ventingNaturalGas?: {
      volumeOfGasVented: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    hfcLeaks?: {
      R134a: boolean;
      R410A: boolean;
      R404A: boolean;
      R407C: boolean;
      R507A: boolean;
      others: number | string;
      refrigerantAdded: number | string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
  };

  // Scope 2
  electricity?: {
    electricityConsumed: string;
    supplier: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };
  cooling?: {
    coolingConsumed: string;
    selectedSystems: string[];
    otherComments: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };
  steam?: {
    volume: string;
    selectedSources: string[];
    otherComments: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };
  heating?: {
    heatingPurchased: string;
    heatingConsumed: string;
    supplierName: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };
  ipps?: {
    electricityConsumed: string;
    emissionFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };
  eac?: {
    gridElectricity: string;
    emissionFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };
  residual?: {
    electricityConsumed: string;
    residualMixFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };
  coolingSteam?: {
    energyConsumed: string;
    emissionFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileMetadata[];
  };

  // Scope 3 - Upstream
  scope3Upstream?: {
    purchasedGoodsAndServices?: {
      totalAmountSpent?: string;
      massOfGoods?: string;
      selectedCategories?: string[];
      otherCategoryValue?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    capitalGoods?: {
      totalCost?: string;
      goodsDescription?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    fuelEnergyRelatedActivities?: {
      fuelVolume?: string;
      energyType?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    upstreamTransportationDistribution?: {
      massOfGoods?: string;
      distance?: string;
      transportMode?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    wasteGeneratedInOperations?: {
      wasteWeight?: string;
      wasteType?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    businessTravel?: {
      distance?: string;
      numberOfFlights?: string;
      numberOfEmployees?: string;
      passengerKilometers?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    employeeCommuting?: {
      numberOfEmployees?: string;
      averageDistance?: string;
      commutingMode?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    upstreamLeasedAssets?: {
      electricityConsumed?: string;
      fuelConsumed?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
  };

  // Scope 3 - Downstream
  scope3Downstream?: {
    downstreamTransportationDistribution?: {
      massOfProducts?: string;
      distance?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    processingSoldProducts?: {
      processedQuantity?: string;
      processingType?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    useOfSoldProducts?: {
      unitsSold?: string;
      productLifetime?: string;
      averageAnnualConsumption?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    endOfLifeTreatment?: {
      treatments?: Array<{ type: string; mass: number }>;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    downstreamLeasedAssets?: {
      fuelConsumed?: string;
      electricityConsumed?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    franchises?: {
      fuelConsumed?: string;
      electricityConsumed?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
    investments?: {
      equityShare?: string;
      portfolioEmissions?: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileMetadata[];
    };
  };
}

export interface AssessmentState {
  currentView: string;
  assessmentId: number | null;
  assessmentData: AssessmentData;
  isLoading: boolean;
  error: string | null;
  isContinueMode: boolean;
  isAssignedTask: boolean;
  progress: AssessmentProgress[];
  scopeTotals: ScopeTotals;
  lastSubmittedAt?: string;
  targetStep?: string;
}

type AssessmentAction =
  | { type: "SET_VIEW"; payload: string }
  | { type: "SET_ASSESSMENT_ID"; payload: number }
  | { type: "SET_TARGET_STEP"; payload: string }
  | { type: "SET_CONTINUE_MODE"; payload: boolean }
  | { type: "SET_ASSIGNED_TASK"; payload: boolean }
  | {
    type: "UPDATE_ASSESSMENT_METADATA";
    payload: {
      progress?: AssessmentProgress[];
      scopeTotals?: ScopeTotals;
      lastSubmittedAt?: string;
    };
  }
  | { type: "UPDATE_BASIC_DATA"; payload: Partial<AssessmentData> }
  | {
    type: "UPDATE_STATIONARY_ELECTRICITY_HEAT";
    payload: NonNullable<AssessmentData["stationarySources"]>["electricityHeat"];
  }
  | {
    type: "UPDATE_STATIONARY_INDUSTRIAL";
    payload: NonNullable<AssessmentData["stationarySources"]>["industrialProcesses"];
  }
  | {
    type: "UPDATE_STATIONARY_OIL_GAS";
    payload: NonNullable<AssessmentData["stationarySources"]>["oilGasOperations"];
  }
  | {
    type: "UPDATE_MOBILE_ROAD_TRANSPORT";
    payload: NonNullable<AssessmentData["mobileSources"]>["roadTransport"];
  }
  | {
    type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT";
    payload: NonNullable<AssessmentData["mobileSources"]>["vehicleEquipment"];
  }
  | {
    type: "UPDATE_MOBILE_MARINE_AVIATION";
    payload: NonNullable<AssessmentData["mobileSources"]>["marineAviation"];
  }
  | {
    type: "UPDATE_PROCESS_CEMENT_MANUFACTURING";
    payload: NonNullable<AssessmentData["processEmissions"]>["cementManufacturing"];
  }
  | {
    type: "UPDATE_PROCESS_GAS_FLARING";
    payload: NonNullable<AssessmentData["processEmissions"]>["gasFlaring"];
  }
  | {
    type: "UPDATE_FUGITIVE_VENTING";
    payload: NonNullable<AssessmentData["fugitiveEmissions"]>["ventingNaturalGas"];
  }
  | {
    type: "UPDATE_FUGITIVE_HFC_LEAKS";
    payload: NonNullable<AssessmentData["fugitiveEmissions"]>["hfcLeaks"];
  }
  // Scope 2 flattened
  | { type: "UPDATE_ELECTRICITY"; payload: AssessmentData["electricity"] }
  | { type: "UPDATE_COOLING"; payload: AssessmentData["cooling"] }
  | { type: "UPDATE_STEAM"; payload: AssessmentData["steam"] }
  | { type: "UPDATE_HEATING"; payload: AssessmentData["heating"] }
  | { type: "UPDATE_IPPS"; payload: AssessmentData["ipps"] }
  | { type: "UPDATE_EAC"; payload: AssessmentData["eac"] }
  | { type: "UPDATE_RESIDUAL"; payload: AssessmentData["residual"] }
  | { type: "UPDATE_COOLING_STEAM"; payload: AssessmentData["coolingSteam"] }
  // Scope 3 Upstream
  | { type: "UPDATE_UPSTREAM_PURCHASED_GOODS"; payload: NonNullable<AssessmentData["scope3Upstream"]>["purchasedGoodsAndServices"] }
  | { type: "UPDATE_UPSTREAM_CAPITAL_GOODS"; payload: NonNullable<AssessmentData["scope3Upstream"]>["capitalGoods"] }
  | { type: "UPDATE_UPSTREAM_FUEL_ENERGY"; payload: NonNullable<AssessmentData["scope3Upstream"]>["fuelEnergyRelatedActivities"] }
  | { type: "UPDATE_UPSTREAM_TRANSPORTATION"; payload: NonNullable<AssessmentData["scope3Upstream"]>["upstreamTransportationDistribution"] }
  | { type: "UPDATE_UPSTREAM_WASTE"; payload: NonNullable<AssessmentData["scope3Upstream"]>["wasteGeneratedInOperations"] }
  | { type: "UPDATE_UPSTREAM_BUSINESS_TRAVEL"; payload: NonNullable<AssessmentData["scope3Upstream"]>["businessTravel"] }
  | { type: "UPDATE_UPSTREAM_EMPLOYEE_COMMUTING"; payload: NonNullable<AssessmentData["scope3Upstream"]>["employeeCommuting"] }
  | { type: "UPDATE_UPSTREAM_LEASED_ASSETS"; payload: NonNullable<AssessmentData["scope3Upstream"]>["upstreamLeasedAssets"] }
  // Scope 3 Downstream
  | { type: "UPDATE_DOWNSTREAM_TRANSPORTATION"; payload: NonNullable<AssessmentData["scope3Downstream"]>["downstreamTransportationDistribution"] }
  | { type: "UPDATE_DOWNSTREAM_PROCESSING"; payload: NonNullable<AssessmentData["scope3Downstream"]>["processingSoldProducts"] }
  | { type: "UPDATE_DOWNSTREAM_USE_SOLD_PRODUCTS"; payload: NonNullable<AssessmentData["scope3Downstream"]>["useOfSoldProducts"] }
  | { type: "UPDATE_DOWNSTREAM_END_OF_LIFE"; payload: NonNullable<AssessmentData["scope3Downstream"]>["endOfLifeTreatment"] }
  | { type: "UPDATE_DOWNSTREAM_LEASED_ASSETS"; payload: NonNullable<AssessmentData["scope3Downstream"]>["downstreamLeasedAssets"] }
  | { type: "UPDATE_DOWNSTREAM_FRANCHISES"; payload: NonNullable<AssessmentData["scope3Downstream"]>["franchises"] }
  | { type: "UPDATE_DOWNSTREAM_INVESTMENTS"; payload: NonNullable<AssessmentData["scope3Downstream"]>["investments"] }
  | { type: "LOAD_SAVED_DATA"; payload: AssessmentData }
  | { type: "RESET_ASSESSMENT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_PROGRESS"; payload: AssessmentProgress[] }
  | {
    type: "SET_COMPUTED_DATA";
    payload: {
      assessmentId: number;
      progress: AssessmentProgress[];
      scopeTotals: ScopeTotals;
      totals: TotalsResponse | undefined;
      status: string;
    };
  };

const initialState: AssessmentState = {
  currentView: "hub",
  assessmentId: null,
  isContinueMode: false,
  isAssignedTask: false,
  assessmentData: {
    subsidiary: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",

    // ---- Scope 1 ----
    stationarySources: {
      electricityHeat: {
        dieselGenerators: [],
        gasTurbines: [],
        files: {},
        customFiles: {},
        additionalFields: [],
      },
      industrialProcesses: {
        boilerFurnaces: [],
        files: {},
        additionalFields: [],
      },
      oilGasOperations: {
        onShoreProduction: [],
        files: {},
        additionalFields: [],
      },
    },
    mobileSources: {
      roadTransport: {
        vehicleFleet: [],
        carsBuses: [],
        files: {},
        additionalFields: [],
      },
      vehicleEquipment: {
        forkliftFuelType: [],
        heavyDutyFuelType: [],
        tractorFuelType: [],
        files: {},
        additionalFields: [],
      },
      marineAviation: {
        air: [],
        marine: [],
        files: {},
        additionalFields: [],
      },
    },
    processEmissions: {
      cementManufacturing: {
        cementQuantity: 0,
        files: {},
        additionalFields: [],
      },
      gasFlaring: {
        gasVolume: 0,
        carbonContent: 0,
        files: {},
        additionalFields: [],
      },
    },
    fugitiveEmissions: {
      ventingNaturalGas: {
        volumeOfGasVented: 0,
        files: {},
        additionalFields: [],
      },

      hfcLeaks: {
        R134a: false,
        R410A: false,
        R404A: false,
        R407C: false,
        R507A: false,
        others: "",
        refrigerantAdded: "",
        files: {},
        additionalFields: [],
      },
    },

    // ---- Scope 2 ----
    electricity: {
      electricityConsumed: "",
      supplier: "",
      files: {},
      additionalFields: [],
    },
    cooling: {
      coolingConsumed: "",
      selectedSystems: [],
      otherComments: "",
      files: {},
      additionalFields: [],
    },
    steam: {
      volume: "",
      selectedSources: [],
      otherComments: "",
      files: {},
      additionalFields: [],
    },
    heating: {
      heatingPurchased: "",
      heatingConsumed: "",
      supplierName: "",
      files: {},
      additionalFields: [],
    },
    ipps: {
      electricityConsumed: "",
      emissionFactor: "",
      files: {},
      additionalFields: [],
    },
    eac: {
      gridElectricity: "",
      emissionFactor: "",
      files: {},
      additionalFields: [],
    },
    residual: {
      electricityConsumed: "",
      residualMixFactor: "",
      files: {},
      additionalFields: [],
    },
    coolingSteam: {
      energyConsumed: "",
      emissionFactor: "",
      files: {},
      additionalFields: [],
    },

    // ---- Scope 3 ----
    scope3Upstream: {
      purchasedGoodsAndServices: {
        totalAmountSpent: "",
        massOfGoods: "",
        selectedCategories: [],
        otherCategoryValue: "",
        files: {},
        additionalFields: [],
      },
      capitalGoods: {
        totalCost: "",
        goodsDescription: "",
        files: {},
        additionalFields: [],
      },
      fuelEnergyRelatedActivities: {
        fuelVolume: "",
        energyType: "",
        files: {},
        additionalFields: [],
      },
      upstreamTransportationDistribution: {
        massOfGoods: "",
        distance: "",
        transportMode: "",
        files: {},
        additionalFields: [],
      },
      wasteGeneratedInOperations: {
        wasteWeight: "",
        wasteType: "",
        files: {},
        additionalFields: [],
      },
      businessTravel: {
        distance: "",
        numberOfFlights: "",
        numberOfEmployees: "",
        passengerKilometers: "",
        files: {},
        additionalFields: [],
      },
      employeeCommuting: {
        numberOfEmployees: "",
        averageDistance: "",
        commutingMode: "",
        files: {},
        additionalFields: [],
      },
      upstreamLeasedAssets: {
        electricityConsumed: "",
        fuelConsumed: "",
        files: {},
        additionalFields: [],
      },
    },
    scope3Downstream: {
      downstreamTransportationDistribution: {
        massOfProducts: "",
        distance: "",
        files: {},
        additionalFields: [],
      },
      processingSoldProducts: {
        processedQuantity: "",
        processingType: "",
        files: {},
        additionalFields: [],
      },
      useOfSoldProducts: {
        unitsSold: "",
        productLifetime: "",
        averageAnnualConsumption: "",
        files: {},
        additionalFields: [],
      },
      endOfLifeTreatment: {
        treatments: [],
        files: {},
        additionalFields: [],
      },
      downstreamLeasedAssets: {
        fuelConsumed: "",
        electricityConsumed: "",
        files: {},
        additionalFields: [],
      },
      franchises: {
        fuelConsumed: "",
        electricityConsumed: "",
        files: {},
        additionalFields: [],
      },
      investments: {
        equityShare: "",
        portfolioEmissions: "",
        files: {},
        additionalFields: [],
      },
    },
  },
  isLoading: false,
  error: null,
  progress: [],
  scopeTotals: {
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0,
  },
};

function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload, error: null };

    case "SET_TARGET_STEP":
      return { ...state, targetStep: action.payload };

    case "SET_CONTINUE_MODE":
      return { ...state, isContinueMode: action.payload };

    case "SET_ASSIGNED_TASK":
      return { ...state, isAssignedTask: action.payload };

    case "SET_ASSESSMENT_ID":
      return {
        ...state,
        assessmentId: action.payload,
        assessmentData: {
          ...state.assessmentData,
          assessmentId: action.payload,
        },
      };

    case "UPDATE_BASIC_DATA":
      return {
        ...state,
        assessmentData: { ...state.assessmentData, ...action.payload },
        error: null,
      };
    case "UPDATE_STATIONARY_ELECTRICITY_HEAT":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          stationarySources: {
            ...(state.assessmentData.stationarySources ?? {}),
            electricityHeat: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_STATIONARY_INDUSTRIAL":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          stationarySources: {
            ...(state.assessmentData.stationarySources ?? {}),
            industrialProcesses: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_STATIONARY_OIL_GAS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          stationarySources: {
            ...(state.assessmentData.stationarySources ?? {}),
            oilGasOperations: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_MOBILE_ROAD_TRANSPORT":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          mobileSources: {
            ...state.assessmentData.mobileSources,
            roadTransport: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_MOBILE_VEHICLE_EQUIPMENT":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          mobileSources: {
            ...state.assessmentData.mobileSources,
            vehicleEquipment: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_MOBILE_MARINE_AVIATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          mobileSources: {
            ...state.assessmentData.mobileSources,
            marineAviation: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_PROCESS_CEMENT_MANUFACTURING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          processEmissions: {
            ...state.assessmentData.processEmissions,
            cementManufacturing: action.payload,
          },
        },
        error: null,
      };

    case "UPDATE_PROCESS_GAS_FLARING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          processEmissions: {
            ...state.assessmentData.processEmissions,
            gasFlaring: action.payload,
          },
        },
        error: null,
      };

    case "UPDATE_FUGITIVE_VENTING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          fugitiveEmissions: {
            ...state.assessmentData.fugitiveEmissions,
            ventingNaturalGas: action.payload,
          },
        },
        error: null,
      };

    case "UPDATE_FUGITIVE_HFC_LEAKS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          fugitiveEmissions: {
            ...state.assessmentData.fugitiveEmissions,
            hfcLeaks: action.payload,
          },
        },
        error: null,
      };

    // Scope 2
    case "UPDATE_ELECTRICITY":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          electricity: action.payload,
        },
      };

    case "UPDATE_COOLING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          cooling: action.payload,
        },
      };

    case "UPDATE_STEAM":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          steam: action.payload,
        },
      };

    case "UPDATE_HEATING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          heating: action.payload,
        },
      };

    case "UPDATE_IPPS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          ipps: action.payload,
        },
      };

    case "UPDATE_EAC":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          eac: action.payload,
        },
      };

    case "UPDATE_RESIDUAL":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          residual: action.payload,
        },
      };

    case "UPDATE_COOLING_STEAM":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          coolingSteam: action.payload,
        },
      };

    // Scope 3 Upstream
    case "UPDATE_UPSTREAM_PURCHASED_GOODS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            purchasedGoodsAndServices: action.payload,
          },
        },
      };

    case "UPDATE_UPSTREAM_CAPITAL_GOODS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            capitalGoods: action.payload,
          },
        },
      };

    case "UPDATE_UPSTREAM_FUEL_ENERGY":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            fuelEnergyRelatedActivities: action.payload,
          },
        },
      };

    case "UPDATE_UPSTREAM_TRANSPORTATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            upstreamTransportationDistribution: action.payload,
          },
        },
      };

    case "UPDATE_UPSTREAM_WASTE":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            wasteGeneratedInOperations: action.payload,
          },
        },
      };

    case "UPDATE_UPSTREAM_BUSINESS_TRAVEL":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            businessTravel: action.payload,
          },
        },
      };

    case "UPDATE_UPSTREAM_EMPLOYEE_COMMUTING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            employeeCommuting: action.payload,
          },
        },
      };

    case "UPDATE_UPSTREAM_LEASED_ASSETS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Upstream: {
            ...state.assessmentData.scope3Upstream,
            upstreamLeasedAssets: action.payload,
          },
        },
      };

    // Scope 3 Downstream
    case "UPDATE_DOWNSTREAM_TRANSPORTATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Downstream: {
            ...state.assessmentData.scope3Downstream,
            downstreamTransportationDistribution: action.payload,
          },
        },
      };

    case "UPDATE_DOWNSTREAM_PROCESSING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Downstream: {
            ...state.assessmentData.scope3Downstream,
            processingSoldProducts: action.payload,
          },
        },
      };

    case "UPDATE_DOWNSTREAM_USE_SOLD_PRODUCTS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Downstream: {
            ...state.assessmentData.scope3Downstream,
            useOfSoldProducts: action.payload,
          },
        },
      };

    case "UPDATE_DOWNSTREAM_END_OF_LIFE":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Downstream: {
            ...state.assessmentData.scope3Downstream,
            endOfLifeTreatment: action.payload,
          },
        },
      };

    case "UPDATE_DOWNSTREAM_LEASED_ASSETS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Downstream: {
            ...state.assessmentData.scope3Downstream,
            downstreamLeasedAssets: action.payload,
          },
        },
      };

    case "UPDATE_DOWNSTREAM_FRANCHISES":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Downstream: {
            ...state.assessmentData.scope3Downstream,
            franchises: action.payload,
          },
        },
      };

    case "UPDATE_DOWNSTREAM_INVESTMENTS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          scope3Downstream: {
            ...state.assessmentData.scope3Downstream,
            investments: action.payload,
          },
        },
      };

    case "LOAD_SAVED_DATA":
      return {
        ...state,
        assessmentId: action.payload.assessmentId ?? state.assessmentId,
        progress: action.payload.progress || state.progress,
        scopeTotals: action.payload.scopeTotals || state.scopeTotals,
        assessmentData: {
          ...state.assessmentData,
          ...action.payload,
          assessmentId: action.payload.assessmentId ?? state.assessmentData.assessmentId,
        },
        isLoading: false,
        error: null,
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: action.payload,
        assessmentData: {
          ...state.assessmentData,
          progress: action.payload,
        },
      };
    case "SET_COMPUTED_DATA":
      return {
        ...state,
        assessmentId: action.payload.assessmentId,
        progress: action.payload.progress,
        scopeTotals: action.payload.scopeTotals,
        assessmentData: {
          ...state.assessmentData,
          assessmentId: action.payload.assessmentId,
          status: action.payload.status,
          progress: action.payload.progress,
          scopeTotals: action.payload.scopeTotals,
          totals: action.payload.totals,
        },
        isLoading: false,
        error: null,
      };
    case "RESET_ASSESSMENT":
      try {
        localStorage.removeItem("esg-assessment-data");
        return { ...initialState };
      } catch (error) {
        console.error(error);
        return { ...state, error: "Failed to reset assessment" };
      }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

export const AssessmentContext = createContext<{
  state: AssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
} | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  React.useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    const savedData = localStorage.getItem("esg-assessment-data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: "LOAD_SAVED_DATA", payload: parsedData });
      } catch {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to load saved assessment data",
        });
      }
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>{children}</AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}
