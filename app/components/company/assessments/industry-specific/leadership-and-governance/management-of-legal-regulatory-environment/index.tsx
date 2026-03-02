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
import PublicPolicyEngagement from "./public-policy-engagement";
import BoardManagementOversight from "./board-management-oversight";

type LREView = "overview" | "public-policy-engagement" | "board-management-oversight";

interface LegalRegulatoryEnvironmentProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: LREView;
  initialStep?: string;
  onContinueToNextAssessment: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
}

const steps = ["public-policy-engagement", "board-management-oversight"] as const;

export default function LegalRegulatoryEnvironment({
  onBack,
  initialForm,
  onContinueToNextAssessment,
}: LegalRegulatoryEnvironmentProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<LREView>(initialForm ?? "overview");
  const [showSuccess, setShowSuccess] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const { state, dispatch } = useAssessment();

  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];

  const cardStatusMap: Record<string, { groupKey: string; dataPath: string[] }> = {
    "Public Policy Engagement": { groupKey: "leadershipGovernance.legalRegulatoryEnvironment.publicPolicyEngagement", dataPath: ["leadershipGovernance", "managementOfTheLegalAndRegulatoryEnvironment", "publicPolicyEngagement"] },
    "Board & Management Oversight of Sustainability": { groupKey: "leadershipGovernance.legalRegulatoryEnvironment.boardManagementOversight", dataPath: ["leadershipGovernance", "managementOfTheLegalAndRegulatoryEnvironment", "boardAndManagementOversight"] },
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
    { label: "Management of the Legal & Regulatory Environment", onClick: handleBackToOverview },
  ];

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Public Policy Engagement") {
      setCurrentView("public-policy-engagement");
    }
    if (cardTitle === "Board & Management Oversight of Sustainability") {
      setCurrentView("board-management-oversight");
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Management of the Legal & Regulatory Environment"
        totals={totals ?? undefined}
        nextAssessment={null}
        onContinue={onContinueToNextAssessment}
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentView === "public-policy-engagement") {
    return (
      <PublicPolicyEngagement
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("board-management-oversight")}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Public Policy Engagement" }]}
      />
    );
  }

  if (currentView === "board-management-oversight") {
    return (
      <BoardManagementOversight
        onBack={() => setCurrentView("public-policy-engagement")}
        onContinueToNextAssessment={() => {
          setShowSuccess(true);
        }}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
        }}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[
          ...overviewBreadcrumb,
          { label: "Board & Management Oversight of Sustainability" },
        ]}
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
                  Management of the Legal & Regulatory Environment
                </h3>
                <p className="text-muted-foreground text-sm">
                  This disclosure topic assesses the company&apos;s strategic approach to engaging
                  with and influencing government regulations and policy proposals related to the
                  environmental and social factors affecting the industry. IFRS code: EM-EP-530a.1
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent(
                      "Management of the Legal & Regulatory Environment"
                    )}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <div className="space-y-6">
              {/* Public Policy & Lobbying Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold">Public Policy & Lobbying</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1">Public Policy & Lobbying</h6>
                      <p>
                        Provide information on your company’s engagement in public policy, including
                        lobbying activities, regulatory submissions, or participation in industry
                        groups. Enter details that reflect how your organization influences or
                        responds to government policy within the reporting period.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="max-w-2xl">
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    style={{ borderLeftWidth: "4px", borderLeftColor: getSectionBorderColor(getCardStatus("Public Policy Engagement")) }}
                    onClick={() => handleCardClick("Public Policy Engagement")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">Public Policy Engagement</h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-530a.1, which is a qualitative discussion
                            of the company&apos;s positions on key government regulations and
                            policies.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sustainability Governance & Reporting Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold">
                    Sustainability Governance & Reporting (Nigeria)
                  </h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1">
                        Sustainability Governance & Reporting (Nigeria)
                      </h6>
                      <p>
                        Provide information on your company’s engagement in public policy, including
                        lobbying activities, regulatory submissions, or participation in industry
                        groups. Enter details that reflect how your organization influences or
                        responds to government policy within the reporting period.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="max-w-2xl">
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    style={{ borderLeftWidth: "4px", borderLeftColor: getSectionBorderColor(getCardStatus("Board & Management Oversight of Sustainability")) }}
                    onClick={() =>
                      handleCardClick("Board & Management Oversight of Sustainability")
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">
                              Board & Management Oversight of Sustainability
                            </h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-NGA.G1, which discusses the board&apos;s
                            oversight and management&apos;s role in assessing sustainability risks,
                            with a specific focus on Nigerian regulatory requirements.
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
