"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ChevronRight, Info } from "lucide-react";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { SuccessScreen } from "../../../SuccessScreen";
import { TotalsResponse } from "@/services/assessment.service";
import EnvironmentalManagementPolicies from "./environmental-managment-policies";
import HydrocarbonSpills from "./hydrocarbon-spills";
import ReservesInSensitiveAreas from "./reserves-in-sensitive-areas";
import { useAssessment } from "@/hooks/useAssessment";
import { getFormSectionStatus, getSectionBorderColor, resolveDataPath, type SectionStatus } from "@/lib/assessmentStatusUtils";

type SHRView =
  | "overview"
  | "environmental-management-policies"
  | "hydrocarbon-spills"
  | "reserves-in-sensitive-areas";

interface BioDiversityImpactProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: SHRView;
  initialStep?: string;
  onContinueToNextAssessment: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
}

const steps = [
  "environmental-management-policies",
  "hydrocarbon-spills",
  "reserves-in-sensitive-areas",
] as const;

const scopeData = [
  {
    id: "environmental-management",
    title: "Environmental Management",
    cards: [
      {
        title: "Environmental Management Policies",
        subtitle:
          "This form covers metric EM-EP-160a.1, which is qualitative and descriptive, covering policies and practices for active sites.",
        clickable: true,
      },
      {
        title: "Hydrocarbon Spills",
        subtitle:
          "This form covers metric EM-EP-160a.2, focusing on the quantitative impact of operational spills on the environment.",
        clickable: true,
      },
      {
        title: "Reserves in Sensitive Areas",
        subtitle:
          "This form covers metric EM-EP-160a.3, quantifying the potential future impact on biodiversity based on reserve locations.",
        clickable: true,
      },
    ],
  },
];

export function BioDiversityImpact({ onBack, initialForm, onContinueToNextAssessment }: BioDiversityImpactProps) {
  const router = useRouter();
  const { state } = useAssessment();
  const [currentView, setCurrentView] = useState<SHRView>(initialForm ?? "overview");

  const [showSuccess, setShowSuccess] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);

  const params = useParams();

  const reportId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const handleViewReport = () => {
    if (reportId) {
      router.push(`/reports-and-analytics/${reportId}?tab=environmental`);
    } else {
      router.push("/reports-and-analytics");
    }
  };

  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];

  const cardStatusMap: Record<string, { groupKey: string; dataPath: string[] }> = {
    "Environmental Management Policies": { groupKey: "environment.biodiversityImpact.environmentalManagement.environmentalManagementPolicies", dataPath: ["environment", "biodiversityImpact", "environmentalManagement", "environmentalManagementPolicies"] },
    "Hydrocarbon Spills": { groupKey: "environment.biodiversityImpact.environmentalManagement.hydrocarbonSpills", dataPath: ["environment", "biodiversityImpact", "environmentalManagement", "hydrocarbonSpills"] },
    "Reserves in Sensitive Areas": { groupKey: "environment.biodiversityImpact.environmentalManagement.reservesInSensitiveAreas", dataPath: ["environment", "biodiversityImpact", "environmentalManagement", "reservesInSensitiveAreas"] },
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
    { label: "Biodiversity Impact", onClick: handleBackToOverview },
  ];

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Environmental Management Policies") {
      setCurrentView("environmental-management-policies");
    }
    if (cardTitle === "Hydrocarbon Spills") {
      setCurrentView("hydrocarbon-spills");
    }
    if (cardTitle === "Reserves in Sensitive Areas") {
      setCurrentView("reserves-in-sensitive-areas");
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Biodiversity Impacts"
        nextAssessment="Social Capital &amp; Human Rights"
        totals={totals ?? undefined}
        reportId={reportId}
        onContinue={handleViewReport}
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={onBack}
      />
    );
  }

  if (currentView === "environmental-management-policies") {
    return (
      <EnvironmentalManagementPolicies
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("hydrocarbon-spills")}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Environmental Management Policies" }]}
      />
    );
  }

  if (currentView === "hydrocarbon-spills") {
    return (
      <HydrocarbonSpills
        onBack={() => setCurrentView("environmental-management-policies")}
        onContinueToNextAssessment={() => setCurrentView("reserves-in-sensitive-areas")}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Hydrocarbon Spills" }]}
      />
    );
  }

  if (currentView === "reserves-in-sensitive-areas") {
    return (
      <ReservesInSensitiveAreas
        onBack={() => setCurrentView("hydrocarbon-spills")}
        onContinueToNextAssessment={() => {
          setShowSuccess(true);
        }}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
        }}
        stepIndex={3}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Reserves in Sensitive Areas" }]}
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
                <h3 className="text-2xl font-bold text-foreground">Biodiversity Impacts</h3>
                <p className="text-muted-foreground text-md">
                  This disclosure topic assesses the company&apos;s approach to minimizing its
                  ecological footprint, covering management policies, the impact of operational
                  spills, and the proximity of its reserves to environmentally sensitive areas.
                  (IFRS codes: EM-EP-160a.1, EM-EP-160a.2, EM-EP-160a.3)
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent("Biodiversity Impact")}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <Accordion
              type="multiple"
              defaultValue={["environmental-management"]}
              className="space-y-4"
            >
              {scopeData.map((scope) => (
                <AccordionItem key={scope.id} value={scope.id} className="border-0">
                  <AccordionTrigger className="py-4 px-2 rounded-lg bg-transparent hover:no-underline hover:cursor-pointer">
                    <div className="flex items-center w-full relative">
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
                            {scope.id === "environmental-management" && (
                              <>
                                <h6 className="font-semibold mb-1">Environmental Management</h6>
                                <p>
                                  Report the policies, procedures, and operational practices your
                                  company uses to protect biodiversity during exploration and
                                  production activities. This includes measures such as habitat
                                  protection plans, impact assessments, restoration programs, waste
                                  handling procedures, and monitoring systems designed to prevent or
                                  minimize harm to natural ecosystems.
                                </p>
                              </>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="flex-1 h-0.5 bg-gray-300 mx-3 self-center" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scope.cards.map((card) => (
                        <Card
                          key={card.title}
                          className={`transition-all bg-white shadow-sm rounded-lg ${
                            card.clickable
                              ? "cursor-pointer hover:bg-accent/50 hover:shadow-md"
                              : "cursor-default"
                          }`}
                          style={{ borderLeftWidth: "4px", borderLeftColor: getSectionBorderColor(getCardStatus(card.title)) }}
                          onClick={() => card.clickable && handleCardClick(card.title)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2 flex-1">
                                <h5 className="font-medium text-foreground">{card.title}</h5>
                                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
