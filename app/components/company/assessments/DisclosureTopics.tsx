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
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { GhgEmissionsAssessment } from "./industry-specific/environmental/ghg-emissions";
import CommunityRelationsHome from "./industry-specific/social-capital/community-relations/CommunityRelationsHome";
import { SecurityHumanRightsAssessment } from "./industry-specific/social-capital/security-rights";

interface DisclosureTopicsProps {
  onBack: () => void;
  initialView?: "topics" | "ghg" | any;
  initialForm?: "stationary-sources" | any;
  initialStep?: string;
}

interface MetricCard {
  title: string;
  subtitle: string;
  clickable?: boolean;
}

interface MetricSection {
  title: string;
  tooltip: {
    title: string;
    description: string;
  };
  cards: MetricCard[];
}

const industrySpecificMetrics: MetricSection[] = [
  {
    title: "Environmental",
    tooltip: {
      title: "Environmental",
      description:
        "Covers your organization's impact on nature—including energy use, emissions, waste, water, and resource efficiency.",
    },
    cards: [
      {
        title: "Greenhouse Gas Emissions",
        subtitle: "Report total CO2-equivalent emissions from Subsidiaries and supply chains",
        clickable: true,
      },
      {
        title: "Air Quality",
        subtitle: "Assess pollutant emissions and their impact on local air quality",
      },
      {
        title: "Water Management",
        subtitle: "Evaluate water use, conservation, and treatment practices",
      },
      {
        title: "Biodiversity Impact",
        subtitle: "Identify and measure impacts on ecosystems, species, and natural habitats",
      },
    ],
  },
  {
    title: "Social Capital",
    tooltip: {
      title: "Social Capital",
      description:
        "Assesses how your company engages with communities, customers, and society through responsibility, trust, and ethical practices.",
    },
    cards: [
      {
        title: "Security, Human Rights & Rights of Indigenous Peoples",
        subtitle:
          "Asess how rights, safety, and cultural heritage are safegiarded in Subsidiaryal areas",
        clickable: true,
      },
      {
        title: "Community Relations",
        subtitle: "Report engagement strategies and impact on local  communities",
        clickable: true,
      },
    ],
  },
  {
    title: "Human Capital",
    tooltip: {
      title: "Human Capital",
      description:
        "Focuses on employee wellbeing—covering health and safety, diversity, training, and fair treatment in the workplace.",
    },
    cards: [
      {
        title: "Workforce Health & Safety",
        subtitle:
          "Evaluate measures taken to protect employee well-being and prevent workplace accidents",
      },
    ],
  },
  {
    title: "Business Model and Innovation",
    tooltip: {
      title: "Business Model and Innovation",
      description:
        "Evaluates how your products, services, and operations integrate sustainability and long-term resilience.",
    },
    cards: [
      {
        title: "Reserves Valuation & Capital Expenditures",
        subtitle: "Report on investment strategies and valuation of natural rsource reserves",
      },
    ],
  },
  {
    title: "Leadership and Governance",
    tooltip: {
      title: "Leadership and Governance",
      description:
        "Measures accountability - including ethics, transparency, anticorruption practices, and oversight from management.",
    },
    cards: [
      {
        title: "Business Ethics & Transparency",
        subtitle: "Assess anti-corruption measures and Subsidiaryal integrity",
      },
      {
        title: "Management of the Legal & Regulatory Environment",
        subtitle: "Evaluate compliance with applicable laws and regulations",
      },
      {
        title: "Critical Incident Risk Management",
        subtitle:
          "Report preparedness plans and response strategies for major Subsidiaryal incidents",
      },
    ],
  },
];

const supplementaryMetrics: MetricSection[] = [
  {
    title: "Environmental",
    tooltip: {
      title: "Environmental",
      description:
        "Covers your organization's impact on nature—including energy use, emissions, waste, water, and resource efficiency.",
    },
    cards: [
      {
        title: "Greenhouse Gas Emissions",
        subtitle: "Report total CO2-equivalent emissions from Subsidiaries and supply chains",
        clickable: true,
      },
      {
        title: "Air Quality",
        subtitle: "Assess pollutant emissions and their impact on local air quality",
      },
      {
        title: "Water Management",
        subtitle: "Evaluate water use, conservation, and treatment practices",
      },
      {
        title: "Biodiversity Impact",
        subtitle: "Identify and measure impacts on ecosystems, species, and natural habitats",
      },
    ],
  },
  {
    title: "Social Capital",
    tooltip: {
      title: "Social Capital",
      description:
        "Assesses how your company engages with communities, customers, and society through responsibility, trust, and ethical practices.",
    },
    cards: [
      {
        title: "Security, Human Rights & Rights of Indigenous Peoples",
        subtitle:
          "Asess how rights, safety, and cultural heritage are safegiarded in Subsidiaryal areas",
      },
      {
        title: "Community Relations",
        subtitle: "Report engagement strategies and impact on local  communities",
      },
    ],
  },
  {
    title: "Human Capital",
    tooltip: {
      title: "Human Capital",
      description:
        "Focuses on employee wellbeing—covering health and safety, diversity, training, and fair treatment in the workplace.",
    },
    cards: [
      {
        title: "Workforce Health & Safety",
        subtitle:
          "Evaluate measures taken to protect employee well-being and prevent workplace accidents",
      },
    ],
  },
  {
    title: "Business Model and Innovation",
    tooltip: {
      title: "Business Model and Innovation",
      description:
        "Evaluates how your products, services, and operations integrate sustainability and long-term resilience.",
    },
    cards: [
      {
        title: "Reserves Valuation & Capital Expenditures",
        subtitle: "Report on investment strategies and valuation of natural rsource reserves",
      },
    ],
  },
  {
    title: "Leadership and Governance",
    tooltip: {
      title: "Leadership and Governance",
      description:
        "Measures accountability - including ethics, transparency, anticorruption practices, and oversight from management.",
    },
    cards: [
      {
        title: "Business Ethics & Transparency",
        subtitle: "Assess anti-corruption measures and Subsidiaryal integrity",
      },
      {
        title: "Management of the Legal & Regulatory Environment",
        subtitle: "Evaluate compliance with applicable laws and regulations",
      },
      {
        title: "Critical Incident Risk Management",
        subtitle:
          "Report preparedness plans and response strategies for major Subsidiaryal incidents",
      },
    ],
  },
];

export function DisclosureTopics({
  onBack,
  initialView = "topics",
  initialForm,
  initialStep,
}: DisclosureTopicsProps) {
  // const [currentView, setCurrentView] = useState<"topics" | "ghg">("topics");
  const [currentView, setCurrentView] = useState(initialView);

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Greenhouse Gas Emissions") {
      setCurrentView("ghg");
    } else if (cardTitle === "Community Relations") {
      setCurrentView("crs");
    } else if (cardTitle === "Security, Human Rights & Rights of Indigenous Peoples") {
      setCurrentView("security-human-rights");
    }
  };

  const handleBackToHub = () => {
    onBack();
  };

  if (currentView === "ghg") {
    return (
      <GhgEmissionsAssessment
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
      />
    );
  }
  if (currentView === "security-human-rights") {
    return (
      <SecurityHumanRightsAssessment
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
      />
    );
  }
  if (currentView === "crs") {
    return <CommunityRelationsHome onBack={() => setCurrentView("topics")} />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-green-50 p-6 ">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Card className="bg-gray-50 p-8 rounded-xl shadow-none ">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-foreground">Disclosure Topics</h1>
                  <p className="text-muted-foreground text-base">
                    Disclosure topics are industry-based versions of sustainability-related risks
                    and
                    <br />
                    opportunities
                  </p>
                </div>
                <Button className="bg-primary  hover:bg-teal-600 text-white">Assign Task</Button>
              </div>

              <Accordion type="multiple" className="space-y-6" defaultValue={["industry-specific"]}>
                {/* Industry-Specific Metrics */}
                <AccordionItem value="industry-specific" className="border-none">
                  <AccordionTrigger className="py-4 px-0 hover:no-underline hover:cursor-pointer bg-transparent">
                    <div className="flex items-center w-full relative">
                      <span className="text-lg font-semibold flex items-center gap-2">
                        Industry-Specific Metrics
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl  border-none"
                          >
                            <h6>Industry-Specific Metrics</h6>
                            <p>
                              These are core ESG assessment metrics that are most relevant to your
                              industry. They reflect the Disclosure Topi key risks, impacts, and
                              regulatory expectations sustainability-related risks and opportunities
                              specific to your sector, and are required for consistent benchmarking
                              and disclosure.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="flex-1 h-0.5 bg-gray-300 mx-3 self-center" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 px-0">
                    <div className="space-y-8">
                      {industrySpecificMetrics.map((section) => (
                        <div key={section.title} className="space-y-4">
                          <div className="flex items-center gap-2 mb-2 relative">
                            <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                              {section.title}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="start"
                                  className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                                >
                                  <h6 className="font-semibold mb-1">{section.tooltip.title}</h6>
                                  <p>{section.tooltip.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.cards.map((card) => (
                              <Card
                                key={card.title}
                                className={`transition-colors shadow-sm bg-white rounded-lg border ${
                                  card.clickable
                                    ? "cursor-pointer hover:bg-accent/50"
                                    : "cursor-default"
                                }`}
                                onClick={() => card.clickable && handleCardClick(card.title)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1 flex-1">
                                      <h5 className="font-medium text-foreground">{card.title}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        {card.subtitle}
                                      </p>
                                    </div>
                                    <ChevronRight className="h-7 w-7 text-muted-foreground shrink-0 ml-2" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Supplementary Metrics */}
                <AccordionItem value="supplementary" className="border-none">
                  <AccordionTrigger className="py-4 px-0 hover:no-underline hover:cursor-pointer bg-transparent">
                    <div className="flex items-center w-full relative">
                      <span className="text-lg font-semibold flex items-center gap-2">
                        Supplementary Metrics
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                          >
                            <h6>Supplementary Metrics</h6>
                            <p>
                              These are optional metrics that provide additioanl insight into your
                              sustainability performance. They are not mandatory but can be reported
                              to demonstrate leadership, transparency, or broader impact.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="flex-1 h-0.5 bg-gray-300 mx-3 self-center" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 px-0">
                    <div className="space-y-8">
                      {supplementaryMetrics.map((section) => (
                        <div key={section.title} className="space-y-4">
                          <div className="flex items-center gap-2 mb-2 relative">
                            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                              {section.title}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="start"
                                  className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                                >
                                  <h6 className="font-semibold mb-1">{section.tooltip.title}</h6>
                                  <p>{section.tooltip.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.cards.map((card) => (
                              <Card
                                key={card.title}
                                className="shadow-sm bg-white rounded-lg border cursor-default"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1 flex-1">
                                      <h4 className="font-medium text-foreground">{card.title}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {card.subtitle}
                                      </p>
                                    </div>
                                    <ChevronRight className="h-7 w-7 text-muted-foreground shrink-0 ml-2" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
