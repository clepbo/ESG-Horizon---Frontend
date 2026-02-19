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
  overallProgress?: number;
  scopeTotals?: ScopeTotals;
  totals?: TotalsResponse;
  humanCapital?: any;
  socialCapital?: any;
  businessInnovation?: any;
  businessModel?: any;
  businessModelAndInnovation?: any;
  activityMetrics?: {
    productionVolume?: {
      progress?: number;
      [key: string]: any;
    };
    assetPortfolio?: {
      offshoreSites?: {
        progress?: number;
        [key: string]: any;
      };
      terrestrialSites?: {
        progress?: number;
        [key: string]: any;
      };
    };
  };
  environment?: {
    overallProgress?: number;
    ghg?: {
      scope1?: {
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
      };
      scope2?: {
        locationBased?: {
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
        };
        marketBased?: {
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
        };
      };
      scope3?: {
        upstream?: {
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
            materialWeight?: string;
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
            massTransported?: string;
            distanceTravelled?: string;
            logisticsSpend?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
          wasteGeneratedInOperations?: {
            wasteWeight?: string;
            selectedMethods?: string[];
            otherMethodValue?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
          businessTravel?: {
            totalFlights?: string;
            airDistance?: string;
            airEmployees?: string;
            economyPercent?: string;
            businessPercent?: string;
            firstClassPercent?: string;
            groundDistance?: string;
            groundEmployees?: string;
            fuelConsumed?: string;
            hotelNights?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
          employeeCommuting?: {
            numberOfEmployees?: string;
            averageDistance?: string;
            workdaysPerYear?: string;
            selectedMethods?: string[];
            otherMethodValue?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
          upstreamLeasedAssets?: {
            electricityConsumed?: string;
            fuelConsumed?: string;
            floorArea?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
        };
        downstream?: {
          downstreamTransportationDistribution?: {
            massOfProductsSold?: string;
            averageDistributionDistance?: string;
            fuelConsumedByDistribution?: string;
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
            selectedMethods?: { [key: string]: boolean };
            otherDisposalMethod?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
          downstreamLeasedAssets?: {
            electricityConsumed?: string;
            otherEnergyConsumed?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
          franchises?: {
            fuelConsumption?: string;
            electricityConsumption?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
          investments?: {
            investmentAmount?: string;
            portfolioEmissions?: string;
            files?: { [key: string]: FileMetadata | null };
            additionalFields?: FileMetadata[];
          };
        };
      };
    };
    airQuality?: {
      airPollutantEmissions?: {
        progress?: number;
        [key: string]: any;
      };
    };
    waterManagement?: {
      waterAndProducedWaterManagement?: {
        freshwaterWithdrawals?: {
          progress?: number;
          [key: string]: any;
        };
        producedWaterManagement?: {
          progress?: number;
          [key: string]: any;
        };
      };
      hydraulicFracturingImpacts?: {
        chemicalDisclosure?: {
          progress?: number;
          [key: string]: any;
        };
        waterQualityImpacts?: {
          progress?: number;
          [key: string]: any;
        };
      };
    };
    biodiversityImpact?: {
      environmentalManagement?: {
        environmentalManagementPolicies?: {
          progress?: number;
          [key: string]: any;
        };
        hydrocarbonSpills?: {
          progress?: number;
          [key: string]: any;
        };
        reservesInSensitiveAreas?: {
          progress?: number;
          [key: string]: any;
        };
      };
    };
    activityMetrics?: {
      productionVolume?: {
        progress?: number;
        [key: string]: any;
      };
      assetPortfolio?: {
        offshoreSites?: {
          progress?: number;
          [key: string]: any;
        };
        terrestrialSites?: {
          progress?: number;
          [key: string]: any;
        };
      };
    };
    businessInnovation?: {
      businessEthicsAndTransparency?: {
        reservesInCountriesWithHighCorruptionRisk?: {
          progress?: number;
          [key: string]: any;
        };
        antiCorruptionManagementSystem?: {
          progress?: number;
          [key: string]: any;
        };
      };
      reservesValuationAndCapitalExpenditures?: {
        reservesSensitivityToCarbonPricing?: {
          progress?: number;
          [key: string]: any;
        };
        embeddedCarbonInReserves?: {
          progress?: number;
          [key: string]: any;
        };
        renewableEnergyInvestment?: {
          progress?: number;
          [key: string]: any;
        };
        capitalExpenditureStrategy?: {
          progress?: number;
          [key: string]: any;
        };
      };
    };
    leadershipGovernance?: {
      criticalIncidentRiskManagement?: {
        catastrophicRiskManagementSystems?: {
          progress?: number;
          [key: string]: any;
        };
        processSafetyEvents?: {
          progress?: number;
          [key: string]: any;
        };
      };
      managementOfTheLegalAndRegulatoryEnvironment?: {
        boardAndManagementOversight?: {
          progress?: number;
          [key: string]: any;
        };
        publicPolicyEngagement?: {
          progress?: number;
          [key: string]: any;
        };
      };
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
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["stationarySources"]
    >["electricityHeat"];
  }
  | {
    type: "UPDATE_STATIONARY_INDUSTRIAL";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["stationarySources"]
    >["industrialProcesses"];
  }
  | {
    type: "UPDATE_STATIONARY_OIL_GAS";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["stationarySources"]
    >["oilGasOperations"];
  }
  | {
    type: "UPDATE_MOBILE_ROAD_TRANSPORT";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["mobileSources"]
    >["roadTransport"];
  }
  | {
    type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["mobileSources"]
    >["vehicleEquipment"];
  }
  | {
    type: "UPDATE_MOBILE_MARINE_AVIATION";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["mobileSources"]
    >["marineAviation"];
  }
  | {
    type: "UPDATE_PROCESS_CEMENT_MANUFACTURING";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["processEmissions"]
    >["cementManufacturing"];
  }
  | {
    type: "UPDATE_PROCESS_GAS_FLARING";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["processEmissions"]
    >["gasFlaring"];
  }
  | {
    type: "UPDATE_FUGITIVE_VENTING";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["fugitiveEmissions"]
    >["ventingNaturalGas"];
  }
  | {
    type: "UPDATE_FUGITIVE_HFC";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope1"]
      >["fugitiveEmissions"]
    >["hfcLeaks"];
  }
  // Scope 2 flattened
  | {
    type: "UPDATE_LOCATION_ELECTRICITY";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["locationBased"]
    >["electricity"];
  }
  | {
    type: "UPDATE_LOCATION_COOLING";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["locationBased"]
    >["cooling"];
  }
  | {
    type: "UPDATE_LOCATION_STEAM";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["locationBased"]
    >["steam"];
  }
  | {
    type: "UPDATE_LOCATION_HEATING";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["locationBased"]
    >["heating"];
  }
  | {
    type: "UPDATE_MARKET_IPPS";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["marketBased"]
    >["ipps"];
  }
  | {
    type: "UPDATE_MARKET_EAC";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["marketBased"]
    >["eac"];
  }
  | {
    type: "UPDATE_MARKET_RESIDUAL";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["marketBased"]
    >["residual"];
  }
  | {
    type: "UPDATE_MARKET_COOLING_STEAM";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope2"]
      >["marketBased"]
    >["coolingSteam"];
  }
  // Scope 3 Upstream
  | {
    type: "UPDATE_UPSTREAM_PURCHASED_GOODS";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["purchasedGoodsAndServices"];
  }
  | {
    type: "UPDATE_UPSTREAM_CAPITAL_GOODS";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["capitalGoods"];
  }
  | {
    type: "UPDATE_UPSTREAM_FUEL_ENERGY";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["fuelEnergyRelatedActivities"];
  }
  | {
    type: "UPDATE_UPSTREAM_TRANSPORTATION";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["upstreamTransportationDistribution"];
  }
  | {
    type: "UPDATE_UPSTREAM_WASTE";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["wasteGeneratedInOperations"];
  }
  | {
    type: "UPDATE_UPSTREAM_BUSINESS_TRAVEL";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["businessTravel"];
  }
  | {
    type: "UPDATE_UPSTREAM_EMPLOYEE_COMMUTING";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["employeeCommuting"];
  }
  | {
    type: "UPDATE_UPSTREAM_LEASED_ASSETS";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["upstream"]
    >["upstreamLeasedAssets"];
  }
  // Scope 3 Downstream
  | {
    type: "UPDATE_DOWNSTREAM_TRANSPORTATION";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["downstream"]
    >["downstreamTransportationDistribution"];
  }
  | {
    type: "UPDATE_DOWNSTREAM_PROCESSING_SOLD";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["downstream"]
    >["processingSoldProducts"];
  }
  | {
    type: "UPDATE_DOWNSTREAM_USE_OF_SOLD";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["downstream"]
    >["useOfSoldProducts"];
  }
  | {
    type: "UPDATE_DOWNSTREAM_END_OF_LIFE";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["downstream"]
    >["endOfLifeTreatment"];
  }
  | {
    type: "UPDATE_DOWNSTREAM_LEASED_ASSETS";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["downstream"]
    >["downstreamLeasedAssets"];
  }
  | {
    type: "UPDATE_DOWNSTREAM_FRANCHISES";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["downstream"]
    >["franchises"];
  }
  | {
    type: "UPDATE_DOWNSTREAM_INVESTMENTS";
    payload: NonNullable<
      NonNullable<
        NonNullable<NonNullable<AssessmentData["environment"]>["ghg"]>["scope3"]
      >["downstream"]
    >["investments"];
  }
  // Air Quality
  | { type: "UPDATE_AIR_QUALITY"; payload: any }
  // Water Management
  | { type: "UPDATE_WATER_FRESHWATER"; payload: any }
  | { type: "UPDATE_WATER_PRODUCED"; payload: any }
  | { type: "UPDATE_WATER_CHEMICAL"; payload: any }
  | { type: "UPDATE_WATER_QUALITY"; payload: any }
  // Biodiversity
  | { type: "UPDATE_BIODIVERSITY_POLICIES"; payload: any }
  | { type: "UPDATE_BIODIVERSITY_SPILLS"; payload: any }
  | { type: "UPDATE_BIODIVERSITY_RESERVES"; payload: any }
  | { type: "UPDATE_ACTIVITY_METRICS"; payload: { section: string; data: any } }
  | { type: "UPDATE_ASSET_PORTFOLIO"; payload: { section: string; data: any } }
  | {
    type: "UPDATE_BUSINESS_INNOVATION";
    payload: { category: string; section: string; data: any };
  }
  | {
    type: "UPDATE_LEADERSHIP_GOVERNANCE";
    payload: { category: string; section: string; data: any };
  }
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
    environment: {
      ghg: {
        scope1: {
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
        },
        scope2: {
          locationBased: {
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
          },
          marketBased: {
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
        },
        scope3: {
          upstream: {
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
              materialWeight: "",
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
              massTransported: "",
              distanceTravelled: "",
              logisticsSpend: "",
              files: {},
              additionalFields: [],
            },
            wasteGeneratedInOperations: {
              wasteWeight: "",
              selectedMethods: [],
              otherMethodValue: "",
              files: {},
              additionalFields: [],
            },
            businessTravel: {
              totalFlights: "",
              airDistance: "",
              airEmployees: "",
              economyPercent: "",
              businessPercent: "",
              firstClassPercent: "",
              groundDistance: "",
              groundEmployees: "",
              fuelConsumed: "",
              hotelNights: "",
              files: {},
              additionalFields: [],
            },
            employeeCommuting: {
              numberOfEmployees: "",
              averageDistance: "",
              workdaysPerYear: "",
              selectedMethods: [],
              otherMethodValue: "",
              files: {},
              additionalFields: [],
            },
            upstreamLeasedAssets: {
              electricityConsumed: "",
              fuelConsumed: "",
              floorArea: "",
              files: {},
              additionalFields: [],
            },
          },
          downstream: {
            downstreamTransportationDistribution: {
              massOfProductsSold: "",
              averageDistributionDistance: "",
              fuelConsumedByDistribution: "",
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
              selectedMethods: {
                landfill: false,
                recycling: false,
                composting: false,
                incineration: false,
                others: false,
              },
              otherDisposalMethod: "",
              files: {},
              additionalFields: [],
            },
            downstreamLeasedAssets: {
              electricityConsumed: "",
              otherEnergyConsumed: "",
              files: {},
              additionalFields: [],
            },
            franchises: {
              fuelConsumption: "",
              electricityConsumption: "",
              files: {},
              additionalFields: [],
            },
            investments: {
              investmentAmount: "",
              portfolioEmissions: "",
              files: {},
              additionalFields: [],
            },
          },
        },
      },
      airQuality: {
        airPollutantEmissions: {},
      },
      waterManagement: {
        waterAndProducedWaterManagement: {
          freshwaterWithdrawals: {},
          producedWaterManagement: {},
        },
        hydraulicFracturingImpacts: {
          chemicalDisclosure: {},
          waterQualityImpacts: {},
        },
      },
      biodiversityImpact: {
        environmentalManagement: {
          environmentalManagementPolicies: {},
          hydrocarbonSpills: {},
          reservesInSensitiveAreas: {},
        },
      },
      activityMetrics: {
        productionVolume: {},
        assetPortfolio: {
          offshoreSites: {},
          terrestrialSites: {},
        },
      },
      businessInnovation: {
        businessEthicsAndTransparency: {
          reservesInCountriesWithHighCorruptionRisk: {},
          antiCorruptionManagementSystem: {},
        },
        reservesValuationAndCapitalExpenditures: {
          reservesSensitivityToCarbonPricing: {},
          embeddedCarbonInReserves: {},
          renewableEnergyInvestment: {},
          capitalExpenditureStrategy: {},
        },
      },
      leadershipGovernance: {
        criticalIncidentRiskManagement: {
          catastrophicRiskManagementSystems: {},
          processSafetyEvents: {},
        },
        managementOfTheLegalAndRegulatoryEnvironment: {
          boardAndManagementOversight: {},
          publicPolicyEngagement: {},
        },
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
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                stationarySources: {
                  ...state.assessmentData.environment?.ghg?.scope1?.stationarySources,
                  electricityHeat: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };
    case "UPDATE_STATIONARY_INDUSTRIAL":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                stationarySources: {
                  ...state.assessmentData.environment?.ghg?.scope1?.stationarySources,
                  industrialProcesses: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };
    case "UPDATE_STATIONARY_OIL_GAS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                stationarySources: {
                  ...state.assessmentData.environment?.ghg?.scope1?.stationarySources,
                  oilGasOperations: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };
    case "UPDATE_MOBILE_ROAD_TRANSPORT":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                mobileSources: {
                  ...state.assessmentData.environment?.ghg?.scope1?.mobileSources,
                  roadTransport: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };
    case "UPDATE_MOBILE_VEHICLE_EQUIPMENT":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                mobileSources: {
                  ...state.assessmentData.environment?.ghg?.scope1?.mobileSources,
                  vehicleEquipment: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };
    case "UPDATE_MOBILE_MARINE_AVIATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                mobileSources: {
                  ...state.assessmentData.environment?.ghg?.scope1?.mobileSources,
                  marineAviation: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };
    case "UPDATE_PROCESS_CEMENT_MANUFACTURING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                processEmissions: {
                  ...state.assessmentData.environment?.ghg?.scope1?.processEmissions,
                  cementManufacturing: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };

    case "UPDATE_PROCESS_GAS_FLARING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                processEmissions: {
                  ...state.assessmentData.environment?.ghg?.scope1?.processEmissions,
                  gasFlaring: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };

    case "UPDATE_FUGITIVE_VENTING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                fugitiveEmissions: {
                  ...state.assessmentData.environment?.ghg?.scope1?.fugitiveEmissions,
                  ventingNaturalGas: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };

    case "UPDATE_FUGITIVE_HFC":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope1: {
                ...state.assessmentData.environment?.ghg?.scope1,
                fugitiveEmissions: {
                  ...state.assessmentData.environment?.ghg?.scope1?.fugitiveEmissions,
                  hfcLeaks: action.payload,
                },
              },
            },
          },
        },
        error: null,
      };

    // Scope 2
    case "UPDATE_LOCATION_ELECTRICITY":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                locationBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.locationBased,
                  electricity: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_LOCATION_COOLING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                locationBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.locationBased,
                  cooling: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_LOCATION_STEAM":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                locationBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.locationBased,
                  steam: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_LOCATION_HEATING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                locationBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.locationBased,
                  heating: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_MARKET_IPPS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                marketBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.marketBased,
                  ipps: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_MARKET_EAC":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                marketBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.marketBased,
                  eac: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_MARKET_RESIDUAL":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                marketBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.marketBased,
                  residual: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_MARKET_COOLING_STEAM":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope2: {
                ...state.assessmentData.environment?.ghg?.scope2,
                marketBased: {
                  ...state.assessmentData.environment?.ghg?.scope2?.marketBased,
                  coolingSteam: action.payload,
                },
              },
            },
          },
        },
      };

    // Scope 3 Upstream
    case "UPDATE_UPSTREAM_PURCHASED_GOODS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  purchasedGoodsAndServices: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_UPSTREAM_CAPITAL_GOODS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  capitalGoods: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_UPSTREAM_FUEL_ENERGY":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  fuelEnergyRelatedActivities: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_UPSTREAM_TRANSPORTATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  upstreamTransportationDistribution: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_UPSTREAM_WASTE":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  wasteGeneratedInOperations: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_UPSTREAM_BUSINESS_TRAVEL":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  businessTravel: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_UPSTREAM_EMPLOYEE_COMMUTING":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  employeeCommuting: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_UPSTREAM_LEASED_ASSETS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                upstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.upstream,
                  upstreamLeasedAssets: action.payload,
                },
              },
            },
          },
        },
      };

    // Scope 3 Downstream
    case "UPDATE_DOWNSTREAM_TRANSPORTATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                downstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.downstream,
                  downstreamTransportationDistribution: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_DOWNSTREAM_PROCESSING_SOLD":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                downstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.downstream,
                  processingSoldProducts: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_DOWNSTREAM_USE_OF_SOLD":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                downstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.downstream,
                  useOfSoldProducts: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_DOWNSTREAM_END_OF_LIFE":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                downstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.downstream,
                  endOfLifeTreatment: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_DOWNSTREAM_LEASED_ASSETS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                downstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.downstream,
                  downstreamLeasedAssets: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_DOWNSTREAM_FRANCHISES":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                downstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.downstream,
                  franchises: action.payload,
                },
              },
            },
          },
        },
      };

    case "UPDATE_DOWNSTREAM_INVESTMENTS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            ghg: {
              ...state.assessmentData.environment?.ghg,
              scope3: {
                ...state.assessmentData.environment?.ghg?.scope3,
                downstream: {
                  ...state.assessmentData.environment?.ghg?.scope3?.downstream,
                  investments: action.payload,
                },
              },
            },
          },
        },
      };

    // Air Quality
    case "UPDATE_AIR_QUALITY":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            airQuality: {
              ...state.assessmentData.environment?.airQuality,
              airPollutantEmissions: action.payload,
            },
          },
        },
      };

    // Water Management
    case "UPDATE_WATER_FRESHWATER":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            waterManagement: {
              ...state.assessmentData.environment?.waterManagement,
              waterAndProducedWaterManagement: {
                ...state.assessmentData.environment?.waterManagement
                  ?.waterAndProducedWaterManagement,
                freshwaterWithdrawals: action.payload,
              },
            },
          },
        },
      };

    case "UPDATE_WATER_PRODUCED":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            waterManagement: {
              ...state.assessmentData.environment?.waterManagement,
              waterAndProducedWaterManagement: {
                ...state.assessmentData.environment?.waterManagement
                  ?.waterAndProducedWaterManagement,
                producedWaterManagement: action.payload,
              },
            },
          },
        },
      };

    case "UPDATE_WATER_CHEMICAL":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            waterManagement: {
              ...state.assessmentData.environment?.waterManagement,
              hydraulicFracturingImpacts: {
                ...state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts,
                chemicalDisclosure: action.payload,
              },
            },
          },
        },
      };

    case "UPDATE_WATER_QUALITY":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            waterManagement: {
              ...state.assessmentData.environment?.waterManagement,
              hydraulicFracturingImpacts: {
                ...state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts,
                waterQualityImpacts: action.payload,
              },
            },
          },
        },
      };

    // Biodiversity
    case "UPDATE_BIODIVERSITY_POLICIES":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            biodiversityImpact: {
              ...state.assessmentData.environment?.biodiversityImpact,
              environmentalManagement: {
                ...state.assessmentData.environment?.biodiversityImpact?.environmentalManagement,
                environmentalManagementPolicies: action.payload,
              },
            },
          },
        },
      };

    case "UPDATE_BIODIVERSITY_SPILLS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            biodiversityImpact: {
              ...state.assessmentData.environment?.biodiversityImpact,
              environmentalManagement: {
                ...state.assessmentData.environment?.biodiversityImpact?.environmentalManagement,
                hydrocarbonSpills: action.payload,
              },
            },
          },
        },
      };

    case "UPDATE_BIODIVERSITY_RESERVES":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            biodiversityImpact: {
              ...state.assessmentData.environment?.biodiversityImpact,
              environmentalManagement: {
                ...state.assessmentData.environment?.biodiversityImpact?.environmentalManagement,
                reservesInSensitiveAreas: action.payload,
              },
            },
          },
        },
      };
    case "UPDATE_ACTIVITY_METRICS":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            activityMetrics: {
              ...state.assessmentData.environment?.activityMetrics,
              [action.payload.section]: action.payload.data,
            },
          },
        },
      };

    case "UPDATE_ASSET_PORTFOLIO":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            activityMetrics: {
              ...state.assessmentData.environment?.activityMetrics,
              assetPortfolio: {
                ...state.assessmentData.environment?.activityMetrics?.assetPortfolio,
                [action.payload.section]: action.payload.data,
              },
            },
          },
        },
      };

    case "UPDATE_BUSINESS_INNOVATION":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            businessInnovation: {
              ...state.assessmentData.environment?.businessInnovation,
              [action.payload.category]: {
                ...state.assessmentData.environment?.businessInnovation?.[
                action.payload.category as keyof NonNullable<
                  NonNullable<AssessmentData["environment"]>["businessInnovation"]
                >
                ],
                [action.payload.section]: action.payload.data,
              },
            },
          },
        },
      };

    case "UPDATE_LEADERSHIP_GOVERNANCE":
      return {
        ...state,
        assessmentData: {
          ...state.assessmentData,
          environment: {
            ...state.assessmentData.environment,
            leadershipGovernance: {
              ...state.assessmentData.environment?.leadershipGovernance,
              [action.payload.category]: {
                ...state.assessmentData.environment?.leadershipGovernance?.[
                action.payload.category as keyof NonNullable<
                  NonNullable<AssessmentData["environment"]>["leadershipGovernance"]
                >
                ],
                [action.payload.section]: action.payload.data,
              },
            },
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
          environment: {
            ...state.assessmentData.environment,
            ...(action.payload.environment || {}),
            businessInnovation: {
              ...state.assessmentData.environment?.businessInnovation,
              ...(action.payload.environment?.businessInnovation || {}),
            },
          },
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
