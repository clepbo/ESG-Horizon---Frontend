"use client";

import Header from "../components/Header";
import { ESGJourneyChart } from "../components/ESGJourneyChart";
import {
  AssessmentProvider,
  useAssessment,
  type SourceData,
} from "@/hooks/useAssessment";
import { Scope1EmissionsChart } from "./components/Scope1EmissionsChart";
import { Scope2EmissionsChart } from "./components/Scope2EmissionsChart";
import { EmissionsBreakdownChart } from "./components/EmissionsBreakdownChart";
import { AssessmentProgressCard } from "./components/AssessmentProgressCard";
import { DataQualityIndicator } from "./components/DataQualityIndicator";
import { EmissionsSummaryCard } from "./components/EmissionsSummaryCard";
import React from "react"; // Import React for useMemo and useCallback

// Helper function to safely convert a value to a number.
// Moved outside the component to ensure a stable reference.
const toNumber = (val: unknown): number =>
  typeof val === "string" && !isNaN(parseFloat(val))
    ? parseFloat(val)
    : typeof val === "number" && !isNaN(val)
    ? val
    : 0;

// Helper function to calculate total emissions for an array of SourceData.
// Moved outside the component as it's a pure function and doesn't rely on component state.
const calculateSourceEmissions = (
  sources: SourceData[] | undefined
): number => {
  if (!sources) return 0;
  return sources.reduce((sum, s) => {
    const volume = toNumber(s.volume);
    const factor = s.emissionFactor;
    return sum + volume * factor;
  }, 0);
};

function ReportsContent() {
  const { state } = useAssessment();
  const data = state.assessmentData;

  // Since the calculation functions are now pure and defined outside the component,
  // we can use useMemo with 'data' as the only dependency.
  const calculateScope1Total = React.useMemo(() => {
    let scope1 = 0;

    // Stationary Sources
    if (data.stationarySources) {
      scope1 += calculateSourceEmissions(
        data.stationarySources.electricityHeat?.dieselGenerators
      );
      scope1 += calculateSourceEmissions(
        data.stationarySources.electricityHeat?.gasTurbines
      );
      scope1 += calculateSourceEmissions(
        data.stationarySources.industrialProcesses?.boilerFurnaces
      );
      scope1 += calculateSourceEmissions(
        data.stationarySources.oilGasOperations?.onShoreProduction
      );
    }

    // Mobile Sources
    if (data.mobileSources) {
      scope1 += calculateSourceEmissions(
        data.mobileSources.roadTransport?.vehicleFleet
      );
      scope1 += calculateSourceEmissions(
        data.mobileSources.roadTransport?.carsBuses
      );
      scope1 += calculateSourceEmissions(
        data.mobileSources.vehicleEquipment?.forkliftFuelType
      );
      scope1 += calculateSourceEmissions(
        data.mobileSources.vehicleEquipment?.heavyDutyFuelType
      );
      scope1 += calculateSourceEmissions(
        data.mobileSources.vehicleEquipment?.tractorFuelType
      );
      scope1 += calculateSourceEmissions(
        data.mobileSources.marineAviation?.air
      );
      scope1 += calculateSourceEmissions(
        data.mobileSources.marineAviation?.marine
      );
    }

    // Process Emissions
    if (data.processEmissions) {
      const cementEmissions =
        toNumber(data.processEmissions.cementManufacturing?.cementQuantity) *
        0.44; // Example factor
      if (!isNaN(cementEmissions)) scope1 += cementEmissions;

      const gasFlaringEmissions =
        toNumber(data.processEmissions.gasFlaring?.gasVolume) *
        toNumber(data.processEmissions.gasFlaring?.carbonContent);
      if (!isNaN(gasFlaringEmissions)) scope1 += gasFlaringEmissions;
    }

    // Fugitive Emissions
    if (data.fugitiveEmissions) {
      const ventingEmissions =
        toNumber(data.fugitiveEmissions.ventingNaturalGas?.volumeOfGasVented) *
        0.002; // Example factor
      if (!isNaN(ventingEmissions)) scope1 += ventingEmissions;

      const hfcEmissions =
        toNumber(data.fugitiveEmissions.hfcLeaks?.refrigerantAdded) * 1430; // Example GWP
      if (!isNaN(hfcEmissions)) scope1 += hfcEmissions;
    }

    return scope1;
  }, [data]);

  const calculateScope2Total = React.useMemo(() => {
    let scope2 = 0;
    if (data.electricity)
      scope2 += toNumber(data.electricity.electricityConsumed) * 0.35; // Example factor
    if (data.cooling) scope2 += toNumber(data.cooling.coolingConsumed) * 0.1; // Example factor
    if (data.steam) scope2 += toNumber(data.steam.volume) * 0.2; // Example factor
    if (data.heating) scope2 += toNumber(data.heating.heatingPurchased) * 0.15; // Example factor
    if (data.ipps)
      scope2 +=
        toNumber(data.ipps.electricityConsumed) *
        toNumber(data.ipps.emissionFactor);
    if (data.eac)
      scope2 +=
        toNumber(data.eac.gridElectricity) * toNumber(data.eac.emissionFactor);
    if (data.residual)
      scope2 +=
        toNumber(data.residual.electricityConsumed) *
        toNumber(data.residual.residualMixFactor);
    if (data.coolingSteam)
      scope2 +=
        toNumber(data.coolingSteam.energyConsumed) *
        toNumber(data.coolingSteam.emissionFactor);
    return scope2;
  }, [data]);

  const scope1 = calculateScope1Total;
  const scope2 = calculateScope2Total;
  const total = scope1 + scope2;

  // A more dynamic way to calculate progress
  const totalSections = 14; // Total number of sections in the assessment
  const completedSections = Object.entries(data).filter(([value]) => {
    // Check if the section object exists and has at least one filled field
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some(
        (field) =>
          (Array.isArray(field) && field.length > 0) || // Check if array is not empty
          (typeof field === "string" && field.trim() !== "") || // Check if string is not empty
          (typeof field === "number" && field !== 0) // Check if number is not zero
      );
    }
    return false;
  }).length;
  const progress = Math.round((completedSections / totalSections) * 100);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <main className="flex-1 h-full overflow-y-auto p-6">
        <Header />
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive ESG assessment reports and emissions analytics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-600">Total Emissions (tCO₂e)</p>
              <p className="text-2xl font-bold">{total.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-600">Scope 1 (tCO₂e)</p>
              <p className="text-2xl font-bold">{scope1.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-600">Scope 2 (tCO₂e)</p>
              <p className="text-2xl font-bold">{scope2.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-600">Assessment Progress</p>
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-sm text-gray-500">
                {completedSections} of {totalSections} sections
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Scope1EmissionsChart />
            <Scope2EmissionsChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <EmissionsBreakdownChart />
            <AssessmentProgressCard />
            <DataQualityIndicator />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmissionsSummaryCard />
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold">ESG Journey Overview</h3>
              <ESGJourneyChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReportsAnalyticsPage() {
  return (
    <AssessmentProvider>
      <ReportsContent />
    </AssessmentProvider>
  );
}
// "use client";

// import Header from "../components/Header";
// import { ESGJourneyChart } from "../components/ESGJourneyChart";
// import { AssessmentProvider, useAssessment } from "@/hooks/useAssessment";
// import { Scope1EmissionsChart } from "./components/Scope1EmissionsChart";
// import { Scope2EmissionsChart } from "./components/Scope2EmissionsChart";
// import { EmissionsBreakdownChart } from "./components/EmissionsBreakdownChart";
// import { AssessmentProgressCard } from "./components/AssessmentProgressCard";
// import { DataQualityIndicator } from "./components/DataQualityIndicator";
// import { EmissionsSummaryCard } from "./components/EmissionsSummaryCard";

// function ReportsContent() {
//     const { state } = useAssessment();
//     const data = state.assessmentData;

//     // --- crude “totals” placeholders ---
//     // Scope 1: sum stationary + mobile volumes
//     const scope1 =
//         (data.stationarySources?.electricityHeat?.dieselVolume ?? 0) +
//         (data.stationarySources?.electricityHeat?.gasVolume ?? 0) +
//         (data.stationarySources?.industrialProcesses?.fuelVolume ?? 0) +
//         (data.stationarySources?.oilGasOperations?.fuelVolume ?? 0) +
//         (data.mobileSources?.roadTransport?.dieselTruckVolume ?? 0) +
//         (data.mobileSources?.roadTransport?.carPetrolVolume ?? 0) +
//         (data.mobileSources?.roadTransport?.carDieselVolume ?? 0) +
//         (data.mobileSources?.vehicleEquipment?.forkliftVolume ?? 0) +
//         (data.mobileSources?.vehicleEquipment?.heavyDutyVolume ?? 0) +
//         (data.mobileSources?.vehicleEquipment?.tractorVolume ?? 0) +
//         (data.mobileSources?.marineAviation?.helicopterVolume ?? 0) +
//         (data.mobileSources?.marineAviation?.vesselVolume ?? 0);

//     // Scope 2: sum electricity / cooling / steam etc.
//     const scope2 =
//         Number(data.electricity?.electricityConsumed ?? 0) +
//         Number(data.cooling?.coolingConsumed ?? 0) +
//         Number(data.steam?.volume ?? 0) +
//         Number(data.heating?.heatingConsumed ?? 0) +
//         Number(data.ipps?.electricityConsumed ?? 0) +
//         Number(data.eac?.gridElectricity ?? 0) +
//         Number(data.residual?.electricityConsumed ?? 0) +
//         Number(data.coolingSteam?.energyConsumed ?? 0);

//     const total = scope1 + scope2;

//     // Placeholder for progress
//     const completedSections = 2; // you can derive from which sections are filled
//     const totalSections = 4;
//     const progress = Math.round((completedSections / totalSections) * 100);

//     return (
//         <div className="flex h-screen overflow-hidden bg-gray-50">
//             <main className="flex-1 h-full overflow-y-auto p-6">
//                 <Header />
//                 <div className="p-6">
//                     <div className="mb-8">
//                         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                             Reports & Analytics
//                         </h1>
//                         <p className="text-gray-600">
//                             Comprehensive ESG assessment reports and emissions analytics
//                         </p>
//                     </div>

//                     {/* Key Metrics */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                         <div className="bg-white rounded-xl shadow p-6">
//                             <p className="text-sm text-gray-600">Total Emissions</p>
//                             <p className="text-2xl font-bold">{total.toLocaleString()}</p>
//                             <p className="text-sm text-gray-500">activity units (placeholder)</p>
//                         </div>

//                         <div className="bg-white rounded-xl shadow p-6">
//                             <p className="text-sm text-gray-600">Scope 1</p>
//                             <p className="text-2xl font-bold">{scope1.toLocaleString()}</p>
//                         </div>

//                         <div className="bg-white rounded-xl shadow p-6">
//                             <p className="text-sm text-gray-600">Scope 2</p>
//                             <p className="text-2xl font-bold">{scope2.toLocaleString()}</p>
//                         </div>

//                         <div className="bg-white rounded-xl shadow p-6">
//                             <p className="text-sm text-gray-600">Assessment Progress</p>
//                             <p className="text-2xl font-bold">{progress}%</p>
//                             <p className="text-sm text-gray-500">
//                                 {completedSections} of {totalSections} sections
//                             </p>
//                         </div>
//                     </div>

//                     {/* Charts */}
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                         <Scope1EmissionsChart />
//                         <Scope2EmissionsChart />
//                     </div>
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//                         <EmissionsBreakdownChart />
//                         <AssessmentProgressCard />
//                         <DataQualityIndicator />
//                     </div>
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <EmissionsSummaryCard />
//                         <div className="bg-white rounded-xl shadow p-6">
//                             <h3 className="text-lg font-semibold">ESG Journey Overview</h3>
//                             <ESGJourneyChart />
//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }

// export default function ReportsAnalyticsPage() {
//     return (
//         <AssessmentProvider>
//             <ReportsContent />
//         </AssessmentProvider>
//     );
// }

// "use client";

// import {
//     Leaf,
//     BarChart3,
//     TrendingDown,
//     Activity,
//     Zap,
// } from "lucide-react";
// import Header from "../components/Header";
// import { ESGJourneyChart } from "../components/ESGJourneyChart";
// import { AssessmentProvider } from "@/hooks/useAssessment";
// import { Scope1EmissionsChart } from "./components/Scope1EmissionsChart";
// import { Scope2EmissionsChart } from "./components/Scope2EmissionsChart";
// import { EmissionsBreakdownChart } from "./components/EmissionsBreakdownChart";
// import { AssessmentProgressCard } from "./components/AssessmentProgressCard";
// import { DataQualityIndicator } from "./components/DataQualityIndicator";
// import { EmissionsSummaryCard } from "./components/EmissionsSummaryCard";

// export default function ReportsAnalyticsPage() {
//     return (
//         <AssessmentProvider>
//             <div className="flex h-screen overflow-hidden bg-gray-50">
//                 <main className="flex-1 h-full overflow-y-auto p-6">
//                     <Header />
//                     <div className="p-6">
//                         {/* Page Header */}
//                         <div className="mb-8">
//                             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                                 Reports & Analytics
//                             </h1>
//                             <p className="text-gray-600">
//                                 Comprehensive ESG assessment reports and
//                                 emissions analytics
//                             </p>
//                         </div>

//                         {/* Key Metrics Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                             <div className="bg-white rounded-xl shadow p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600">
//                                             Total Emissions
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900">
//                                             3,726.5
//                                         </p>
//                                         <p className="text-sm text-gray-500">
//                                             tonnes CO2e
//                                         </p>
//                                     </div>
//                                     <div className="p-3 bg-blue-100 rounded-lg">
//                                         <Leaf className="w-6 h-6 text-blue-600" />
//                                     </div>
//                                 </div>
//                                 <div className="mt-4 flex items-center text-sm">
//                                     <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
//                                     <span className="text-green-600">
//                                         -13.2%
//                                     </span>
//                                     <span className="text-gray-500 ml-1">
//                                         vs last year
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="bg-white rounded-xl shadow p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600">
//                                             Scope 1
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900">
//                                             2,676.5
//                                         </p>
//                                         <p className="text-sm text-gray-500">
//                                             tonnes CO2e
//                                         </p>
//                                     </div>
//                                     <div className="p-3 bg-green-100 rounded-lg">
//                                         <Activity className="w-6 h-6 text-green-600" />
//                                     </div>
//                                 </div>
//                                 <div className="mt-4 flex items-center text-sm">
//                                     <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
//                                     <span className="text-green-600">
//                                         -8.5%
//                                     </span>
//                                     <span className="text-gray-500 ml-1">
//                                         vs last year
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="bg-white rounded-xl shadow p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600">
//                                             Scope 2
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900">
//                                             1,050.0
//                                         </p>
//                                         <p className="text-sm text-gray-500">
//                                             tonnes CO2e
//                                         </p>
//                                     </div>
//                                     <div className="p-3 bg-purple-100 rounded-lg">
//                                         <Zap className="w-6 h-6 text-purple-600" />
//                                     </div>
//                                 </div>
//                                 <div className="mt-4 flex items-center text-sm">
//                                     <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
//                                     <span className="text-green-600">
//                                         -22.1%
//                                     </span>
//                                     <span className="text-gray-500 ml-1">
//                                         vs last year
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="bg-white rounded-xl shadow p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600">
//                                             Assessment Progress
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900">
//                                             65%
//                                         </p>
//                                         <p className="text-sm text-gray-500">
//                                             completed
//                                         </p>
//                                     </div>
//                                     <div className="p-3 bg-yellow-100 rounded-lg">
//                                         <BarChart3 className="w-6 h-6 text-yellow-600" />
//                                     </div>
//                                 </div>
//                                 <div className="mt-4 flex items-center text-sm">
//                                     <span className="text-blue-600">
//                                         2 of 4 sections
//                                     </span>
//                                     <span className="text-gray-500 ml-1">
//                                         completed
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Main Charts Grid */}
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                             <Scope1EmissionsChart />
//                             <Scope2EmissionsChart />
//                         </div>

//                         {/* Secondary Charts Grid */}
//                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//                             <EmissionsBreakdownChart />
//                             <AssessmentProgressCard />
//                             <DataQualityIndicator />
//                         </div>

//                         {/* Summary Section */}
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                             <EmissionsSummaryCard />
//                             <div className="bg-white rounded-xl shadow p-6">
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                                     ESG Journey Overview
//                                 </h3>
//                                 <ESGJourneyChart />
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         </AssessmentProvider>
//     );
// }
