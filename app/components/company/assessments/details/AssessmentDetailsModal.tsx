"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Separator } from "@/app/components/ui/separator";
import { useAssessment, useSubmitForReview } from "@/services/hooks/assessment.hooks";
import { assessmentService } from "@/services/assessment.service";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import ReviewerSelectionModal from "@/app/components/company/assessments/ReviewerSelectionModal";

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

export function AssessmentDetailsModal({
  open,
  onClose,
  assessment,
  requireAssessmentReview,
}: AssessmentDetailsModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PillarTabId>(DEFAULT_TAB);
  const [selectedFile, setSelectedFile] = useState<FileWithMeta | null>(null);
  const [reviewerModalOpen, setReviewerModalOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState<{ open: boolean; path: string }>({
    open: false,
    path: "",
  });
  const { data: fullAssessment, isLoading } = useAssessment(assessment?.id);
  const submitForReviewMutation = useSubmitForReview();

  const clearSectionMutation = useMutation({
    mutationFn: (path: string) =>
      assessmentService.saveProgress(assessment!.id, path, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", assessment?.id] });
    },
  });

  // Task 5: close modal first, then navigate
  const handleAssignTask = () => {
    if (!assessment?.id) return;
    onClose();
    router.push(`/assessments/tasks/assign?assessmentId=${assessment.id}`);
  };

  const handleSubmitClick = () => {
    if (requireAssessmentReview) {
      setReviewerModalOpen(true);
    } else {
      setSubmitConfirmOpen(true);
    }
  };

  // Task 4: invalidate specific assessment query + close modal on success
  const handleReviewerSelected = (reviewerId?: number) => {
    if (!assessment?.id) return;
    submitForReviewMutation.mutate(
      { assessmentId: assessment.id, reviewerId },
      {
        onSettled: () => setReviewerModalOpen(false),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["assessment", assessment.id] });
          onClose();
        },
      },
    );
  };

  const handleDirectSubmitConfirm = () => {
    if (!assessment?.id) return;
    submitForReviewMutation.mutate(
      { assessmentId: assessment.id },
      {
        onSettled: () => setSubmitConfirmOpen(false),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["assessment", assessment.id] });
          onClose();
        },
      },
    );
  };

  // Task 2: navigate to the assessment form at the given view + step
  const handleEditSection = (view: string, step?: string) => {
    if (!assessment?.id) return;
    const params = new URLSearchParams({ forceDisclosure: "1", view });
    if (step) params.set("step", step);
    onClose();
    router.push(`/assessments/${assessment.id}?${params.toString()}`);
  };

  // Task 3: open confirm then save null at path to clear section data
  const handleClearSection = (path: string) => {
    setClearConfirm({ open: true, path });
  };

  const handleClearConfirm = () => {
    clearSectionMutation.mutate(clearConfirm.path, {
      onSettled: () => setClearConfirm({ open: false, path: "" }),
    });
  };

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

  // Only allow editing when assessment is still in progress or has been declined
  const isEditable =
    fullAssessment.status === "in_progress" || fullAssessment.status === "declined";

  const tabContent: Record<PillarTabId, React.ReactNode> = {
    "activity-metrics": (
      <ActivityMetricsTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
        onEditSection={isEditable ? handleEditSection : undefined}
        onClearSection={isEditable ? handleClearSection : undefined}
      />
    ),
    environmental: (
      <EnvironmentalTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
        onEditSection={isEditable ? handleEditSection : undefined}
        onClearSection={isEditable ? handleClearSection : undefined}
      />
    ),
    "social-capital": (
      <SocialCapitalTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
        onEditSection={isEditable ? handleEditSection : undefined}
        onClearSection={isEditable ? handleClearSection : undefined}
      />
    ),
    "human-capital": (
      <HumanCapitalTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
        onEditSection={isEditable ? handleEditSection : undefined}
        onClearSection={isEditable ? handleClearSection : undefined}
      />
    ),
    "business-model": (
      <BusinessModelTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
        onEditSection={isEditable ? handleEditSection : undefined}
        onClearSection={isEditable ? handleClearSection : undefined}
      />
    ),
    leadership: (
      <LeadershipTab
        assessmentData={assessmentData}
        submittedGroups={submittedGroups}
        onFileClick={setSelectedFile}
        onEditSection={isEditable ? handleEditSection : undefined}
        onClearSection={isEditable ? handleClearSection : undefined}
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
          requireAssessmentReview={requireAssessmentReview}
          isSubmitting={submitForReviewMutation.isPending}
          onClose={onClose}
          onAssignTask={isEditable ? handleAssignTask : undefined}
          onSubmitClick={isEditable ? handleSubmitClick : undefined}
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

      {/* Submit for Review — reviewer selection */}
      <ReviewerSelectionModal
        open={reviewerModalOpen}
        onClose={() => setReviewerModalOpen(false)}
        onSubmit={handleReviewerSelected}
        loading={submitForReviewMutation.isPending}
      />

      {/* Submit / Approve — direct confirm */}
      <ConfirmModal
        open={submitConfirmOpen}
        title="Submit Assessment"
        message="Are you sure you want to submit this assessment? Once submitted, you will not be able to edit it further."
        onCancel={() => setSubmitConfirmOpen(false)}
        onConfirm={handleDirectSubmitConfirm}
        loading={submitForReviewMutation.isPending}
      />

      {/* Clear section data — confirm */}
      <ConfirmModal
        open={clearConfirm.open}
        title="Clear Section Data"
        message="Are you sure you want to clear all data in this section? This action cannot be undone."
        onCancel={() => setClearConfirm({ open: false, path: "" })}
        onConfirm={handleClearConfirm}
        loading={clearSectionMutation.isPending}
      />
    </div>
  );
}
