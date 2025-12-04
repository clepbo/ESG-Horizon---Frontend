import { Card, CardContent } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import React from "react";
import { AirQualityProps } from "../../air-quality/components/AirQualityCard";
import CustomTooltip from "@/app/(company)/ranking/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/ranking/create/components/TooltipMessage";
import FreshWaterWithdrawalAndConsumption from "./FreshWaterWithdrawalAndConsumption";
import ProducedWaterManagement from "./ProducedWaterManagement";
import ChemicalDisclosure from "./ChemicalDisclosure";
import WaterQualityImpact from "./WaterQualityImpact";

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

interface WaterAndWastemanagamentCardsProps {
  backToAssessmentHub: () => void;
  backToDisclosureTopics: () => void;
}

export default function WaterAndWastemanagamentCards({
  backToAssessmentHub,
  backToDisclosureTopics,
}: AirQualityProps) {
  const [step, setStep] = React.useState<number>(0);

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
        setStep(1); // fallback
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

  if (step === 0) {
    return (
      <section className="min-h-screen bg-green-50 p-6">
        <div className="flex flex-row gap-4 md:flex-col md:justify-between w-full">
          <CustomBreadcrumbDynamic features={features} />
          <Card className="w-full p-6 flex min-h-[90vh] flex-col gap-3 lg:gap-6 bg-white rounded-md shadow-md">
            <div className="flex flex-col gap-3 md:flex-row items-center w-full md:justify-between">
              <div className="flex flex-col gap-2">
                <h5 className="">Water and Wastewater Management</h5>
                <p className="text-sm">
                  This disclosure topic quantifies the company's water footprint, from freshwater
                  withdrawal to the management and disposal of operational wastewater, to assess
                  overall resource efficiency and environmental impact. It metric IFRS codes:
                  EM-EP-140a.1, EM-EP-140a.2, EM-EP-140a.3 and EM-EP-140a.4
                </p>
              </div>
              <Button className="text-white cursor-pointer rounded">Assign task</Button>
            </div>
            <div>
              <h5>
                {" "}
                Water and Produced Water Management{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Water and Produced Water Management"}
                      message={
                        "Report how your company manages freshwater use and wastewater generated during operations.This includes tracking water withdrawal, treatment, discharge, recycling, and measures taken to reduce environmental impacts such as contamination or excessive water consumption."
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
                    className="cursor-pointer hover:bg-gray-100 max-w-md shadow"
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
            </div>
            <div>
              <h5>
                {" "}
                Hydraulic Fracturing Impacts{" "}
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title={"Hydraulic Fracturing Impacts"}
                      message={
                        "Disclose how hydraulic fracturing (fracking) activities affect local water systems.This includes chemical usage, wastewater handling, spill prevention, groundwater protection measures, and comparison of water quality before and after drilling activities."
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
                    className="cursor-pointer hover:bg-gray-100 max-w-lg shadow"
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
            </div>
            <div></div>
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
        stepIndex={0}
        totalSteps={3}
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
        stepIndex={1}
        totalSteps={3}
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
        stepIndex={0}
        totalSteps={0}
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
        onContinueToNextAssessment={() => alert("Submitted")}
        stepIndex={4}
        totalSteps={4}
      />
    );
  }
  return null;
}
