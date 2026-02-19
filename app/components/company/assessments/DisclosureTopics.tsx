"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { ArrowLeft, ChevronRight, Info, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { GhgEmissionsAssessment } from "./industry-specific/environmental/ghg-emissions";
import CommunityRelationsHome from "./industry-specific/social-capital/community-relations/CommunityRelationsHome";
import { SecurityHumanRightsAssessment } from "./industry-specific/social-capital/security-rights";
import AirQiality from "./industry-specific/environmental/air-quality/components/AirQiality";
import { useDebounce } from "use-debounce";
import { Input } from "../../ui/input";
import { FrontendTask } from "@/services/assignTask.service";
import { BioDiversityImpact } from "./industry-specific/environmental/biodiversity-impacts";
import WaterAndWastewaterManagement from "./industry-specific/environmental/water-management";
import ReservesValuationAndCapitalExpenditures from "./industry-specific/business-model-innovation/reserves-valuation-capital-expenditures";
import BusinessEthicsAndTransparency from "./industry-specific/business-model-innovation/business-ethics-transparency";
import WorkForceHealthAndSafety from "./industry-specific/human-capital/workforce-health-safety";
import { useAssessment } from "@/hooks/useAssessment";
import { useTopicCompletion } from "@/hooks/useAssessmentCompletion";
// import { CompletionIndicator } from "@/app/components/ui/reusables/CompletionIndication";
import CriticalIncidentRiskManagement from "./industry-specific/leadership-and-governance/critical-incident-risk-management";
import ManagementOfLegalAndRegulatoryEnvironment from "./industry-specific/leadership-and-governance/management-of-legal-regulatory-environment";
import { ActivityMetricHome } from "./activity-metrics/ActivityMetricsHome";
import { checkTopicCompletion } from "@/lib/assessmentCompletionUtils";

interface DisclosureTopicsProps {
  onBack: () => void;
  initialView?: "topics" | "ghg" | any;
  initialForm?: "stationary-sources" | any;
  initialStep?: string;
  assignedTask?: FrontendTask | null;
  assignedTopics?: string[];
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

// Helper function to check if a topic is assigned
const isTopicAssigned = (topicTitle: string, assignedTopics?: string[]): boolean => {
  if (!assignedTopics || assignedTopics.length === 0) return true;

  const directMatch = assignedTopics.some(
    (topic) => topic.toLowerCase().trim() === topicTitle.toLowerCase().trim()
  );

  if (directMatch) return true;

  // Hierarchical matching - check if any assigned topic is a child of this topic
  const topicHierarchy: Record<string, string[]> = {
    "Greenhouse Gas Emissions": [
      "GreenHouse Gas Emissions",
      "Scope 1",
      "Scope 2",
      "Scope 3",
      "Stationary Sources",
      "Mobile Sources",
      "Process Emissions",
      "Fugitive Emissions",
      "Location-based emissions",
      "Market-based emissions",
    ],
    "Community Relations": ["Community Relations", "Community Engagement"],
    "Security, Human Rights & Rights of Indigenous Peoples": ["Security Rights"],
    "Human Capital": ["Human Capital"],
    "Air Quality": ["Air Quality"],
    "Water Management": ["Water Management"],
    "Biodiversity Impact": ["Biodiversity Impact"],
    "Workforce Health & Safety": ["Workforce Health & Safety"],
  };

  const childTopics = topicHierarchy[topicTitle] || [];
  const hasChildMatch = assignedTopics.some((assignedTopic) =>
    childTopics.some((child) => child.toLowerCase().trim() === assignedTopic.toLowerCase().trim())
  );

  return hasChildMatch;
};

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
        clickable: true,
      },
      {
        title: "Water and Wastewater Management",
        subtitle: "Evaluate water use, conservation, and treatment practices",
        clickable: true,
      },
      {
        title: "Biodiversity Impact",
        subtitle: "Identify and measure impacts on ecosystems, species, and natural habitats",
        clickable: true,
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
          "Asess how rights, safety, and cultural heritage are safeguarded in operational areas",
        clickable: true,
      },
      {
        title: "Community Relations",
        subtitle: "Report engagement strategies and impact on local communities",
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
        clickable: true,
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
        subtitle: "Report on investment strategies and valuation of natural resource reserves",
        clickable: true,
      },
      {
        title: "Business Ethics & Transparency",
        subtitle: "Assess anti-corruption measures and operational integrity",
        clickable: true,
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
        title: "Critical Incident Risk Management",
        subtitle: "Report preparedness plans and response strategies for major incidents",
        clickable: true,
      },
      {
        title: "Management of the Legal & Regulatory Environment",
        subtitle: "Evaluate compliance with applicable laws and regulations",
        clickable: true,
      },
    ],
  },
];

const allMetrics: MetricSection[] = [...industrySpecificMetrics];

export function DisclosureTopics({
  onBack,
  initialView = "topics",
  initialForm,
  initialStep,
  assignedTask,
  assignedTopics,
}: DisclosureTopicsProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState(initialView);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const { state } = useAssessment();

  // Use the custom hook for topic completion status
  // const { getStatus, getCardBorderClass } = useTopicCompletion(allMetrics, state.assessmentData);

  // Helper to extract status from backend data
  const getStatusFromData = (title: string, data: any) => {
    // Map titles to data paths
    const pathToData = {
      "Greenhouse Gas Emissions": data?.environment?.ghg,
      "Air Quality": data?.environment?.airQuality?.airPollutantEmissions, // Simplified mapping
      "Water and Wastewater Management":
        data?.environment?.waterManagement?.waterAndProducedWaterManagement,
      "Biodiversity Impact":
        data?.environment?.biodiversityImpact?.environmentalManagement,
      "Community Relations": data?.socialCapital?.communityRelations,
      "Security, Human Rights & Rights of Indigenous Peoples":
        data?.socialCapital?.securityHumanRights,
      "Workforce Health & Safety": data?.humanCapital?.workforceHealthSafety, // Check path
      "Reserves Valuation & Capital Expenditures":
        data?.businessModel?.reservesValuation,
      "Business Ethics & Transparency": data?.businessModel?.businessEthics,
      "Critical Incident Risk Management":
        data?.leadershipGovernance?.criticalIncidentRiskManagement,
      "Management of the Legal & Regulatory Environment":
        data?.leadershipGovernance?.legalRegulatoryEnvironment,
      "Activity Metrics": data?.foundationalData?.activityMetrics,
    };

    const itemData = pathToData[title as keyof typeof pathToData];

    if (!itemData) return { status: "not-started", count: "0/0", progress: 0 };

    const progress = itemData.progress || 0;
    const completed = itemData.dataCount?.count || 0;
    const total = itemData.dataCount?.expected || 0;

    let status = "not-started";
    if (progress === 100 || (total > 0 && completed === total)) {
      status = "completed";
    } else if (progress > 0 || completed > 0) {
      status = "in-progress";
    }

    return {
      status,
      count: `${completed}/${total}`,
      progress,
    };
  };

  const getActivityMetricsStatus = () => {
    return getStatusFromData("Activity Metrics", state.assessmentData);
  };

  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case "Greenhouse Gas Emissions":
        setCurrentView("ghg");
        break;
      case "Biodiversity Impact":
        setCurrentView("biodiversity");
        break;
      case "Community Relations":
        setCurrentView("crs");
        break;
      case "Security, Human Rights & Rights of Indigenous Peoples":
        setCurrentView("security-human-rights");
        break;
      case "Air Quality":
        setCurrentView("air-quality");
        break;
      case "Water and Wastewater Management":
        setCurrentView("water-and-wastewater-management");
        break;
      case "Workforce Health & Safety":
        setCurrentView("workforce-health-and-safety");
        break;
      case "Reserves Valuation & Capital Expenditures":
        setCurrentView("reserves-valuation-capital-expenditures");
        break;
      case "Business Ethics & Transparency":
        setCurrentView("business-ethics-transparency");
        break;
      case "Critical Incident Risk Management":
        setCurrentView("critical-incident-risk-management");
        break;
      case "Management of the Legal & Regulatory Environment":
        setCurrentView("management-of-legal-and-regulatory-environment");
        break;
      default:
        break;
    }
  };

  const handleBackToHub = () => {
    onBack();
  };

  const filterMetrics = (metrics: MetricSection[], metricType: string) => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    const topicsToFilter = assignedTopics || assignedTask?.topics;

    return metrics
      .map((section) => {
        const pillarMatches =
          !debouncedSearchTerm || section.title.toLowerCase().includes(searchLower);

        const filteredCards = section.cards.filter((card) => {
          const isAssigned = isTopicAssigned(card.title, topicsToFilter);
          if (!isAssigned) return false;

          if (!debouncedSearchTerm) return true;

          const topicMatches = card.title.toLowerCase().includes(searchLower);
          const subtitleMatches = card.subtitle.toLowerCase().includes(searchLower);
          const metricTypeMatches = metricType.toLowerCase().includes(searchLower);

          return topicMatches || subtitleMatches || pillarMatches || metricTypeMatches;
        });

        return {
          ...section,
          cards: filteredCards,
        };
      })
      .filter((section) => section.cards.length > 0);
  };

  const filteredIndustryMetrics = filterMetrics(industrySpecificMetrics, "Industry-Specific");

  if (currentView === "activity-metrics") {
    return (
      <ActivityMetricHome
        onBack={() => setCurrentView("topics")}
        initialView={
          initialStep && typeof initialStep === "string"
            ? ((initialStep.includes("production")
              ? "production-volume"
              : initialStep.includes("offshore")
                ? "offshore-sites"
                : initialStep.includes("terrestrial")
                  ? "terrestrial-sites"
                  : "overview") as any)
            : "overview"
        }
      />
    );
  }
  if (currentView === "ghg") {
    return (
      <GhgEmissionsAssessment
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
        assignedTask={assignedTask}
        assignedTopics={assignedTopics}
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
        onContinueToNextAssessment={() => {
          setCurrentView("topics");
        }}
        onSubmit={(data) => {
          console.info(data);
          setCurrentView("topics");
        }}
      />
    );
  }
  if (currentView === "biodiversity") {
    return (
      <BioDiversityImpact
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
        onContinueToNextAssessment={() => {
          setCurrentView("topics");
        }}
        onSubmit={(data) => {
          console.info(data);
          setCurrentView("topics");
        }}
      />
    );
  }
  if (currentView === "crs") {
    return (
      <CommunityRelationsHome
        onBack={() => setCurrentView("topics")}
        initialForm={initialForm as any}
      />
    );
  }
  if (currentView === "air-quality") {
    return (
      <AirQiality
        backToDisclosureTopics={() => setCurrentView("topics")}
        backToAssessmentHub={handleBackToHub}
      />
    );
  }
  if (currentView === "water-and-wastewater-management") {
    return (
      <WaterAndWastewaterManagement
        backToDisclosureTopics={() => setCurrentView("topics")}
        backToAssessmentHub={handleBackToHub}
      />
    );
  }
  if (currentView === "reserves-valuation-capital-expenditures") {
    return (
      <ReservesValuationAndCapitalExpenditures
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
        onContinueToNextAssessment={() => {
          setCurrentView("topics");
        }}
        onSubmit={(data) => {
          console.info(data);
          setCurrentView("topics");
        }}
      />
    );
  }

  if (currentView === "workforce-health-and-safety") {
    return (
      <WorkForceHealthAndSafety
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
        onContinueToNextAssessment={() => {
          setCurrentView("topics");
        }}
      />
    );
  }

  if (currentView === "business-ethics-transparency") {
    return (
      <BusinessEthicsAndTransparency
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
        onContinueToNextAssessment={() => {
          setCurrentView("topics");
        }}
        onSubmit={(data) => {
          console.info(data);
          setCurrentView("topics");
        }}
      />
    );
  }
  if (currentView === "critical-incident-risk-management") {
    return (
      <CriticalIncidentRiskManagement
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
        onContinueToNextAssessment={() => {
          setCurrentView("topics");
        }}
        onSubmit={(data) => {
          console.info(data);
          setCurrentView("topics");
        }}
      />
    );
  }
  if (currentView === "management-of-legal-and-regulatory-environment") {
    return (
      <ManagementOfLegalAndRegulatoryEnvironment
        onBack={() => setCurrentView("topics")}
        onBackToHub={handleBackToHub}
        initialForm={initialForm as any}
        initialStep={initialStep}
        onContinueToNextAssessment={() => {
          setCurrentView("topics");
        }}
        onSubmit={(data) => {
          console.info(data);
          setCurrentView("topics");
        }}
      />
    );
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
                  <h1 className="text-2xl font-bold text-foreground">
                    {assignedTask ? `Task: ${assignedTask.taskName}` : "Disclosure Topics"}
                  </h1>
                  <p className="text-muted-foreground text-base">
                    {assignedTask
                      ? "Complete the assigned assessment topics below"
                      : "Disclosure topics are industry-based versions of sustainability-related risks and opportunities"}
                  </p>
                  {assignedTask && assignedTask.description && (
                    <p className="text-sm text-muted-foreground italic">
                      {assignedTask.description}
                    </p>
                  )}
                </div>
                {!assignedTask && (
                  <Button
                    className="bg-primary hover:bg-teal-600 text-white"
                    onClick={() => router.push("/assessments/tasks/assign?selectAll=true")}
                  >
                    Assign Task
                  </Button>
                )}
              </div>

              <div className="relative w-full mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search-input"
                  placeholder="Search for topic"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid my-6">
                <div className="flex items-center w-full relative">
                  <span className="text-lg font-semibold flex items-center gap-2">
                    Foundational Data
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl  border-none"
                      >
                        <h6 className="underline">Foundational Data</h6>
                        <p>
                          Foundational data refers to the core, baseline information required to
                          accurately calculate metrics and generate ESG assessments. It includes
                          essential inputs such as activity data, operational figures, workforce
                          totals, production volumes, or other primary data points that form the
                          basis of all calculations and analysis. Providing accurate foundational
                          data ensures consistency, reliability, and comparability across reporting
                          periods.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
                {/* Status indication commented out - revisit later (was getActivityMetricsBorderClass()) */}
                <Card
                  className={`transition-all shadow-sm bg-white rounded-lg cursor-pointer hover:bg-accent/50 hover:shadow-md max-w-md`}
                  // className={`transition-all shadow-sm bg-white rounded-lg cursor-pointer hover:bg-accent/50 hover:shadow-md max-w-md ${getActivityMetricsBorderClass()}`}
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: (() => {
                      const status = getActivityMetricsStatus();
                      if (status.status === "completed") return "#2dd4bf"; // teal-400
                      if (status.status === "in-progress") return "#facc15"; // yellow-400
                      return "transparent";
                    })()
                  }}
                  onClick={() => setCurrentView("activity-metrics")}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-foreground">Activity Metrics</h5>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const status = getActivityMetricsStatus();
                              if (status.status === "in-progress") {
                                return (
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-200 font-medium">
                                    In Progress
                                  </span>
                                );
                              }
                              if (status.status === "completed") {
                                return (
                                  <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full border border-teal-200 font-medium">
                                    Completed
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Report production volumes and the number of operational sites.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-7 w-7 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </div>
              <Accordion type="multiple" className="space-y-6" defaultValue={["industry-specific"]}>
                {/* Industry-Specific Metrics */}
                {filteredIndustryMetrics.length > 0 && (
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
                                industry. They reflect the key risks, impacts, and regulatory
                                expectations specific to your sector.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="flex-1 h-0.5 bg-gray-300 mx-3 self-center" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 px-0">
                      <div className="space-y-8">
                        {filteredIndustryMetrics.map((section) => (
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
                              {section.cards.map((card) => {
                                // Status indication commented out - revisit later
                                // const status = getStatus(card.title);
                                // const borderClass = getCardBorderClass(card.title);
                                // const getBorderColor = () => { ... };

                                return (
                                  <Card
                                    key={card.title}
                                    className={`transition-all shadow-sm bg-white rounded-lg ${card.clickable
                                      ? "cursor-pointer hover:bg-accent/50 hover:shadow-md"
                                      : "cursor-default"
                                      }`}
                                    style={{
                                      borderLeftWidth: "4px",
                                      borderLeftColor: (() => {
                                        const status = getStatusFromData(card.title, state.assessmentData);
                                        if (status.status === "completed") return "#2dd4bf"; // teal-400
                                        if (status.status === "in-progress") return "#facc15"; // yellow-400
                                        return "transparent";
                                      })()
                                    }}
                                    onClick={() => card.clickable && handleCardClick(card.title)}
                                  >
                                    <CardContent className="p-4 flex justify-between items-center">
                                      <div className="flex items-start justify-between gap-3 flex-1">
                                        <div className="space-y-2 flex-1">
                                          <div className="flex items-center justify-between">
                                            <h5 className="font-medium text-foreground">
                                              {card.title}
                                            </h5>
                                            <div className="flex items-center gap-2">
                                              {(() => {
                                                const status = getStatusFromData(card.title, state.assessmentData);
                                                if (status.status === "in-progress") {
                                                  return (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-200 font-medium">
                                                      In Progress
                                                    </span>
                                                  );
                                                }
                                                if (status.status === "completed") {
                                                  return (
                                                    <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full border border-teal-200 font-medium">
                                                      Completed
                                                    </span>
                                                  );
                                                }
                                                return null;
                                              })()}
                                            </div>
                                            {/* <CompletionIndicator status={status} /> */}
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            {card.subtitle}
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronRight className="h-7 w-7 text-muted-foreground shrink-0" />
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* No Results Message */}
                {filteredIndustryMetrics.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      {assignedTask && !debouncedSearchTerm
                        ? "No topics assigned to you for this task"
                        : debouncedSearchTerm
                          ? `No topics found matching "${debouncedSearchTerm}"`
                          : "No topics available"}
                    </p>
                    {debouncedSearchTerm && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Try searching for different keywords or browse all topics
                      </p>
                    )}
                  </div>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
