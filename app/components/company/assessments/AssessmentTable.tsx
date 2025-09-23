"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  DataTable,
  FilterOption,
} from "@/app/components/ui/reusables/DataTable";
import ConfirmModal from "../../ui/modals/ConfirmModal";

export interface Assessment {
  id: number;
  startPeriod: string;
  endPeriod: string;
  subsidiary: string;
  status: "In Progress" | "Completed" | "Draft";
}

interface AssessmentTableProps {
  data: Assessment[];
}

const columnHelper = createColumnHelper<Assessment>();

export function AssessmentTable({ data: initialData }: AssessmentTableProps) {
  const [data, setData] = useState(initialData);
  const [modalData, setModalData] = useState({
    open: false,
    assessmentId: null as number | null,
  });

  const handleOpenModal = (assessmentId: number) => {
    setModalData({
      open: true,
      assessmentId: assessmentId,
    });
  };

  const handleDeleteConfirm = () => {
    console.log(`Deleting assessment with ID: ${modalData.assessmentId}`);
    setData((prevData) =>
      prevData.filter((item) => item.id !== modalData.assessmentId)
    );

    setModalData({
      open: false,
      assessmentId: null,
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
        const getStatusBadgeVariant = (status: string) => {
          switch (status) {
            case "Completed":
              return "default";
            case "In Progress":
              return "secondary";
            case "Draft":
              return "outline";
            default:
              return "outline";
          }
        };
        return (
          <Badge
            variant={getStatusBadgeVariant(info.getValue())}
            className="capitalize"
          >
            {info.getValue()}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Quick Actions",
      cell: (info) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white rounded-sm"
          >
            {info.row.original.status === "Draft" ? "Edit" : "Continue"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive rounded-sm"
            onClick={() => handleOpenModal(info.row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const filterOptions: FilterOption[] = [
    {
      label: "Status",
      columnId: "status",
      options: ["In Progress", "Completed", "Draft"],
    },
    { label: "Date", columnId: "startPeriod", options: ["2025", "2024"] },
  ];

  return (
    <>
      <DataTable data={data} columns={columns} filterOptions={filterOptions} />
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
    </>
  );
}
