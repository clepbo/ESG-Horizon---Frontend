"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAssessmentData } from "../AssessmentDataProvider";
import { PieChart as PieChartIcon } from "lucide-react";

export function EmissionsBreakdownChart() {
  const { assessmentData, isLoading } = useAssessmentData();

  const calculateEmissionsBreakdown = () => {
    if (!assessmentData) return [];

    const breakdown = [];

    // Scope 1 Emissions
    let scope1Total = 0;
    
    // Stationary Sources
    if (assessmentData.stationarySources) {
      const stationary = assessmentData.stationarySources;
      
      if (stationary.electricityHeat) {
        const totalVolume = (stationary.electricityHeat.dieselVolume || 0) + (stationary.electricityHeat.gasVolume || 0);
        scope1Total += totalVolume * 2.31;
      }
      
      if (stationary.industrialProcesses) {
        scope1Total += (stationary.industrialProcesses.fuelVolume || 0) * 2.31;
      }
      
      if (stationary.oilGasOperations) {
        scope1Total += (stationary.oilGasOperations.fuelVolume || 0) * 2.31;
      }
    }

    // Mobile Sources
    if (assessmentData.mobileSources) {
      const mobile = assessmentData.mobileSources;
      
      if (mobile.roadTransport) {
        const road = mobile.roadTransport;
        const totalVolume = (road.dieselTruckVolume || 0) + (road.carPetrolVolume || 0) + (road.carDieselVolume || 0);
        scope1Total += totalVolume * 2.31;
      }
      
      if (mobile.vehicleEquipment) {
        const vehicle = mobile.vehicleEquipment;
        const totalVolume = (vehicle.forkliftVolume || 0) + (vehicle.heavyDutyVolume || 0) + (vehicle.tractorVolume || 0);
        scope1Total += totalVolume * 2.31;
      }
      
      if (mobile.marineAviation) {
        const marine = mobile.marineAviation;
        const totalVolume = (marine.helicopterVolume || 0) + (marine.vesselVolume || 0);
        scope1Total += totalVolume * 2.31;
      }
    }

    // Process Emissions
    if (assessmentData.processEmissions) {
      const process = assessmentData.processEmissions;
      
      if (process.co2Release) {
        const co2 = process.co2Release;
        const totalEmissions = (co2.clinkerQuantity || 0) + (co2.calciumOxide || 0) + (co2.magnesiumOxide || 0);
        scope1Total += totalEmissions * 0.44;
      }
      
      if (process.gasFlaring) {
        scope1Total += (process.gasFlaring.gasVolume || 0) * 0.002;
      }
    }

    // Fugitive Emissions
    if (assessmentData.fugitiveEmissions) {
      const fugitive = assessmentData.fugitiveEmissions;
      
      if (fugitive.methaneLeaks) {
        const methane = fugitive.methaneLeaks;
        const totalLeaks = Object.values(methane).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        scope1Total += totalLeaks * 25;
      }
      
      if (fugitive.ventingNaturalGas) {
        scope1Total += (fugitive.ventingNaturalGas.volumeOfGasVented || 0) * 0.002;
      }
    }

    // Scope 2 Emissions (mock data)
    const scope2LocationBased = 750; // kg CO2e
    const scope2MarketBased = 300; // kg CO2e

    if (scope1Total > 0) {
      breakdown.push({
        name: "Scope 1 - Stationary",
        value: scope1Total * 0.4,
        color: "#3B82F6"
      });
      breakdown.push({
        name: "Scope 1 - Mobile",
        value: scope1Total * 0.3,
        color: "#10B981"
      });
      breakdown.push({
        name: "Scope 1 - Process",
        value: scope1Total * 0.2,
        color: "#F59E0B"
      });
      breakdown.push({
        name: "Scope 1 - Fugitive",
        value: scope1Total * 0.1,
        color: "#EF4444"
      });
    }

    breakdown.push({
      name: "Scope 2 - Location",
      value: scope2LocationBased,
      color: "#8B5CF6"
    });
    
    breakdown.push({
      name: "Scope 2 - Market",
      value: scope2MarketBased,
      color: "#EC4899"
    });

    return breakdown;
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
              <div className="text-2xl font-bold text-gray-900">{totalEmissions.toFixed(1)}</div>
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} tonnes CO2e`, 'Emissions']}
                  labelStyle={{ color: '#374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
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
