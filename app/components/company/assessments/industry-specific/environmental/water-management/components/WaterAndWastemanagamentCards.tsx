import { Card, CardContent } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { AirQualityProps } from "../../air-quality/components/AirQualityCard";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";
import FreshWaterWithdrawalAndConsumption from "./FreshWaterWithdrawalAndConsumption";
import ProducedWaterManagement from "./ProducedWaterManagement";
import ChemicalDisclosure from "./ChemicalDisclosure";
import WaterQualityImpact from "./WaterQualityImpact";
import { SuccessScreen } from "../../../../SuccessScreen";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentCompletion } from "@/hooks/useAssessmentCompletion";
import { checkSubComponentCompletion } from "@/lib/assessmentCompletionUtils";
import { CompletionIndicator } from "@/app/components/ui/reusables/CompletionIndication";

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

// Combine cards into sections for the hook
const scopeData = [
  {
    id: "water-produced-water",
    title: "Water and Produced Water Management",
    cards: cards1,
  },
  {
    id: "hydraulic-fracturing",
    title: "Hydraulic Fracturing Impacts",
    cards: cards2,
  },
];

export default function WaterAndWastemanagementCards({
  backToAssessmentHub,
  backToDisclosureTopics,
}: AirQualityProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(0);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const { state, dispatch } = useAssessment();

  // Use the reusable hook with checkSubComponentCompletion
  const { getStatus, getCardBorderClass } = useAssessmentCompletion(
    scopeData,
    state.assessmentData,
    checkSubComponentCompletion
  );

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
        onContinue={backToDisclosureTopics}
        onContinueAssessment={() => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" })}
        onBackToHub={backToAssessmentHub}
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
                    className={`cursor-pointer hover:bg-accent/50 hover:shadow-md transition-all shadow ${getCardBorderClass(
                      card.title
                    )}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-foreground">{card.title}</h5>
                            <CompletionIndicator status={getStatus(card.title)} />
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
                    className={`cursor-pointer hover:bg-accent/50 hover:shadow-md transition-all shadow ${getCardBorderClass(
                      card.title
                    )}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-foreground">{card.title}</h5>
                            <CompletionIndicator status={getStatus(card.title)} />
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
        onBack={backToWasteWaterManagement}
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
        onBack={backToWasteWaterManagement}
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
        onBack={backToWasteWaterManagement}
        onContinueToNextAssessment={() => setShowSuccess(true)}
        stepIndex={4}
        totalSteps={4}
      />
    );
  }
  return null;
}
