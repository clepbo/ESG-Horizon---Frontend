"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { useAssessmentData } from "../AssessmentDataProvider";
import { CheckCircle, Circle, Clock } from "lucide-react";

export function AssessmentProgressCard() {
  const { assessmentData, isLoading } = useAssessmentData();

  const calculateAssessmentProgress = () => {
    if (!assessmentData) return [];

    const sections = [
      {
        name: "Stationary Sources",
        completed: !!(
          assessmentData.stationarySources?.electricityHeat ||
          assessmentData.stationarySources?.industrialProcesses ||
          assessmentData.stationarySources?.oilGasOperations
        ),
        inProgress: false,
        progress: 0
      },
      {
        name: "Mobile Sources",
        completed: !!(
          assessmentData.mobileSources?.roadTransport ||
          assessmentData.mobileSources?.vehicleEquipment ||
          assessmentData.mobileSources?.marineAviation
        ),
        inProgress: false,
        progress: 0
      },
      {
        name: "Process Emissions",
        completed: !!(
          assessmentData.processEmissions?.co2Release ||
          assessmentData.processEmissions?.gasFlaring ||
          assessmentData.processEmissions?.fertilizerEmissions ||
          assessmentData.processEmissions?.entericFermentation ||
          assessmentData.processEmissions?.methaneNitrousOxide
        ),
        inProgress: false,
        progress: 0
      },
      {
        name: "Fugitive Emissions",
        completed: !!(
          assessmentData.fugitiveEmissions?.methaneLeaks ||
          assessmentData.fugitiveEmissions?.ventingNaturalGas ||
          assessmentData.fugitiveEmissions?.incompleteCombustion ||
          assessmentData.fugitiveEmissions?.hfcLeaks
        ),
        inProgress: false,
        progress: 0
      }
    ];

    // Calculate progress for each section
    sections.forEach(section => {
      if (section.name === "Stationary Sources") {
        const stationary = assessmentData.stationarySources;
        let completed = 0;
        let total = 3;
        
        if (stationary?.electricityHeat) completed++;
        if (stationary?.industrialProcesses) completed++;
        if (stationary?.oilGasOperations) completed++;
        
        section.progress = (completed / total) * 100;
        section.inProgress = completed > 0 && completed < total;
      }
      
      if (section.name === "Mobile Sources") {
        const mobile = assessmentData.mobileSources;
        let completed = 0;
        let total = 3;
        
        if (mobile?.roadTransport) completed++;
        if (mobile?.vehicleEquipment) completed++;
        if (mobile?.marineAviation) completed++;
        
        section.progress = (completed / total) * 100;
        section.inProgress = completed > 0 && completed < total;
      }
      
      if (section.name === "Process Emissions") {
        const process = assessmentData.processEmissions;
        let completed = 0;
        let total = 5;
        
        if (process?.co2Release) completed++;
        if (process?.gasFlaring) completed++;
        if (process?.fertilizerEmissions) completed++;
        if (process?.entericFermentation) completed++;
        if (process?.methaneNitrousOxide) completed++;
        
        section.progress = (completed / total) * 100;
        section.inProgress = completed > 0 && completed < total;
      }
      
      if (section.name === "Fugitive Emissions") {
        const fugitive = assessmentData.fugitiveEmissions;
        let completed = 0;
        let total = 4;
        
        if (fugitive?.methaneLeaks) completed++;
        if (fugitive?.ventingNaturalGas) completed++;
        if (fugitive?.incompleteCombustion) completed++;
        if (fugitive?.hfcLeaks) completed++;
        
        section.progress = (completed / total) * 100;
        section.inProgress = completed > 0 && completed < total;
      }
    });

    return sections;
  };

  const sections = calculateAssessmentProgress();
  const totalCompleted = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  const overallProgress = (totalCompleted / totalSections) * 100;

  if (isLoading) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Assessment Progress</CardTitle>
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
        <CardTitle className="text-lg font-semibold text-gray-900">Assessment Progress</CardTitle>
        <p className="text-sm text-gray-600">Completion status of GHG emissions assessment</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{overallProgress.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Overall Completion</div>
            <Progress value={overallProgress} className="mt-2" />
          </div>

          {/* Section Progress */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {section.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : section.inProgress ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{section.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{section.progress.toFixed(0)}%</span>
                </div>
                <Progress value={section.progress} className="h-2" />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{totalCompleted}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-400">{totalSections - totalCompleted}</div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
