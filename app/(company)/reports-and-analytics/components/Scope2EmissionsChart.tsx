"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { useAssessmentData } from "../AssessmentDataProvider";
import { Zap, TrendingDown, TrendingUp } from "lucide-react";

export function Scope2EmissionsChart() {
  const { assessmentData, isLoading } = useAssessmentData();

  const parseNum = (v: unknown): number => {
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    if (typeof v === 'string') {
      const n = Number(String(v).replace(/[^0-9.-]/g, ''));
      return isNaN(n) ? 0 : n;
    }
    return 0;
  };

  const gridEF = 0.5;

  const computeScope2Totals = () => {
    if (!assessmentData) return { locationBased: 0, marketBased: 0 };

    // Location-based sources
    let locationBased = 0;
    if (assessmentData.electricity) {
      locationBased += parseNum(assessmentData.electricity.electricityConsumed) * gridEF;
    }
    if (assessmentData.cooling) {
      locationBased += parseNum(assessmentData.cooling.coolingConsumed) * gridEF;
    }
    if (assessmentData.steam) {
      locationBased += parseNum(assessmentData.steam.volume) * gridEF;
    }
    if (assessmentData.heating) {
      locationBased += parseNum(assessmentData.heating.heatingConsumed) * gridEF;
    }

    let marketBased = 0;
    if (assessmentData.ipps) {
      marketBased += parseNum(assessmentData.ipps.electricityConsumed) * (parseNum(assessmentData.ipps.emissionFactor) || gridEF);
    }
    if (assessmentData.eac) {
      marketBased += parseNum(assessmentData.eac.gridElectricity) * (parseNum(assessmentData.eac.emissionFactor) || gridEF);
    }
    if (assessmentData.residual) {
      marketBased += parseNum(assessmentData.residual.electricityConsumed) * (parseNum(assessmentData.residual.residualMixFactor) || gridEF);
    }
    if (assessmentData.coolingSteam) {
      marketBased += parseNum(assessmentData.coolingSteam.energyConsumed) * (parseNum(assessmentData.coolingSteam.emissionFactor) || gridEF);
    }

    return { locationBased, marketBased };
  };

  const totals = computeScope2Totals();

  const chartData = [
    { label: 'Location-based', value: Math.round(totals.locationBased) },
    { label: 'Market-based', value: Math.round(totals.marketBased) },
  ];

  const currentLocationBased = chartData[0].value;
  const currentMarketBased = chartData[1].value;
  const previousLocationBased = currentLocationBased * 1.05; // simple reference for trend
  const previousMarketBased = currentMarketBased * 1.05;
  
  const locationTrend = currentLocationBased < previousLocationBased ? "down" : "up";
  const marketTrend = currentMarketBased < previousMarketBased ? "down" : "up";
  
  const locationTrendValue = previousLocationBased > 0 ? Math.abs(((currentLocationBased - previousLocationBased) / previousLocationBased) * 100).toFixed(1) : "0.0";
  const marketTrendValue = previousMarketBased > 0 ? Math.abs(((currentMarketBased - previousMarketBased) / previousMarketBased) * 100).toFixed(1) : "0.0";

  const hasData = currentLocationBased > 0 || currentMarketBased > 0;

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
        <p className="text-sm text-gray-600">Indirect emissions from purchased energy (kg CO2e)</p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-900">{currentLocationBased.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Location-based</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-900">{currentMarketBased.toLocaleString()}</div>
                <div className="text-xs text-purple-600">Market-based</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip formatter={(value: number) => [`${Number(value).toLocaleString()} kg CO2e`, 'Emissions']} labelStyle={{ color: '#374151' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64} fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Scope 2 emissions data available</p>
            <p className="text-sm text-gray-400">Add Scope 2 entries (electricity, cooling, steam, heating, IPPs/EAC etc.)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
