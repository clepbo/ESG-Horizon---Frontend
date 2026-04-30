"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { XCircle } from "lucide-react";
import { useApproveAssessment, useDeclineAssessment } from "@/services/hooks/assessment.hooks";
import { useRoles } from "@/lib/roles";
import PermissionTooltip from "@/app/components/ui/PermissionTooltip";

interface ApproveDeclineActionsProps {
  assessmentId: number;
  rejectionReason?: string;
  isAwaitingApproval: boolean;
  onClose: () => void;
}

export function ApproveDeclineActions({
  assessmentId,
  rejectionReason,
  isAwaitingApproval,
  onClose,
}: ApproveDeclineActionsProps) {
  const approveMutation = useApproveAssessment();
  const declineMutation = useDeclineAssessment();
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineValidationError, setDeclineValidationError] = useState("");

  const { isValidator } = useRoles();
  const canApprove = isValidator;
  const canDecline = isValidator;
  const isActionLoading = approveMutation.isPending || declineMutation.isPending;

  const handleApprove = () => {
    if (!assessmentId || isActionLoading) return;
    approveMutation.mutate(assessmentId, { onSuccess: () => onClose() });
  };

  const handleOpenDecline = () => {
    setShowDeclineReason(true);
    setDeclineValidationError("");
  };

  const handleCancelDecline = () => {
    setShowDeclineReason(false);
    setDeclineReason("");
    setDeclineValidationError("");
  };

  const handleConfirmDecline = () => {
    if (!assessmentId || isActionLoading) return;
    if (!declineReason.trim()) {
      setDeclineValidationError("Please enter a reason for rejection.");
      return;
    }
    declineMutation.mutate(
      { assessmentId, reason: declineReason },
      {
        onSuccess: () => {
          setShowDeclineReason(false);
          setDeclineReason("");
          onClose();
        },
      }
    );
  };

  return (
    <>
      {rejectionReason && (
        <Alert className="border-red-300 bg-red-50">
          <XCircle className="h-5 text-red-600" />
          <AlertDescription className="text-red-700 font-medium">
            Assessment Declined: {rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      {isAwaitingApproval && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 items-center">
            <div className="relative group">
              <Button
                onClick={canApprove ? handleApprove : undefined}
                disabled={isActionLoading || !canApprove}
                className="bg-green-600 text-white"
              >
                Approve
              </Button>
              {!canApprove && <PermissionTooltip message="Requires Admin or SubAdmin role" />}
            </div>
            {!showDeclineReason && (
              <div className="relative group">
                <Button
                  onClick={canDecline ? handleOpenDecline : undefined}
                  disabled={isActionLoading || !canDecline}
                  variant="destructive"
                >
                  Decline
                </Button>
                {!canDecline && <PermissionTooltip message="Requires Admin or SubAdmin role" />}
              </div>
            )}
          </div>

          {showDeclineReason && (
            <div className="w-full md:w-2/3 bg-gray-50 p-4 rounded-md">
              <textarea
                rows={3}
                className="w-full p-2 rounded border border-gray-300"
                placeholder="Enter reason for rejection"
                value={declineReason}
                onChange={(e) => {
                  setDeclineReason(e.target.value);
                  setDeclineValidationError("");
                }}
                disabled={isActionLoading}
              />
              {declineValidationError && (
                <div className="text-sm text-red-600 mt-2">{declineValidationError}</div>
              )}
              <div className="flex gap-2 mt-3">
                <Button onClick={handleCancelDecline} variant="outline" disabled={isActionLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDecline}
                  variant="destructive"
                  disabled={isActionLoading}
                  className="text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
