"use client";

import { Card } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { communityItems } from "./data/index";
import { slugify } from "./utils";
import CommunityRisk from "./components/CommunityRisk";
import OperationalDelay from "./components/OperationalDelay";
import { useAssessment } from "@/hooks/useAssessment";
import { FeatureCard } from "./components/ItemCards";

interface Props {
  onBack?: () => void;
}
export default function CommunityRelationsHome({ onBack }: Props) {
  const [currentView, setCurrentView] = useState<string>("");
  const { state, dispatch } = useAssessment();
  const router = useRouter();

  function handleForwardBack() {
    setCurrentView("");
    onBack && onBack();
  }

  function handleCardClick(cardTitle: string) {
    setCurrentView(slugify(cardTitle));
  }

  function handleBack() {
    setCurrentView("");
  }

  if (currentView === slugify(communityItems[0].title)) {
    return (
      <div>
        <CommunityRisk
          onBack={handleBack}
          onDisclosureTopics={handleForwardBack}
          onNext={function (): void {
            throw new Error("Function not implemented.");
          }}
          stepIndex={1}
          totalSteps={2}
        />
      </div>
    );
  }
  if (currentView === slugify(communityItems[1].title)) {
    return (
      <div>
        <OperationalDelay onBack={handleBack} onDisclosureTopics={handleForwardBack} />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-green-50 p-6">
      <div className="flex flex-row md:flex-col md:justify-between w-full">
        <Button
          className="mb-3 text-sm flex gap-1 text-gray-800 shadow rounded px-4 py-2 w-fit bg-white hover:bg-gray-100 cursor-pointer"
          onClick={onBack ? onBack : () => dispatch({ type: "SET_VIEW", payload: "disclosure" })}
        >
          <ArrowLeft size={18} /> <span className="text-sm">Back</span>
        </Button>
        <Card className="w-full p-6 flex flex-col gap-3 bg-white rounded-md shadow-md">
          <div className="flex flex-col md:flex-row items-center w-full md:justify-between">
            <div className="flex flex-col gap-2">
              <h5 className="">Community Relations </h5>
              <p className="text-sm">
                This disclosure topic assesses the company's framework for managing its relationship
                with host communities, from proactive risk and opportunity management to the
                operational impact of non-technical disruptions. IFRS codes: EM-EP-210b.1,
                EM-EP-210b.2
              </p>
            </div>
            <Button className="text-white cursor-pointer">Assign task</Button>
          </div>

          {communityItems.map((card, i) => (
            // <>
            //     <h5 className='-mb-2'> {card.title}
            //         <CustomTooltip detail={<TooltipMessage title={card.tooltipTitle} message={card.tooltipMessage} />} />
            //     </h5>
            //     <Card
            //         key={card.title}
            //         className={`transition-colors shadow-sm max-w-lg bg-white rounded-lg border ${card.clickable
            //             ? "cursor-pointer hover:bg-accent/50"
            //             : "cursor-default"
            //             }`}
            //         onClick={() => card.clickable && handleCardClick(card.title)}
            //     >
            //         <CardContent className="p-4">
            //             <div className="flex items-center justify-between">
            //                 <div className="space-y-1 flex-1">
            //                     <h5 className="font-medium text-foreground">{card.subtitle}</h5>
            //                     <p className="text-sm text-muted-foreground">
            //                         {card.body}
            //                     </p>
            //                 </div>
            //                 <ChevronRight className="h-7 w-7 text-muted-foreground shrink-0 ml-2" />
            //             </div>
            //         </CardContent>
            //     </Card>
            // </>
            <FeatureCard
              key={card.title}
              title={card.title}
              tooltipTitle={card.tooltipTitle}
              tooltipMessage={card.tooltipMessage}
              subtitle={card.subtitle}
              body={card.body}
              clickable={card.clickable}
              onClick={() => card.clickable && handleCardClick(card.title)}
            />
          ))}
        </Card>
      </div>
    </section>
  );
}
