"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { FrontendTask } from "@/services/assignTask.service";
import { useMyTasks, useStartTask } from "@/services/hooks/assignTask.hooks";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

interface MyTasksListProps {
  onBack: () => void;
  onTaskSelect: (task: FrontendTask, topics: string[], assessmentId: number) => void;
  onNoTasks?: () => void;
}

export function MyTasksList({ onBack, onTaskSelect, onNoTasks }: MyTasksListProps) {
  const { data: tasks, isLoading, error } = useMyTasks();
  const { user } = useAuth();
  const { mutate: startTask, isPending: isStarting } = useStartTask();
  const [startingTaskId, setStartingTaskId] = useState<number | null>(null);

  const myAssignedTasks = tasks?.filter((task) => {
    // Check if the current user's ID is in the assignedUserIds array
    const isAssigned = task.assignedUserIds?.includes(user?.id ?? 0);
    console.log(`Task "${task.taskName}" (ID: ${task.id}):`, {
      assignedUserIds: task.assignedUserIds,
      currentUserId: user?.id,
      isAssigned,
    });
    return isAssigned;
  });

  useEffect(() => {
    if (!isLoading && !error && myAssignedTasks && myAssignedTasks.length === 0 && onNoTasks) {
      onNoTasks();
    }
  }, [isLoading, error, myAssignedTasks, onNoTasks]);

  const handleTaskClick = (task: FrontendTask) => {
    // Additional security check: verify user is assigned
    if (!task.assignedUserIds?.includes(user?.id ?? 0)) {
      toast.error("You are not authorized to access this task");
      return;
    }

    const topics = task.topics || [];
    setStartingTaskId(task.id);

    // If task is already in progress or completed, don't call start task API
    if (task.status === "in_progress" || task.status === "completed") {
      const assessmentId = task.assessmentId || 0;

      if (!assessmentId) {
        console.error("No assessment ID found for in-progress task:", task);
        toast.error("Assessment data not found. Please contact support.");
        setStartingTaskId(null);
        return;
      }

      onTaskSelect(task, topics, assessmentId);
      setStartingTaskId(null);
      return;
    }

    startTask(task.id, {
      onSuccess: (response) => {
        console.log("Task started successfully:", response);

        const assessmentId =
          response?.assessmentId ||
          response?.data?.assessmentId ||
          (response as any)?.assessment_id ||
          response?.taskAssignment?.assessmentId ||
          response?.assessment?.id ||
          0;

        if (!assessmentId) {
          console.error("No assessment ID in response:", response);
        }

        onTaskSelect(task, topics, assessmentId);
        setStartingTaskId(null);
      },
      onError: (error) => {
        console.error("Failed to start task:", error);
        toast.error("Failed to start task. Please try again.");
        setStartingTaskId(null);
      },
    });
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      case "on_hold":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Unknown") return "No due date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate || dueDate === "Unknown") return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-lg text-muted-foreground">Loading your assigned tasks...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <p className="font-semibold">Error loading tasks</p>
          </div>
          <p className="text-muted-foreground mb-4">
            There was a problem loading your assigned tasks. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 bg-white mb-6"
          disabled={isStarting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="bg-white p-8 rounded-xl shadow-sm">
          <CardContent className="p-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-3">My Assigned Tasks</h1>
              <p className="text-muted-foreground text-base">
                Select a task to start completing your assigned disclosure topics
              </p>
            </div>

            {!myAssignedTasks || myAssignedTasks.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground text-lg font-medium mb-2">
                  No tasks assigned yet
                </p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll see your assessment tasks here once they&apos;re assigned to you
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAssignedTasks.map((task) => {
                  const topics = task.topics || [];
                  const isCurrentlyStarting = startingTaskId === task.id;
                  const isTaskInProgress =
                    task.status === "in_progress" || task.status === "completed";

                  return (
                    <Card
                      key={task.id}
                      className={`cursor-pointer hover:shadow-xl transition-all hover:border-primary hover:-translate-y-1 border-2 ${
                        isCurrentlyStarting ? "opacity-75 pointer-events-none" : ""
                      }`}
                      onClick={() => !isCurrentlyStarting && handleTaskClick(task)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header with status */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-lg leading-tight flex-1">
                              {task.taskName || "Untitled Task"}
                            </h3>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status
                                ? task.status.replace("_", " ").toUpperCase()
                                : "PENDING"}
                            </span>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Priority */}
                          {task.priority && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Priority:</span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Due Date */}
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              isOverdue(task.dueDate) ? "text-red-600" : "text-muted-foreground"
                            }`}
                          >
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Due: {formatDate(task.dueDate)}</span>
                            {isOverdue(task.dueDate) && (
                              <span className="text-xs font-semibold">(OVERDUE)</span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {task.progress !== undefined && (
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-medium">Progress</span>
                                <span className="font-bold text-primary">{Math.min(task.progress, 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(task.progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Topics */}
                          {topics && topics.length > 0 && (
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-muted-foreground font-medium mb-2">
                                Assigned Topics ({topics.length})
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {topics.slice(0, 2).map((topic, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                  >
                                    {topic}
                                  </span>
                                ))}
                                {topics.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    +{topics.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Call to action */}
                          <Button
                            className="w-full mt-2 bg-primary hover:bg-primary/90 text-white"
                            disabled={isCurrentlyStarting}
                          >
                            {isCurrentlyStarting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {isTaskInProgress ? "Continuing..." : "Starting..."}
                              </>
                            ) : isTaskInProgress ? (
                              "Continue Task"
                            ) : (
                              "Start Task"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
