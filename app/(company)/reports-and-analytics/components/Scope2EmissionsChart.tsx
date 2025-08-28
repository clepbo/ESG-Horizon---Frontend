"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useAssessmentData } from "../AssessmentDataProvider";
import { Zap, TrendingDown, TrendingUp } from "lucide-react";

export function Scope2EmissionsChart() {
  const { assessmentData, isLoading } = useAssessmentData();

  // There is no explicit Scope 2 structure yet; derive nothing and show empty state when unavailable
  const chartData: Array<{ month: string; locationBased: number; marketBased: number }> = [];

  const currentLocationBased = chartData[chartData.length - 1]?.locationBased || 0;
  const currentMarketBased = chartData[chartData.length - 1]?.marketBased || 0;
  const previousLocationBased = chartData[chartData.length - 2]?.locationBased || currentLocationBased;
  const previousMarketBased = chartData[chartData.length - 2]?.marketBased || currentMarketBased;
  
  const locationTrend = currentLocationBased < previousLocationBased ? "down" : "up";
  const marketTrend = currentMarketBased < previousMarketBased ? "down" : "up";
  
  const locationTrendValue = previousLocationBased > 0 ? Math.abs(((currentLocationBased - previousLocationBased) / previousLocationBased) * 100).toFixed(1) : "0.0";
  const marketTrendValue = previousMarketBased > 0 ? Math.abs(((currentMarketBased - previousMarketBased) / previousMarketBased) * 100).toFixed(1) : "0.0";

  if (isLoading) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Scope 2 Emissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
            <Zap className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Scope 2 Emissions</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {locationTrend === "down" ? (
                <TrendingDown className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingUp className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${locationTrend === "down" ? "text-green-600" : "text-red-600"}`}>
                {locationTrendValue}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              {marketTrend === "down" ? (
                <TrendingDown className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingUp className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${marketTrend === "down" ? "text-green-600" : "text-red-600"}`}>
                {marketTrendValue}%
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600">Indirect emissions from purchased electricity</p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Scope 2 emissions data available</p>
            <p className="text-sm text-gray-400">Add Scope 2 (electricity) tracking to view trends here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-900">{currentLocationBased.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Location-based (kg CO2e)</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-900">{currentMarketBased.toLocaleString()}</div>
                <div className="text-xs text-purple-600">Market-based (kg CO2e)</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} domain={[0, 'dataMax + 100']} />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} kg CO2e`, 'Emissions']} labelStyle={{ color: '#374151' }} />
                <Line type="monotone" dataKey="locationBased" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }} name="Location-based" />
                <Line type="monotone" dataKey="marketBased" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }} name="Market-based" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
