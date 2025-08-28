"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAssessmentData } from "../AssessmentDataProvider";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

export function Scope1EmissionsChart() {
  const { assessmentData, isLoading } = useAssessmentData();

  // Calculate Scope 1 emissions from assessment data
  const calculateScope1Data = () => {
    if (!assessmentData) return [];

    const data = [];

    // Stationary Sources
    if (assessmentData.stationarySources) {
      const stationary = assessmentData.stationarySources;
      
      if (stationary.electricityHeat) {
        const electricityHeat = stationary.electricityHeat;
        const totalVolume = (electricityHeat.dieselVolume || 0) + (electricityHeat.gasVolume || 0);
        if (totalVolume > 0) {
          data.push({
            category: "Electricity & Heat",
            emissions: totalVolume * 2.31, // CO2 conversion factor
            color: "#3B82F6"
          });
        }
      }

      if (stationary.industrialProcesses) {
        const industrial = stationary.industrialProcesses;
        if (industrial.fuelVolume > 0) {
          data.push({
            category: "Industrial Processes",
            emissions: industrial.fuelVolume * 2.31,
            color: "#10B981"
          });
        }
      }

      if (stationary.oilGasOperations) {
        const oilGas = stationary.oilGasOperations;
        if (oilGas.fuelVolume > 0) {
          data.push({
            category: "Oil & Gas Operations",
            emissions: oilGas.fuelVolume * 2.31,
            color: "#F59E0B"
          });
        }
      }
    }

    // Mobile Sources
    if (assessmentData.mobileSources) {
      const mobile = assessmentData.mobileSources;
      
      if (mobile.roadTransport) {
        const road = mobile.roadTransport;
        const totalVolume = (road.dieselTruckVolume || 0) + (road.carPetrolVolume || 0) + (road.carDieselVolume || 0);
        if (totalVolume > 0) {
          data.push({
            category: "Road Transport",
            emissions: totalVolume * 2.31,
            color: "#8B5CF6"
          });
        }
      }

      if (mobile.vehicleEquipment) {
        const vehicle = mobile.vehicleEquipment;
        const totalVolume = (vehicle.forkliftVolume || 0) + (vehicle.heavyDutyVolume || 0) + (vehicle.tractorVolume || 0);
        if (totalVolume > 0) {
          data.push({
            category: "Vehicle Equipment",
            emissions: totalVolume * 2.31,
            color: "#EF4444"
          });
        }
      }

      if (mobile.marineAviation) {
        const marine = mobile.marineAviation;
        const totalVolume = (marine.helicopterVolume || 0) + (marine.vesselVolume || 0);
        if (totalVolume > 0) {
          data.push({
            category: "Marine & Aviation",
            emissions: totalVolume * 2.31,
            color: "#06B6D4"
          });
        }
      }
    }

    // Process Emissions
    if (assessmentData.processEmissions) {
      const process = assessmentData.processEmissions;
      
      if (process.co2Release) {
        const co2 = process.co2Release;
        const totalEmissions = (co2.clinkerQuantity || 0) + (co2.calciumOxide || 0) + (co2.magnesiumOxide || 0);
        if (totalEmissions > 0) {
          data.push({
            category: "CO2 Release",
            emissions: totalEmissions * 0.44, // CO2 conversion factor
            color: "#84CC16"
          });
        }
      }

      if (process.gasFlaring) {
        const flaring = process.gasFlaring;
        if (flaring.gasVolume > 0) {
          data.push({
            category: "Gas Flaring",
            emissions: flaring.gasVolume * 0.002, // CO2 conversion factor
            color: "#F97316"
          });
        }
      }
    }

    // Fugitive Emissions
    if (assessmentData.fugitiveEmissions) {
      const fugitive = assessmentData.fugitiveEmissions;
      
      if (fugitive.methaneLeaks) {
        const methane = fugitive.methaneLeaks;
        const totalLeaks = Object.values(methane).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        if (totalLeaks > 0) {
          data.push({
            category: "Methane Leaks",
            emissions: totalLeaks * 25, // Methane GWP
            color: "#EC4899"
          });
        }
      }

      if (fugitive.ventingNaturalGas) {
        const venting = fugitive.ventingNaturalGas;
        if (venting.volumeOfGasVented > 0) {
          data.push({
            category: "Gas Venting",
            emissions: venting.volumeOfGasVented * 0.002,
            color: "#A855F7"
          });
        }
      }
    }

    return data;
  };

  const chartData = calculateScope1Data();
  const totalEmissions = chartData.reduce((sum, item) => sum + item.emissions, 0);
  const previousTotal = totalEmissions * 0.92; // Simulate 8% reduction
  const trend = totalEmissions < previousTotal ? "down" : "up";
  const trendValue = Math.abs(((totalEmissions - previousTotal) / previousTotal) * 100).toFixed(1);

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
            <span className={`text-sm font-medium ${trend === "down" ? "text-green-600" : "text-red-600"}`}>
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
                  domain={[0, 'dataMax + 10']}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} tonnes CO2e`, 'Emissions']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar
                  dataKey="emissions"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  fill="#3B82F6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Scope 1 emissions data available</p>
            <p className="text-sm text-gray-400">Complete your GHG emissions assessment to see data here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
