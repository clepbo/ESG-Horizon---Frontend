"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ListX, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { TaskTable } from "@/app/components/company/tasks/TaskTable";
import { TaskDetailDrawer } from "@/app/components/company/tasks/TaskDetailDrawer";
import { useRouter } from "next/navigation";
import {
  useCompanyTasks,
  useApproveTask,
  useRejectTask,
  useDeleteTask,
  useSendTaskReminder,
  useAddTaskComment,
} from "@/services/hooks/assignTask.hooks";
import { FrontendTask } from "@/services/assignTask.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function TasksPage() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<FrontendTask | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const { data: tasks = [], isLoading, isError, error } = useCompanyTasks();

  if (isError) {
    toast.error(error?.message || "Failed to load tasks.");
  }

  const { user: authUser } = useAuth();

  const approveTaskMutation = useApproveTask();
  const rejectTaskMutation = useRejectTask();
  const deleteTaskMutation = useDeleteTask();
  const sendReminderMutation = useSendTaskReminder();
  const addCommentMutation = useAddTaskComment();

  const handleViewTask = (task: FrontendTask) => {
    setSelectedTask(task);
    setIsDetailDrawerOpen(true);
  };

  const handleEditTask = (task: FrontendTask) => {
    router.push(`/assessments/tasks/assign?edit=${task.id}`);
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.info("Task deleted successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task.");
    }
  };

  const handleReassignTask = async (taskId: number) => {
    router.push(`/assessments/tasks/assign?edit=${taskId}`);
  };

  const handleApproveTask = async (taskId: number) => {
    try {
      await approveTaskMutation.mutateAsync(taskId);
      toast.success("Task approved successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve task.");
    }
  };

  const handleDeclineTask = async (taskId: number, comment?: string) => {
    try {
      if (!comment || comment.trim() === "") {
        toast.info("Please provide a comment before declining.");
        return;
      }
      const author = authUser?.first_name
        ? `${authUser.first_name} ${authUser.last_name ?? ""}`.trim()
        : "Anonymous";

      await addCommentMutation.mutateAsync({
        id: taskId,
        payload: { commenter: author, comment },
      });
      await rejectTaskMutation.mutateAsync(taskId);

      toast.error("Task declined successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to decline task");
    }
  };

  const handleSendReminder = async (taskId: number) => {
    try {
      await sendReminderMutation.mutateAsync(taskId);
      toast.info(`Reminder sent for task ID: ${taskId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reminder");
    }
  };

  return (
    <motion.main
      className="flex-1 h-full min-h-screen overflow-y-auto p-6 bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.5 }}
    >
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
            <p className="text-base text-muted-foreground">
              Keep track of all assessment and reporting tasks assigned across teams and
              departments.
            </p>
          </div>

          {tasks && tasks.length > 0 && !isLoading && (
            <Button
              onClick={() => router.push("/assessments/tasks/assign")}
              size="sm"
              className="text-white"
            >
              <Plus className="mr-2 h-5 w-5" /> Assign Task
            </Button>
          )}
        </div>

        {tasks && tasks.length === 0 && !isLoading ? (
          <motion.div
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg shadow-sm mt-10 bg-white"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ListX className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tasks Assigned Yet</h3>
            <p className="text-base text-gray-500 mb-6 text-center">
              No assigned tasks. Get started by assigning your first assessment task.
            </p>
            <Button
              onClick={() => router.push("/assessments/tasks/assign")}
              size="sm"
              className="text-white"
            >
              <Plus className="mr-2 h-5 w-5" /> Assign Task
            </Button>
          </motion.div>
        ) : (
          <section className="shadow-md">
            <TaskTable
              tasks={tasks}
              onViewTask={handleViewTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onReassignTask={handleReassignTask}
              onApproveTask={handleApproveTask}
              onDeclineTask={handleDeclineTask}
              onSendReminder={handleSendReminder}
              isLoading={isLoading}
            />
          </section>
        )}

        {/* Task Detail Drawer */}
        <TaskDetailDrawer
          task={selectedTask}
          open={isDetailDrawerOpen}
          onOpenChange={setIsDetailDrawerOpen}
        />
      </div>
    </motion.main>
  );
}
