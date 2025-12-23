"use client";

import { useState } from "react";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FrontendTask } from "@/services/assignTask.service";

interface NotificationDropdownProps {
  tasks: FrontendTask[];
}

const TASKS_PER_PAGE = 5;

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "approved":
      return "bg-teal-100 text-teal-800";
    case "declined":
      return "bg-red-100 text-red-800";
    case "on_hold":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function NotificationDropdown({ tasks }: NotificationDropdownProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const router = useRouter();

  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  const startIndex = currentPage * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const currentTasks = tasks.slice(startIndex, endIndex);

  const handleTaskClick = () => {
    setOpen(false);
    router.push("/assessments/new-assessment");
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setHasOpened(true);
    }
  };

  const taskCount = tasks.length;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative cursor-pointer focus:outline-none">
          <Bell className="text-gray-600 hover:text-black transition-colors" size={20} />
          {taskCount > 0 && !hasOpened && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {taskCount > 99 ? "99+" : taskCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Task Notifications</h3>
            <p className="text-sm text-gray-500 mt-1">
              You have {taskCount} task{taskCount !== 1 ? "s" : ""} assigned
            </p>
          </div>

          {/* Task List */}
          <div className="max-h-96 overflow-y-auto">
            {currentTasks.length > 0 ? (
              currentTasks.map((task) => {
                // Get topic count from the raw task data
                const topicCount = task.topics?.length || 0;

                return (
                  <div
                    key={task.id}
                    onClick={handleTaskClick}
                    className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {task.taskName}
                        </p>
                        <div className="flex flex-col gap-1 mt-1.5">
                          <p className="text-xs text-gray-600">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Created by: {task.assignedTo}</p>
                          {topicCount > 0 && (
                            <p className="text-xs text-gray-500">
                              {topicCount} topic{topicCount !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No tasks assigned</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
