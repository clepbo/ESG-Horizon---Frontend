import { Card, CardContent } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/hooks/useAssessment";
import { checkTopicCompletion } from "@/lib/assessmentCompletionUtils";

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
  const { state } = useAssessment();
  const router = useRouter();

  useEffect(() => {
    // Debugging completion status - keep or remove as needed for dev
    if (state.assessmentData) {
      checkTopicCompletion("Air Quality", state.assessmentData);
    }
  }, [state.assessmentData]);

  const cards = [
    {
      title: "Air Pollutant Emisssions",
      subtitle:
        "This form covers metric  EM-EP-120a.1., focusing on the company&apos;s overall air quality",
    },
  ];

  // Status indication commented out - revisit later
  // const renderCompletionIndicator = () => { ... };
  // const getCardBorderClass = (): string => { ... };

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
                className="cursor-pointer hover:bg-gray-100 max-w-lg shadow border-gray-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-foreground">{card.title}</h5>
                        {/* {renderCompletionIndicator()} */}
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
