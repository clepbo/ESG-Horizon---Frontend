"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Button } from "@/app/components/ui/button";
import { ExternalLink, X, Edit, Bell } from "lucide-react";
import { FrontendTask } from "@/services/assignTask.service";
import { cn } from "@/lib/utils";
import {
  useAddTaskComment,
  useDeleteTask,
  useTaskComments,
  useStartTask,
} from "@/services/hooks/assignTask.hooks";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface TaskDetailDrawerProps {
  task: FrontendTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  const [comment, setComment] = useState("");

  const deleteTaskMutation = useDeleteTask();
  const { data: comments, isLoading } = useTaskComments(task?.id ?? 0);
  const addCommentMutation = useAddTaskComment();
  const startTaskMutation = useStartTask();

  const { user: authUser } = useAuth();
  const router = useRouter();

  if (!task) return null;

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const dueInWeeks = diffDays > 0 ? `Due in ${Math.ceil(diffDays / 7)} weeks` : "Past due";

  const isAssignedToCurrentUser = task.assignedUserIds?.includes(authUser?.id ?? 0) ?? false;

  const handleSaveTask = async (taskId: number) => {
    if (!comment) {
      toast.info("Nothing to save. Details closed");
      onOpenChange(false);
      return;
    }

    try {
      const author = authUser?.first_name
        ? `${authUser.first_name} ${authUser.last_name ?? ""}`.trim()
        : "Anonymous";

      await addCommentMutation.mutateAsync({
        id: taskId,
        payload: { commenter: author, comment },
      });
      setComment("");
      toast.success("Comment added successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error updating task");
      console.error(error);
    }
  };

  const handleStartTask = async (taskId: number) => {
    try {
      const response = await startTaskMutation.mutateAsync(taskId);
      toast.success("Task started successfully");

      // Extract assessment ID from response
      const assessmentId =
        response.assessmentId ||
        response.data?.assessmentId ||
        response.taskAssignment?.assessmentId ||
        response.assessment?.id ||
        task.assessmentId;

      // Close drawer
      onOpenChange(false);

      // Navigate to assessment if ID is available
      if (assessmentId) {
        router.push(`/assessments/${assessmentId}`);
      } else {
        toast.info("Redirecting to tasks...");
        router.push("/assessments/tasks");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start task");
      console.error(error);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />

      <DialogPrimitive.Title className="sr-only">Task Details</DialogPrimitive.Title>

      <DialogPrimitive.Content
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-[500px] bg-white shadow-lg rounded-l-lg",
          "overflow-y-auto p-6 space-y-6 pr-8 mr-4",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-semibold text-neutral-900">Task Details</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground shadow-lg px-1 py-2 cursor-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground">Task Name</div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{task.taskName}</h1>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="max-w-40">
            <div className="text-xs font-semibold text-muted-foreground">Assignee</div>
            <div className="font-medium">{task.assignedTo}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Status</div>
            <Badge variant="secondary" className="capitalize">
              {task.status.replace("_", " ")}
            </Badge>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="border border-teal-500"
              onClick={() => router.push(`/assessments/tasks/assign?edit=${task.id}`)}
            >
              <Edit className="w-4 h-5 mr-1 text-teal-500" />{" "}
              <span className="text-teal-500">Edit Task</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Date Assigned</div>
            <div className="font-medium mt-1">
              {new Date(task.dateAssigned).toISOString().split("T")[0]}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mt-4">Due Date</div>
            <div className="font-medium mt-1">{dueDate.toISOString().split("T")[0]}</div>
            <div className="text-xs text-orange-600">{dueInWeeks}</div>
          </div>
          <Button variant="outline" size="sm" className="border border-teal-500">
            <Bell className="w-4 h-4 mr-1 text-teal-500" />{" "}
            <span className="text-teal-500">Send Reminder</span>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Section 0 of 3</span>
            <span>{task.progress ?? 0}% Complete</span>
          </div>
          <Progress value={task.progress ?? 0} />
        </div>

        {task.departments?.length ? (
          <div>
            <h4 className="text-sm font-medium">Departments</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {task.departments.map((dept) => (
                <Badge key={dept} className="bg-gray-200 text-gray-700">
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {task.teamMembers?.length ? (
          <div>
            <h4 className="text-sm font-medium">Team Members</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {task.teamMembers.map((member) => (
                <Badge key={member} className="bg-gray-200 text-gray-700">
                  {member}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {task.topics?.length ? (
          <div>
            <h4 className="text-sm font-medium">Topics Assigned</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {task.topics.map((topic) => (
                <Badge key={topic} className="bg-gray-200 text-gray-700">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="font-semibold">Comments</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {comments?.map(
                (c: { id: number; commenter: string; comment: string; createdAt: string }) => (
                  <li key={c.id} className="bg-gray-200 shadow-sm rounded-md p-2 text-sm my-3">
                    <span className="font-small text-neutral-600">{c.commenter}:</span>{" "}
                    <span className="font-medium text-neutral-900">{c.comment}</span>
                    <div className="text-xs text-neutral-600 mt-1">
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
          <h4 className="text-sm font-medium">Add Comment</h4>
          <textarea
            placeholder="Leave a comment..."
            className="mt-2 w-full border border-gray-400 rounded-md p-2 text-sm text-muted-foreground"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            disabled={addCommentMutation.isPending || deleteTaskMutation.isPending}
            onClick={() => handleSaveTask(task.id)}
            className="border border-teal-600 bg-white text-teal"
          >
            Submit Comment
          </Button>

          {isAssignedToCurrentUser && (
            <Button
              disabled={
                addCommentMutation.isPending ||
                deleteTaskMutation.isPending ||
                startTaskMutation.isPending
              }
              onClick={() => handleStartTask(task.id)}
              className="bg-teal-600 text-white"
            >
              {startTaskMutation.isPending ? "Starting..." : "Start Task"}
            </Button>
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  );
}
