"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useAssessmentData } from "../AssessmentDataProvider";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";

export function DataQualityIndicator() {
  const { assessmentData, isLoading } = useAssessmentData();

  const computeQuality = () => {
    if (!assessmentData) return { score: 0, level: 'Poor', issues: [ 'No assessment data found' ] };

    const issues: string[] = [];
    let totalChecks = 0;
    let passedChecks = 0;

    // Basic info
    totalChecks += 3;
    if (assessmentData.subsidiary) passedChecks++; else issues.push('Missing subsidiary');
    if (assessmentData.startMonth && assessmentData.startYear) passedChecks++; else issues.push('Missing start period');
    if (assessmentData.endMonth && assessmentData.endYear) passedChecks++; else issues.push('Missing end period');

    // Helper to detect numeric values
    const hasNumeric = (obj: unknown) => {
      if (!obj || typeof obj !== 'object') return false;
      return Object.values(obj as Record<string, unknown>).some(v => typeof v === 'number' && (v as number) > 0);
    };

    // Sections
    const sections: Array<{ name: string; data: unknown }>= [
      { name: 'Stationary Sources', data: assessmentData.stationarySources },
      { name: 'Mobile Sources', data: assessmentData.mobileSources },
      { name: 'Process Emissions', data: assessmentData.processEmissions },
      { name: 'Fugitive Emissions', data: assessmentData.fugitiveEmissions },
    ];

    sections.forEach(({ name, data }) => {
      totalChecks += 2;
      if (data && typeof data === 'object' && Object.keys(data as object).length > 0) {
        passedChecks++;
      } else {
        issues.push(`No ${name} data provided`);
      }
      if (hasNumeric(data)) passedChecks++; else issues.push(`${name} has no numeric values`);
    });

    // Files check (any files anywhere)
    totalChecks += 1;
    const hasFiles = Object.values(assessmentData).some(section => {
      if (section && typeof section === 'object') {
        return Object.values(section as Record<string, unknown>).some(sub => {
          if (sub && typeof sub === 'object' && 'files' in (sub as any)) {
            const files = (sub as any).files as Record<string, unknown> | undefined;
            return files && Object.keys(files).length > 0;
          }
          return false;
        });
      }
      return false;
    });
    if (hasFiles) passedChecks++; else issues.push('No supporting documents uploaded');

    const score = Math.round((passedChecks / Math.max(totalChecks, 1)) * 100);
    let level: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Poor';
    if (score >= 80) level = 'Excellent'; else if (score >= 60) level = 'Good'; else if (score >= 40) level = 'Fair';

    return { score, level, issues };
  };

  const quality = computeQuality();

  const getQualityColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const getQualityIcon = (level: string) => {
    switch (level) {
      case 'Excellent': return <CheckCircle className="w-5 h-5" />;
      case 'Good': return <Shield className="w-5 h-5" />;
      case 'Fair': return <AlertTriangle className="w-5 h-5" />;
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
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{quality.score}%</div>
            <div className="text-sm text-gray-600">Data Quality Score</div>
          </div>

          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${getQualityColor(quality.level)}`}>
            {getQualityIcon(quality.level)}
            <span className="font-medium">{quality.level} Quality</span>
          </div>

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
                  <div className="text-xs text-gray-500">+{quality.issues.length - 3} more issues</div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Recommendations:</p>
              <ul className="space-y-1">
                {quality.score < 80 && (<li>• Complete missing assessment sections</li>)}
                {quality.score < 60 && (<li>• Add supporting documentation</li>)}
                {quality.score < 40 && (<li>• Review data accuracy and completeness</li>)}
                {quality.score >= 80 && (<li>• Data quality is excellent - ready for reporting</li>)}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
