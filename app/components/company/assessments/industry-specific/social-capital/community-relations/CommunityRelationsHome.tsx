"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { communityItems } from "./data/index";
import { slugify } from "./utils";
import CommunityRisk from "./components/CommunityRisk";
import OperationalDelay from "./components/OperationalDelay";
import HCDTContribution from "./components/HCDTContribution";
import CommunityDisputeResolution from "./components/CommunityDisputeResolution";
import { useAssessment } from "@/hooks/useAssessment";
import { FeatureCard } from "./components/ItemCards";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { SuccessScreen } from "../../../SuccessScreen";
import { getFormSectionStatus, getSectionBorderColor, resolveDataPath, type SectionStatus } from "@/lib/assessmentStatusUtils";

interface Props {
  onBack?: () => void;
  backToAssessmentHub?: () => void;
  backToDisclosureTopics?: () => void;
  onContinue?: () => void;
  initialForm?: string;
  onContinueToNextAssessment?: () => void;
}

export default function CommunityRelationsHome({
  onBack,
  backToAssessmentHub,
  onContinue: _onContinue,
  backToDisclosureTopics,
  initialForm,
  onContinueToNextAssessment,
}: Props) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<string>(initialForm ?? "");
  const { state, dispatch } = useAssessment();
  const [showSuccess, setShowSuccess] = React.useState(false);

  const submittedGroups: string[] = (state.assessmentData as any)?.submittedGroups || [];

  const cardStatusMap: Record<string, { groupKey: string; dataPath: string[] }> = {
    "Risk & Opportunity Management": { groupKey: "socialCapital.communityRelations.communityRiskOpportunityManagement", dataPath: ["socialCapital", "communityRelations", "communityRiskOpportunityManagement"] },
    "Host Community Development (PIA)": { groupKey: "socialCapital.communityRelations.hcdtContribution", dataPath: ["socialCapital", "communityRelations", "hcdtContribution"] },
    "Community Dispute Resolution": { groupKey: "socialCapital.communityRelations.communityDisputeResolution", dataPath: ["socialCapital", "communityRelations", "communityDisputeResolution"] },
    "Operational Delays": { groupKey: "socialCapital.communityRelations.operationalDelays", dataPath: ["socialCapital", "communityRelations", "operationalDelays"] },
  };

  const getCardStatus = (cardTitle: string): SectionStatus => {
    const info = cardStatusMap[cardTitle];
    if (!info) return "not-started";
    return getFormSectionStatus(submittedGroups, info.groupKey, resolveDataPath(state.assessmentData, info.dataPath));
  };

  function handleForwardBack() {
    setCurrentView("");
    if (onBack) {
      onBack();
    }
  }

  function handleCardClick(cardTitle: string) {
    setCurrentView(slugify(cardTitle));
  }

  function handleBack() {
    setCurrentView("");
  }

  const handleBackToHub = () => {
    if (backToAssessmentHub) {
      backToAssessmentHub();
    } else {
      setShowSuccess(false);
      setCurrentView("");
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        assessmentName="Community Relations"
        totals={undefined}
        nextAssessment="Security, Human Rights & Rights of Indigenous Peoples"
        onContinueAssessment={onContinueToNextAssessment}
        onBackToHub={handleBackToHub}
      />
    );
  }

  // Community Risk (index 0)
  if (currentView === slugify(communityItems[0].title)) {
    return (
      <div>
        <CommunityRisk
          onBack={handleBack}
          onDisclosureTopics={handleForwardBack}
          onNext={() => {
            setCurrentView(slugify(communityItems[1].title));
          }}
          stepIndex={1}
          totalSteps={4}
        />
      </div>
    );
  }

  // HCDT Contribution (index 1)
  if (currentView === slugify(communityItems[1].title)) {
    return (
      <div>
        <HCDTContribution
          onBack={handleBack}
          onDisclosureTopics={handleForwardBack}
          onNext={() => {
            setCurrentView(slugify(communityItems[2].title));
          }}
          stepIndex={2}
          totalSteps={4}
        />
      </div>
    );
  }

  // Community Dispute Resolution (index 2)
  if (currentView === slugify(communityItems[2].title)) {
    return (
      <div>
        <CommunityDisputeResolution
          onBack={handleBack}
          onDisclosureTopics={handleForwardBack}
          onNext={() => {
            setCurrentView(slugify(communityItems[3].title));
          }}
          stepIndex={3}
          totalSteps={4}
        />
      </div>
    );
  }

  // Operational Delay (index 3)
  if (currentView === slugify(communityItems[3].title)) {
    return (
      <div>
        <OperationalDelay
          onBack={handleBack}
          onDisclosureTopics={handleForwardBack}
          onNext={() => setShowSuccess(true)}
          stepIndex={4}
          totalSteps={4}
        />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-green-50 p-6">
      <CustomBreadcrumbDynamic
        features={[
          { label: "Dashboard", href: "/dashboard-esg" },
          { label: "Assessments", href: "/assessments/hub" },
          {
            label: "Disclosure topics",
            onClick: onBack
              ? onBack
              : () => dispatch({ type: "SET_VIEW", payload: "disclosure-topics" }),
          },
          { label: "Community Relations" },
        ]}
      />

      <div className="flex flex-row md:flex-col md:justify-between w-full mt-4">
        <Card className="w-full p-6 flex flex-col gap-3 bg-white rounded-md shadow-md">
          <div className="flex flex-col md:flex-row items-center w-full md:justify-between">
            <div className="flex flex-col gap-2">
              <h5 className="">Community Relations </h5>
              <p className="text-sm">
                This disclosure topic assesses the company&apos;s framework for managing its
                relationship with host communities, from proactive risk and opportunity management
                to the operational impact of non-technical disruptions. IFRS codes: EM-EP-210b.1,
                EM-EP-210b.2, EM-EP-NGA.S1, EM-EP-NGA.S2
              </p>
            </div>
            <Button
              className="text-white cursor-pointer"
              onClick={() =>
                router.push(
                  `/assessments/tasks/assign?topic=${encodeURIComponent("Community Relations")}`
                )
              }
            >
              Assign task
            </Button>
          </div>

          <FeatureCard
            key={communityItems[0].title}
            title={communityItems[0].title}
            tooltipTitle={communityItems[0].tooltipTitle}
            tooltipMessage={communityItems[0].tooltipMessage}
            subtitle={communityItems[0].subtitle}
            body={communityItems[0].body}
            clickable={communityItems[0].clickable}
            onClick={() => communityItems[0].clickable && handleCardClick(communityItems[0].title)}
            borderColor={getSectionBorderColor(getCardStatus(communityItems[0].title))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureCard
              key={communityItems[1].subtitle}
              title={communityItems[1].title}
              tooltipTitle={communityItems[1].tooltipTitle}
              tooltipMessage={communityItems[1].tooltipMessage}
              subtitle={communityItems[1].subtitle}
              body={communityItems[1].body}
              clickable={communityItems[1].clickable}
              onClick={() =>
                communityItems[1].clickable && handleCardClick(communityItems[1].title)
              }
              borderColor={getSectionBorderColor(getCardStatus(communityItems[1].title))}
            />
            <FeatureCard
              key={communityItems[2].subtitle}
              title={communityItems[2].title}
              tooltipTitle={communityItems[2].tooltipTitle}
              tooltipMessage={communityItems[2].tooltipMessage}
              subtitle={communityItems[2].subtitle}
              body={communityItems[2].body}
              clickable={communityItems[2].clickable}
              onClick={() =>
                communityItems[2].clickable && handleCardClick(communityItems[2].title)
              }
              borderColor={getSectionBorderColor(getCardStatus(communityItems[2].title))}
            />
          </div>

          <FeatureCard
            key={communityItems[3].title}
            title={communityItems[3].title}
            tooltipTitle={communityItems[3].tooltipTitle}
            tooltipMessage={communityItems[3].tooltipMessage}
            subtitle={communityItems[3].subtitle}
            body={communityItems[3].body}
            clickable={communityItems[3].clickable}
            onClick={() => communityItems[3].clickable && handleCardClick(communityItems[3].title)}
            borderColor={getSectionBorderColor(getCardStatus(communityItems[3].title))}
          />
        </Card>
      </div>
    </section>
  );
}
