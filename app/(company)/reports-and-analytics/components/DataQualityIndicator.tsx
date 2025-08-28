"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useAssessmentData } from "../AssessmentDataProvider";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";

export function DataQualityIndicator() {
  const { assessmentData, isLoading } = useAssessmentData();

  // Mock data for now - will be replaced with real data once structure is fixed
  const generateMockDataQuality = () => {
    return {
      score: 75,
      level: "Good",
      issues: [
        "Missing supporting documentation for some sections",
        "Incomplete process emissions data",
        "No fugitive emissions assessment completed"
      ]
    };
  };

  const quality = generateMockDataQuality();

  const getQualityColor = (level: string) => {
    switch (level) {
      case "Excellent": return "text-green-600 bg-green-50";
      case "Good": return "text-blue-600 bg-blue-50";
      case "Fair": return "text-yellow-600 bg-yellow-50";
      default: return "text-red-600 bg-red-50";
    }
  };

  const getQualityIcon = (level: string) => {
    switch (level) {
      case "Excellent": return <CheckCircle className="w-5 h-5" />;
      case "Good": return <Shield className="w-5 h-5" />;
      case "Fair": return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-none shadow rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Data Quality</CardTitle>
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
        <CardTitle className="text-lg font-semibold text-gray-900">Data Quality</CardTitle>
        <p className="text-sm text-gray-600">Assessment of data completeness and reliability</p>
        
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quality Score */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{quality.score}%</div>
            <div className="text-sm text-gray-600">Data Quality Score</div>
          </div>

          {/* Quality Level */}
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${getQualityColor(quality.level)}`}>
            {getQualityIcon(quality.level)}
            <span className="font-medium">{quality.level} Quality</span>
          </div>

          {/* Issues List */}
          {quality.issues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Info className="w-4 h-4" />
                Data Quality Issues
              </div>
              <div className="space-y-1">
                {quality.issues.slice(0, 3).map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{issue}</span>
                  </div>
                ))}
                {quality.issues.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{quality.issues.length - 3} more issues
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Recommendations:</p>
              <ul className="space-y-1">
                {quality.score < 80 && (
                  <li>• Complete missing assessment sections</li>
                )}
                {quality.score < 60 && (
                  <li>• Add supporting documentation</li>
                )}
                {quality.score < 40 && (
                  <li>• Review data accuracy and completeness</li>
                )}
                {quality.score >= 80 && (
                  <li>• Data quality is excellent - ready for reporting</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
