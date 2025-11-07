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

import { ITask } from "@/app/(company)/assessments/tasks/page";

interface TaskTableProps {
  tasks: ITask[];
  onViewTask: (task: ITask) => void;
  onEditTask: (task: ITask) => void;
  onDeleteTask: (taskId: string) => void;
  onReassignTask: (taskId: string) => void;
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
  onSendReminder: (taskId: string) => void;
}

const columnHelper = createColumnHelper<ITask>();

const getStatusVariant = (status: ITask["status"]) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "in-progress":
      return "yellow";
    case "completed":
    case "approved":
      return "successGreen";
    case "on-hold":
      return "yellow";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

function ActionDropdown({
  task,
  onViewTask,
  onEditTask,
  onSendReminder,
  onReassignTask,
  onApproveTask,
  onRejectTask,
  onDeleteTask,
}: {
  task: ITask;
  onViewTask: (task: ITask) => void;
  onEditTask: (task: ITask) => void;
  onSendReminder: (taskId: string) => void;
  onReassignTask: (taskId: string) => void;
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
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
        <DropdownMenuItem onClick={() => onApproveTask(task.id)}>
          <CheckCircle className="mr-2 h-4 w-4 text-success" /> Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRejectTask(task.id)}>
          <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDeleteTask(task.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TaskTable({
  tasks,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onReassignTask,
  onApproveTask,
  onRejectTask,
  onSendReminder,
}: TaskTableProps) {
  const [dateRange, setDateRange] = useState<
    { startMonth: string; endMonth: string } | undefined
  >();

  const filteredTasks = useMemo(() => {
    if (!dateRange) return tasks;

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

    const startDate = new Date(Number(startYearStr), startMonthIndex, 1);
    const endDate = new Date(Number(endYearStr), endMonthIndex + 1, 0);

    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [tasks, dateRange]);

  const columns = [
    columnHelper.accessor("taskName", { header: "Task Name" }),
    columnHelper.accessor("assignedTo", { header: "Assigned To" }),
    columnHelper.accessor("dateAssigned", {
      header: "Date Assigned",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("dueDate", {
      header: "Due Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
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
      cell: (info) => (
        <Badge variant={getStatusVariant(info.getValue())} className="capitalize">
          {info.getValue().replace("-", " ")}
        </Badge>
      ),
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
          onRejectTask={onRejectTask}
          onDeleteTask={onDeleteTask}
        />
      ),
    }),
  ];

  const filterOptions: FilterOption[] = [
    {
      label: "Status",
      columnId: "status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "On Hold", value: "on-hold" },
      ],
    },
  ];

  return (
    <section className="shadow-md">
      <DataTable
        data={filteredTasks}
        columns={columns}
        filterOptions={filterOptions}
        customFilters={
          <DateRangePicker value={dateRange} onChange={setDateRange} className="w-[250px]" />
        }
      />
    </section>
  );
}
