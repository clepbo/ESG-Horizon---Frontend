"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { useAssessment, type SourceData } from "@/hooks/useAssessment";
import { TrendingDown, TrendingUp, Calendar, Building } from "lucide-react";

export function EmissionsSummaryCard() {
  const {
    state: { assessmentData, isLoading },
  } = useAssessment();

  // Helper function to safely convert a value to a number
  const toNumber = (val: unknown): number =>
    typeof val === "string" && !isNaN(parseFloat(val)) ? parseFloat(val) : 0;

  // Helper function to calculate total emissions for an array of SourceData
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

  const calculateSummary = () => {
    if (!assessmentData) return null;

    let scope1 = 0;
    let scope2 = 0;

    // Calculate Scope 1 emissions
    if (assessmentData.stationarySources) {
      const { electricityHeat, industrialProcesses, oilGasOperations } =
        assessmentData.stationarySources;
      scope1 += calculateSourceEmissions(electricityHeat?.dieselGenerators);
      scope1 += calculateSourceEmissions(electricityHeat?.gasTurbines);
      scope1 += calculateSourceEmissions(industrialProcesses?.boilerFurnaces);
      scope1 += calculateSourceEmissions(oilGasOperations?.onShoreProduction);
    }

    if (assessmentData.mobileSources) {
      const { roadTransport, vehicleEquipment, marineAviation } =
        assessmentData.mobileSources;
      scope1 += calculateSourceEmissions(roadTransport?.vehicleFleet);
      scope1 += calculateSourceEmissions(roadTransport?.carsBuses);
      scope1 += calculateSourceEmissions(vehicleEquipment?.forkliftFuelType);
      scope1 += calculateSourceEmissions(vehicleEquipment?.heavyDutyFuelType);
      scope1 += calculateSourceEmissions(vehicleEquipment?.tractorFuelType);
      scope1 += calculateSourceEmissions(marineAviation?.air);
      scope1 += calculateSourceEmissions(marineAviation?.marine);
    }

    if (assessmentData.processEmissions) {
      const { cementManufacturing, gasFlaring } =
        assessmentData.processEmissions;

      const cementEmissions =
        toNumber(cementManufacturing?.cementQuantity) * 0.44; // Example factor
      if (!isNaN(cementEmissions)) scope1 += cementEmissions;

      const gasFlaringEmissions =
        toNumber(gasFlaring?.gasVolume) * toNumber(gasFlaring?.carbonContent);
      if (!isNaN(gasFlaringEmissions)) scope1 += gasFlaringEmissions;
    }

    if (assessmentData.fugitiveEmissions) {
      const { ventingNaturalGas, hfcLeaks } = assessmentData.fugitiveEmissions;

      const ventingEmissions =
        toNumber(ventingNaturalGas?.volumeOfGasVented) * 0.002; // Example factor
      if (!isNaN(ventingEmissions)) scope1 += ventingEmissions;

      const hfcEmissions = toNumber(hfcLeaks?.refrigerantAdded) * 1430; // Example GWP for R134a
      if (!isNaN(hfcEmissions)) scope1 += hfcEmissions;
    }

    // Calculate Scope 2 emissions
    const {
      electricity,
      cooling,
      steam,
      heating,
      ipps,
      eac,
      residual,
      coolingSteam,
    } = assessmentData;

    scope2 += toNumber(electricity?.electricityConsumed) * 0.35; // Example factor
    scope2 += toNumber(cooling?.coolingConsumed) * 0.1; // Example factor
    scope2 += toNumber(steam?.volume) * 0.2; // Example factor
    scope2 += toNumber(heating?.heatingPurchased) * 0.15; // Example factor
    scope2 +=
      toNumber(ipps?.electricityConsumed) * toNumber(ipps?.emissionFactor);
    scope2 += toNumber(eac?.gridElectricity) * toNumber(eac?.emissionFactor);
    scope2 +=
      toNumber(residual?.electricityConsumed) *
      toNumber(residual?.residualMixFactor);
    scope2 +=
      toNumber(coolingSteam?.energyConsumed) *
      toNumber(coolingSteam?.emissionFactor);

    const total = scope1 + scope2;
    const previousYear = total * 1.1; // arbitrary comparison to show trend
    const reduction =
      previousYear > 0 ? ((previousYear - total) / previousYear) * 100 : 0;
    const targetReduction = 20;
    const progressToTarget = Math.min((reduction / targetReduction) * 100, 100);

    return {
      scope1,
      scope2,
      total,
      reduction,
      progressToTarget,
      targetReduction,
      previousYear,
    };
  };

  const summary = calculateSummary();

  if (isLoading) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Emissions Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Emissions Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No emissions data available</p>
            <p className="text-sm text-gray-400">
              Complete your assessment to see summary
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-none shadow rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Emissions Summary
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comprehensive overview of your GHG emissions
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {summary.total.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-900">
                {summary.scope1.toFixed(1)}
              </div>
              <div className="text-xs text-blue-600">Scope 1 (tonnes)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-900">
                {summary.scope2.toFixed(1)}
              </div>
              <div className="text-xs text-purple-600">Scope 2 (tonnes)</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Emissions Reduction
              </span>
              <div className="flex items-center gap-1">
                {summary.reduction > 0 ? (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    summary.reduction > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(summary.reduction).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(Math.abs(summary.reduction), 100)}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              vs. previous year ({summary.previousYear.toFixed(1)} tonnes)
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Target Progress
              </span>
              <span className="text-sm font-medium text-gray-600">
                {summary.progressToTarget.toFixed(0)}% of{" "}
                {summary.targetReduction}% target
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${summary.progressToTarget}%` }}
              ></div>
            </div>
          </div>

          {assessmentData && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {assessmentData.startMonth} {assessmentData.startYear} -{" "}
                  {assessmentData.endMonth} {assessmentData.endYear}
                </span>
              </div>
              {assessmentData.subsidiary && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Building className="w-4 h-4" />
                  <span>{assessmentData.subsidiary}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
// import { useAssessment } from "@/hooks/useAssessment";
// import { TrendingDown, TrendingUp, Calendar, Building } from "lucide-react";

// export function EmissionsSummaryCard() {
//   const { state: { assessmentData, isLoading } } = useAssessment();

//   const toNumber = (val: unknown): number => (typeof val === 'number' && !isNaN(val) ? val : 0);

//   const calculateSummary = () => {
//     if (!assessmentData) return null;

//     // Scope 1
//     let scope1 = 0;

//     if (assessmentData.stationarySources) {
//       const s = assessmentData.stationarySources;
//       if (s.electricityHeat) scope1 += (toNumber(s.electricityHeat.dieselVolume) + toNumber(s.electricityHeat.gasVolume)) * 2.31;
//       if (s.industrialProcesses) scope1 += toNumber(s.industrialProcesses.fuelVolume) * 2.31;
//       if (s.oilGasOperations) scope1 += toNumber(s.oilGasOperations.fuelVolume) * 2.31;
//     }

//     if (assessmentData.mobileSources) {
//       const m = assessmentData.mobileSources;
//       if (m.roadTransport) scope1 += (toNumber(m.roadTransport.dieselTruckVolume) + toNumber(m.roadTransport.carPetrolVolume) + toNumber(m.roadTransport.carDieselVolume)) * 2.31;
//       if (m.vehicleEquipment) scope1 += (toNumber(m.vehicleEquipment.forkliftVolume) + toNumber(m.vehicleEquipment.heavyDutyVolume) + toNumber(m.vehicleEquipment.tractorVolume)) * 2.31;
//       if (m.marineAviation) scope1 += (toNumber(m.marineAviation.helicopterVolume) + toNumber(m.marineAviation.vesselVolume)) * 2.31;
//     }

//     if (assessmentData.processEmissions) {
//       const p = assessmentData.processEmissions;
//       if (p.co2Release) scope1 += (toNumber(p.co2Release.clinkerQuantity) + toNumber(p.co2Release.calciumOxide) + toNumber(p.co2Release.magnesiumOxide)) * 0.44;
//       if (p.gasFlaring) scope1 += toNumber(p.gasFlaring.gasVolume) * 0.002;
//     }

//     if (assessmentData.fugitiveEmissions) {
//       const f = assessmentData.fugitiveEmissions;
//       if (f.methaneLeaks) scope1 += Object.values(f.methaneLeaks).reduce<number>((sum, v) => sum + (typeof v === 'number' ? v : 0), 0) * 25;
//       if (f.ventingNaturalGas) scope1 += toNumber(f.ventingNaturalGas.volumeOfGasVented) * 0.002;
//     }

//     // Scope 2 (not available yet)
//     const scope2 = 0;

//     const total = scope1 + scope2;
//     const previousYear = total * 1.10; // arbitrary comparison to show trend, not persisted
//     const reduction = previousYear > 0 ? ((previousYear - total) / previousYear) * 100 : 0;
//     const targetReduction = 20;
//     const progressToTarget = Math.min((reduction / targetReduction) * 100, 100);

//     return { scope1, scope2, total, reduction, progressToTarget, targetReduction, previousYear };
//   };

//   const summary = calculateSummary();

//   if (isLoading) {
//     return (
//       <Card className="bg-white border-none shadow rounded-xl">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-gray-900">Emissions Summary</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!summary) {
//     return (
//       <Card className="bg-white border-none shadow rounded-xl">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-gray-900">Emissions Summary</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <p className="text-gray-500">No emissions data available</p>
//             <p className="text-sm text-gray-400">Complete your assessment to see summary</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="bg-white border-none shadow rounded-xl">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold text-gray-900">Emissions Summary</CardTitle>
//         <p className="text-sm text-gray-600">Comprehensive overview of your GHG emissions</p>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-6">
//           <div className="text-center">
//             <div className="text-4xl font-bold text-gray-900">{summary.total.toFixed(1)}</div>
//             <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="text-center p-3 bg-blue-50 rounded-lg">
//               <div className="text-lg font-bold text-blue-900">{summary.scope1.toFixed(1)}</div>
//               <div className="text-xs text-blue-600">Scope 1 (tonnes)</div>
//             </div>
//             <div className="text-center p-3 bg-purple-50 rounded-lg">
//               <div className="text-lg font-bold text-purple-900">{summary.scope2.toFixed(1)}</div>
//               <div className="text-xs text-purple-600">Scope 2 (tonnes)</div>
//             </div>
//           </div>

//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium text-gray-700">Emissions Reduction</span>
//               <div className="flex items-center gap-1">
//                 {summary.reduction > 0 ? (
//                   <TrendingDown className="w-4 h-4 text-green-600" />
//                 ) : (
//                   <TrendingUp className="w-4 h-4 text-red-600" />
//                 )}
//                 <span className={`text-sm font-medium ${summary.reduction > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                   {Math.abs(summary.reduction).toFixed(1)}%
//                 </span>
//               </div>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(Math.abs(summary.reduction), 100)}%` }}></div>
//             </div>
//             <div className="text-xs text-gray-500">vs. previous year ({summary.previousYear.toFixed(1)} tonnes)</div>
//           </div>

//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium text-gray-700">Target Progress</span>
//               <span className="text-sm font-medium text-gray-600">{summary.progressToTarget.toFixed(0)}% of {summary.targetReduction}% target</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${summary.progressToTarget}%` }}></div>
//             </div>
//           </div>

//           {assessmentData && (
//             <div className="pt-4 border-t border-gray-200">
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Calendar className="w-4 h-4" />
//                 <span>
//                   {assessmentData.startMonth} {assessmentData.startYear} - {assessmentData.endMonth} {assessmentData.endYear}
//                 </span>
//               </div>
//               {assessmentData.subsidiary && (
//                 <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
//                   <Building className="w-4 h-4" />
//                   <span>{assessmentData.subsidiary}</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
