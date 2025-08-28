"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAssessmentData } from "../AssessmentDataProvider";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

export function Scope1EmissionsChart() {
  const { assessmentData, isLoading } = useAssessmentData();

  // Mock data for now - will be replaced with real data once structure is fixed
  const generateMockScope1Data = () => {
    return [
      {
        category: "Electricity & Heat",
        emissions: 1250.5,
        color: "#3B82F6"
      },
      {
        category: "Industrial Processes",
        emissions: 890.2,
        color: "#10B981"
      },
      {
        category: "Road Transport",
        emissions: 650.8,
        color: "#8B5CF6"
      },
      {
        category: "Vehicle Equipment",
        emissions: 320.1,
        color: "#EF4444"
      },
      {
        category: "Marine & Aviation",
        emissions: 180.3,
        color: "#06B6D4"
      },
      {
        category: "Gas Flaring",
        emissions: 95.7,
        color: "#F97316"
      }
    ];
  };

  const chartData = generateMockScope1Data();
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
      </CardContent>
    </Card>
  );
}
