"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    type ReactNode,
} from "react";

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
            manureSystem: string;
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
}

export interface AssessmentState {
    currentView: string;
    assessmentData: AssessmentData;
    isLoading: boolean;
    error: string | null;
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
          payload: NonNullable<
              AssessmentData["mobileSources"]
          >["roadTransport"];
      }
    | {
          type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT";
          payload: NonNullable<
              AssessmentData["mobileSources"]
          >["vehicleEquipment"];
      }
    | {
          type: "UPDATE_MOBILE_MARINE_AVIATION";
          payload: NonNullable<
              AssessmentData["mobileSources"]
          >["marineAviation"];
      }
    | {
          type: "UPDATE_PROCESS_CEMENT_MANUFACTURING";
          payload: NonNullable<
              AssessmentData["processEmissions"]
          >["cementManufacturing"];
      }
    | {
          type: "UPDATE_PROCESS_GAS_FLARING";
          payload: NonNullable<
              AssessmentData["processEmissions"]
          >["gasFlaring"];
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
                manureSystem: "",
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
    },
    isLoading: false,
    error: null,
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
        <AssessmentContext.Provider value={{ state, dispatch }}>
            {children}
        </AssessmentContext.Provider>
    );
}

export function useAssessment() {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error(
            "useAssessment must be used within an AssessmentProvider"
        );
    }
    return context;
}