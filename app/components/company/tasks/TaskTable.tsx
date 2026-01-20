"use client";

import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { DataTable, FilterOption } from "../../ui/reusables/DataTable";
import { DateRangePicker } from "../../ui/reusables/DateRangePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Eye,
  Edit,
  Bell,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FrontendTask, TaskStatus } from "@/services/assignTask.service";
import CustomDialog from "../../ui/reusables/CustomDialog";

interface TaskTableProps {
  tasks: FrontendTask[];
  isLoading?: boolean;
  onViewTask: (task: FrontendTask) => void;
  onEditTask: (task: FrontendTask) => void;
  onDeleteTask: (taskId: number) => void;
  onReassignTask: (taskId: number) => void;
  onApproveTask: (taskId: number) => void;
  onDeclineTask: (taskId: number) => void;
  onSendReminder: (taskId: number) => void;
}

const getStatusLabel = (status: TaskStatus | string) =>
  status ? status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Unknown";

const getStatusVariant = (status: TaskStatus) => {
  switch (status) {
    case "pending":
      return "grey";
    case "in_progress":
      return "yellow";
    case "completed":
    case "approved":
      return "successGreen";
    case "on_hold":
      return "yellow";
    case "declined":
      return "destructive";
    default:
      return "outline";
  }
};

const columnHelper = createColumnHelper<FrontendTask>();

function ActionDropdown({
  task,
  onViewTask,
  onEditTask,
  onSendReminder,
  onReassignTask,
  onApproveTask,
  onDeclineTask,
  onDeleteTask,
}: {
  task: FrontendTask;
  onViewTask: (task: FrontendTask) => void;
  onEditTask: (task: FrontendTask) => void;
  onSendReminder: (taskId: number) => void;
  onReassignTask: (taskId: number) => void;
  onApproveTask: (taskId: number) => void;
  onDeclineTask: (taskId: number, comment?: string) => void;
  onDeleteTask: (taskId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [declineComment, setDeclineComment] = useState("");

  return (
    <section>
      <DropdownMenu onOpenChange={setIsOpen}>
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
          <DropdownMenuItem onClick={() => onViewTask(task)}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEditTask(task)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSendReminder(task.id)}>
            <Bell className="mr-2 h-4 w-4" /> Send Reminder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReassignTask(task.id)}>
            <UserPlus className="mr-2 h-4 w-4" /> Reassign
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setApproveOpen(true)}>
            <CheckCircle className="mr-2 h-4 w-4 text-success" /> Approve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeclineOpen(true)}>
            <XCircle className="mr-2 h-4 w-4 text-destructive" /> Decline
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Confirm Approval"
        className="bg-white"
      >
        <p className="mt-4">Are you sure you want to approve this task?</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setApproveOpen(false)}
            className="border border-teal-600"
          >
            Cancel
          </Button>
          <Button
            className="bg-teal-600 text-white"
            onClick={() => {
              onApproveTask(task.id);
              setApproveOpen(false);
            }}
          >
            Approve
          </Button>
        </div>
      </CustomDialog>

      <CustomDialog
        open={declineOpen}
        onOpenChange={setDeclineOpen}
        title="Decline Task"
        className="bg-white"
      >
        <p className="mt-4">Please provide a comment before declining:</p>
        <textarea
          placeholder="Enter comment..."
          className="mt-2 w-full border border-red-500 rounded-md p-2 text-sm bg-white text-black"
          value={declineComment}
          onChange={(e) => setDeclineComment(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setDeclineOpen(false)}
            className="border border-red-500"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDeclineTask(task.id, declineComment);
              setDeclineComment("");
              setDeclineOpen(false);
            }}
          >
            Decline
          </Button>
        </div>
      </CustomDialog>

      <CustomDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Confirm Delete"
        className="bg-white"
      >
        <p className="mt-4">Are you sure you want to delete this task?</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(false)}
            className="border border-red-500"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDeleteTask(task.id);
              setDeleteOpen(false);
            }}
          >
            Delete
          </Button>
        </div>
      </CustomDialog>
    </section>
  );
}

export function TaskTable({
  tasks,
  isLoading,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onReassignTask,
  onApproveTask,
  onDeclineTask,
  onSendReminder,
}: TaskTableProps) {
  const [dateRange, setDateRange] = useState<
    { startMonth: string; endMonth: string } | undefined
  >();

  const filteredTasks = useMemo(() => {
    if (!dateRange?.startMonth || !dateRange?.endMonth) return tasks;

    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const [startMonthName, startYearStr] = dateRange.startMonth.split(", ");
    const [endMonthName, endYearStr] = dateRange.endMonth.split(", ");

    const startMonthIndex = MONTHS.indexOf(startMonthName);
    const endMonthIndex = MONTHS.indexOf(endMonthName);

    if (startMonthIndex === -1 || endMonthIndex === -1) return tasks;

    const startDate = new Date(Number(startYearStr), startMonthIndex, 1);
    const endDate = new Date(Number(endYearStr), endMonthIndex + 1, 0);

    return tasks.filter((task) => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && taskDate >= startDate && taskDate <= endDate;
    });
  }, [tasks, dateRange]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("taskName", { header: "Task Name" }),
      columnHelper.display({
        id: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => {
          const name = row.original.assignedTo;
          const email = row.original.assignedToEmail;

          if (!name || name === "—") {
            return <span className="text-muted-foreground">—</span>;
          }

          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm">{name}</span>
              {email && <span className="text-xs text-muted-foreground">{email}</span>}
            </div>
          );
        },
      }),
      columnHelper.accessor("dateAssigned", {
        header: "Date Assigned",
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return value ? new Date(value).toLocaleDateString() : "—";
        },
      }),
      columnHelper.accessor("dueDate", {
        header: "Due Date",
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return value ? new Date(value).toLocaleDateString() : "—";
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as TaskStatus;
          return (
            <Badge variant={getStatusVariant(status)} className="capitalize whitespace-nowrap">
              {getStatusLabel(status)}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionDropdown
            task={row.original}
            onViewTask={onViewTask}
            onEditTask={onEditTask}
            onSendReminder={onSendReminder}
            onReassignTask={onReassignTask}
            onApproveTask={onApproveTask}
            onDeclineTask={onDeclineTask}
            onDeleteTask={onDeleteTask}
          />
        ),
      }),
    ],
    [
      onViewTask,
      onEditTask,
      onSendReminder,
      onReassignTask,
      onApproveTask,
      onDeclineTask,
      onDeleteTask,
    ]
  );

  const filterOptions: FilterOption[] = [
    {
      label: "Status",
      columnId: "status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Approved", value: "approved" },
        { label: "Declined", value: "declined" },
        { label: "On Hold", value: "on_hold" },
      ],
    },
  ];

  return (
    <section className="shadow-md">
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">Loading tasks...</div>
      ) : (
        <DataTable
          data={filteredTasks}
          columns={columns}
          filterOptions={filterOptions}
          customFilters={
            <DateRangePicker value={dateRange} onChange={setDateRange} className="w-[250px]" />
          }
        />
      )}
    </section>
  );
}
