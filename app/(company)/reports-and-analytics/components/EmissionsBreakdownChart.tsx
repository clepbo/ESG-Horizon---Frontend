"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAssessment } from "@/hooks/useAssessment";
import { PieChart as PieChartIcon } from "lucide-react";

export function EmissionsBreakdownChart() {
  const { state: { assessmentData, isLoading } } = useAssessment();

  const toNumber = (val: unknown): number => (typeof val === 'number' && !isNaN(val) ? val : 0);

  const calculateEmissionsBreakdown = () => {
    if (!assessmentData) return [] as { name: string; value: number; color: string }[];

    const parts: { name: string; value: number; color: string }[] = [];

    // Stationary
    if (assessmentData.stationarySources) {
      const s = assessmentData.stationarySources;
      const elec = s.electricityHeat ? (toNumber(s.electricityHeat.dieselVolume) + toNumber(s.electricityHeat.gasVolume)) * 2.31 : 0;
      if (elec > 0) parts.push({ name: 'Scope 1 - Stationary', value: elec, color: '#3B82F6' });

      const ind = s.industrialProcesses ? toNumber(s.industrialProcesses.fuelVolume) * 2.31 : 0;
      if (ind > 0) parts.push({ name: 'Scope 1 - Industrial', value: ind, color: '#10B981' });

      const og = s.oilGasOperations ? toNumber(s.oilGasOperations.fuelVolume) * 2.31 : 0;
      if (og > 0) parts.push({ name: 'Scope 1 - Oil & Gas', value: og, color: '#F59E0B' });
    }

    // Mobile
    if (assessmentData.mobileSources) {
      const m = assessmentData.mobileSources;
      const road = m.roadTransport ? (toNumber(m.roadTransport.dieselTruckVolume) + toNumber(m.roadTransport.carPetrolVolume) + toNumber(m.roadTransport.carDieselVolume)) * 2.31 : 0;
      if (road > 0) parts.push({ name: 'Scope 1 - Road', value: road, color: '#8B5CF6' });

      const veh = m.vehicleEquipment ? (toNumber(m.vehicleEquipment.forkliftVolume) + toNumber(m.vehicleEquipment.heavyDutyVolume) + toNumber(m.vehicleEquipment.tractorVolume)) * 2.31 : 0;
      if (veh > 0) parts.push({ name: 'Scope 1 - Equipment', value: veh, color: '#EF4444' });

      const ma = m.marineAviation ? (toNumber(m.marineAviation.helicopterVolume) + toNumber(m.marineAviation.vesselVolume)) * 2.31 : 0;
      if (ma > 0) parts.push({ name: 'Scope 1 - Marine/Aviation', value: ma, color: '#06B6D4' });
    }

    // Process
    if (assessmentData.processEmissions?.co2Release) {
      const co2 = assessmentData.processEmissions.co2Release;
      const proc = (toNumber(co2.clinkerQuantity) + toNumber(co2.calciumOxide) + toNumber(co2.magnesiumOxide)) * 0.44;
      if (proc > 0) parts.push({ name: 'Scope 1 - Process', value: proc, color: '#84CC16' });
    }

    if (assessmentData.processEmissions?.gasFlaring) {
      const fl = assessmentData.processEmissions.gasFlaring;
      const val = toNumber(fl.gasVolume) * 0.002;
      if (val > 0) parts.push({ name: 'Scope 1 - Gas Flaring', value: val, color: '#F97316' });
    }

    // Fugitive
    if (assessmentData.fugitiveEmissions?.methaneLeaks) {
      const methane = assessmentData.fugitiveEmissions.methaneLeaks;
      // const leaks = Object.values(methane).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0) * 25;
      const leaks = Object.values(methane).reduce<number>((sum, v) => sum + toNumber(v), 0) * 25;
      if (leaks > 0) parts.push({ name: 'Scope 1 - Fugitive', value: leaks, color: '#EC4899' });
    }

    if (assessmentData.fugitiveEmissions?.ventingNaturalGas) {
      const vn = assessmentData.fugitiveEmissions.ventingNaturalGas;
      const val = toNumber(vn.volumeOfGasVented) * 0.002;
      if (val > 0) parts.push({ name: 'Scope 1 - Venting', value: val, color: '#A855F7' });
    }

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
              <div className="text-2xl font-bold text-gray-900">{totalEmissions.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)} tonnes CO2e`, 'Emissions']} labelStyle={{ color: '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
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
