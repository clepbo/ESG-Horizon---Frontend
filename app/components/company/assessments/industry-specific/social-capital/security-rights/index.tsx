"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import ReservesAreaConflict from "./reserves-area-conflict";
import ReservesIndigenousLand from "./reserves-indigenous-land";
import HumanRightEngagement from "./human-right-engagement";

type SHRView =
  | "overview"
  | "reserves-in-conflict"
  | "reserves-indigenous-land"
  | "human-rights-engagement";

interface SecurityHumanRightsAssessmentProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: SHRView;
  initialStep?: string;
}

const steps = [
  "reserves-in-conflict",
  "reserves-indigenous-land",
  "human-rights-engagement",
] as const;

type StepKey = (typeof steps)[number];

const scopeData = [
  {
    id: "operations-in-zone-conflict",
    title: "Operations in Zone of Conflict",
    cards: [
      {
        title: "Reserves in or near Areas of Conflict",
        subtitle:
          "This form covers metric EM-EP-210a.1, focusing on the percentage of reserves located in proximity to active conflict zones.",
        clickable: true,
      },
      {
        title: "Reserves in or near Indigenous Land",
        subtitle:
          "This form covers metric EM-EP-210a.2, which is specific to the percentage of reserves located on or near indigenous peoples' land.",
        clickable: true,
      },
      {
        title: "Human Rights Engagement Processes",
        subtitle:
          "This form covers metric EM-EP-210a.3, detailing the qualitative strategy for managing human rights risks through due diligence and engagement",
        clickable: true,
      },
    ],
  },
];

export function SecurityHumanRightsAssessment({
  onBack,
  initialForm,
}: SecurityHumanRightsAssessmentProps) {
  const [currentView, setCurrentView] = useState<SHRView>(initialForm ?? "overview");

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Reserves in or near Areas of Conflict") {
      setCurrentView("reserves-in-conflict");
    }
    if (cardTitle === "Reserves in or near Indigenous Land") {
      setCurrentView("reserves-indigenous-land");
    }
    if (cardTitle === "Human Rights Engagement Processes") {
      setCurrentView("human-rights-engagement");
    }
  };

  const handleBackToOverview = () => {
    setCurrentView("overview");
  };

  if (currentView === "reserves-in-conflict") {
    return (
      <ReservesAreaConflict
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("reserves-indigenous-land")}
        stepIndex={1}
        totalSteps={steps.length}
      />
    );
  }

  if (currentView === "reserves-indigenous-land") {
    return (
      <ReservesIndigenousLand
        onBack={() => setCurrentView("reserves-in-conflict")}
        onContinueToNextAssessment={() => setCurrentView("human-rights-engagement")}
        stepIndex={2}
        totalSteps={steps.length}
      />
    );
  }

  if (currentView === "human-rights-engagement") {
    return (
      <HumanRightEngagement
        onBack={() => setCurrentView("reserves-indigenous-land")}
        onContinueToNextAssessment={() => setCurrentView("overview")}
        stepIndex={3}
        totalSteps={steps.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-white">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mt-5 mb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Security, Human Rights & Rights of Indigenous Peoples
                </h3>
                <p className="text-muted-foreground text-md">
                  This disclosure topic assesses the company's exposure to and management of risks
                  associated with operating in areas of conflict and near indigenous communities,
                  focusing on human rights due diligence and community engagement. IFRS codes:
                  EM-EP-210a.1, EM-EP-210a.2, EM-EP-210a.3
                </p>
              </div>
              <Button className="bg-primary hover:bg-teal-600 text-white">Assign Task</Button>
            </div>

            <Accordion
              type="multiple"
              defaultValue={["operations-in-zone-conflict"]}
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
                            {scope.id === "operations-in-zone-conflict" && (
                              <>
                                <h6 className="font-semibold mb-1">
                                  Operations in Zone of Conflict
                                </h6>
                                <p>
                                  Report whether your company operates in areas affected by social
                                  unrest, armed conflict, or political instability. These locations
                                  may increase risks related to employee safety, community impact,
                                  human rights violations, and operational disruption. Companies
                                  should disclose any active projects in such zones and describe
                                  measures taken to ensure security, protect civilians, and comply
                                  with international human rights standards.
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
                          className={`transition-colors bg-white shadow-sm rounded-lg ${
                            card.clickable ? "cursor-pointer hover:bg-accent/50" : "cursor-default"
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
