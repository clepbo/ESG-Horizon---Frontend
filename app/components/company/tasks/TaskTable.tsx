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

interface TaskTableProps {
  tasks: FrontendTask[];
  isLoading?: boolean;
  onViewTask: (task: FrontendTask) => void;
  onEditTask: (task: FrontendTask) => void;
  onDeleteTask: (taskId: number) => void;
  onReassignTask: (taskId: number) => void;
  onApproveTask: (taskId: number) => void;
  onRejectTask: (taskId: number) => void;
  onSendReminder: (taskId: number) => void;
}

const getStatusLabel = (status: TaskStatus | string) =>
  status ? status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Unknown";

const getStatusVariant = (status: TaskStatus) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "in_progress":
      return "yellow";
    case "completed":
    case "approved":
      return "successGreen";
    case "on_hold":
      return "yellow";
    case "rejected":
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
  onRejectTask,
  onDeleteTask,
}: {
  task: FrontendTask;
  onViewTask: (task: FrontendTask) => void;
  onEditTask: (task: FrontendTask) => void;
  onSendReminder: (taskId: number) => void;
  onReassignTask: (taskId: number) => void;
  onApproveTask: (taskId: number) => void;
  onRejectTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
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
  isLoading,
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
      columnHelper.accessor("assignedTo", { header: "Assigned To" }),
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
            <Badge variant={getStatusVariant(status)} className="capitalize">
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
            onRejectTask={onRejectTask}
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
      onRejectTask,
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
        { label: "Rejected", value: "rejected" },
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
