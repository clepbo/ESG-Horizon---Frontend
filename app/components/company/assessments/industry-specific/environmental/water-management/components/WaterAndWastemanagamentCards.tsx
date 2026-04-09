import { Card, CardContent } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import React, { useEffect } from "react";
import { AirQualityProps } from "../../air-quality/components/AirQualityCard";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";
import FreshWaterWithdrawalAndConsumption from "./FreshWaterWithdrawalAndConsumption";
import ProducedWaterManagement from "./ProducedWaterManagement";
import ChemicalDisclosure from "./ChemicalDisclosure";
import WaterQualityImpact from "./WaterQualityImpact";
import { SuccessScreen } from "../../../../SuccessScreen";
import { useAssessment } from "@/hooks/useAssessment";
import {
  getFormSectionStatus,
  getSectionBorderColor,
  resolveDataPath,
  type SectionStatus,
} from "@/lib/assessmentStatusUtils";
import { StatusPill } from "@/app/components/ui/StatusPill";
import { checkSubComponentCompletion } from "@/lib/assessmentCompletionUtils";
// import { CompletionIndicator } from "@/app/components/ui/reusables/CompletionIndication";
import { useRouter, useParams } from "next/navigation";

const cards1 = [
  {
    title: "Freshwater Withdrawal & Consumption",
    subtitle:
      "This form covers metric EM-EP-140a.1, focusing on the company's overall water footprint.",
    clickable: true,
  },
  {
    title: "Produced Water Management",
    subtitle:
      "This form covers metric EM-EP-140a.2, which is specific to the operational wastewater generated.",
    clickable: true,
  },
];

const cards2 = [
  {
    title: "Chemical Disclosure",
    subtitle:
      "This form covers metric EM-EP-140a.3, which is specific to the public disclosure of chemicals used in hydraulic fracturing operations.",
    clickable: true,
  },
  {
    title: "Water Quality Impacts",
    subtitle:
      "This form covers metric EM-EP-140a.4, which is specific to monitoring and reporting on the impact of hydraulic fracturing on local water quality.",
    clickable: true,
  },
];

export default function WaterAndWastemanagementCards({
  backToAssessmentHub,
  backToDisclosureTopics,
  onContinueToNextAssessment,
}: AirQualityProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(0);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const { state } = useAssessment();
  const params = useParams();

  const reportId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const handleViewReport = () => {
    if (reportId) {
      router.push(`/reports-and-analytics/${reportId}?tab=environmental`);
    } else {
      router.push("/reports-and-analytics");
    }
  };

  useEffect(() => {
    // Debugging completion status - keep or remove as needed for dev
    if (state.assessmentData) {
      const tests = [
        "Freshwater Withdrawal & Consumption",
        "Produced Water Management",
        "Chemical Disclosure",
        "Water Quality Impacts",
      ];

      tests.forEach((title) => {
        checkSubComponentCompletion(title, state.assessmentData);
      });
    }
  }, [state.assessmentData]);

  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];

  const cardStatusMap: Record<string, { groupKey: string; dataPath: string[] }> = {
    "Freshwater Withdrawal & Consumption": {
      groupKey: "environment.waterManagement.waterAndProducedWaterManagement.freshwaterWithdrawals",
      dataPath: [
        "environment",
        "waterManagement",
        "waterAndProducedWaterManagement",
        "freshwaterWithdrawals",
      ],
    },
    "Produced Water Management": {
      groupKey:
        "environment.waterManagement.waterAndProducedWaterManagement.producedWaterManagement",
      dataPath: [
        "environment",
        "waterManagement",
        "waterAndProducedWaterManagement",
        "producedWaterManagement",
      ],
    },
    "Chemical Disclosure": {
      groupKey: "environment.waterManagement.hydraulicFracturingImpacts.chemicalDisclosure",
      dataPath: [
        "environment",
        "waterManagement",
        "hydraulicFracturingImpacts",
        "chemicalDisclosure",
      ],
    },
    "Water Quality Impacts": {
      groupKey: "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts",
      dataPath: [
        "environment",
        "waterManagement",
        "hydraulicFracturingImpacts",
        "waterQualityImpacts",
      ],
    },
  };

  const getCardStatus = (cardTitle: string): SectionStatus => {
    const info = cardStatusMap[cardTitle];
    if (!info) return "not-started";
    return getFormSectionStatus(
      submittedGroups,
      info.groupKey,
      resolveDataPath(state.assessmentData, info.dataPath)
    );
  };

  function backToWasteWaterManagement() {
    setStep(0);
  }

  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case "Freshwater Withdrawal & Consumption":
        setStep(1);
        break;
      case "Produced Water Management":
        setStep(2);
        break;
      case "Chemical Disclosure":
        setStep(3);
        break;
      case "Water Quality Impacts":
        setStep(4);
        break;
      default:
        setStep(1);
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
    {
      label: "Water and Wastewater Management",
    },
  ];

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Water and Wastewater Management"
        totals={undefined}
        nextAssessment="Biodiversity Impact"
        reportId={reportId}
        onContinue={handleViewReport}
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={backToDisclosureTopics}
      />
    );
  }

  if (step === 0) {
    return (
      <section className="min-h-screen bg-green-50 p-6">
        <div className="flex flex-row gap-4 md:flex-col md:justify-between w-full">
          <CustomBreadcrumbDynamic features={features} />
          <Card className="w-full p-6 flex min-h-[90vh] flex-col gap-3 lg:gap-6 bg-white rounded-md shadow-md">
            <div className="flex flex-col gap-3 md:flex-row items-center w-full md:justify-between">
              <div className="flex flex-col gap-2">
                <h5 className="text-2xl font-bold text-foreground">
                  Water and Wastewater Management
                </h5>
                <p className="text-sm text-muted-foreground">
                  This disclosure topic quantifies the company&apos;s water footprint, from
                  freshwater withdrawal to the management and disposal of operational wastewater, to
                  assess overall resource efficiency and environmental impact. It metric IFRS codes:
                  EM-EP-140a.1, EM-EP-140a.2, EM-EP-140a.3 and EM-EP-140a.4
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white cursor-pointer rounded"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent(
                      "Water and Wastewater Management"
                    )}`
                  )
                }
              >
                Assign task
              </Button>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-3">
                Water and Produced Water Management{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Water and Produced Water Management"}
                      message={
                        "Report how your company manages freshwater use and wastewater generated during operations. This includes tracking water withdrawal, treatment, discharge, recycling, and measures taken to reduce environmental impacts such as contamination or excessive water consumption."
                      }
                    />
                  }
                />
              </h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cards1.map((card, i) => (
                  <Card
                    key={i}
                    onClick={() => handleCardClick(card.title)}
                    className="cursor-pointer hover:bg-accent/50 hover:shadow-md transition-all shadow"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: getSectionBorderColor(getCardStatus(card.title)),
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-foreground">{card.title}</h5>
                            <StatusPill status={getCardStatus(card.title)} />
                          </div>
                          <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-3">
                Hydraulic Fracturing Impacts{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Hydraulic Fracturing Impacts"}
                      message={
                        "Disclose how hydraulic fracturing (fracking) activities affect local water systems. This includes chemical usage, wastewater handling, spill prevention, groundwater protection measures, and comparison of water quality before and after drilling activities."
                      }
                    />
                  }
                />
              </h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cards2.map((card, i) => (
                  <Card
                    key={i}
                    onClick={() => handleCardClick(card.title)}
                    className="cursor-pointer hover:bg-accent/50 hover:shadow-md transition-all shadow"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: getSectionBorderColor(getCardStatus(card.title)),
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-foreground">{card.title}</h5>
                            <StatusPill status={getCardStatus(card.title)} />
                          </div>
                          <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>
    );
  }
  if (step === 1) {
    return (
      <FreshWaterWithdrawalAndConsumption
        backToDisclosureTopic={backToDisclosureTopics}
        backToAssessment={backToAssessmentHub}
        backToWaterWasteManagement={() => setStep(0)}
        onBack={backToWasteWaterManagement}
        onContinueToNextAssessment={() => setStep(2)}
        stepIndex={1}
        totalSteps={4}
      />
    );
  }
  if (step === 2) {
    return (
      <ProducedWaterManagement
        backToAssessment={backToAssessmentHub}
        backToDisclosureTopic={backToDisclosureTopics}
        backToWaterWasteManagement={backToWasteWaterManagement}
        onBack={() => setStep(1)}
        onContinueToNextAssessment={() => setStep(3)}
        stepIndex={2}
        totalSteps={4}
      />
    );
  }
  if (step === 3) {
    return (
      <ChemicalDisclosure
        backToDisclosureTopic={backToDisclosureTopics}
        backToAssessment={backToAssessmentHub}
        backToWaterWasteManagement={backToWasteWaterManagement}
        onBack={() => setStep(2)}
        onContinueToNextAssessment={() => setStep(4)}
        stepIndex={3}
        totalSteps={4}
      />
    );
  }
  if (step === 4) {
    return (
      <WaterQualityImpact
        backToDisclosureTopic={backToDisclosureTopics}
        backToAssessment={backToAssessmentHub}
        backToWaterWasteManagement={backToWasteWaterManagement}
        onBack={() => setStep(3)}
        onContinueToNextAssessment={() => setShowSuccess(true)}
        stepIndex={4}
        totalSteps={4}
      />
    );
  }
  return null;
}
