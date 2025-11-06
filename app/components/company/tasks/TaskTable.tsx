"use client";

import { useState, useMemo } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "../../ui/reusables/DataTable";
import { ITask } from "@/app/(company)/assessments/tasks/page";
import { DateRangePicker } from "../../ui/reusables/DateRangePicker";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

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

type SortOption = "due-oldest" | "due-newest" | "progress-highest" | "progress-lowest";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Due Date (Oldest/Newest)", value: "due-oldest" },
  { label: "Due Date (Newest/Oldest)", value: "due-newest" },
  { label: "Progress (Highest/Lowest)", value: "progress-highest" },
  { label: "Progress (Lowest/Highest)", value: "progress-lowest" },
];

const columnHelper = createColumnHelper<ITask>();

const getStatusBadge = (status: ITask["status"]) => {
  const variants: Record<
    ITask["status"],
    { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
  > = {
    pending: { variant: "secondary", className: "bg-muted text-muted-foreground" },
    "in-progress": { variant: "default", className: "bg-info text-white" },
    completed: { variant: "default", className: "bg-success text-white" },
    "on-hold": { variant: "outline", className: "bg-warning-100 text-warning-600 border-warning" },
    approved: { variant: "default", className: "bg-success text-white" },
    rejected: { variant: "destructive", className: "bg-danger text-white" },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {status.replace("-", " ")}
    </Badge>
  );
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
          className="w-[110px] justify-between rounded-sm border-primary"
        >
          Action
          {isOpen ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 border-primary shadow-md">
        <DropdownMenuItem onClick={() => onViewTask(task)} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditTask(task)} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSendReminder(task.id)} className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" /> Send Reminder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onReassignTask(task.id)} className="cursor-pointer">
          <UserPlus className="mr-2 h-4 w-4" /> Reassign
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onApproveTask(task.id)} className="cursor-pointer">
          <CheckCircle className="mr-2 h-4 w-4 text-success" /> Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRejectTask(task.id)} className="cursor-pointer">
          <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDeleteTask(task.id)}
          className="cursor-pointer text-destructive focus:text-destructive"
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
  const [sortOption, setSortOption] = useState<SortOption>("due-oldest");
  const [dateRange, setDateRange] = useState<{ startMonth: string; endMonth: string } | undefined>(
    undefined
  );

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
      cell: (info) => `${info.row.original.progress}%`,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => getStatusBadge(info.getValue()),
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

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (dateRange) {
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
      const startYear = Number(startYearStr);

      const endMonthIndex = MONTHS.indexOf(endMonthName);
      const endYear = Number(endYearStr);

      const startDate = new Date(startYear, startMonthIndex, 1);
      const endDate = new Date(endYear, endMonthIndex + 1, 0);

      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= startDate && taskDate <= endDate;
      });
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case "due-oldest":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "due-newest":
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case "progress-highest":
          return (b.progress || 0) - (a.progress || 0);
        case "progress-lowest":
          return (a.progress || 0) - (b.progress || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, sortOption, dateRange]);

  const filterOptions = [
    {
      label: "Sort",
      columnId: "sort",
      options: SORT_OPTIONS.map((opt) => opt.label),
    },
  ];

  return (
    <DataTable
      data={filteredTasks}
      columns={columns}
      filterOptions={filterOptions}
      customFilters={
        <DateRangePicker value={dateRange} onChange={setDateRange} className="w-[250px]" />
      }
    />
  );
}
