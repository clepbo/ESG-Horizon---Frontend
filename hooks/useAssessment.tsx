"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    type ReactNode,
} from "react";

interface FileMetadata {
    name: string;
    size: number;
    lastModified: number;
}

export interface AssessmentData {
    subsidiary: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    stationarySources?: {
        electricityHeat?: {
            dieselFuelType?: string;
            dieselVolume?: string;
            gasFuelType?: string;
            gasVolume?: string;
            files?: { [key: string]: FileMetadata | null };
        };
        industrialProcesses?: {
            selectedFuelType: string;
            otherFuelType: string;
            fuelVolume: string;
            files?: { [key: string]: FileMetadata | null };
        };
        oilGasOperations?: {
            selectedFuelType: string;
            fuelVolume: string;
            files?: { [key: string]: FileMetadata | null };
        };
    };
    mobileSources?: {
        roadTransport?: {
            dieselTruckVolume: string;
            carPetrolVolume: string;
            carDieselVolume: string;
            files?: { [key: string]: FileMetadata | null };
        };
        vehicleEquipment?: {
            forkliftFuelType: string;
            forkliftVolume: string;
            heavyDutyFuelType: string;
            heavyDutyVolume: string;
            tractorFuelType: string;
            tractorVolume: string;
            files?: { [key: string]: FileMetadata | null };
        };
        marineAviation?: {
            helicopterFuelType: string;
            helicopterVolume: string;
            vesselFuelType: string;
            otherFuelType: string;
            vesselVolume: string;
            files?: { [key: string]: FileMetadata | null };
        };
    };
    processEmissions?: {
        methaneNitrousOxide?: {
            animals: { [type: string]: number };
            manureSystem: string;
            otherManureSystem: string;
            files?: { [key: string]: FileMetadata | null };
        };
        co2Release?: {
            clinkerQuantity: string;
            calciumOxide: string;
            magnesiumOxide: string;
            files?: { [key: string]: FileMetadata | null };
        };
        fertilizerEmissions?: {
            products: { [product: string]: string };
            feedstock: string;
            files?: { [key: string]: FileMetadata | null };
        };
        gasFlaring?: {
            gasVolume: string;
            carbonContent: string;
            files?: { [key: string]: FileMetadata | null };
        };
        entericFermentation?: {
            animals: { [type: string]: number };
            files?: { [key: string]: FileMetadata | null };
        };
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
        stationarySources: {},
        mobileSources: {},
        processEmissions: {},
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
        throw new Error(
            "useAssessment must be used within an AssessmentProvider"
        );
    }
    return context;
}
