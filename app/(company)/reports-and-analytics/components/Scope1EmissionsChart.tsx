"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAssessment, type SourceData } from "@/hooks/useAssessment";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

export function Scope1EmissionsChart() {
  const {
    state: { assessmentData, isLoading },
  } = useAssessment();

  // Helper function to safely convert a value to a number
  const toNumber = (val: unknown): number =>
    typeof val === "string" && !isNaN(parseFloat(val))
      ? parseFloat(val)
      : typeof val === "number" && !isNaN(val)
        ? val
        : 0;

  // Helper function to calculate total emissions for an array of SourceData
  const calculateSourceEmissions = (sources: SourceData[] | undefined): number => {
    if (!sources) return 0;
    return sources.reduce((sum, s) => {
      const volume = toNumber(s.volume);
      const factor = s.emissionFactor;
      return sum + volume * factor;
    }, 0);
  };

  // Calculate Scope 1 emissions from assessment data
  const calculateScope1Data = () => {
    if (!assessmentData) return [];

    const data: { category: string; emissions: number }[] = [];

    // Stationary Sources
    const stationaryEmissions =
      (calculateSourceEmissions(
        assessmentData.stationarySources?.electricityHeat?.dieselGenerators
      ) || 0) +
      (calculateSourceEmissions(assessmentData.stationarySources?.electricityHeat?.gasTurbines) ||
        0) +
      (calculateSourceEmissions(
        assessmentData.stationarySources?.industrialProcesses?.boilerFurnaces
      ) || 0) +
      (calculateSourceEmissions(
        assessmentData.stationarySources?.oilGasOperations?.onShoreProduction
      ) || 0);
    if (stationaryEmissions > 0) {
      data.push({
        category: "Stationary Sources",
        emissions: stationaryEmissions,
      });
    }

    // Mobile Sources
    const mobileEmissions =
      (calculateSourceEmissions(assessmentData.mobileSources?.roadTransport?.vehicleFleet) || 0) +
      (calculateSourceEmissions(assessmentData.mobileSources?.roadTransport?.carsBuses) || 0) +
      (calculateSourceEmissions(assessmentData.mobileSources?.vehicleEquipment?.forkliftFuelType) ||
        0) +
      (calculateSourceEmissions(
        assessmentData.mobileSources?.vehicleEquipment?.heavyDutyFuelType
      ) || 0) +
      (calculateSourceEmissions(assessmentData.mobileSources?.vehicleEquipment?.tractorFuelType) ||
        0) +
      (calculateSourceEmissions(assessmentData.mobileSources?.marineAviation?.air) || 0) +
      (calculateSourceEmissions(assessmentData.mobileSources?.marineAviation?.marine) || 0);
    if (mobileEmissions > 0) {
      data.push({ category: "Mobile Sources", emissions: mobileEmissions });
    }

    // Process Emissions
    if (assessmentData.processEmissions) {
      const cementEmissions =
        toNumber(assessmentData.processEmissions.cementManufacturing?.cementQuantity) * 0.44; // Using example factor
      if (cementEmissions > 0) {
        data.push({
          category: "Cement Manufacturing",
          emissions: cementEmissions,
        });
      }

      const gasFlaringEmissions =
        toNumber(assessmentData.processEmissions.gasFlaring?.gasVolume) *
        toNumber(assessmentData.processEmissions.gasFlaring?.carbonContent);
      if (gasFlaringEmissions > 0) {
        data.push({ category: "Gas Flaring", emissions: gasFlaringEmissions });
      }
    }

    // Fugitive Emissions
    if (assessmentData.fugitiveEmissions) {
      const ventingEmissions =
        toNumber(assessmentData.fugitiveEmissions.ventingNaturalGas?.volumeOfGasVented) * 0.002; // Using example factor
      if (ventingEmissions > 0) {
        data.push({ category: "Gas Venting", emissions: ventingEmissions });
      }

      const hfcEmissions =
        toNumber(assessmentData.fugitiveEmissions.hfcLeaks?.refrigerantAdded) * 1430; // Using example GWP
      if (hfcEmissions > 0) {
        data.push({ category: "HFC Leaks", emissions: hfcEmissions });
      }
    }

    return data;
  };

  const chartData = calculateScope1Data();
  const totalEmissions = chartData.reduce((sum, item) => sum + item.emissions, 0);
  const previousTotal = totalEmissions * 1.05; // assume slight reduction for trend reference
  const trend = totalEmissions < previousTotal ? "down" : "up";
  const trendValue =
    previousTotal > 0
      ? Math.abs(((totalEmissions - previousTotal) / previousTotal) * 100).toFixed(1)
      : "0.0";

  if (isLoading) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Scope 1 Emissions</CardTitle>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Scope 1 Emissions</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                trend === "down" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendValue}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">Direct emissions from owned or controlled sources</p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalEmissions.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} barCategoryGap={8}>
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  domain={[0, "dataMax + 10"]}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} tonnes CO2e`, "Emissions"]}
                  labelStyle={{ color: "#374151" }}
                />
                <Bar dataKey="emissions" radius={[4, 4, 0, 0]} maxBarSize={40} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Scope 1 emissions data available</p>
            <p className="text-sm text-gray-400">
              Complete your GHG emissions assessment to see data here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
// import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
// import { useAssessment } from "@/hooks/useAssessment";
// import { Activity, TrendingDown, TrendingUp } from "lucide-react";

// export function Scope1EmissionsChart() {
//   const { state: { assessmentData, isLoading } } = useAssessment();

//   const toNumber = (val: unknown): number => (typeof val === "number" && !isNaN(val) ? val : 0);

//   // Calculate Scope 1 emissions from assessment data
//   const calculateScope1Data = () => {
//     if (!assessmentData) return [] as { category: string; emissions: number }[];

//     const data: { category: string; emissions: number }[] = [];

//     // Stationary Sources
//     if (assessmentData.stationarySources) {
//       const stationary = assessmentData.stationarySources;

//       if (stationary.electricityHeat) {
//         const diesel = toNumber(stationary.electricityHeat.dieselVolume);
//         const gas = toNumber(stationary.electricityHeat.gasVolume);
//         const totalVolume = diesel + gas;
//         if (totalVolume > 0) {
//           data.push({ category: "Electricity & Heat", emissions: totalVolume * 2.31 });
//         }
//       }

//       if (stationary.industrialProcesses) {
//         const fuelVolume = toNumber(stationary.industrialProcesses.fuelVolume);
//         if (fuelVolume > 0) {
//           data.push({ category: "Industrial Processes", emissions: fuelVolume * 2.31 });
//         }
//       }

//       if (stationary.oilGasOperations) {
//         const fuelVolume = toNumber(stationary.oilGasOperations.fuelVolume);
//         if (fuelVolume > 0) {
//           data.push({ category: "Oil & Gas Operations", emissions: fuelVolume * 2.31 });
//         }
//       }
//     }

//     // Mobile Sources
//     if (assessmentData.mobileSources) {
//       const mobile = assessmentData.mobileSources;

//       if (mobile.roadTransport) {
//         const road = mobile.roadTransport;
//         const totalVolume =
//           toNumber(road.dieselTruckVolume) +
//           toNumber(road.carPetrolVolume) +
//           toNumber(road.carDieselVolume);
//         if (totalVolume > 0) {
//           data.push({ category: "Road Transport", emissions: totalVolume * 2.31 });
//         }
//       }

//       if (mobile.vehicleEquipment) {
//         const v = mobile.vehicleEquipment;
//         const totalVolume = toNumber(v.forkliftVolume) + toNumber(v.heavyDutyVolume) + toNumber(v.tractorVolume);
//         if (totalVolume > 0) {
//           data.push({ category: "Vehicle Equipment", emissions: totalVolume * 2.31 });
//         }
//       }

//       if (mobile.marineAviation) {
//         const m = mobile.marineAviation;
//         const totalVolume = toNumber(m.helicopterVolume) + toNumber(m.vesselVolume);
//         if (totalVolume > 0) {
//           data.push({ category: "Marine & Aviation", emissions: totalVolume * 2.31 });
//         }
//       }
//     }

//     // Process Emissions
//     if (assessmentData.processEmissions) {
//       const process = assessmentData.processEmissions;

//       if (process.co2Release) {
//         const co2 = process.co2Release;
//         const totalEmissions = toNumber(co2.clinkerQuantity) + toNumber(co2.calciumOxide) + toNumber(co2.magnesiumOxide);
//         if (totalEmissions > 0) {
//           data.push({ category: "CO2 Release", emissions: totalEmissions * 0.44 });
//         }
//       }

//       if (process.gasFlaring) {
//         const flaring = process.gasFlaring;
//         const gasVolume = toNumber(flaring.gasVolume);
//         if (gasVolume > 0) {
//           data.push({ category: "Gas Flaring", emissions: gasVolume * 0.002 });
//         }
//       }
//     }

//     // Fugitive Emissions
//     if (assessmentData.fugitiveEmissions) {
//       const fugitive = assessmentData.fugitiveEmissions;

//       if (fugitive.methaneLeaks) {
//         const methane = fugitive.methaneLeaks;
//         const totalLeaks = Object.values(methane).reduce<number>((sum, val) => (sum + (typeof val === "number" ? val : 0)), 0);
//         if (totalLeaks > 0) {
//           data.push({ category: "Methane Leaks", emissions: totalLeaks * 25 });
//         }
//       }

//       if (fugitive.ventingNaturalGas) {
//         const venting = fugitive.ventingNaturalGas;
//         const vol = toNumber(venting.volumeOfGasVented);
//         if (vol > 0) {
//           data.push({ category: "Gas Venting", emissions: vol * 0.002 });
//         }
//       }
//     }

//     return data;
//   };

//   const chartData = calculateScope1Data();
//   const totalEmissions = chartData.reduce((sum, item) => sum + item.emissions, 0);
//   const previousTotal = totalEmissions * 1.05; // assume slight reduction for trend reference
//   const trend = totalEmissions < previousTotal ? "down" : "up";
//   const trendValue = previousTotal > 0 ? Math.abs(((totalEmissions - previousTotal) / previousTotal) * 100).toFixed(1) : "0.0";

//   if (isLoading) {
//     return (
//       <Card className="bg-white border-none shadow rounded-xl">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-gray-900">Scope 1 Emissions</CardTitle>
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
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Activity className="w-5 h-5 text-blue-600" />
//             <CardTitle className="text-lg font-semibold text-gray-900">Scope 1 Emissions</CardTitle>
//           </div>
//           <div className="flex items-center gap-2">
//             {trend === "down" ? (
//               <TrendingDown className="w-4 h-4 text-green-600" />
//             ) : (
//               <TrendingUp className="w-4 h-4 text-red-600" />
//             )}
//             <span className={`text-sm font-medium ${trend === "down" ? "text-green-600" : "text-red-600"}`}>
//               {trendValue}%
//             </span>
//           </div>
//         </div>
//         <p className="text-sm text-gray-600">Direct emissions from owned or controlled sources</p>
//       </CardHeader>
//       <CardContent>
//         {chartData.length > 0 ? (
//           <div className="space-y-4">
//             <div className="text-center">
//               <div className="text-3xl font-bold text-gray-900">{totalEmissions.toFixed(1)}</div>
//               <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
//             </div>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={chartData} barCategoryGap={8}>
//                 <XAxis
//                   dataKey="category"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 10, fill: "#6B7280" }}
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                 />
//                 <YAxis
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 10, fill: "#6B7280" }}
//                   domain={[0, 'dataMax + 10']}
//                 />
//                 <Tooltip
//                   formatter={(value: number) => [`${value.toFixed(1)} tonnes CO2e`, 'Emissions']}
//                   labelStyle={{ color: '#374151' }}
//                 />
//                 <Bar dataKey="emissions" radius={[4, 4, 0, 0]} maxBarSize={40} fill="#3B82F6" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No Scope 1 emissions data available</p>
//             <p className="text-sm text-gray-400">Complete your GHG emissions assessment to see data here</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
