import { Card, CardContent } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/hooks/useAssessment";
import {
  checkTopicCompletion,
  getCompletionBadgeVariant,
  shouldShowBadge,
  type CompletionStatus,
} from "@/lib/assessmentCompletionUtils";

export interface AirQualityProps {
  backToDisclosureTopics: () => void;
  backToAssessmentHub: () => void;
  handleCardClick: () => void;
}

export default function AirQualityCard({
  backToDisclosureTopics,
  backToAssessmentHub,
  handleCardClick,
}: AirQualityProps) {
  const router = useRouter();
  const { state } = useAssessment();
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    status: "not-started",
    completionPercentage: 0,
  });

  useEffect(() => {
    const status = checkTopicCompletion("Air Quality", state.assessmentData);
    setCompletionStatus(status);
  }, [state.assessmentData]);

  const cards = [
    {
      title: "Air Pollutant Emisssions",
      subtitle:
        "This form covers metric  EM-EP-120a.1., focusing on the company&apos;s overall air quality",
    },
  ];

  // Render completion indicator
  const renderCompletionIndicator = () => {
    if (!shouldShowBadge(completionStatus)) return null;

    const badge = getCompletionBadgeVariant(completionStatus);

    return (
      <div className="flex items-center gap-1.5">
        {completionStatus.status === "completed" && (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.className}`}>
          {badge.text}
        </span>
      </div>
    );
  };

  // Get border color based on completion status
  const getCardBorderClass = (): string => {
    switch (completionStatus.status) {
      case "completed":
        return "border-l-4 border-l-green-500 border-t border-r border-b border-gray-200";
      case "in-progress":
        return "border-l-4 border-l-yellow-500 border-t border-r border-b border-gray-200";
      default:
        return "border-gray-200";
    }
  };

  const features = [
    {
      label: "Assessments",
      onClick: backToAssessmentHub,
    },
    {
      label: "Disclosure Topics",
      onClick: backToDisclosureTopics,
    },
  ];

  return (
    <div>
      <section className="min-h-screen bg-green-50 p-6">
        <div className="flex flex-row gap-4 md:flex-col md:justify-between w-full">
          <CustomBreadcrumbDynamic features={features} />
          <Card className="w-full p-6 flex min-h-[90vh] flex-col gap-3 bg-white rounded-md shadow-md">
            <div className="flex flex-col gap-3 md:flex-row items-center w-full md:justify-between">
              <div className="flex flex-col gap-2">
                <h5 className="">Air Quality</h5>
                <p className="text-sm">
                  This disclosure topic quantifies the company&apos;s direct atmospheric release of
                  key non-GHG pollutants, assessing its impact on local air quality and the
                  management of associated environmental and health risks. IFRS code: EM-EP-120a.1
                </p>
              </div>
              <Button
                className="text-white cursor-pointer rounded"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent("Air Quality")}`
                  )
                }
              >
                Assign task
              </Button>
            </div>

            {cards.map((card, i) => (
              <Card
                key={i}
                onClick={handleCardClick}
                className={`cursor-pointer hover:bg-gray-100 max-w-lg shadow ${getCardBorderClass()}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-foreground">{card.title}</h5>
                        {renderCompletionIndicator()}
                      </div>
                      <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </Card>
        </div>
      </section>
    </div>
  );
}
