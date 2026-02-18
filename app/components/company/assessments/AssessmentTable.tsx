/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Eye,
  BadgeAlert,
  SquarePen,
  SquareArrowOutUpRight,
  Trash2,
  CircleHelp,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DataTable, FilterOption } from "@/app/components/ui/reusables/DataTable";
import ConfirmModal from "../../ui/modals/ConfirmModal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { AssessmentDetailsModal } from "./AssessmentDetailsModal";
import { DateRangePicker } from "@/app/components/ui/reusables/DateRangePicker";
import { SuccessScreen } from "@/app/components/company/assessments/SuccessScreen";
import { formatStatus } from "@/lib/utils";
import { useDeleteAssessment, useGenerateReport } from "@/services/hooks/assessment.hooks";

export type AssessmentStatus =
  | "in_progress"
  | "awaiting_review"
  | "submitted_approved"
  | "approved"
  | "unapproved_rejected"
  | "declined";

export interface Assessment {
  id: number;
  startPeriod: string;
  endPeriod: string;
  subsidiary: string;
  status: AssessmentStatus;
  rejection_reason?: string;
  progress?: number;
  lastUpdated?: string | Date;
}

interface AssessmentTableProps {
  data: Assessment[];
}

const columnHelper = createColumnHelper<Assessment>();

function DeclineReasonModal({
  open,
  onClose,
  reason,
}: {
  open: boolean;
  onClose: () => void;
  reason: string | undefined;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Reason for Decline</h2>
        <p className="text-gray-600">{reason || "No reason provided."}</p>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ActionDropdownProps {
  status: AssessmentStatus;
  getActionIcon: (label: string) => ReactNode;
  onView: () => void;
  onContinue: () => void;
  onReview?: () => void;
  onGenerateReport?: () => void;
  onDelete?: () => void;
  deletePending?: boolean;
}

function ActionDropdown({
  status,
  getActionIcon,
  onView,
  onContinue,
  onReview,
  onGenerateReport,
  onDelete,
  deletePending,
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[110px] justify-between rounded-sm border-teal-600"
        >
          Action
          {isOpen ? (
            <ChevronUp className="ml-1 h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 border-teal-600 shadow-md">
        {/* Show View unless it's awaiting_review — Review doubles as the view in that case */}
        {status !== "awaiting_review" && (
          <DropdownMenuItem onClick={onView}>
            {getActionIcon("View")}
            View
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onContinue}
          disabled={status === "approved" || status === "submitted_approved"}
        >
          {getActionIcon("Continue")}
          Continue
        </DropdownMenuItem>

        {/* Show Review when awaiting_review */}
        {status === "awaiting_review" && (
          <DropdownMenuItem onClick={onReview}>
            {getActionIcon("Review")}
            Review
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onGenerateReport}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </DropdownMenuItem>

        {status !== "awaiting_review" &&
          status !== "submitted_approved" &&
          status !== "approved" && (
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
              disabled={deletePending}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AssessmentTable({ data }: AssessmentTableProps) {
  const router = useRouter();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [modalData, setModalData] = useState({
    open: false,
    assessmentId: null as number | null,
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | undefined>(undefined);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [dateRange, setDateRange] = useState<
    { startMonth: string; endMonth: string } | undefined
  >();

  const deleteMutation = useDeleteAssessment();
  const generateReportMutation = useGenerateReport();

  const filteredData = dateRange
    ? data.filter((a) => {
        const startDate = new Date(a.startPeriod);
        const endDate = new Date(a.endPeriod);
        const rangeStart = new Date(dateRange.startMonth);
        const rangeEnd = new Date(dateRange.endMonth);
        return startDate >= rangeStart && endDate <= rangeEnd;
      })
    : data;

  const validData = filteredData.filter((a) => a.startPeriod && a.endPeriod && a.subsidiary);

  const handleOpenModal = (assessmentId: number) => setModalData({ open: true, assessmentId });

  const handleOpenDetails = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setDetailsOpen(true);
  };

  const handleOpenReason = (reason: string | undefined) => {
    setSelectedReason(reason);
    setReasonOpen(true);
  };

  const handleDeleteConfirm = () => {
    const idToDelete = modalData.assessmentId;
    if (!idToDelete) return;

    deleteMutation.mutate(idToDelete, {
      onSuccess: () => setModalData({ open: false, assessmentId: null }),
      onError: (error: Error) => {
        console.error("Deletion failed:", error);
        setModalData({ open: false, assessmentId: null });
      },
    });
  };

  const getActionIcon = (label: string) => {
    switch (label) {
      case "View":
        return <Eye className="mr-2 h-4 w-4 " />;
      case "Review":
        return <BadgeAlert className="mr-2 h-4 w-4" />;
      case "Update":
        return <SquarePen className="mr-2 h-4 w-4 " />;
      case "Continue":
        return <SquareArrowOutUpRight className="mr-2 h-4 w-4 " />;
      default:
        return null;
    }
  };

  const handleGenerateReport = (id: number) => {
    generateReportMutation.mutate(id, {
      onSuccess: () => {
        const assessment = data.find((a) => a.id === id);
        if (assessment) {
          setSelectedAssessment(assessment);
        }
        setTimeout(() => {
          setShowReportSuccess(true);
        }, 500);
      },
    });
  };

  const handleContinue = (assessment: Assessment) => {
    if (!assessment?.id) return;

    if (assessment.status === "in_progress") {
      router.push(`/assessments/${assessment.id}`);
      return;
    }

    router.push(`/assessments/${assessment.id}?forceDisclosure=1`);
  };

  const handleView = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
  };

  const columns = [
    columnHelper.accessor("startPeriod", { header: "Starting Period" }),
    columnHelper.accessor("endPeriod", { header: "Ending Period" }),
    columnHelper.accessor("subsidiary", { header: "Subsidiaries" }),
    columnHelper.accessor("lastUpdated", {
      header: "Last Updated",
      cell: (info) => {
        const dateValue = info.getValue();
        if (!dateValue) return "—";
        try {
          const date = new Date(dateValue);
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const timeStr = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-800">{dateStr}</span>
              <span className="text-[10px] text-gray-500 leading-tight">{timeStr}</span>
            </div>
          );
        } catch (e) {
          return "—";
        }
      },
    }),

    columnHelper.display({
      id: "progress",
      header: "Progress",
      cell: (info) => {
        const percentage = info.row.original.progress ?? 0;
        const radius = 22;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const index = info.row.index;

        return (
          <div className="relative flex items-center justify-center w-14 h-14">
            <svg
              width="56"
              height="56"
              className="-rotate-90deg"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="4"
                fill="transparent"
              />
              <defs>
                <linearGradient id={`grad-${index}`} x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="30%" stopColor="#f97316" />
                  <stop offset="65%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke={`url(#grad-${index})`}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-in-out"
              />
            </svg>
            <span className="absolute text-[11px] font-semibold text-gray-800">
              {percentage > 0 ? `${percentage}%` : "N/A"}
            </span>
          </div>
        );
      },
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const assessment = info.row.original;
        const status = info.getValue();

        const variantMap: Record<AssessmentStatus, string> = {
          in_progress: "yellow",
          awaiting_review: "primaryBlue",
          submitted_approved: "successGreen",
          approved: "successGreen",
          unapproved_rejected: "destructive",
          declined: "destructive",
        };

        const label = formatStatus(status);
        const variant = variantMap[status] || "outline";

        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant as any} className="capitalize">
              {label}
            </Badge>

            {status === "unapproved_rejected" && assessment.rejection_reason && (
              <button
                onClick={() => handleOpenReason(assessment.rejection_reason)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <CircleHelp className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Quick Actions",
      cell: ({ row }) => {
        const assessment = row.original;
        return (
          <div className="flex items-center gap-2">
            {/* Put actions back into the dropdown (always show View & Continue) */}
            <ActionDropdown
              status={assessment.status}
              getActionIcon={getActionIcon}
              onView={() => handleOpenDetails(assessment)}
              onContinue={() => handleContinue(assessment)}
              onReview={() => handleOpenDetails(assessment)}
              onGenerateReport={() => handleGenerateReport(assessment.id)}
              onDelete={() => handleOpenModal(assessment.id)}
              deletePending={deleteMutation.isPending}
            />
          </div>
        );
      },
    }),
  ];

  const filterOptions: FilterOption[] = [
    {
      label: "Status",
      columnId: "status",
      options: [
        "in_progress",
        "awaiting_review",
        "submitted_approved",
        "approved",
        "unapproved_rejected",
      ].map((value) => ({
        label: formatStatus(value as AssessmentStatus),
        value,
      })),
    },
  ];

  return (
    <div>
      <DataTable
        data={validData}
        columns={columns}
        filterOptions={filterOptions}
        customFilters={
          <DateRangePicker value={dateRange} onChange={setDateRange} className="w-[250px]" />
        }
      />

      <ConfirmModal
        open={modalData.open}
        title="Confirm Deletion"
        message="Are you sure you want to delete this assessment? This action cannot be undone."
        onCancel={() => setModalData({ open: false, assessmentId: null })}
        onConfirm={handleDeleteConfirm}
      />

      <AssessmentDetailsModal
        open={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        assessment={selectedAssessment}
      />

      <DeclineReasonModal
        open={reasonOpen}
        onClose={() => setReasonOpen(false)}
        reason={selectedReason}
      />

      {showReportSuccess && selectedAssessment && (
        <SuccessScreen
          assessmentName="report"
          type="report"
          reportId={selectedAssessment.id}
          onContinue={() => {
            setShowReportSuccess(false);
            router.push(`/reports-and-analytics/${selectedAssessment.id}`);
          }}
          onBackToHub={() => {
            setShowReportSuccess(false);
            router.push("/assessments");
          }}
          totals={undefined}
          sectionKey={undefined}
          nextAssessment={null}
        />
      )}
    </div>
  );
}
