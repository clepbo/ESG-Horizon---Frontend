"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAssessment, type SourceData } from "@/hooks/useAssessment";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatNumberFull } from "@/lib/numberFormat";

export function EmissionsBreakdownChart() {
  const {
    state: { assessmentData, isLoading },
  } = useAssessment();

  // Helper function to safely convert a value to a number
  const toNumber = (val: unknown): number =>
    typeof val === "string" && !isNaN(parseFloat(val)) ? parseFloat(val) : 0;

  // Helper function to calculate total emissions for an array of SourceData
  const calculateSourceEmissions = (sources: SourceData[] | undefined): number => {
    if (!sources) return 0;
    return sources.reduce((sum, s) => {
      const volume = toNumber(s.volume);
      const factor = toNumber(s.emissionFactor);
      return sum + volume * factor;
    }, 0);
  };

  const calculateEmissionsBreakdown = () => {
    if (!assessmentData) return [];

    const parts: { name: string; value: number; color: string }[] = [];

    const env = assessmentData.environment;
    const ghg = env?.ghg;
    const scope1 = ghg?.scope1;
    const scope2 = ghg?.scope2;
    const locationBased = scope2?.locationBased;

    // Scope 1 Emissions
    if (scope1?.stationarySources) {
      const { electricityHeat, industrialProcesses, oilGasOperations } = scope1.stationarySources;

      const stationaryTotal =
        calculateSourceEmissions(electricityHeat?.dieselGenerators) +
        calculateSourceEmissions(electricityHeat?.gasTurbines) +
        calculateSourceEmissions(industrialProcesses?.boilerFurnaces) +
        calculateSourceEmissions(oilGasOperations?.onShoreProduction);

      if (stationaryTotal > 0) {
        parts.push({
          name: "Scope 1 - Stationary",
          value: stationaryTotal,
          color: "#3B82F6",
        });
      }
    }

    if (scope1?.mobileSources) {
      const { roadTransport, vehicleEquipment, marineAviation } = scope1.mobileSources;

      const mobileTotal =
        calculateSourceEmissions(roadTransport?.vehicleFleet) +
        calculateSourceEmissions(roadTransport?.carsBuses) +
        calculateSourceEmissions(vehicleEquipment?.forkliftFuelType) +
        calculateSourceEmissions(vehicleEquipment?.heavyDutyFuelType) +
        calculateSourceEmissions(vehicleEquipment?.tractorFuelType) +
        calculateSourceEmissions(marineAviation?.air) +
        calculateSourceEmissions(marineAviation?.marine);

      if (mobileTotal > 0) {
        parts.push({
          name: "Scope 1 - Mobile",
          value: mobileTotal,
          color: "#8B5CF6",
        });
      }
    }

    if (scope1?.processEmissions) {
      const { cementManufacturing, gasFlaring } = scope1.processEmissions;

      const cementEmissions = toNumber(cementManufacturing?.cementQuantity) * 0.44; // Example factor
      if (cementEmissions > 0) {
        parts.push({
          name: "Scope 1 - Cement",
          value: cementEmissions,
          color: "#84CC16",
        });
      }

      const gasFlaringEmissions =
        toNumber(gasFlaring?.gasVolume) * toNumber(gasFlaring?.carbonContent);
      if (gasFlaringEmissions > 0) {
        parts.push({
          name: "Scope 1 - Gas Flaring",
          value: gasFlaringEmissions,
          color: "#F97316",
        });
      }
    }

    if (scope1?.fugitiveEmissions) {
      const { ventingNaturalGas, hfcLeaks } = scope1.fugitiveEmissions;

      const ventingEmissions = toNumber(ventingNaturalGas?.volumeOfGasVented) * 0.002; // Example factor
      if (ventingEmissions > 0) {
        parts.push({
          name: "Scope 1 - Venting",
          value: ventingEmissions,
          color: "#A855F7",
        });
      }

      // A more robust way to calculate HFC leaks would be to map each type to a GWP
      const hfcEmissions = Number(hfcLeaks?.refrigerantAdded || 0) * 1430; // Example factor for R134a GWP
      if (hfcEmissions > 0) {
        parts.push({
          name: "Scope 1 - HFC Leaks",
          value: hfcEmissions,
          color: "#EC4899",
        });
      }
    }

    // Scope 2 Emissions
    const electricityEmissions = toNumber(locationBased?.electricity?.electricityConsumed) * 0.35; // Example factor
    if (electricityEmissions > 0) {
      parts.push({
        name: "Scope 2 - Electricity",
        value: electricityEmissions,
        color: "#2563EB",
      });
    }

    const coolingEmissions = toNumber(locationBased?.cooling?.coolingConsumed) * 0.1; // Example factor
    if (coolingEmissions > 0) {
      parts.push({
        name: "Scope 2 - Cooling",
        value: coolingEmissions,
        color: "#0F766E",
      });
    }

    // Add other Scope 2 calculations similarly...

    return parts;
  };

  const chartData = calculateEmissionsBreakdown();
  const totalEmissions = chartData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Emissions Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-none shadow rounded-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-green-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">Emissions Breakdown</CardTitle>
        </div>
        <p className="text-sm text-gray-600">Distribution of emissions by source and scope</p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatNumberFull(totalEmissions, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${Math.round(Number(percent || 0) * 100)}%`
                  }
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value?: number) => [
                    `${formatNumberFull(value ?? 0, { minimumFractionDigits: 2 })} tonnes CO2e`,
                    "Emissions",
                  ]}
                  labelStyle={{ color: "#374151" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No emissions data available</p>
            <p className="text-sm text-gray-400">Complete your assessment to see breakdown</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// import { useAssessment } from "@/hooks/useAssessment";
// import { PieChart as PieChartIcon } from "lucide-react";

// export function EmissionsBreakdownChart() {
//   const { state: { assessmentData, isLoading } } = useAssessment();

//   const toNumber = (val: unknown): number => (typeof val === 'number' && !isNaN(val) ? val : 0);

//   const calculateEmissionsBreakdown = () => {
//     if (!assessmentData) return [] as { name: string; value: number; color: string }[];

//     const parts: { name: string; value: number; color: string }[] = [];

//     // Stationary
//     if (assessmentData.stationarySources) {
//       const s = assessmentData.stationarySources;
//       const elec = s.electricityHeat ? (toNumber(s.electricityHeat.dieselVolume) + toNumber(s.electricityHeat.gasVolume)) * 2.31 : 0;
//       if (elec > 0) parts.push({ name: 'Scope 1 - Stationary', value: elec, color: '#3B82F6' });

//       const ind = s.industrialProcesses ? toNumber(s.industrialProcesses.fuelVolume) * 2.31 : 0;
//       if (ind > 0) parts.push({ name: 'Scope 1 - Industrial', value: ind, color: '#10B981' });

//       const og = s.oilGasOperations ? toNumber(s.oilGasOperations.fuelVolume) * 2.31 : 0;
//       if (og > 0) parts.push({ name: 'Scope 1 - Oil & Gas', value: og, color: '#F59E0B' });
//     }

//     // Mobile
//     if (assessmentData.mobileSources) {
//       const m = assessmentData.mobileSources;
//       const road = m.roadTransport ? (toNumber(m.roadTransport.dieselTruckVolume) + toNumber(m.roadTransport.carPetrolVolume) + toNumber(m.roadTransport.carDieselVolume)) * 2.31 : 0;
//       if (road > 0) parts.push({ name: 'Scope 1 - Road', value: road, color: '#8B5CF6' });

//       const veh = m.vehicleEquipment ? (toNumber(m.vehicleEquipment.forkliftVolume) + toNumber(m.vehicleEquipment.heavyDutyVolume) + toNumber(m.vehicleEquipment.tractorVolume)) * 2.31 : 0;
//       if (veh > 0) parts.push({ name: 'Scope 1 - Equipment', value: veh, color: '#EF4444' });

//       const ma = m.marineAviation ? (toNumber(m.marineAviation.helicopterVolume) + toNumber(m.marineAviation.vesselVolume)) * 2.31 : 0;
//       if (ma > 0) parts.push({ name: 'Scope 1 - Marine/Aviation', value: ma, color: '#06B6D4' });
//     }

//     // Process
//     if (assessmentData.processEmissions?.co2Release) {
//       const co2 = assessmentData.processEmissions.co2Release;
//       const proc = (toNumber(co2.clinkerQuantity) + toNumber(co2.calciumOxide) + toNumber(co2.magnesiumOxide)) * 0.44;
//       if (proc > 0) parts.push({ name: 'Scope 1 - Process', value: proc, color: '#84CC16' });
//     }

//     if (assessmentData.processEmissions?.gasFlaring) {
//       const fl = assessmentData.processEmissions.gasFlaring;
//       const val = toNumber(fl.gasVolume) * 0.002;
//       if (val > 0) parts.push({ name: 'Scope 1 - Gas Flaring', value: val, color: '#F97316' });
//     }

//     // Fugitive
//     if (assessmentData.fugitiveEmissions?.methaneLeaks) {
//       const methane = assessmentData.fugitiveEmissions.methaneLeaks;
//       // const leaks = Object.values(methane).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0) * 25;
//       const leaks = Object.values(methane).reduce<number>((sum, v) => sum + toNumber(v), 0) * 25;
//       if (leaks > 0) parts.push({ name: 'Scope 1 - Fugitive', value: leaks, color: '#EC4899' });
//     }

//     if (assessmentData.fugitiveEmissions?.ventingNaturalGas) {
//       const vn = assessmentData.fugitiveEmissions.ventingNaturalGas;
//       const val = toNumber(vn.volumeOfGasVented) * 0.002;
//       if (val > 0) parts.push({ name: 'Scope 1 - Venting', value: val, color: '#A855F7' });
//     }

//     return parts;
//   };

//   const chartData = calculateEmissionsBreakdown();
//   const totalEmissions = chartData.reduce((sum, item) => sum + item.value, 0);

//   if (isLoading) {
//     return (
//       <Card className="bg-white border-none shadow rounded-xl">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-gray-900">Emissions Breakdown</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="bg-white border-none shadow rounded-xl">
//       <CardHeader>
//         <div className="flex items-center gap-2">
//           <PieChartIcon className="w-5 h-5 text-green-600" />
//           <CardTitle className="text-lg font-semibold text-gray-900">Emissions Breakdown</CardTitle>
//         </div>
//         <p className="text-sm text-gray-600">Distribution of emissions by source and scope</p>
//       </CardHeader>
//       <CardContent>
//         {chartData.length > 0 ? (
//           <div className="space-y-4">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-gray-900">{totalEmissions.toFixed(1)}</div>
//               <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
//             </div>
//             <ResponsiveContainer width="100%" height={200}>
//               <PieChart>
//                 <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
//                   {chartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value: number) => [`${value.toFixed(1)} tonnes CO2e`, 'Emissions']} labelStyle={{ color: '#374151' }} />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               {chartData.map((item, index) => (
//                 <div key={index} className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
//                   <span className="text-gray-700">{item.name}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No emissions data available</p>
//             <p className="text-sm text-gray-400">Complete your assessment to see breakdown</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
