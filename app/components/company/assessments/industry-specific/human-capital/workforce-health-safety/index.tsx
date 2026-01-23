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
import HealthSafetyPerformance from "./health-safety-performance";
import SafetyManagementSystems from "./safety-management-systems";
import { useAssessmentCompletion } from "@/hooks/useAssessmentCompletion";
import { checkSubComponentCompletion } from "@/lib/assessmentCompletionUtils";
import { CompletionIndicator } from "@/app/components/ui/reusables/CompletionIndication";

type WHSView = "overview" | "health-safety-performance" | "safety-management-systems";

interface WorkforceHealthSafetyProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: WHSView;
  initialStep?: string;
  onContinueToNextAssessment: () => void;
}

const scopeData = [
  {
    id: "risk-opportunity-management",
    title: "Risk & Opportunity Management",
    cards: [
      {
        title: "Health & Safety Performance",
        subtitle:
          "This form covers metric EM-EP-320a.1, focusing on the quantitative safety performance indicators for both direct and contract employees.",
        clickable: true,
      },
      {
        title: "Safety Management Systems",
        subtitle:
          "This form covers metric EM-EP-320a.2, detailing the qualitative discussion of management systems used to foster a culture of safety.",
        clickable: true,
      },
    ],
  },
];

const steps = ["Health & Safety Performance", "Safety Management Systems"];

export default function WorkforceHealthSafety({
  onBack,
  onBackToHub,
  initialForm,
  onContinueToNextAssessment,
}: WorkforceHealthSafetyProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<WHSView>(initialForm ?? "overview");
  const [showSuccess, setShowSuccess] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const { state, dispatch } = useAssessment();

  const { getStatus, getCardBorderClass } = useAssessmentCompletion(
    scopeData,
    state.assessmentData,
    checkSubComponentCompletion
  );

  const handleBackToOverview = () => {
    setCurrentView("overview");
  };

  const overviewBreadcrumb = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onBack },
    { label: "Workforce Health & Safety", onClick: handleBackToOverview },
  ];

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Health & Safety Performance") {
      setCurrentView("health-safety-performance");
    }
    if (cardTitle === "Safety Management Systems") {
      setCurrentView("safety-management-systems");
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Safety Management Systems"
        totals={totals ?? undefined}
        nextAssessment="Reserves Valuation and Capital Expenditures"
        onContinue={onContinueToNextAssessment}
        onContinueAssessment={() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" })}
        onBackToHub={onBackToHub}
      />
    );
  }

  if (currentView === "health-safety-performance") {
    const healthSafetyBreadcrumb = [
      { label: "Dashboard", href: "/dashboard-esg" },
      { label: "Assessments", href: "/assessments/hub" },
      { label: "Disclosure topics", onClick: onBack },
      { label: "Workforce Health & Safety", onClick: handleBackToOverview },
      { label: "Health & Safety Performance" },
    ];

    return (
      <HealthSafetyPerformance
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("safety-management-systems")}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={healthSafetyBreadcrumb}
      />
    );
  }

  if (currentView === "safety-management-systems") {
    const safetyMgmtBreadcrumb = [
      { label: "Dashboard", href: "/dashboard-esg" },
      { label: "Assessments", href: "/assessments/hub" },
      { label: "Disclosure topics", onClick: onBack },
      { label: "Workforce Health & Safety", onClick: handleBackToOverview },
      { label: "Safety Management Systems" },
    ];

    return (
      <SafetyManagementSystems
        onBack={() => setCurrentView("health-safety-performance")}
        onContinueToNextAssessment={() => {
          setShowSuccess(true);
        }}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
        }}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={safetyMgmtBreadcrumb}
      />
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <CustomBreadcrumbDynamic features={overviewBreadcrumb} />
      <div className="max-w-7xl mx-auto space-y-6 mt-4">
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mt-5 mb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Workforce Health & Safety</h3>
                <p className="text-muted-foreground text-md">
                  This disclosure topic assesses the company&apos;s performance in protecting its
                  workforce from occupational harm through quantitative safety metrics and a
                  description of its underlying safety management systems. IFRS codes: EM-EP-320a.1,
                  EM-EP-320a.2
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent(
                      "Workforce Health & Safety"
                    )}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <div className="space-y-6">
              {scopeData.map((scope) => (
                <div key={scope.id}>
                  <div className="flex items-center mb-4">
                    <span className="text-lg font-semibold flex items-center gap-2">
                      {scope.title}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="start"
                          className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                        >
                          <h6 className="font-semibold mb-1">Risk & Opportunity Management</h6>
                          <p>
                            Describe how your company identifies, assesses, and manages health and
                            safety risks that could affect employees, contractors, or on-site
                            workers. This may include safety audits, hazard controls, training
                            programs, emergency preparedness, incident investigations, and
                            continuous improvement plans.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scope.cards.map((card) => (
                      <Card
                        key={card.title}
                        className={`transition-colors bg-white shadow-sm rounded-lg ${getCardBorderClass(
                          card.title
                        )} ${
                          card.clickable ? "cursor-pointer hover:bg-accent/50" : "cursor-default"
                        }`}
                        onClick={() => card.clickable && handleCardClick(card.title)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-foreground">{card.title}</h5>
                                <CompletionIndicator status={getStatus(card.title)} />
                              </div>
                              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
