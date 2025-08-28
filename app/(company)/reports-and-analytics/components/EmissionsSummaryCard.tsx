"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useAssessmentData } from "../AssessmentDataProvider";
import { TrendingDown, TrendingUp, Target, Calendar, Building } from "lucide-react";

export function EmissionsSummaryCard() {
  const { assessmentData, isLoading } = useAssessmentData();

  const calculateEmissionsSummary = () => {
    if (!assessmentData) return null;

    let scope1Total = 0;
    let scope2Total = 1050; // Mock data for Scope 2

    // Calculate Scope 1 emissions
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

    const totalEmissions = scope1Total + scope2Total;
    const previousYear = totalEmissions * 1.15; // Assume 15% higher last year
    const reduction = ((previousYear - totalEmissions) / previousYear) * 100;
    const targetReduction = 20; // Target 20% reduction
    const progressToTarget = Math.min((reduction / targetReduction) * 100, 100);

    return {
      scope1: scope1Total,
      scope2: scope2Total,
      total: totalEmissions,
      reduction,
      progressToTarget,
      targetReduction,
      previousYear
    };
  };

  const summary = calculateEmissionsSummary();

  if (isLoading) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Emissions Summary</CardTitle>
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
          <CardTitle className="text-lg font-semibold text-gray-900">Emissions Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No emissions data available</p>
            <p className="text-sm text-gray-400">Complete your assessment to see summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-none shadow rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Emissions Summary</CardTitle>
        <p className="text-sm text-gray-600">Comprehensive overview of your GHG emissions</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Emissions */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{summary.total.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Total CO2e (tonnes)</div>
          </div>

          {/* Scope Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-900">{summary.scope1.toFixed(1)}</div>
              <div className="text-xs text-blue-600">Scope 1 (tonnes)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-900">{summary.scope2.toFixed(1)}</div>
              <div className="text-xs text-purple-600">Scope 2 (tonnes)</div>
            </div>
          </div>

          {/* Reduction Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Emissions Reduction</span>
              <div className="flex items-center gap-1">
                {summary.reduction > 0 ? (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${summary.reduction > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(summary.reduction).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.abs(summary.reduction), 100)}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-500">
              vs. previous year ({summary.previousYear.toFixed(1)} tonnes)
            </div>
          </div>

          {/* Target Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Target Progress</span>
              <span className="text-sm font-medium text-gray-600">
                {summary.progressToTarget.toFixed(0)}% of {summary.targetReduction}% target
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${summary.progressToTarget}%` }}
              ></div>
            </div>
          </div>

          {/* Assessment Period */}
          {assessmentData && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {assessmentData.startMonth} {assessmentData.startYear} - {assessmentData.endMonth} {assessmentData.endYear}
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
