"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/app/components/ui/button";
import { TaskTable } from "@/app/components/company/tasks/TaskTable";
import { TaskDetailDrawer } from "@/app/components/company/tasks/TaskDetailDrawer";
import { useRouter } from "next/navigation";
import {
  useCompanyTasks,
  useApproveTask,
  useRejectTask,
  useReassignTask,
  useDeleteTask,
  useSendTaskReminder,
} from "@/services/hooks/assignTask.hooks";
import { FrontendTask } from "@/services/assignTask.service";

export default function TasksPage() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<FrontendTask | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const { data: tasks = [], isLoading, isError, error } = useCompanyTasks();

  if (isError) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  }

  const approveTaskMutation = useApproveTask();
  const rejectTaskMutation = useRejectTask();
  const reassignTaskMutation = useReassignTask();
  const deleteTaskMutation = useDeleteTask();
  const sendReminderMutation = useSendTaskReminder();

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
      toast({
        title: "Task Deleted",
        description: "Task deleted successfully.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReassignTask = async (taskId: number) => {
    try {
      await reassignTaskMutation.mutateAsync({ id: taskId, payload: {} });
      toast({ title: "Task Reassigned", description: `Task ID ${taskId} reassigned.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleApproveTask = async (taskId: number) => {
    try {
      await approveTaskMutation.mutateAsync(taskId);
      toast({ title: "Task Approved", description: "Task has been approved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectTask = async (taskId: number) => {
    try {
      await rejectTaskMutation.mutateAsync(taskId);
      toast({
        title: "Task Rejected",
        description: "Task has been rejected.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSendReminder = async (taskId: number) => {
    try {
      await sendReminderMutation.mutateAsync(taskId);
      toast({ title: "Reminder Sent", description: `Reminder sent for task ID: ${taskId}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
          <Button
            onClick={() => router.push("/assessments/tasks/assign")}
            size="sm"
            className="text-white"
          >
            <Plus className="mr-2 h-5 w-5" /> Assign Task
          </Button>
        </div>

        {/* Task Table */}
        <section className="shadow-md">
          <TaskTable
            tasks={tasks}
            onViewTask={handleViewTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onReassignTask={handleReassignTask}
            onApproveTask={handleApproveTask}
            onRejectTask={handleRejectTask}
            onSendReminder={handleSendReminder}
            isLoading={isLoading}
          />
        </section>

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
