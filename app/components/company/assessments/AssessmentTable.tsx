// "use client";

// import { JSX, useState } from "react";
// import { createColumnHelper } from "@tanstack/react-table";
// import { Badge } from "@/app/components/ui/badge";
// import { Button } from "@/app/components/ui/button";
// import { Trash2 } from "lucide-react";
// import { DataTable, FilterOption } from "@/app/components/ui/reusables/DataTable";
// import ConfirmModal from "../../ui/modals/ConfirmModal";
// import { useRouter } from "next/navigation";
// import { useDeleteAssessment } from "@/services/hooks/assessment.hooks";
// import AssessmentDetailsModal from "./AssessmentDetailsModal";
// import { DateRangePicker } from "@/app/components/ui/reusables/DateRangePicker";

// export type AssessmentStatus =
//   | "in_progress"
//   | "awaiting_review"
//   | "submitted_approved"
//   | "approved"
//   | "unapproved_rejected";

// export interface Assessment {
//   id: number;
//   startPeriod: string;
//   endPeriod: string;
//   subsidiary: string;
//   status: AssessmentStatus;
//   rejection_reason?: string;
//   progress?: number;
// }

// interface AssessmentTableProps {
//   data: Assessment[];
// }

// const columnHelper = createColumnHelper<Assessment>();

// export function AssessmentTable({ data }: AssessmentTableProps) {
//   const router = useRouter();
//   const [modalData, setModalData] = useState({
//     open: false,
//     assessmentId: null as number | null,
//   });

//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

//   const deleteMutation = useDeleteAssessment();

//   const [dateRange, setDateRange] = useState<{ startMonth: string; endMonth: string } | undefined>(
//     undefined
//   );

//   const filteredData = dateRange
//     ? data.filter((a) => {
//         const startDate = new Date(a.startPeriod);
//         const endDate = new Date(a.endPeriod);
//         const rangeStart = new Date(dateRange.startMonth);
//         const rangeEnd = new Date(dateRange.endMonth);
//         return startDate >= rangeStart && endDate <= rangeEnd;
//       })
//     : data;

//   const validData = filteredData.filter((a) => a.startPeriod && a.endPeriod && a.subsidiary);

//   const handleOpenModal = (assessmentId: number) => {
//     setModalData({
//       open: true,
//       assessmentId: assessmentId,
//     });
//   };

//   const handleOpenDetails = (assessment: Assessment) => {
//     setSelectedAssessment(assessment);
//     setDetailsOpen(true);
//   };

//   const handleDeleteConfirm = () => {
//     const idToDelete = modalData.assessmentId;
//     if (!idToDelete) return;

//     deleteMutation.mutate(idToDelete, {
//       onSuccess: () => {
//         setModalData({
//           open: false,
//           assessmentId: null,
//         });
//       },
//       onError: (error: Error) => {
//         console.error("Deletion failed:", error);
//         setModalData({
//           open: false,
//           assessmentId: null,
//         });
//       },
//     });
//   };

//   const columns = [
//     columnHelper.accessor("startPeriod", {
//       header: "Starting Period",
//     }),
//     columnHelper.accessor("endPeriod", {
//       header: "Ending Period",
//     }),
//     columnHelper.accessor("subsidiary", {
//       header: "Subsidiaries",
//     }),
//     columnHelper.display({
//       id: "progress",
//       header: "Progress",
//       cell: (info) => {
//         const percentage = info.row.original.progress ?? 0;
//         const radius = 16;
//         const circumference = 2 * Math.PI * radius;
//         const offset = circumference - (percentage / 100) * circumference;
//         const index = info.row.index;

//         return (
//           <div className="relative flex items-center justify-center w-10 h-10">
//             <svg
//               width="40"
//               height="40"
//               className="rotate-[-90deg]"
//               style={{ position: "absolute", top: 0, left: 0 }}
//             >
//               <circle
//                 cx="20"
//                 cy="20"
//                 r={radius}
//                 stroke="#e5e7eb"
//                 strokeWidth="4"
//                 fill="transparent"
//               />
//               <defs>
//                 <linearGradient id={`grad-${index}`} x1="0%" y1="100%" x2="100%" y2="0%">
//                   <stop offset="0%" stopColor="#ef4444" />
//                   <stop offset="30%" stopColor="#f97316" />
//                   <stop offset="65%" stopColor="#eab308" />
//                   <stop offset="100%" stopColor="#22c55e" />
//                 </linearGradient>
//               </defs>
//               <circle
//                 cx="20"
//                 cy="20"
//                 r={radius}
//                 stroke={`url(#grad-${index})`}
//                 strokeWidth="4"
//                 fill="transparent"
//                 strokeDasharray={circumference}
//                 strokeDashoffset={offset}
//                 strokeLinecap="round"
//                 className="transition-all duration-700 ease-in-out"
//               />
//             </svg>
//             <span className="absolute text-xs font-semibold text-gray-800">
//               {percentage > 0 ? `${percentage}%` : "N/A"}
//             </span>
//           </div>
//         );
//       },
//     }),

//     columnHelper.accessor("status", {
//       header: "Status",
//       cell: (info) => {
//         const status = info.getValue();
//         const getStatusDisplay = (status: AssessmentStatus) => {
//           switch (status) {
//             case "in_progress":
//               return { label: "In Progress", variant: "yellow" as const };
//             case "awaiting_review":
//               return { label: "Awaiting Review", variant: "primaryBlue" as const };
//             case "submitted_approved":
//               return { label: "Submitted-Approved", variant: "successGreen" as const };
//             case "approved":
//               return { label: "Approved", variant: "successGreen" as const };
//             case "unapproved_rejected":
//               return { label: "Unapproved/Rejected", variant: "destructive" as const };
//             default:
//               return { label: status, variant: "outline" as const };
//           }
//         };
//         const { label, variant } = getStatusDisplay(status);
//         return (
//           <Badge variant={variant} className="capitalize">
//             {label}
//           </Badge>
//         );
//       },
//     }),

//     columnHelper.display({
//       id: "actions",
//       header: "Quick Actions",
//       cell: (info) => {
//         const status = info.row.original.status;
//         const assessment = info.row.original;

//         let actionButton;
//         let trashButton: JSX.Element | null;
//         trashButton = (
//           <Button
//             key="trash"
//             size="sm"
//             variant="outline"
//             className="text-destructive hover:text-destructive rounded-sm"
//             onClick={() => handleOpenModal(assessment.id)}
//             disabled={deleteMutation.isPending}
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         );

//         if (status === "in_progress") {
//           actionButton = (
//             <Button
//               key="continue"
//               size="sm"
//               className="bg-[var(--color-primary)] hover:bg-teal-600 text-white rounded-sm"
//               onClick={() => router.push(`/assessments/${assessment.id}`)}
//             >
//               Continue
//             </Button>
//           );
//         } else if (status === "awaiting_review") {
//           actionButton = (
//             <Button
//               key="review"
//               size="sm"
//               className="bg-[var(--color-primary)] hover:bg-teal-600 text-white rounded-sm"
//               onClick={() => handleOpenDetails(assessment)}
//             >
//               Review
//             </Button>
//           );
//           trashButton = null;
//         } else if (status === "unapproved_rejected") {
//           actionButton = (
//             <Button
//               key="update"
//               size="sm"
//               className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm"
//               onClick={() => router.push(`/assessments/${assessment.id}`)}
//             >
//               Update
//             </Button>
//           );
//         } else if (status === "submitted_approved" || status === "approved") {
//           actionButton = (
//             <Button
//               key="view"
//               size="sm"
//               variant="outline"
//               className="rounded-sm"
//               onClick={() => handleOpenDetails(assessment)}
//             >
//               View
//             </Button>
//           );
//           trashButton = null;
//         } else {
//           actionButton = (
//             <Button
//               key="view"
//               size="sm"
//               variant="outline"
//               className="rounded-sm"
//               onClick={() => handleOpenDetails(assessment)}
//             >
//               View
//             </Button>
//           );
//         }

//         return (
//           <div className="flex gap-2 items-center">
//             {actionButton}
//             {trashButton}
//           </div>
//         );
//       },
//     }),
//   ];

//   const filterOptions: FilterOption[] = [
//     {
//       label: "Status",
//       columnId: "status",
//       options: [
//         "in_progress",
//         "awaiting_review",
//         "submitted_approved",
//         "approved",
//         "unapproved_rejected",
//       ],
//     },
//   ];

//   return (
//     <section className="shadow-md">
//       <DataTable
//         data={validData}
//         columns={columns}
//         filterOptions={filterOptions}
//         customFilters={
//           <DateRangePicker value={dateRange} onChange={setDateRange} className="w-[300px]" />
//         }
//       />
//       <ConfirmModal
//         open={modalData.open}
//         title="Confirm Deletion"
//         message="Are you sure you want to delete this assessment? This action cannot be undone."
//         onCancel={() => setModalData({ open: false, assessmentId: null })}
//         onConfirm={handleDeleteConfirm}
//       />
//       <AssessmentDetailsModal
//         open={detailsOpen}
//         onClose={() => {
//           setDetailsOpen(false);
//           setSelectedAssessment(null);
//         }}
//         assessment={selectedAssessment}
//       />
//     </section>
//   );
// }
"use client";

import { JSX, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { DataTable, FilterOption } from "@/app/components/ui/reusables/DataTable";
import ConfirmModal from "../../ui/modals/ConfirmModal";
import { useRouter } from "next/navigation";
import { useDeleteAssessment } from "@/services/hooks/assessment.hooks";
import AssessmentDetailsModal from "./AssessmentDetailsModal";
import { DateRangePicker } from "@/app/components/ui/reusables/DateRangePicker";

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
  progress?: number;
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

  const [dateRange, setDateRange] = useState<{ startMonth: string; endMonth: string } | undefined>(
    undefined
  );

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
    columnHelper.display({
      id: "progress",
      header: "Progress",
      cell: (info) => {
        const percentage = info.row.original.progress ?? 0;
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const index = info.row.index;

        return (
          <div className="relative flex items-center justify-center w-10 h-10">
            <svg
              width="40"
              height="40"
              className="rotate-[-90deg]"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle
                cx="20"
                cy="20"
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
                cx="20"
                cy="20"
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
            <span className="absolute text-xs font-semibold text-gray-800">
              {percentage > 0 ? `${percentage}%` : "N/A"}
            </span>
          </div>
        );
      },
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

    // ✅ Refactored Quick Actions column to dropdown
    columnHelper.display({
      id: "actions",
      header: "Quick Actions",
      cell: ({ row }) => {
        const assessment = row.original;
        const status = assessment.status;

        const handleActionClick = () => {
          if (status === "in_progress" || status === "unapproved_rejected") {
            router.push(`/assessments/${assessment.id}`);
          } else {
            handleOpenDetails(assessment);
          }
        };

        const getActionLabel = () => {
          switch (status) {
            case "in_progress":
              return "Continue";
            case "awaiting_review":
              return "Review";
            case "unapproved_rejected":
              return "Update";
            case "submitted_approved":
            case "approved":
              return "View";
            default:
              return "View";
          }
        };

        const actionLabel = getActionLabel();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-[110px] justify-between rounded-sm">
                Action
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleActionClick}>{actionLabel}</DropdownMenuItem>

              {status !== "awaiting_review" &&
                status !== "submitted_approved" &&
                status !== "approved" && (
                  <DropdownMenuItem
                    onClick={() => handleOpenModal(assessment.id)}
                    className="text-red-600 focus:text-red-600"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
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
      ],
    },
  ];

  return (
    <section className="shadow-md">
      <DataTable
        data={validData}
        columns={columns}
        filterOptions={filterOptions}
        customFilters={
          <DateRangePicker value={dateRange} onChange={setDateRange} className="w-[300px]" />
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
