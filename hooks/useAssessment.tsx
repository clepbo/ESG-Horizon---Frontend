"use client";

import { FileData } from "@/app/components/company/assessments/AdditionalFileUpload";
import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

export interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
  url?: string;
  publicId?: string;
  isDeleting?: boolean;
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
      dieselFuelType?: string;
      dieselVolume?: number;
      gasFuelType?: string;
      gasVolume?: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    industrialProcesses?: {
      selectedFuelType: string;
      otherFuelType: string;
      fuelVolume: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    oilGasOperations?: {
      selectedFuelType: string;
      fuelVolume: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
  };
  mobileSources?: {
    roadTransport?: {
      dieselTruckFuelType?: string;
      dieselTruckVolume: number;
      carPetrolVolume: number;
      carDieselVolume: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    vehicleEquipment?: {
      forkliftFuelType: string;
      forkliftVolume: number;
      heavyDutyFuelType: string;
      heavyDutyVolume: number;
      tractorFuelType: string;
      tractorVolume: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    marineAviation?: {
      helicopterFuelType: string;
      helicopterVolume: number;
      vesselFuelType: string;
      otherFuelType: string;
      vesselVolume: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
  };
  processEmissions?: {
    co2Release?: {
      clinkerQuantity: number;
      calciumOxide: number;
      magnesiumOxide: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    fertilizerEmissions?: {
      products: { [product: string]: number };
      feedstock: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    gasFlaring?: {
      gasVolume: number;
      carbonContent: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    entericFermentation?: {
      animals: { [type: string]: number };
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    methaneNitrousOxide?: {
      animals: { [type: string]: number };
      manureSystem: string;
      otherManureSystem: string;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
  };
  fugitiveEmissions?: {
    methaneLeaks?: {
      compressors: number;
      pumps: number;
      prds: number;
      openEnded: number;
      seals: number;
      wellheads: number;
      manifolds: number;
      hoses: number;
      drains: number;
      sampling: number;
      others: number;
      methanePercent: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    ventingNaturalGas?: {
      volumeOfGasVented: number;
      methane: number;
      carbonDioxide: number;
      ethane: number;
      propane: number;
      butanes: number;
      wellheads: number;
      nitrogen: number;
      hydrogenSulfide: number;
      others: number;
      files?: { [key: string]: FileMetadata | null };
      additionalFields?: FileData[];
    };
    incompleteCombustion?: {
      volumeToFlare: number;
      flareEfficiency: number;
      gasComposition: number;
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
    // reportingPeriod: string;
    supplier: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  cooling?: {
    coolingConsumed: string;
    // reportingPeriod: string;
    selectedSystems: string[];
    otherComments: string;
    files?: { [key: string]: FileMetadata | null };
    additionalFields?: FileData[];
  };
  steam?: {
    volume: string;
    // reportingPeriod: string;
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
      type: "UPDATE_PROCESS_CO2_RELEASE";
      payload: NonNullable<AssessmentData["processEmissions"]>["co2Release"];
    }
  | {
      type: "UPDATE_PROCESS_FERTILIZER_EMISSIONS";
      payload: NonNullable<
        AssessmentData["processEmissions"]
      >["fertilizerEmissions"];
    }
  | {
      type: "UPDATE_PROCESS_GAS_FLARING";
      payload: NonNullable<AssessmentData["processEmissions"]>["gasFlaring"];
    }
  | {
      type: "UPDATE_PROCESS_ENTERIC_FERMENTATION";
      payload: NonNullable<
        AssessmentData["processEmissions"]
      >["entericFermentation"];
    }
  | {
      type: "UPDATE_PROCESS_METHANE_NITROUS_OXIDE";
      payload: NonNullable<
        AssessmentData["processEmissions"]
      >["methaneNitrousOxide"];
    }
  | {
      type: "UPDATE_FUGITIVE_METHANE_LEAKS";
      payload: NonNullable<AssessmentData["fugitiveEmissions"]>["methaneLeaks"];
    }
  | {
      type: "UPDATE_FUGITIVE_VENTING";
      payload: NonNullable<
        AssessmentData["fugitiveEmissions"]
      >["ventingNaturalGas"];
    }
  | {
      type: "UPDATE_FUGITIVE_INCOMPLETE_COMBUSTION";
      payload: NonNullable<
        AssessmentData["fugitiveEmissions"]
      >["incompleteCombustion"];
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
        dieselFuelType: "",
        dieselVolume: 0,
        gasFuelType: "",
        gasVolume: 0,
        files: {},
      },
      industrialProcesses: {
        selectedFuelType: "",
        otherFuelType: "",
        fuelVolume: 0,
        files: {},
      },
      oilGasOperations: {
        selectedFuelType: "",
        fuelVolume: 0,
        files: {},
      },
    },
    mobileSources: {
      roadTransport: {
        dieselTruckVolume: 0,
        carPetrolVolume: 0,
        carDieselVolume: 0,
        files: {},
      },
      vehicleEquipment: {
        forkliftFuelType: "",
        forkliftVolume: 0,
        heavyDutyFuelType: "",
        heavyDutyVolume: 0,
        tractorFuelType: "",
        tractorVolume: 0,
        files: {},
      },
      marineAviation: {
        helicopterFuelType: "",
        helicopterVolume: 0,
        vesselFuelType: "",
        otherFuelType: "",
        vesselVolume: 0,
        files: {},
      },
    },
    processEmissions: {
      co2Release: {
        clinkerQuantity: 0,
        calciumOxide: 0,
        magnesiumOxide: 0,
        files: {},
      },
      fertilizerEmissions: { products: {}, feedstock: 0, files: {} },
      gasFlaring: { gasVolume: 0, carbonContent: 0, files: {} },
      entericFermentation: { animals: {}, files: {} },
      methaneNitrousOxide: {
        animals: {},
        manureSystem: "",
        otherManureSystem: "",
        files: {},
      },
    },
    fugitiveEmissions: {
      methaneLeaks: {
        compressors: 0,
        pumps: 0,
        prds: 0,
        openEnded: 0,
        seals: 0,
        wellheads: 0,
        manifolds: 0,
        hoses: 0,
        drains: 0,
        sampling: 0,
        others: 0,
        methanePercent: 0,
        files: {},
      },
      ventingNaturalGas: {
        volumeOfGasVented: 0,
        methane: 0,
        carbonDioxide: 0,
        ethane: 0,
        propane: 0,
        butanes: 0,
        wellheads: 0,
        nitrogen: 0,
        hydrogenSulfide: 0,
        others: 0,
        files: {},
      },
      incompleteCombustion: {
        volumeToFlare: 0,
        flareEfficiency: 0,
        gasComposition: 0,
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
    case "UPDATE_PROCESS_CO2_RELEASE":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          processEmissions: {
            ...(state.assessmentData.processEmissions ?? {}),
            co2Release: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_PROCESS_FERTILIZER_EMISSIONS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          processEmissions: {
            ...(state.assessmentData.processEmissions ?? {}),
            fertilizerEmissions: action.payload,
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
    case "UPDATE_PROCESS_ENTERIC_FERMENTATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          processEmissions: {
            ...(state.assessmentData.processEmissions ?? {}),
            entericFermentation: action.payload,
          },
        },
        error: null,
      };
    case "UPDATE_PROCESS_METHANE_NITROUS_OXIDE":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          processEmissions: {
            ...(state.assessmentData.processEmissions ?? {}),
            methaneNitrousOxide: action.payload,
          },
        },
        error: null,
      };

    case "UPDATE_FUGITIVE_METHANE_LEAKS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          fugitiveEmissions: {
            ...(state.assessmentData.fugitiveEmissions ?? {}),
            methaneLeaks: action.payload,
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
    case "UPDATE_FUGITIVE_INCOMPLETE_COMBUSTION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          fugitiveEmissions: {
            ...(state.assessmentData.fugitiveEmissions ?? {}),
            incompleteCombustion: action.payload,
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

// "use client";

// import React, {
//   createContext,
//   useContext,
//   useReducer,
//   type ReactNode,
// } from "react";

// export interface FileMetadata {
//   name: string;
//   size: number;
//   lastModified: number;
// }

// export interface AssessmentData {
//   subsidiary: string;
//   startMonth: string;
//   startYear: string;
//   endMonth: string;
//   endYear: string;

//   // Scope 1
//   stationarySources?: {
//     electricityHeat?: {
//       dieselFuelType?: string;
//       dieselVolume?: number;
//       gasFuelType?: string;
//       gasVolume?: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     industrialProcesses?: {
//       selectedFuelType: string;
//       otherFuelType: string;
//       fuelVolume: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     oilGasOperations?: {
//       selectedFuelType: string;
//       fuelVolume: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//   };
//   mobileSources?: {
//     roadTransport?: {
//       dieselTruckFuelType?: string;
//       dieselTruckVolume: number;
//       carPetrolVolume: number;
//       carDieselVolume: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     vehicleEquipment?: {
//       forkliftFuelType: string;
//       forkliftVolume: number;
//       heavyDutyFuelType: string;
//       heavyDutyVolume: number;
//       tractorFuelType: string;
//       tractorVolume: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     marineAviation?: {
//       helicopterFuelType: string;
//       helicopterVolume: number;
//       vesselFuelType: string;
//       otherFuelType: string;
//       vesselVolume: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//   };
//   processEmissions?: {
//     co2Release?: {
//       clinkerQuantity: number;
//       calciumOxide: number;
//       magnesiumOxide: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     fertilizerEmissions?: {
//       products: { [product: string]: number };
//       feedstock: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     gasFlaring?: {
//       gasVolume: number;
//       carbonContent: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     entericFermentation?: {
//       animals: { [type: string]: number };
//       files?: { [key: string]: FileMetadata | null };
//     };
//     methaneNitrousOxide?: {
//       animals: { [type: string]: number };
//       manureSystem: string;
//       otherManureSystem: string;
//       files?: { [key: string]: FileMetadata | null };
//     };
//   };
//   fugitiveEmissions?: {
//     methaneLeaks?: {
//       compressors: number;
//       pumps: number;
//       prds: number;
//       openEnded: number;
//       seals: number;
//       wellheads: number;
//       manifolds: number;
//       hoses: number;
//       drains: number;
//       sampling: number;
//       others: number;
//       methanePercent: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     ventingNaturalGas?: {
//       volumeOfGasVented: number;
//       methane: number;
//       carbonDioxide: number;
//       ethane: number;
//       propane: number;
//       butanes: number;
//       wellheads: number;
//       nitrogen: number;
//       hydrogenSulfide: number;
//       others: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//     incompleteCombustion?: {
//       volumeToFlare: number;
//       flareEfficiency: number;
//       gasComposition: number;
//     };
//     hfcLeaks?: {
//       R134a: boolean;
//       R410A: boolean;
//       R404A: boolean;
//       R407C: boolean;
//       R507A: boolean;
//       others: number;
//       manureSystem: string;
//       refrigerantAdded: number;
//       files?: { [key: string]: FileMetadata | null };
//     };
//   };

//   // Scope 2
//   electricity?: {
//     electricityConsumed: string;
//     // reportingPeriod: string;
//     supplier: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
//   cooling?: {
//     coolingConsumed: string;
//     // reportingPeriod: string;
//     selectedSystems: string[];
//     otherComments: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
//   steam?: {
//     volume: string;
//     // reportingPeriod: string;
//     selectedSources: string[];
//     otherComments: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
//   heating?: {
//     heatingPurchased: string;
//     heatingConsumed: string;
//     supplierName: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
//   ipps?: {
//     electricityConsumed: string;
//     emissionFactor: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
//   eac?: {
//     gridElectricity: string;
//     emissionFactor: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
//   residual?: {
//     electricityConsumed: string;
//     residualMixFactor: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
//   coolingSteam?: {
//     energyConsumed: string;
//     emissionFactor: string;
//     files?: { [key: string]: FileMetadata | null };
//   };
// }

// export interface AssessmentState {
//   currentView: string;
//   assessmentData: AssessmentData;
//   isLoading: boolean;
//   lastSaved: Date | null;
//   error: string | null;
//   isSaving: boolean;
// }

// type AssessmentAction =
//   | { type: "SET_VIEW"; payload: string }
//   | { type: "UPDATE_BASIC_DATA"; payload: Partial<AssessmentData> }
//   | {
//       type: "UPDATE_STATIONARY_ELECTRICITY_HEAT";
//       payload: NonNullable<
//         AssessmentData["stationarySources"]
//       >["electricityHeat"];
//     }
//   | {
//       type: "UPDATE_STATIONARY_INDUSTRIAL";
//       payload: NonNullable<
//         AssessmentData["stationarySources"]
//       >["industrialProcesses"];
//     }
//   | {
//       type: "UPDATE_STATIONARY_OIL_GAS";
//       payload: NonNullable<
//         AssessmentData["stationarySources"]
//       >["oilGasOperations"];
//     }
//   | {
//       type: "UPDATE_MOBILE_ROAD_TRANSPORT";
//       payload: NonNullable<AssessmentData["mobileSources"]>["roadTransport"];
//     }
//   | {
//       type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT";
//       payload: NonNullable<AssessmentData["mobileSources"]>["vehicleEquipment"];
//     }
//   | {
//       type: "UPDATE_MOBILE_MARINE_AVIATION";
//       payload: NonNullable<AssessmentData["mobileSources"]>["marineAviation"];
//     }
//   | {
//       type: "UPDATE_PROCESS_CO2_RELEASE";
//       payload: NonNullable<AssessmentData["processEmissions"]>["co2Release"];
//     }
//   | {
//       type: "UPDATE_PROCESS_FERTILIZER_EMISSIONS";
//       payload: NonNullable<
//         AssessmentData["processEmissions"]
//       >["fertilizerEmissions"];
//     }
//   | {
//       type: "UPDATE_PROCESS_GAS_FLARING";
//       payload: NonNullable<AssessmentData["processEmissions"]>["gasFlaring"];
//     }
//   | {
//       type: "UPDATE_PROCESS_ENTERIC_FERMENTATION";
//       payload: NonNullable<
//         AssessmentData["processEmissions"]
//       >["entericFermentation"];
//     }
//   | {
//       type: "UPDATE_PROCESS_METHANE_NITROUS_OXIDE";
//       payload: NonNullable<
//         AssessmentData["processEmissions"]
//       >["methaneNitrousOxide"];
//     }
//   | {
//       type: "UPDATE_FUGITIVE_METHANE_LEAKS";
//       payload: NonNullable<AssessmentData["fugitiveEmissions"]>["methaneLeaks"];
//     }
//   | {
//       type: "UPDATE_FUGITIVE_VENTING";
//       payload: NonNullable<
//         AssessmentData["fugitiveEmissions"]
//       >["ventingNaturalGas"];
//     }
//   | {
//       type: "UPDATE_FUGITIVE_INCOMPLETE_COMBUSTION";
//       payload: NonNullable<
//         AssessmentData["fugitiveEmissions"]
//       >["incompleteCombustion"];
//     }
//   | {
//       type: "UPDATE_FUGITIVE_HFC_LEAKS";
//       payload: NonNullable<AssessmentData["fugitiveEmissions"]>["hfcLeaks"];
//     }
//   // Scope 2 flattened
//   | { type: "UPDATE_ELECTRICITY"; payload: AssessmentData["electricity"] }
//   | { type: "UPDATE_COOLING"; payload: AssessmentData["cooling"] }
//   | { type: "UPDATE_STEAM"; payload: AssessmentData["steam"] }
//   | { type: "UPDATE_HEATING"; payload: AssessmentData["heating"] }
//   | { type: "UPDATE_IPPS"; payload: AssessmentData["ipps"] }
//   | { type: "UPDATE_EAC"; payload: AssessmentData["eac"] }
//   | { type: "UPDATE_RESIDUAL"; payload: AssessmentData["residual"] }
//   | { type: "UPDATE_COOLING_STEAM"; payload: AssessmentData["coolingSteam"] }
//   | { type: "SAVE_PROGRESS" }
//   | { type: "LOAD_SAVED_DATA"; payload: AssessmentData }
//   | { type: "RESET_ASSESSMENT" }
//   | { type: "SET_LOADING"; payload: boolean }
//   | { type: "SET_ERROR"; payload: string | null };

// const initialState: AssessmentState = {
//   currentView: "hub",
//   assessmentData: {
//     subsidiary: "",
//     startMonth: "",
//     startYear: "",
//     endMonth: "",
//     endYear: "",

//     // ---- Scope 1 ----
//     stationarySources: {
//       electricityHeat: {
//         dieselFuelType: "",
//         dieselVolume: 0,
//         gasFuelType: "",
//         gasVolume: 0,
//         files: {},
//       },
//       industrialProcesses: {
//         selectedFuelType: "",
//         otherFuelType: "",
//         fuelVolume: 0,
//         files: {},
//       },
//       oilGasOperations: {
//         selectedFuelType: "",
//         fuelVolume: 0,
//         files: {},
//       },
//     },
//     mobileSources: {
//       roadTransport: {
//         dieselTruckVolume: 0,
//         carPetrolVolume: 0,
//         carDieselVolume: 0,
//         files: {},
//       },
//       vehicleEquipment: {
//         forkliftFuelType: "",
//         forkliftVolume: 0,
//         heavyDutyFuelType: "",
//         heavyDutyVolume: 0,
//         tractorFuelType: "",
//         tractorVolume: 0,
//         files: {},
//       },
//       marineAviation: {
//         helicopterFuelType: "",
//         helicopterVolume: 0,
//         vesselFuelType: "",
//         otherFuelType: "",
//         vesselVolume: 0,
//         files: {},
//       },
//     },
//     processEmissions: {
//       co2Release: {
//         clinkerQuantity: 0,
//         calciumOxide: 0,
//         magnesiumOxide: 0,
//         files: {},
//       },
//       fertilizerEmissions: { products: {}, feedstock: 0, files: {} },
//       gasFlaring: { gasVolume: 0, carbonContent: 0, files: {} },
//       entericFermentation: { animals: {}, files: {} },
//       methaneNitrousOxide: {
//         animals: {},
//         manureSystem: "",
//         otherManureSystem: "",
//         files: {},
//       },
//     },
//     fugitiveEmissions: {
//       methaneLeaks: {
//         compressors: 0,
//         pumps: 0,
//         prds: 0,
//         openEnded: 0,
//         seals: 0,
//         wellheads: 0,
//         manifolds: 0,
//         hoses: 0,
//         drains: 0,
//         sampling: 0,
//         others: 0,
//         methanePercent: 0,
//         files: {},
//       },
//       ventingNaturalGas: {
//         volumeOfGasVented: 0,
//         methane: 0,
//         carbonDioxide: 0,
//         ethane: 0,
//         propane: 0,
//         butanes: 0,
//         wellheads: 0,
//         nitrogen: 0,
//         hydrogenSulfide: 0,
//         others: 0,
//         files: {},
//       },
//       incompleteCombustion: {
//         volumeToFlare: 0,
//         flareEfficiency: 0,
//         gasComposition: 0,
//       },
//       hfcLeaks: {
//         R134a: false,
//         R410A: false,
//         R404A: false,
//         R407C: false,
//         R507A: false,
//         others: 0,
//         manureSystem: "",
//         refrigerantAdded: 0,
//         files: {},
//       },
//     },

//     // ---- Scope 2 ----
//     electricity: {
//       electricityConsumed: "",
//       supplier: "",
//       files: {},
//     },
//     cooling: {
//       coolingConsumed: "",
//       selectedSystems: [],
//       otherComments: "",
//       files: {},
//     },
//     steam: {
//       volume: "",
//       selectedSources: [],
//       otherComments: "",
//       files: {},
//     },
//     heating: {
//       heatingPurchased: "",
//       heatingConsumed: "",
//       supplierName: "",
//       files: {},
//     },
//     ipps: {
//       electricityConsumed: "",
//       emissionFactor: "",
//       files: {},
//     },
//     eac: {
//       gridElectricity: "",
//       emissionFactor: "",
//       files: {},
//     },
//     residual: {
//       electricityConsumed: "",
//       residualMixFactor: "",
//       files: {},
//     },
//     coolingSteam: {
//       energyConsumed: "",
//       emissionFactor: "",
//       files: {},
//     },
//   },
//   isLoading: false,
//   lastSaved: null,
//   error: null,
//   isSaving: false,
// };

// function assessmentReducer(
//   state: AssessmentState,
//   action: AssessmentAction
// ): AssessmentState {
//   switch (action.type) {
//     case "SET_VIEW":
//       return { ...state, currentView: action.payload, error: null };
//     case "UPDATE_BASIC_DATA":
//       return {
//         ...state,
//         assessmentData: { ...state.assessmentData, ...action.payload },
//         error: null,
//       };
//     case "UPDATE_STATIONARY_ELECTRICITY_HEAT":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           stationarySources: {
//             ...(state.assessmentData.stationarySources ?? {}),
//             electricityHeat: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_STATIONARY_INDUSTRIAL":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           stationarySources: {
//             ...(state.assessmentData.stationarySources ?? {}),
//             industrialProcesses: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_STATIONARY_OIL_GAS":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           stationarySources: {
//             ...(state.assessmentData.stationarySources ?? {}),
//             oilGasOperations: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_MOBILE_ROAD_TRANSPORT":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           mobileSources: {
//             ...(state.assessmentData.mobileSources ?? {}),
//             roadTransport: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_MOBILE_VEHICLE_EQUIPMENT":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           mobileSources: {
//             ...(state.assessmentData.mobileSources ?? {}),
//             vehicleEquipment: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_MOBILE_MARINE_AVIATION":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           mobileSources: {
//             ...(state.assessmentData.mobileSources ?? {}),
//             marineAviation: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_PROCESS_CO2_RELEASE":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           processEmissions: {
//             ...(state.assessmentData.processEmissions ?? {}),
//             co2Release: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_PROCESS_FERTILIZER_EMISSIONS":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           processEmissions: {
//             ...(state.assessmentData.processEmissions ?? {}),
//             fertilizerEmissions: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_PROCESS_GAS_FLARING":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           processEmissions: {
//             ...(state.assessmentData.processEmissions ?? {}),
//             gasFlaring: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_PROCESS_ENTERIC_FERMENTATION":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           processEmissions: {
//             ...(state.assessmentData.processEmissions ?? {}),
//             entericFermentation: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_PROCESS_METHANE_NITROUS_OXIDE":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           processEmissions: {
//             ...(state.assessmentData.processEmissions ?? {}),
//             methaneNitrousOxide: action.payload,
//           },
//         },
//         error: null,
//       };

//     case "UPDATE_FUGITIVE_METHANE_LEAKS":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           fugitiveEmissions: {
//             ...(state.assessmentData.fugitiveEmissions ?? {}),
//             methaneLeaks: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_FUGITIVE_VENTING":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           fugitiveEmissions: {
//             ...(state.assessmentData.fugitiveEmissions ?? {}),
//             ventingNaturalGas: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_FUGITIVE_INCOMPLETE_COMBUSTION":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           fugitiveEmissions: {
//             ...(state.assessmentData.fugitiveEmissions ?? {}),
//             incompleteCombustion: action.payload,
//           },
//         },
//         error: null,
//       };
//     case "UPDATE_FUGITIVE_HFC_LEAKS":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           fugitiveEmissions: {
//             ...(state.assessmentData.fugitiveEmissions ?? {}),
//             hfcLeaks: action.payload,
//           },
//         },
//         error: null,
//       };

//     // Scope 2
//     case "UPDATE_ELECTRICITY":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           electricity: action.payload,
//         },
//       };

//     case "UPDATE_COOLING":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           cooling: action.payload,
//         },
//       };

//     case "UPDATE_STEAM":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           steam: action.payload,
//         },
//       };

//     case "UPDATE_HEATING":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           heating: action.payload,
//         },
//       };

//     case "UPDATE_IPPS":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           ipps: action.payload,
//         },
//       };

//     case "UPDATE_EAC":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           eac: action.payload,
//         },
//       };

//     case "UPDATE_RESIDUAL":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           residual: action.payload,
//         },
//       };

//     case "UPDATE_COOLING_STEAM":
//       return {
//         ...state,
//         assessmentData: {
//           ...state.assessmentData,
//           coolingSteam: action.payload,
//         },
//       };

//     case "SAVE_PROGRESS":
//       try {
//         localStorage.setItem(
//           "esg-assessment-data",
//           JSON.stringify(state.assessmentData)
//         );
//         return {
//           ...state,
//           lastSaved: new Date(),
//           isSaving: false,
//           error: null,
//         };
//       } catch (error) {
//         return {
//           ...state,
//           error: "Failed to save progress",
//           isSaving: false,
//         };
//       }
//     case "LOAD_SAVED_DATA":
//       return {
//         ...state,
//         assessmentData: action.payload,
//         isLoading: false,
//         error: null,
//       };
//     case "RESET_ASSESSMENT":
//       try {
//         localStorage.removeItem("esg-assessment-data");
//         return { ...initialState };
//       } catch (error) {
//         return { ...state, error: "Failed to reset assessment" };
//       }
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload };
//     case "SET_ERROR":
//       return {
//         ...state,
//         error: action.payload,
//         isLoading: false,
//         isSaving: false,
//       };
//     default:
//       return state;
//   }
// }

// export const AssessmentContext = createContext<{
//   state: AssessmentState;
//   dispatch: React.Dispatch<AssessmentAction>;
// } | null>(null);

// export function AssessmentProvider({ children }: { children: ReactNode }) {
//   const [state, dispatch] = useReducer(assessmentReducer, initialState);

//   React.useEffect(() => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     const savedData = localStorage.getItem("esg-assessment-data");
//     if (savedData) {
//       try {
//         const parsedData = JSON.parse(savedData);
//         dispatch({ type: "LOAD_SAVED_DATA", payload: parsedData });
//       } catch {
//         dispatch({
//           type: "SET_ERROR",
//           payload: "Failed to load saved assessment data",
//         });
//       }
//     }
//     dispatch({ type: "SET_LOADING", payload: false });
//   }, []);

//   return (
//     <AssessmentContext.Provider value={{ state, dispatch }}>
//       {children}
//     </AssessmentContext.Provider>
//   );
// }

// export function useAssessment() {
//   const context = useContext(AssessmentContext);
//   if (!context) {
//     throw new Error("useAssessment must be used within an AssessmentProvider");
//   }
//   return context;
// }
