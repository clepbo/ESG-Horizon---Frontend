"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import EmployeeForm from "./employees-form";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { defaultEmployeeFormData, type EmployeeFormData } from "./types";
import { useAssessment } from "@/hooks/useAssessment";

interface HealthSafetyPerformanceProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex?: number;
  totalSteps?: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function HealthSafetyPerformance({
  onBack,
  onContinueToNextAssessment,
  stepIndex = 1,
  totalSteps = 2,
  breadcrumb,
}: HealthSafetyPerformanceProps) {
  const { state } = useAssessment();

  const savedHealthSafety: any = (state.assessmentData as any)?.humanCapital
    ?.riskAndOpportunityManagement?.healthAndSafetyPerformance;

  const getInitialFormData = (employeeType: "direct" | "contract"): EmployeeFormData => {
    if (!savedHealthSafety) {
      return { ...defaultEmployeeFormData };
    }

    let source: any | undefined;

    if (Array.isArray(savedHealthSafety)) {
      source = savedHealthSafety.find((entry) => entry?.employeeType === employeeType);
    } else if (savedHealthSafety[employeeType]) {
      source = savedHealthSafety[employeeType];
    } else if (savedHealthSafety.employeeType === employeeType) {
      source = savedHealthSafety;
    }

    if (!source) {
      return { ...defaultEmployeeFormData };
    }

    return {
      ...defaultEmployeeFormData,
      totalHoursWorked:
        source.totalHoursWorked !== undefined && source.totalHoursWorked !== null
          ? String(source.totalHoursWorked)
          : "",
      recordableIncidents:
        source.recordableIncidents !== undefined && source.recordableIncidents !== null
          ? String(source.recordableIncidents)
          : "",
      fatalities:
        source.fatalities !== undefined && source.fatalities !== null
          ? String(source.fatalities)
          : "",
      nearMisses:
        source.nearMisses !== undefined && source.nearMisses !== null
          ? String(source.nearMisses)
          : "",
      safetyTrainingHours:
        source.safetyTrainingHours !== undefined && source.safetyTrainingHours !== null
          ? String(source.safetyTrainingHours)
          : "",
      totalHoursWorkedUnit:
        source.totalHoursWorkedUnit ?? defaultEmployeeFormData.totalHoursWorkedUnit,
      recordableIncidentsUnit:
        source.recordableIncidentsUnit ?? defaultEmployeeFormData.recordableIncidentsUnit,
      fatalitiesUnit: source.fatalitiesUnit ?? defaultEmployeeFormData.fatalitiesUnit,
      nearMissesUnit: source.nearMissesUnit ?? defaultEmployeeFormData.nearMissesUnit,
      safetyTrainingHoursUnit:
        source.safetyTrainingHoursUnit ?? defaultEmployeeFormData.safetyTrainingHoursUnit,
      filesAndLinks: Array.isArray(source.filesAndLinks) ? source.filesAndLinks : [],
    };
  };

  const [activeTab, setActiveTab] = useState<string>("direct");
  const formRef = useRef<HTMLDivElement>(null);

  const [directFormData, setDirectFormData] = useState<EmployeeFormData>(() => ({
    ...getInitialFormData("direct"),
  }));

  const [contractFormData, setContractFormData] = useState<EmployeeFormData>(() => ({
    ...getInitialFormData("contract"),
  }));

  const [directProgress, setDirectProgress] = useState({ filled: 0, total: 6 });
  const [contractProgress, setContractProgress] = useState({ filled: 0, total: 6 });

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const combinedProgress = {
    filled: directProgress.filled + contractProgress.filled,
    total: directProgress.total + contractProgress.total,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Health & Safety Performance</h3>
            <p className="text-muted-foreground text-base">
              Report the key health and safety performance indicators for the reporting year. Please
              provide separate data for your direct employees and for contract employees. All rates
              are calculated per 200,000 hours worked.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            {/* Progress Bar - Shows combined progress from both tabs */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={combinedProgress.filled}
              totalFields={combinedProgress.total}
              isSubmitted={false}
            />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="direct">
              {({ activeTab, setActiveTab }) => (
                <>
                  <TabsList>
                    <TabsTrigger value="direct" activeTab={activeTab} onClick={setActiveTab}>
                      Direct Employees
                    </TabsTrigger>
                    <TabsTrigger value="contract" activeTab={activeTab} onClick={setActiveTab}>
                      Contract Employees
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="direct" activeTab={activeTab}>
                    <EmployeeForm
                      employeeType="direct"
                      data={directFormData}
                      onChange={setDirectFormData}
                      onContinueToNextAssessment={onContinueToNextAssessment}
                      onBack={onBack}
                      onProgressChange={setDirectProgress}
                    />
                  </TabsContent>

                  <TabsContent value="contract" activeTab={activeTab}>
                    <EmployeeForm
                      employeeType="contract"
                      data={contractFormData}
                      onChange={setContractFormData}
                      onContinueToNextAssessment={onContinueToNextAssessment}
                      onBack={onBack}
                      onProgressChange={setContractProgress}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
