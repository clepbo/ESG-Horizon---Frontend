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
import ReservesCountriesCorruptionRisk from "./reserves-countries-corruption-risk";
import AntiCorruptionManagement from "./anti-corruption-management";

type BEView = "overview" | "reserves-countries-corruption-risk" | "anti-corruption-management";

interface BusinessEthicsAssessmentProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: BEView;
  initialStep?: string;
  onContinueToNextAssessment: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
}

const steps = ["reserves-countries-corruption-risk", "anti-corruption-management"] as const;

export default function BusinessEthicsAssessment({
  onBack,
  initialForm,
  onContinueToNextAssessment,
}: BusinessEthicsAssessmentProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<BEView>(initialForm ?? "overview");
  const [showSuccess, setShowSuccess] = useState(false);
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const { dispatch } = useAssessment();

  const handleBackToOverview = () => {
    setCurrentView("overview");
  };

  const overviewBreadcrumb = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onBack },
    { label: "Business Ethics & Transparency", onClick: handleBackToOverview },
  ];

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Reserves in Countries with High Corruption Risk") {
      setCurrentView("reserves-countries-corruption-risk");
    }
    if (cardTitle === "Anti-Corruption Management System") {
      setCurrentView("anti-corruption-management");
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Business Ethics & Transparency"
        totals={totals ?? undefined}
        nextAssessment="Next Assessment"
        onContinue={onContinueToNextAssessment}
        onContinueAssessment={() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" })}
        onBackToHub={onBack}
      />
    );
  }

  if (currentView === "reserves-countries-corruption-risk") {
    return (
      <ReservesCountriesCorruptionRisk
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("anti-corruption-management")}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Reserves Sensitivity to Carbon Pricing" }]}
      />
    );
  }

  if (currentView === "anti-corruption-management") {
    return (
      <AntiCorruptionManagement
        onBack={() => setCurrentView("reserves-countries-corruption-risk")}
        onContinueToNextAssessment={() => {
          setShowSuccess(true);
        }}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
        }}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Capital Expenditure Strategy" }]}
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
                  Business Ethics & Transparency
                </h3>
                <p className="text-muted-foreground text-sm">
                  This disclosure topic assesses the company&apos;s exposure to corruption risk
                  based on the location of its reserves and describes the management systems
                  implemented to ensure ethical conduct and prevent bribery throughout its value
                  chain. IFRS codes: EM-EP-510a.1, EM-EP-510a.2
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent(
                      "Business Ethics & Transparency"
                    )}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <div className="space-y-6">
              {/* Geopolitical & Corruption Risk Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold">Geopolitical & Corruption Risk</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1">Geopolitical & Corruption Risk</h6>
                      <p>
                        Provide information on how your company evaluates and manages exposure to
                        geopolitical instability or corruption risks in the regions where it
                        operates. Include insights from internal assessments, compliance reviews, or
                        third-party risk analyses.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="max-w-2xl">
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    onClick={() =>
                      handleCardClick("Reserves in Countries with High Corruption Risk")
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">
                            Reserves in Countries with High Corruption Risk
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-510a.1, focusing on the percentage of
                            reserves located in countries with low rankings on the Corruption
                            Perception Index.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Anti-Corruption Management Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold">Anti-Corruption Management</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1">Anti-Corruption Management</h6>
                      <p>
                        Describe your company’s policies, controls, and training programs aimed at
                        preventing bribery, fraud, and other corrupt practices. Use details from
                        compliance frameworks, audit findings, or ethics program documentation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="max-w-2xl">
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    onClick={() => handleCardClick("Anti-Corruption Management System")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">
                            Anti-Corruption Management System
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-510a.2, which is a qualitative discussion
                            of the management system for preventing corruption and bribery.
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
