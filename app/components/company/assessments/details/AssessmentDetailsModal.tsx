"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Separator } from "@/app/components/ui/separator";
import { useAssessment } from "@/services/hooks/assessment.hooks";
import { formatNumberFull } from "@/lib/numberFormat";

import type { AssessmentDetailsModalProps, FileWithMeta, PillarTabId } from "./types";
import { DEFAULT_TAB } from "./constants";
import { collectAllFiles } from "./utils";

import { ModalHeader } from "./ModalHeader";
import { InfoCardsRow } from "./InfoCardsRow";
import { PillarTabs } from "./PillarTabs";
import { ApproveDeclineActions } from "./ApproveDeclineActions";
import { FilePreviewOverlay } from "./FilePreviewOverlay";
import { DocumentsSection } from "./DocumentsSection";

import { ActivityMetricsTab } from "./tabs/ActivityMetricsTab";
import { EnvironmentalTab } from "./tabs/EnvironmentalTab";
import { SocialCapitalTab } from "./tabs/SocialCapitalTab";
import { HumanCapitalTab } from "./tabs/HumanCapitalTab";
import { BusinessModelTab } from "./tabs/BusinessModelTab";
import { LeadershipTab } from "./tabs/LeadershipTab";

export function AssessmentDetailsModal({ open, onClose, assessment }: AssessmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<PillarTabId>(DEFAULT_TAB);
  const [selectedFile, setSelectedFile] = useState<FileWithMeta | null>(null);
  const { data: fullAssessment, isLoading } = useAssessment(assessment?.id);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) onClose();
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !assessment) return null;

  if (isLoading || !fullAssessment) {
    return (
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Card className="w-full max-w-4xl p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
            <p className="text-gray-600">Loading assessment details...</p>
          </div>
        </Card>
      </div>
    );
  }

  const assessmentData = fullAssessment.assessmentData || {};
  const submittedGroups: string[] = assessmentData.submittedGroups || [];
  const allFiles = collectAllFiles(assessmentData);

  const isAwaitingApproval =
    fullAssessment.status === "awaiting_review" || assessment?.status === "awaiting_review";

  const tabContent: Record<PillarTabId, React.ReactNode> = {
    "activity-metrics": (
      <ActivityMetricsTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
      />
    ),
    environmental: (
      <EnvironmentalTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
      />
    ),
    "social-capital": (
      <SocialCapitalTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
      />
    ),
    "human-capital": (
      <HumanCapitalTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
      />
    ),
    "business-model": (
      <BusinessModelTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
      />
    ),
    leadership: (
      <LeadershipTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
      />
    ),
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-6xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <ModalHeader
          status={fullAssessment.status}
          onClose={onClose}
          onAssignTask={() => {}}
          onSubmitForReview={() => {}}
        />

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Info Cards — conditional 3 or 4 based on active tab */}
            <InfoCardsRow
              activeTabId={activeTab}
              assessmentData={assessmentData}
              fullAssessment={fullAssessment}
            />

            {/* Last updated */}
            {fullAssessment.updatedAt && (
              <p className="text-xs text-gray-700">
                Last updated:{" "}
                {new Date(fullAssessment.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            <Separator />

            {/* Pillar Tabs */}
            <PillarTabs activeTabId={activeTab} onChange={setActiveTab} />

            {/* Active Tab Content */}
            <div className="min-h-[200px]">{tabContent[activeTab]}</div>

            <Separator />

            {/* Supporting Documents */}
            {allFiles.length > 0 && (
              <DocumentsSection files={allFiles} onFileClick={setSelectedFile} />
            )}

            {/* Approve / Decline Actions */}
            <ApproveDeclineActions
              assessmentId={assessment.id}
              rejectionReason={fullAssessment.rejection_reason}
              isAwaitingApproval={isAwaitingApproval}
              onClose={onClose}
            />
          </div>
        </ScrollArea>

        {/* File Preview Overlay */}
        {selectedFile && (
          <FilePreviewOverlay file={selectedFile} onClose={() => setSelectedFile(null)} />
        )}
      </div>
    </div>
  );
}
