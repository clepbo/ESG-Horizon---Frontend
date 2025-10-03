"use client";

import { JSX, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Trash2 } from "lucide-react";
import {
    DataTable,
    FilterOption,
} from "@/app/components/ui/reusables/DataTable";
import ConfirmModal from "../../ui/modals/ConfirmModal";
import { useRouter } from "next/navigation";

export interface Assessment {
    id: number;
    startPeriod: string;
    endPeriod: string;
    subsidiary: string;
    status: "In Progress" | "Awaiting Review" | "Completed";
}

interface AssessmentTableProps {
    data: Assessment[];
}

const columnHelper = createColumnHelper<Assessment>();

export function AssessmentTable({ data: initialData }: AssessmentTableProps) {
    const router = useRouter();
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
                            return "successGreen";
                        case "In Progress":
                            return "yellow";
                        case "Awaiting Review":
                            return "primaryBlue";
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
            cell: (info) => {
                const status = info.row.original.status;

                let actionButton;
                let trashButton: JSX.Element | null;
                trashButton = (
                    <Button
                        key="trash"
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive rounded-sm"
                        onClick={() => handleOpenModal(info.row.original.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                );
                if (status === "In Progress") {
                  // if status is draft
                    actionButton = (
                        <Button
                            key="continue"
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white rounded-sm"
                            onClick={() => router.push(`/assessments/${info.row.original.id}`)}
                        >
                            Continue
                        </Button>
                    );
                } else if (status === "Awaiting Review") {
                    // If Submitted
                    actionButton = (
                        <Button
                            key="edit"
                            size="sm"
                            variant="secondary"
                            className="bg-green-500 hover:bg-green-600 text-white rounded-sm"
                        >
                            Edit
                        </Button>
                    );
                    trashButton = null;
                } else if (status === "Completed") {
                    // If Reviewed
                    return (
                        <span className="text-sm font-medium text-gray-500/70">
                            Done
                        </span>
                    );
                } else {
                    // Default/Fallback case
                    actionButton = (
                        <Button
                            key="view"
                            size="sm"
                            variant="outline"
                            className="rounded-sm"
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
            options: ["In Progress", "Completed", "Draft"],
        },
        { label: "Date", columnId: "startPeriod", options: ["2025", "2024"] },
    ];

    return (
        <section className="shadow-md">
            <DataTable
                data={data}
                columns={columns}
                filterOptions={filterOptions}
            />
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
        </section>
    );
}
