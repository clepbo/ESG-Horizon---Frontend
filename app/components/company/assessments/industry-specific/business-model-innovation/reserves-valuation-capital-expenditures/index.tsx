"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useAssessment } from "@/hooks/useAssessment";
import ReservesSensitivityForm from "./reserves-sensitivity-carbon-pricing";
import EmbeddedCarbonInReserves from "./embedded-carbon-in-reserves";
import RenewableEnergyInvestment from "./renewable-energy-investment";
import CapitalExpenditureStrategy from "./capital-expenditure-strategy";

type RVView =
  | "overview"
  | "reserves-sensitivity-carbon-pricing"
  | "embedded-carbon"
  | "renewable-energy-investment"
  | "capital-expenditure-strategy";

interface ReservesValuationAssessmentProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: RVView;
  initialStep?: string;
  onContinueToNextAssessment: () => void;
  onSubmit: (totals: TotalsResponse | null) => void;
}

const steps = [
  "reserves-sensitivity-carbon-pricing",
  "embedded-carbon",
  "renewable-energy-investment",
  "capital-expenditure-strategy",
] as const;

const scopeData = [
  {
    id: "climate-impact-reserves",
    title: "Climate Impact on Reserves",
    cards: [
      {
        title: "Reserves Sensitivity to Carbon Pricing",
        subtitle:
          "This form covers metric EM-EP-420a.1, focusing on the sensitivity of hydrocarbon reserves to various carbon price scenarios.",
        clickable: true,
      },
      {
        title: "Embedded Carbon in Reserves",
        subtitle:
          "This form covers metric EM-EP-420a.2, which is specific to the estimated CO₂ emissions embedded in proved reserves.",
        clickable: true,
      },
    ],
  },
  {
    id: "strategic-capital-allocation",
    title: "Strategic Capital Allocation",
    cards: [
      {
        title: "Renewable Energy Investment",
        subtitle:
          "This form covers metric EM-EP-420a.3, detailing the investment in and revenue from renewable energy projects.",
        clickable: true,
      },
      {
        title: "Capital Expenditure Strategy",
        subtitle:
          "This form covers metric EM-EP-420a.4, which is a qualitative discussion of how climate factors influence capital expenditure.",
        clickable: true,
      },
    ],
  },
];

export default function ReservesValuationAssessment({
  onBack,
  onBackToHub,
  initialForm,
  onContinueToNextAssessment,
}: ReservesValuationAssessmentProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<RVView>(initialForm ?? "overview");
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
    { label: "Reserves Valuation & Capital Expenditures", onClick: handleBackToOverview },
  ];

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Reserves Sensitivity to Carbon Pricing") {
      setCurrentView("reserves-sensitivity-carbon-pricing");
    }
    if (cardTitle === "Embedded Carbon in Reserves") {
      setCurrentView("embedded-carbon");
    }
    if (cardTitle === "Renewable Energy Investment") {
      setCurrentView("renewable-energy-investment");
    }
    if (cardTitle === "Capital Expenditure Strategy") {
      setCurrentView("capital-expenditure-strategy");
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Capital Expenditure Strategy"
        totals={totals ?? undefined}
        nextAssessment="Next Assessment"
        onContinue={onContinueToNextAssessment}
        onContinueAssessment={() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" })}
        onBackToHub={onBackToHub}
      />
    );
  }

  if (currentView === "reserves-sensitivity-carbon-pricing") {
    return (
      <ReservesSensitivityForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("embedded-carbon")}
        stepIndex={1}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Reserves Sensitivity to Carbon Pricing" }]}
      />
    );
  }

  if (currentView === "embedded-carbon") {
    return (
      <EmbeddedCarbonInReserves
        onBack={() => setCurrentView("reserves-sensitivity-carbon-pricing")}
        onContinueToNextAssessment={() => setCurrentView("renewable-energy-investment")}
        stepIndex={2}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Embedded Carbon in Reserves" }]}
      />
    );
  }

  if (currentView === "renewable-energy-investment") {
    return (
      <RenewableEnergyInvestment
        onBack={() => setCurrentView("embedded-carbon")}
        onContinueToNextAssessment={() => setCurrentView("capital-expenditure-strategy")}
        stepIndex={3}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Renewable Energy Investment" }]}
      />
    );
  }

  if (currentView === "capital-expenditure-strategy") {
    return (
      <CapitalExpenditureStrategy
        onBack={() => setCurrentView("renewable-energy-investment")}
        onContinueToNextAssessment={() => {
          setShowSuccess(true);
        }}
        onSubmit={(totals) => {
          setTotals(totals);
          setShowSuccess(true);
        }}
        stepIndex={4}
        totalSteps={steps.length}
        breadcrumb={[...overviewBreadcrumb, { label: "Capital Expenditure Strategy" }]}
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
                <h3 className="text-2xl font-bold text-foreground">
                  Reserves Valuation & Capital Expenditures
                </h3>
                <p className="text-muted-foreground text-md">
                  This disclosure topic assesses how climate-related risks and opportunities,
                  including carbon pricing and demand shifts, influence the company&apos;s financial
                  planning, reserves valuation, and capital allocation strategies. IFRS codes:
                  EM-EP-420a.1, EM-EP-420a.2, EM-EP-420a.3, EM-EP-420a.4
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent(
                      "Reserves Valuation & Capital Expenditures"
                    )}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <Accordion
              type="multiple"
              defaultValue={["climate-impact-reserves", "strategic-capital-allocation"]}
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
                            {scope.id === "climate-impact-reserves" && (
                              <>
                                <h6 className="font-semibold mb-1">Climate Impact on Reserves</h6>
                                <p>
                                  This metric evaluates how climate-related factors—such as carbon
                                  pricing, emissions regulations, methane restrictions, and
                                  transition-to-renewables scenarios—affect the economic viability
                                  of your proved and probable reserves. It highlights potential
                                  reductions in reserve value due to increased operating costs,
                                  regulatory constraints, or future demand shifts under climate
                                  transition pathways.
                                </p>
                              </>
                            )}
                            {scope.id === "strategic-capital-allocation" && (
                              <>
                                <h6 className="font-semibold mb-1">Strategic Capital Allocation</h6>
                                <p>
                                  This metric assesses how your company allocates capital across
                                  exploration, development, low-carbon projects, and portfolio
                                  diversification efforts. It helps identify whether investment
                                  decisions reflect long-term climate risks, transition planning,
                                  operational efficiency, and alignment with evolving sustainability
                                  expectations.
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
                          className={`transition-colors bg-white shadow-sm rounded-lg ${card.clickable ? "cursor-pointer hover:bg-accent/50" : "cursor-default"
                            }`}
                          onClick={() => card.clickable && handleCardClick(card.title)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1 flex-1">
                                <h5 className="font-medium text-foreground">{card.title}</h5>
                                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
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
