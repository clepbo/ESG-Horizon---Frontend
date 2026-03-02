"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ChevronRight, Info } from "lucide-react";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { SuccessScreen } from "../../../SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import { useAssessment } from "@/hooks/useAssessment";
import { getFormSectionStatus, getSectionBorderColor, resolveDataPath, type SectionStatus } from "@/lib/assessmentStatusUtils";
import ProcessSafetyEvents from "./process-safety-events";
import CatastrophicRiskManagementSystems from "./catastrophic-risk-management-systems";

type CIRMView = "overview" | "process-safety-events" | "catastrophic-risk-management";

interface CriticalIncidentRiskManagementProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: CIRMView;
  initialStep?: string;
  onContinueToNextAssessment: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
}

const steps = ["process-safety-events", "catastrophic-risk-management"] as const;

export default function CriticalIncidentRiskManagement({
  onBack,
  initialForm,
  onContinueToNextAssessment,
}: CriticalIncidentRiskManagementProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<CIRMView>(initialForm ?? "overview");
  const [showSuccess, setShowSuccess] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const { state, dispatch } = useAssessment();

  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];

  const cardStatusMap: Record<string, { groupKey: string; dataPath: string[] }> = {
    "Process Safety Events (Tier 1)": { groupKey: "leadershipGovernance.criticalIncidentRiskManagement.processSafetyEvents", dataPath: ["leadershipGovernance", "criticalIncidentRiskManagement", "processSafetyEvents"] },
    "Catastrophic Risk Management Systems": { groupKey: "leadershipGovernance.criticalIncidentRiskManagement.catastrophicRiskManagementSystems", dataPath: ["leadershipGovernance", "criticalIncidentRiskManagement", "catastrophicRiskManagementSystems"] },
  };

  const getCardStatus = (cardTitle: string): SectionStatus => {
    const info = cardStatusMap[cardTitle];
    if (!info) return "not-started";
    return getFormSectionStatus(submittedGroups, info.groupKey, !!resolveDataPath(state.assessmentData, info.dataPath));
  };

  const handleBackToOverview = () => {
    setCurrentView("overview");
  };

  const overviewBreadcrumb = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onBack },
    { label: "Critical Incident Risk Management", onClick: handleBackToOverview },
  ];

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Process Safety Events (Tier 1)") {
      setCurrentView("process-safety-events");
    }
    if (cardTitle === "Catastrophic Risk Management Systems") {
      setCurrentView("catastrophic-risk-management");
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Critical Incident Risk Management"
        totals={totals ?? undefined}
        nextAssessment="Management of the Legal & Regulatory Environment"
        onContinue={onContinueToNextAssessment}
        onContinueAssessment={() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" })}
        onBackToHub={onBack}
      />
    );
  }

  if (currentView === "process-safety-events") {
    return (
      <ProcessSafetyEvents
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("catastrophic-risk-management")}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Process Safety Events (Tier 1)" }]}
      />
    );
  }

  if (currentView === "catastrophic-risk-management") {
    return (
      <CatastrophicRiskManagementSystems
        onBack={() => setCurrentView("process-safety-events")}
        onContinueToNextAssessment={() => {
          setShowSuccess(true);
        }}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
        }}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Catastrophic Risk Management Systems" }]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <CustomBreadcrumbDynamic features={overviewBreadcrumb} />
      <div className="max-w-7xl mx-auto space-y-6 mt-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Critical Incident Risk Management
                </h3>
                <p className="text-muted-foreground text-sm">
                  This disclosure topic assesses the company&apos;s effectiveness in preventing and
                  managing high-consequence safety events through quantitative process safety
                  metrics and a description of the management systems used to mitigate catastrophic
                  risks. IFRS codes: EM-EP-540a.1, EM-EP-540a.2
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent(
                      "Critical Incident Risk Management"
                    )}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <div className="space-y-6">
              {/* Process Safety Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold">Process Safety</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1">Process Safety</h6>
                      <p>
                        Enter data or documentation showing how your company manages operational
                        process safety, including systems, controls, and performance indicators used
                        to prevent unplanned releases, fires, or explosions. Use internal audits,
                        safety logs, or compliance assessments as your source.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="max-w-2xl">
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    style={{ borderLeftWidth: "4px", borderLeftColor: getSectionBorderColor(getCardStatus("Process Safety Events (Tier 1)")) }}
                    onClick={() => handleCardClick("Process Safety Events (Tier 1)")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">
                              Process Safety Events (Tier 1)
                            </h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-540a.1, focusing on the rate of Tier 1
                            Process Safety Events, which are the most significant loss of
                            containment incidents.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Catastrophic Risk Management Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold">Catastrophic Risk Management</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1">Catastrophic Risk Management</h6>
                      <p>
                        Provide information on how your company identifies, evaluates, and prepares
                        for low-frequency but high-impact events. Enter details reflecting your
                        catastrophic risk framework, emergency response planning, and mitigation
                        strategies supported by internal reports or third-party assessments.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="max-w-2xl">
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    style={{ borderLeftWidth: "4px", borderLeftColor: getSectionBorderColor(getCardStatus("Catastrophic Risk Management Systems")) }}
                    onClick={() => handleCardClick("Catastrophic Risk Management Systems")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">
                              Catastrophic Risk Management Systems
                            </h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-540a.2, which is a qualitative discussion
                            of the management systems for identifying and mitigating catastrophic
                            and tail-end risks.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
