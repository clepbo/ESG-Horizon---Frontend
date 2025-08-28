"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAssessmentData } from "../AssessmentDataProvider";
import { PieChart as PieChartIcon } from "lucide-react";

export function EmissionsBreakdownChart() {
  const { assessmentData, isLoading } = useAssessmentData();

  // Mock data for now - will be replaced with real data once structure is fixed
  const generateMockEmissionsBreakdown = () => {
    return [
      {
        name: "Scope 1 - Stationary",
        value: 1250.5,
        color: "#3B82F6"
      },
      {
        name: "Scope 1 - Mobile",
        value: 1150.9,
        color: "#10B981"
      },
      {
        name: "Scope 1 - Process",
        value: 95.7,
        color: "#F59E0B"
      },
      {
        name: "Scope 1 - Fugitive",
        value: 180.3,
        color: "#EF4444"
      },
      {
        name: "Scope 2 - Location",
        value: 750.0,
        color: "#8B5CF6"
      },
      {
        name: "Scope 2 - Market",
        value: 300.0,
        color: "#EC4899"
      }
    ];
  };

  const chartData = generateMockEmissionsBreakdown();
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
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
      </CardContent>
    </Card>
  );
}
