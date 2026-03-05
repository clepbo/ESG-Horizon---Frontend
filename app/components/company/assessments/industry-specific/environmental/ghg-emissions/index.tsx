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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ChevronRight, Info, Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { useDebounce } from "use-debounce";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { StationarySourcesForm } from "./scope1/stationary-sources";
import { MobileSourcesForm } from "./scope1/mobile-sources";
import { ProcessEmissionsForm } from "./scope1/process-emissions";
import { FugitiveEmissionsForm } from "./scope1/fugitive-emissions";
import { LocationBasedForm } from "./scope2/location-based";
import { MarketBasedForm } from "./scope2/market-based";
import { FrontendTask } from "@/services/assignTask.service";
import UpstreamEmissionHome from "./scope3/UpstreamEmissionHome";
import DownstreamEmission from "./scope3/DownstreamEmission";
import { useAssessment } from "@/hooks/useAssessment";
import { getFormSectionStatus, getSectionBorderColor, resolveDataPath, type SectionStatus } from "@/lib/assessmentStatusUtils";

type GHGView =
  | "overview"
  | "stationary-sources"
  | "mobile-sources"
  | "process-emissions"
  | "fugitive-emissions"
  | "location-based"
  | "market-based"
  | "upstream-emissions"
  | "downstream-emissions"
  | "scope3";

interface GhgEmissionsAssessmentProps {
  onBack: () => void;
  onBackToHub: () => void;
  initialForm?: GHGView;
  initialStep?: string;
  assignedTask?: FrontendTask | null;
  assignedTopics?: string[];
}

interface ScopeCard {
  title: string;
  subtitle: string;
  clickable?: boolean;
}

interface ScopeData {
  id: string;
  title: string;
  cards: ScopeCard[];
}

// Helper function to check if a scope/emission source is assigned
const isScopeItemAssigned = (
  itemTitle: string,
  scopeTitle: string,
  assignedTopics?: string[]
): boolean => {
  if (!assignedTopics || assignedTopics.length === 0) return true;

  const itemHierarchy: Record<string, string[]> = {
    "Stationary Sources": ["Scope 1", "Stationary Sources"],
    "Mobile Sources": ["Scope 1", "Mobile Sources"],
    "Process Emissions": ["Scope 1", "Process Emissions"],
    "Fugitive Emissions": ["Scope 1", "Fugitive Emissions"],
    "Location-Based Scope 2 Emissions": ["Scope 2", "Location-based emissions"],
    "Market-Based Scope 2 Emissions": ["Scope 2", "Market-based emissions"],
    "Upstream Emissions (Categories 1-8)": ["Scope 3"],
    "Downstream Emissions (Categories 9-15)": ["Scope 3"],
  };

  const itemTopics = itemHierarchy[itemTitle] || [];
  const hasItemMatch = assignedTopics.some((topic) =>
    itemTopics.some((item) => item.toLowerCase().trim() === topic.toLowerCase().trim())
  );

  if (hasItemMatch) return true;

  const scopeMatch = assignedTopics.some(
    (topic) => topic.toLowerCase().trim() === scopeTitle.toLowerCase().trim()
  );

  return scopeMatch;
};

const scopeData: ScopeData[] = [
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
        subtitle: "Emissions from moving equipment or vehicles, such as trucks, ships, or planes",
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
          "These emissions are generated from activities in the value chain before products or services reach your organization",
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
  assignedTask,
  assignedTopics,
}: GhgEmissionsAssessmentProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<GHGView>(initialForm ?? "overview");

  useEffect(() => {
    if (initialForm) {
      setCurrentView(initialForm);
    }
  }, [initialForm]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { state } = useAssessment();
  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];

  const cardStatusMap: Record<string, { groupKey: string; dataPath: string[] }> = {
    "Stationary Sources": { groupKey: "environment.ghg.scope1.stationarySources", dataPath: ["environment", "ghg", "scope1", "stationarySources"] },
    "Mobile Sources": { groupKey: "environment.ghg.scope1.mobileSources", dataPath: ["environment", "ghg", "scope1", "mobileSources"] },
    "Process Emissions": { groupKey: "environment.ghg.scope1.processEmissions", dataPath: ["environment", "ghg", "scope1", "processEmissions"] },
    "Fugitive Emissions": { groupKey: "environment.ghg.scope1.fugitiveEmissions", dataPath: ["environment", "ghg", "scope1", "fugitiveEmissions"] },
    "Location-Based Scope 2 Emissions": { groupKey: "environment.ghg.scope2.locationBased", dataPath: ["environment", "ghg", "scope2", "locationBased"] },
    "Market-Based Scope 2 Emissions": { groupKey: "environment.ghg.scope2.marketBased", dataPath: ["environment", "ghg", "scope2", "marketBased"] },
    "Upstream Emissions (Categories 1-8)": { groupKey: "environment.ghg.scope3.upstream", dataPath: ["environment", "ghg", "scope3", "upstream"] },
    "Downstream Emissions (Categories 9-15)": { groupKey: "environment.ghg.scope3.downstream", dataPath: ["environment", "ghg", "scope3", "downstream"] },
  };

  const getCardStatus = (cardTitle: string): SectionStatus => {
    const info = cardStatusMap[cardTitle];
    if (!info) return "not-started";
    return getFormSectionStatus(submittedGroups, info.groupKey, resolveDataPath(state.assessmentData, info.dataPath));
  };

  const handleBackToOverview = () => {
    setCurrentView("overview");
  };

  const overviewBreadcrumb = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onBack },
    { label: "Greenhouse Gas Emissions", onClick: handleBackToOverview },
  ];

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
    if (cardTitle.includes("Upstream Emissions (Categories 1-8)")) {
      setCurrentView("upstream-emissions");
    }
    if (cardTitle.includes("Downstream Emissions (Categories 9-15)")) {
      setCurrentView("downstream-emissions");
    }
  };

  const filterScopes = (scopes: ScopeData[]) => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    const topicsToFilter = assignedTopics || assignedTask?.topics;

    return scopes
      .map((scope) => {
        const scopeMatches =
          !debouncedSearchTerm || scope.title.toLowerCase().includes(searchLower);

        const filteredCards = scope.cards.filter((card) => {
          const isAssigned = isScopeItemAssigned(card.title, scope.title, topicsToFilter);
          if (!isAssigned) return false;

          if (!debouncedSearchTerm) return true;

          const titleMatches = card.title.toLowerCase().includes(searchLower);
          const subtitleMatches = card.subtitle.toLowerCase().includes(searchLower);

          return titleMatches || subtitleMatches || scopeMatches;
        });

        return {
          ...scope,
          cards: filteredCards,
        };
      })
      .filter((scope) => scope.cards.length > 0);
  };

  const filteredScopes = filterScopes(scopeData);

  if (currentView === "stationary-sources") {
    return (
      <StationarySourcesForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("mobile-sources")}
        onBackToHub={onBackToHub}
        initialStep={initialStep as any}
        onBackToDisclosureTopics={onBack}
      />
    );
  }
  if (currentView === "mobile-sources") {
    return (
      <MobileSourcesForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("process-emissions")}
        initialStep={initialStep as any}
        onBackToDisclosureTopics={onBack}
      />
    );
  }
  if (currentView === "process-emissions") {
    return (
      <ProcessEmissionsForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("fugitive-emissions")}
        initialStep={initialStep as any}
        onBackToDisclosureTopics={onBack}
      />
    );
  }
  if (currentView === "fugitive-emissions") {
    return (
      <FugitiveEmissionsForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("location-based")}
        initialStep={initialStep as any}
        onBackToDisclosureTopics={onBack}
      />
    );
  }

  if (currentView === "location-based") {
    return (
      <LocationBasedForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("market-based")}
        initialStep={initialStep as any}
        onBackToDisclosureTopics={onBack}
      />
    );
  }
  if (currentView === "market-based") {
    return (
      <MarketBasedForm
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("upstream-emissions")}
        initialStep={initialStep as any}
        onBackToDisclosureTopics={onBack}
      />
    );
  }

  if (currentView === "scope3") {
    return (
      <UpstreamEmissionHome
        handleBacktoAssessment={onBackToHub}
        handleBacktoGHG={handleBackToOverview}
        backToDisclossureTopic={onBack}
        initialStep={initialStep}
      />
    );
  }

  if (currentView === "upstream-emissions") {
    return (
      <UpstreamEmissionHome
        handleBacktoAssessment={onBackToHub}
        handleBacktoGHG={handleBackToOverview}
        backToDisclossureTopic={onBack}
        initialStep={initialStep}
      />
    );
  }
  if (currentView === "downstream-emissions") {
    return (
      <DownstreamEmission
        handleBacktoAssessment={onBackToHub}
        handleBacktoGHG={handleBackToOverview}
        backToDisclossureTopic={onBack}
        initialStep={initialStep}
      />
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <CustomBreadcrumbDynamic features={overviewBreadcrumb} />
      <div className="max-w-7xl mx-auto space-y-6 mt-4">
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
                <h3 className="text-2xl font-bold text-foreground">
                  {assignedTask ? `Task: ${assignedTask.taskName}` : "Greenhouse Gas Emissions"}
                </h3>
                <p className="text-muted-foreground text-md">
                  {assignedTask
                    ? "Complete the assigned emission sources below"
                    : "Total emissions from Subsidiaries and supply chains, measured in CO2-equivalent"}
                </p>
                {assignedTask && assignedTask.description && (
                  <p className="text-sm text-muted-foreground italic">{assignedTask.description}</p>
                )}
              </div>
              {!assignedTask && (
                <Button
                  className="bg-primary hover:bg-teal-600 text-white"
                  onClick={() =>
                    router.push(
                      `/assessments/tasks/assign?topic=${encodeURIComponent(
                        "GreenHouse Gas Emissions"
                      )}`
                    )
                  }
                >
                  Assign Task
                </Button>
              )}
            </div>

            <div className="relative w-full mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-input"
                placeholder="Search for emission source or scope"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredScopes.length > 0 ? (
              <Accordion
                type="multiple"
                defaultValue={["scope-1", "scope-2", "scope-3"]}
                className="space-y-4"
              >
                {filteredScopes.map((scope) => (
                  <AccordionItem key={scope.id} value={scope.id} className="border-0">
                    <AccordionTrigger className="py-4 px-2 rounded-lg bg-transparent hover:no-underline hover:cursor-pointer">
                      <div className="flex items-center w-full relative">
                        <span className="text-lg font-semibold flex items-center gap-2">
                          {scope.title}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            (GHG Emission)
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                            >
                              {scope.id === "scope-1" && (
                                <>
                                  <h6 className="font-semibold mb-1">Scope 1 (Direct Emissions)</h6>
                                  <p>
                                    Emissions from sources your company owns or directly controls
                                    (e.g., fuel combustion, company vehicles, generators).
                                  </p>
                                </>
                              )}

                              {scope.id === "scope-2" && (
                                <>
                                  <h6 className="font-semibold mb-1">
                                    Scope 2 (Indirect Energy Emissions)
                                  </h6>
                                  <p>
                                    Emissions from purchased electricity, steam, heating, or cooling
                                    that your company consumes.
                                  </p>
                                </>
                              )}

                              {scope.id === "scope-3" && (
                                <>
                                  <h6 className="font-semibold mb-1">
                                    Scope 3 (Value Chain Emissions)
                                  </h6>
                                  <p>
                                    All other indirect emissions outside your direct control - such
                                    as suppliers, transportation, waste, business travel or product
                                    use.
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {assignedTask && !debouncedSearchTerm
                    ? "No emission sources assigned to you for this task"
                    : debouncedSearchTerm
                      ? `No emission sources found matching "${debouncedSearchTerm}"`
                      : "No emission sources available"}
                </p>
                {debouncedSearchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for different keywords or browse all scopes
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
