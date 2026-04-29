"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ChevronRight, Info } from "lucide-react";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { ProductionVolume } from "./ProductionVolume";
import { OffshoreSites } from "./OffschoreSites";
import { TerrestialSites } from "./TerrestialSites";
import { useAssessment } from "@/hooks/useAssessment";
import {
  getFormSectionStatus,
  getSectionBorderColor,
  resolveDataPath,
  type SectionStatus,
} from "@/lib/assessmentStatusUtils";
import { StatusPill } from "@/app/components/ui/StatusPill";

type ActivityMetricView = "overview" | "production-volume" | "offshore-sites" | "terrestrial-sites";

interface ActivityMetricHomeProps {
  onBack?: () => void;
  initialView?: ActivityMetricView;
}

const activityMetricData = [
  {
    id: "production-data",
    title: "Production Data",
    cards: [
      {
        title: "Production Volumes",
        subtitle:
          "This form covers metric EM-EP-000.A, focusing on the average daily production of oil and natural gas.",
        clickable: true,
      },
    ],
  },
  {
    id: "asset-portfolio",
    title: "Asset Portfolio",
    cards: [
      {
        title: "Offshore Sites",
        subtitle:
          "This form covers metric EM-EP-000.B, which is specific to the number of operational offshore sites.",
        clickable: true,
      },
      {
        title: "Terrestrial Sites",
        subtitle:
          "This form covers metric EM-EP-000.C, which is specific to the number of operational onshore sites.",
        clickable: true,
      },
    ],
  },
];

export function ActivityMetricHome({ onBack, initialView = "overview" }: ActivityMetricHomeProps) {
  const router = useRouter();
  const { state } = useAssessment();
  const [currentView, setCurrentView] = useState<ActivityMetricView>(initialView);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];

  const cardStatusMap: Record<string, { groupKey: string; dataPath: string[] }> = {
    "Production Volumes": {
      groupKey: "foundationalData.activityMetrics.productionVolumes",
      dataPath: ["activityMetrics", "productionVolume"],
    },
    "Offshore Sites": {
      groupKey: "foundationalData.activityMetrics.offshoreSites",
      dataPath: ["activityMetrics", "assetPortfolio", "offshoreSites"],
    },
    "Terrestrial Sites": {
      groupKey: "foundationalData.activityMetrics.terrestrialSites",
      dataPath: ["activityMetrics", "assetPortfolio", "terrestrialSites"],
    },
  };

  const getSubCardStatus = (cardTitle: string): SectionStatus => {
    const info = cardStatusMap[cardTitle];
    if (!info) return "not-started";
    return getFormSectionStatus(
      submittedGroups,
      info.groupKey,
      resolveDataPath(state.assessmentData, info.dataPath)
    );
  };

  const handleBackToOverview = () => {
    setCurrentView("overview");
  };

  const overviewBreadcrumb = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onBack || (() => router.back()) },
    { label: "Activity Metrics", onClick: handleBackToOverview },
  ];

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Production Volumes") {
      setCurrentView("production-volume");
    }
    if (cardTitle === "Offshore Sites") {
      setCurrentView("offshore-sites");
    }
    if (cardTitle === "Terrestrial Sites") {
      setCurrentView("terrestrial-sites");
    }
  };

  if (currentView === "production-volume") {
    return (
      <ProductionVolume
        onBack={handleBackToOverview}
        onContinueToNextAssessment={() => setCurrentView("offshore-sites")}
        stepIndex={1}
        totalSteps={3}
        breadcrumb={[...overviewBreadcrumb, { label: "Production Volumes" }]}
      />
    );
  }

  if (currentView === "offshore-sites") {
    return (
      <OffshoreSites
        onBack={() => setCurrentView("production-volume")}
        onContinueToNextAssessment={() => setCurrentView("terrestrial-sites")}
        stepIndex={2}
        totalSteps={3}
        breadcrumb={[...overviewBreadcrumb, { label: "Offshore Sites" }]}
      />
    );
  }

  if (currentView === "terrestrial-sites") {
    return (
      <TerrestialSites
        onBack={() => setCurrentView("offshore-sites")}
        stepIndex={3}
        totalSteps={3}
        breadcrumb={[...overviewBreadcrumb, { label: "Terrestrial Sites" }]}
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
                <h3 className="text-2xl font-bold text-foreground">Activity Metrics</h3>
                <p className="text-muted-foreground text-md">
                  This disclosure topic provides the fundamental quantitative data on the scale of
                  the company&apos;s core operations, including production volumes and the number of
                  operational sites, which serve as a baseline for normalizing other performance
                  metrics. (IFRS codes: EM-EP-000.A, EM-EP-000.B, EM-EP-000.C)
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent("Activity Metrics")}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <div className="space-y-6">
              {activityMetricData.map((section) => (
                <div key={section.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-lg font-semibold">{section.title}</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="start"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        {section.id === "production-data" && (
                          <>
                            <h6 className="font-semibold mb-1">Production Data</h6>
                            <p>
                              This section captures your company&apos;s production output across
                              various hydrocarbon streams. Enter accurate volumes for the reporting
                              period to support emissions calculation and operational benchmarking.
                            </p>
                          </>
                        )}
                        {section.id === "asset-portfolio" && (
                          <>
                            <h6 className="font-semibold mb-1">Asset Portfolio</h6>
                            <p>
                              This section captures the number and type of operational assets your
                              company manages. Asset counts help define operational boundaries and
                              contextualize environmental impacts.
                            </p>
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div
                    className={
                      section.cards.length === 1
                        ? "max-w-md"
                        : "grid grid-cols-1 lg:grid-cols-2 gap-4"
                    }
                  >
                    {section.cards.map((card) => {
                      const status = getSubCardStatus(card.title);

                      return (
                        <Card
                          key={card.title}
                          className={`transition-all bg-white shadow-sm rounded-lg ${
                            card.clickable
                              ? "cursor-pointer hover:bg-accent/50 hover:shadow-md"
                              : "cursor-default"
                          }`}
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: getSectionBorderColor(status),
                          }}
                          onClick={() => card.clickable && handleCardClick(card.title)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-foreground">{card.title}</h5>
                                  <StatusPill status={status} />
                                </div>
                                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
