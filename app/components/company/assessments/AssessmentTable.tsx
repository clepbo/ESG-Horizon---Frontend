"use client";

import { JSX, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Trash2 } from "lucide-react";
import { DataTable, FilterOption } from "@/app/components/ui/reusables/DataTable";
import ConfirmModal from "../../ui/modals/ConfirmModal";
import { useRouter } from "next/navigation";
import { useDeleteAssessment } from "@/services/hooks/assessment.hooks";
import AssessmentDetailsModal from "./AssessmentDetailsModal";
export type AssessmentStatus = 
  | "in_progress" 
  | "awaiting_review" 
  | "submitted_approved" 
  | "approved" 
  | "unapproved_rejected";

export interface Assessment {
  id: number;
  startPeriod: string;
  endPeriod: string;
  subsidiary: string;
  status: AssessmentStatus;
  rejection_reason?: string;
}

interface AssessmentTableProps {
  data: Assessment[];
}

const columnHelper = createColumnHelper<Assessment>();

export function AssessmentTable({ data }: AssessmentTableProps) {
  const router = useRouter();
  const [modalData, setModalData] = useState({
    open: false,
    assessmentId: null as number | null,
  });

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const deleteMutation = useDeleteAssessment();

  const validData = data.filter((a) => a.startPeriod && a.endPeriod && a.subsidiary);

  const handleOpenModal = (assessmentId: number) => {
    setModalData({
      open: true,
      assessmentId: assessmentId,
    });
  };

  const handleOpenDetails = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setDetailsOpen(true);
  };

  const handleDeleteConfirm = () => {
    const idToDelete = modalData.assessmentId;
    if (!idToDelete) return;

    deleteMutation.mutate(idToDelete, {
      onSuccess: () => {
        setModalData({
          open: false,
          assessmentId: null,
        });
      },
      onError: (error: Error) => {
        console.error("Deletion failed:", error);
        setModalData({
          open: false,
          assessmentId: null,
        });
      },
    });
  };
  const columns = [
    columnHelper.accessor("startPeriod", {
      header: "Starting Period",
    }),
    columnHelper.accessor("endPeriod", {
      header: "Ending Period",
    }),
    columnHelper.accessor("subsidiary", {
      header: "Subsidiaries",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const getStatusDisplay = (status: AssessmentStatus) => {
          switch (status) {
            case "in_progress":
              return { label: "In Progress", variant: "yellow" as const };
            case "awaiting_review":
              return { label: "Awaiting Review", variant: "primaryBlue" as const };
            case "submitted_approved":
              return { label: "Submitted-Approved", variant: "successGreen" as const };
            case "approved":
              return { label: "Approved", variant: "successGreen" as const };
            case "unapproved_rejected":
              return { label: "Unapproved/Rejected", variant: "destructive" as const };
            default:
              return { label: status, variant: "outline" as const };
          }
        };
        const { label, variant } = getStatusDisplay(status);
        return (
          <Badge variant={variant} className="capitalize">
            {label}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Quick Actions",
      cell: (info) => {
        const status = info.row.original.status;
        const assessment = info.row.original;

        let actionButton;
        let trashButton: JSX.Element | null;
        trashButton = (
          <Button
            key="trash"
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive rounded-sm"
            onClick={() => handleOpenModal(assessment.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
        
        if (status === "in_progress") {
          actionButton = (
            <Button
              key="continue"
              size="sm"
              className="bg-[var(--color-primary)] hover:bg-teal-600 text-white rounded-sm"
              onClick={() => router.push(`/assessments/${assessment.id}`)}
            >
              Continue
            </Button>
          );
        } else if (status === "awaiting_review") {
          actionButton = (
            <Button
              key="review"
              size="sm"
              className="bg-[var(--color-primary)] hover:bg-teal-600 text-white rounded-sm"
              onClick={() => handleOpenDetails(assessment)}
            >
              Review
            </Button>
          );
          trashButton = null;
        } else if (status === "unapproved_rejected") {
          actionButton = (
            <Button
              key="update"
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm"
              onClick={() => router.push(`/assessments/${assessment.id}`)}
            >
              Update
            </Button>
          );
        } else if (status === "submitted_approved" || status === "approved") {
          actionButton = (
            <Button
              key="view"
              size="sm"
              variant="outline"
              className="rounded-sm"
              onClick={() => handleOpenDetails(assessment)}
            >
              View
            </Button>
          );
          trashButton = null;
        } else {
          actionButton = (
            <Button
              key="view"
              size="sm"
              variant="outline"
              className="rounded-sm"
              onClick={() => handleOpenDetails(assessment)}
            >
              View
            </Button>
          );
        }

        return (
          <div className="flex gap-2 items-center">
            {actionButton}
            {trashButton}
          </div>
        );
      },
    }),
  ];

  const filterOptions: FilterOption[] = [
    {
      label: "Status",
      columnId: "status",
      options: ["in_progress", "awaiting_review", "submitted_approved", "approved", "unapproved_rejected"],
    },
    { label: "Date", columnId: "startPeriod", options: ["2025", "2024"] },
  ];

  return (
    <section className="shadow-md">
      <DataTable data={validData} columns={columns} filterOptions={filterOptions} />
      <ConfirmModal
        open={modalData.open}
        title="Confirm Deletion"
        message="Are you sure you want to delete this assessment? This action cannot be undone."
        onCancel={() =>
          setModalData({
            open: false,
            assessmentId: null,
          })
        }
        onConfirm={handleDeleteConfirm}
      />
      <AssessmentDetailsModal
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
      />
    </section>
  );
}
