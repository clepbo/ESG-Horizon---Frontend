"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ChevronRight, Info } from "lucide-react";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { ProductionVolume } from "./ProductionVolume";
import { OffshoreSites } from "./OffschoreSites";
import { TerrestialSites } from "./TerrestialSites";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentCompletion } from "@/hooks/useAssessmentCompletion";
import { checkSubComponentCompletion } from "@/lib/assessmentCompletionUtils";
import { CompletionIndicator } from "@/app/components/ui/reusables/CompletionIndication";

type ActivityMetricView = "overview" | "production-volume" | "offshore-sites" | "terrestrial-sites";

interface ActivityMetricHomeProps {
  onBack?: () => void;
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

export function ActivityMetricHome({ onBack }: ActivityMetricHomeProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ActivityMetricView>("overview");
  const { state } = useAssessment();
  const params = useParams();

  // const reportId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // Use the reusable hook with checkSubComponentCompletion
  const { getStatus, getCardBorderClass } = useAssessmentCompletion(
    activityMetricData,
    state.assessmentData,
    checkSubComponentCompletion
  );

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
                        className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
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
                      const status = getStatus(card.title);
                      const borderClass = getCardBorderClass(card.title);

                      // Get border color based on status - handle undefined case
                      const getBorderColor = () => {
                        if (!status) return "#d1d5db"; // gray-300 for undefined

                        switch (status.status) {
                          case "completed":
                            return "#22c55e"; // green-500
                          case "in-progress":
                            return "#eab308"; // yellow-500
                          default:
                            return "#d1d5db"; // gray-300
                        }
                      };

                      return (
                        <Card
                          key={card.title}
                          className={`transition-all bg-white shadow-sm rounded-lg ${borderClass} ${
                            card.clickable
                              ? "cursor-pointer hover:bg-accent/50 hover:shadow-md"
                              : "cursor-default"
                          }`}
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: getBorderColor(),
                          }}
                          onClick={() => card.clickable && handleCardClick(card.title)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-foreground">{card.title}</h5>
                                  <CompletionIndicator status={status} />
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
