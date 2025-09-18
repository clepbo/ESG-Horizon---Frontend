"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

export interface FileData {
  id?: string; // Made optional as it may not exist before saving
  name: string;
  size?: number; // Made optional as it may not exist before saving
  lastModified?: number; // Made optional as it may not exist before saving
  url?: string;
  publicId?: string;
  file?: File | null; // Added the 'file' property
}

// The FileMetadata interface can be removed if you use FileData everywhere
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
  subsidiary: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;

  // Scope 1
  stationarySources?: {
    electricityHeat?: {
      dieselGenerators?: SourceData[];
      gasTurbines?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      customFiles?: { [key: string]: any };
      additionalFields?: FileData[];
    };
    industrialProcesses?: {
      boilerFurnaces?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    oilGasOperations?: {
      onShoreProduction?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
  };
  mobileSources?: {
    roadTransport?: {
      vehicleFleet?: SourceData[];
      carsBuses?: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    vehicleEquipment?: {
      forkliftFuelType: SourceData[];
      heavyDutyFuelType: SourceData[];
      tractorFuelType: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    marineAviation?: {
      air: SourceData[];
      marine: SourceData[];
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
  };
  processEmissions?: {
    cementManufacturing?: {
      cementQuantity: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };

    gasFlaring?: {
      gasVolume: number;
      carbonContent: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
  };
  fugitiveEmissions?: {
    ventingNaturalGas?: {
      volumeOfGasVented: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    hfcLeaks?: {
      R134a: boolean;
      R410A: boolean;
      R404A: boolean;
      R407C: boolean;
      R507A: boolean;
      others: number;
      manureSystem: string;
      refrigerantAdded: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
  };

  // Scope 2
  electricity?: {
    electricityConsumed: string;
    supplier: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  cooling?: {
    coolingConsumed: string;
    selectedSystems: string[];
    otherComments: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  steam?: {
    volume: string;
    selectedSources: string[];
    otherComments: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  heating?: {
    heatingPurchased: string;
    heatingConsumed: string;
    supplierName: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  ipps?: {
    electricityConsumed: string;
    emissionFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  eac?: {
    gridElectricity: string;
    emissionFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  residual?: {
    electricityConsumed: string;
    residualMixFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  coolingSteam?: {
    energyConsumed: string;
    emissionFactor: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
}

export interface AssessmentState {
  currentView: string;
  assessmentData: AssessmentData;
  isLoading: boolean;
  lastSaved: Date | null;
  error: string | null;
  isSaving: boolean;
}

type AssessmentAction =
  | { type: "SET_VIEW"; payload: string }
  | { type: "UPDATE_BASIC_DATA"; payload: Partial<AssessmentData> }
  | {
      type: "UPDATE_STATIONARY_ELECTRICITY_HEAT";
      payload: NonNullable<
        AssessmentData["stationarySources"]
      >["electricityHeat"];
    }
  | {
      type: "UPDATE_STATIONARY_INDUSTRIAL";
      payload: NonNullable<
        AssessmentData["stationarySources"]
      >["industrialProcesses"];
    }
  | {
      type: "UPDATE_STATIONARY_OIL_GAS";
      payload: NonNullable<
        AssessmentData["stationarySources"]
      >["oilGasOperations"];
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
      payload: NonNullable<
        AssessmentData["processEmissions"]
      >["cementManufacturing"];
    }
  | {
      type: "UPDATE_PROCESS_GAS_FLARING";
      payload: NonNullable<AssessmentData["processEmissions"]>["gasFlaring"];
    }
  | {
      type: "UPDATE_FUGITIVE_VENTING";
      payload: NonNullable<
        AssessmentData["fugitiveEmissions"]
      >["ventingNaturalGas"];
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
  | { type: "SAVE_PROGRESS" }
  | { type: "LOAD_SAVED_DATA"; payload: AssessmentData }
  | { type: "RESET_ASSESSMENT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: AssessmentState = {
  currentView: "hub",
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
      },
      industrialProcesses: {
        boilerFurnaces: [],
        files: {},
      },
      oilGasOperations: {
        onShoreProduction: [],
        files: {},
      },
    },
    mobileSources: {
      roadTransport: {
        vehicleFleet: [],
        carsBuses: [],
        files: {},
      },
      vehicleEquipment: {
        forkliftFuelType: [],

        heavyDutyFuelType: [],

        tractorFuelType: [],

        files: {},
      },
      marineAviation: {
        air: [],
        marine: [],
        files: {},
      },
    },
    processEmissions: {
      cementManufacturing: {
        cementQuantity: 0,

        files: {},
      },
      gasFlaring: { gasVolume: 0, carbonContent: 0, files: {} },
    },
    fugitiveEmissions: {
      ventingNaturalGas: {
        volumeOfGasVented: 0,
        files: {},
      },

      hfcLeaks: {
        R134a: false,
        R410A: false,
        R404A: false,
        R407C: false,
        R507A: false,
        others: 0,
        manureSystem: "",
        refrigerantAdded: 0,
        files: {},
      },
    },

    // ---- Scope 2 ----
    electricity: {
      electricityConsumed: "",
      supplier: "",
      files: {},
    },
    cooling: {
      coolingConsumed: "",
      selectedSystems: [],
      otherComments: "",
      files: {},
    },
    steam: {
      volume: "",
      selectedSources: [],
      otherComments: "",
      files: {},
    },
    heating: {
      heatingPurchased: "",
      heatingConsumed: "",
      supplierName: "",
      files: {},
    },
    ipps: {
      electricityConsumed: "",
      emissionFactor: "",
      files: {},
    },
    eac: {
      gridElectricity: "",
      emissionFactor: "",
      files: {},
    },
    residual: {
      electricityConsumed: "",
      residualMixFactor: "",
      files: {},
    },
    coolingSteam: {
      energyConsumed: "",
      emissionFactor: "",
      files: {},
    },
  },
  isLoading: false,
  lastSaved: null,
  error: null,
  isSaving: false,
};

function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction
): AssessmentState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload, error: null };
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
            ...(state.assessmentData.mobileSources ?? {}),
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
            ...(state.assessmentData.mobileSources ?? {}),
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
            ...(state.assessmentData.mobileSources ?? {}),
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
            ...(state.assessmentData.processEmissions ?? {}),
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
            ...(state.assessmentData.processEmissions ?? {}),
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
            ...(state.assessmentData.fugitiveEmissions ?? {}),
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
            ...(state.assessmentData.fugitiveEmissions ?? {}),
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

    case "SAVE_PROGRESS":
      try {
        localStorage.setItem(
          "esg-assessment-data",
          JSON.stringify(state.assessmentData)
        );
        return {
          ...state,
          lastSaved: new Date(),
          isSaving: false,
          error: null,
        };
      } catch (error) {
        return {
          ...state,
          error: "Failed to save progress",
          isSaving: false,
        };
      }
    case "LOAD_SAVED_DATA":
      return {
        ...state,
        assessmentData: action.payload,
        isLoading: false,
        error: null,
      };
    case "RESET_ASSESSMENT":
      try {
        localStorage.removeItem("esg-assessment-data");
        return { ...initialState };
      } catch (error) {
        return { ...state, error: "Failed to reset assessment" };
      }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSaving: false,
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
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}
