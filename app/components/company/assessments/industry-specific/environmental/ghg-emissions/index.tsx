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
import { StationarySourcesForm } from "./scope1/stationary-sources";
import { MobileSourcesForm } from "./scope1/mobile-sources";
import { ProcessEmissionsForm } from "./scope1/process-emissions";
import { FugitiveEmissionsForm } from "./scope1/fugitive-emissions";
import { LocationBasedForm } from "./scope2/location-based";
import { MarketBasedForm } from "./scope2/market-based";

type GHGView =
  | "overview"
  | "stationary-sources"
  | "mobile-sources"
  | "process-emissions"
  | "fugitive-emissions"
  | "location-based"
  | "market-based"
  | "scope3";

interface GhgEmissionsAssessmentProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm: GHGView;
  initialStep?: string; // For navigating to specific step within a form
}

const scopeData = [
  {
    id: "scope-1",
    title: "Scope 1",
    cards: [
      {
        title: "Stationary Sources",
        subtitle: "Emissions from fixed facilities or equipment, such as power plants or boilers",
        clickable: true,
      },
      {
        title: "Mobile Sources",
        subtitle: "Emissions from moving equiment or vehincles, such as trucks, ships, or planes",
        clickable: true,
      },
      {
        title: "Process Emissions",
        subtitle: "Emissions released during industrial processes, not related to fuel combustion",
        clickable: true,
      },
      {
        title: "Fugitive Emissions",
        subtitle: "Unintentional leaks of gases from equipment, pipelines, or storage",
        clickable: true,
      },
    ],
  },
  {
    id: "scope-2",
    title: "Scope 2",
    cards: [
      {
        title: "Location-Based Scope 2 Emissions",
        subtitle: "Indirect emissions from purchased electricity",
        clickable: true,
      },
      {
        title: "Market-Based Scope 2 Emissions",
        subtitle: "Indirect emissions from purchased electricity",
        clickable: true,
      },
    ],
  },
  {
    id: "scope-3",
    title: "Scope 3",
    cards: [
      {
        title: "Upstream Emissions (Categories 1-8)",
        subtitle:
          "These emissions are generated from activities in the value chain before products or services reach yur organization",
        clickable: true,
      },
      {
        title: "Downstream Emissions (Categories 9-15)",
        subtitle: "Indirect emissions from activities after your operations",
        clickable: true,
      },
    ],
  },
];

export function GhgEmissionsAssessment({
  onBack,
  onBackToHub = onBack,
  initialForm,
  initialStep,
}: GhgEmissionsAssessmentProps & { initialForm?: GHGView }) {
  const [currentView, setCurrentView] = useState<GHGView>(initialForm ?? "overview");

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Stationary Sources") {
      setCurrentView("stationary-sources");
    }
    if (cardTitle === "Mobile Sources") {
      setCurrentView("mobile-sources");
    }
    if (cardTitle === "Process Emissions") {
      setCurrentView("process-emissions");
    }
    if (cardTitle === "Fugitive Emissions") {
      setCurrentView("fugitive-emissions");
    }
    if (cardTitle.includes("Location-Based")) {
      setCurrentView("location-based");
    }
    if (cardTitle.includes("Market-Based")) {
      setCurrentView("market-based");
    }
    if (cardTitle.includes("scope3")) {
      setCurrentView("scope3");
    }
  };

  const handleBackToOverview = () => {
    // if (onBackToHub) {
    //   onBackToHub();
    // } else {
    //   setCurrentView("overview");
    // }
    setCurrentView("overview");
  };

  if (currentView === "stationary-sources") {
    return (
      <StationarySourcesForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("mobile-sources")}
        onBackToHub={onBackToHub}
        initialStep={initialStep as any}
      />
    );
  }
  if (currentView === "mobile-sources") {
    return (
      <MobileSourcesForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("process-emissions")}
        initialStep={initialStep as any}
      />
    );
  }
  if (currentView === "process-emissions") {
    return (
      <ProcessEmissionsForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("fugitive-emissions")}
        initialStep={initialStep as any}
      />
    );
  }
  if (currentView === "fugitive-emissions") {
    return (
      <FugitiveEmissionsForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("location-based")}
        initialStep={initialStep as any}
      />
    );
  }

  if (currentView === "location-based") {
    return (
      <LocationBasedForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("market-based")}
        initialStep={initialStep as any}
      />
    );
  }
  if (currentView === "market-based") {
    return (
      <MarketBasedForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("scope3")}
        initialStep={initialStep as any}
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
            <div className="flex items-center gap-2 border border-blue-300 bg-blue-50 rounded-md px-3 py-2 mb-4">
              <Info className="h-4 w-4 text-blue-600" />
              <p className="text-sm">
                In your first year, Scope 3 reporting is optional. You may keep your current GHG
                calculation method.
              </p>
            </div>
            <div className="flex items-center justify-between mt-5 mb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Greenhouse Gas Emissions</h3>
                <p className="text-muted-foreground text-md">
                  Total emissions from Subsidiaries and supply chains, measured in CO2-equivalent
                </p>
              </div>
              <Button className="bg-primary  hover:bg-teal-600 text-white">Assign Task</Button>
            </div>

            <Accordion type="multiple" defaultValue={["scope-1"]} className="space-y-4">
              {scopeData.map((scope) => (
                <AccordionItem key={scope.id} value={scope.id} className="border-0">
                  <AccordionTrigger className="py-4 px-2 rounded-lg bg-transparent hover:no-underline hover:cursor-pointer">
                    <div className="flex items-center w-full relative">
                      <span className="text-lg font-semibold flex items-center gap-2">
                        {scope.title}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {/* Info icon acts as the trigger for the tooltip */}
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                          >
                            {/* Dynamically set the content based on the scope ID */}
                            {scope.id === "scope-1" && (
                              <>
                                <h6 className="font-semibold mb-1">Scope 1 - Direct Emissions</h6>
                                <p>
                                  Emissions from sources your company owns or directly controls
                                  (e.g., fuel combustion, company vehicles, generators).
                                </p>
                              </>
                            )}

                            {scope.id === "scope-2" && (
                              <>
                                <h6 className="font-semibold mb-1">
                                  Scope 2 - Indirect Energy Emissions
                                </h6>
                                <p>
                                  Emissions from purchased elelctricity, steam, heating, or cooling
                                  that your company consumes.
                                </p>
                              </>
                            )}

                            {scope.id === "scope-3" && (
                              <>
                                <h6 className="font-semibold mb-1">
                                  Scope 3 - Value Chain Emissions
                                </h6>
                                <p>
                                  All other indirect emissions outside your direct control - such as
                                  suppliers, transportation, waste, business travel or product use.
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
