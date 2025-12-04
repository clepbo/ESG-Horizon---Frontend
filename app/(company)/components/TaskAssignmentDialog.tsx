"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FrontendTask } from "@/services/assignTask.service";
import { Clock } from "lucide-react";

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: FrontendTask[];
}

export default function TaskAssignmentDialog({
  open,
  onOpenChange,
  tasks,
}: TaskAssignmentDialogProps) {
  const router = useRouter();

  const handleTaskClick = () => {
    onOpenChange(false);
    router.push("/assessments/new-assessment");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">You have tasks assigned to you</DialogTitle>
          <DialogDescription>
            You have {tasks.length} task{tasks.length !== 1 ? "s" : ""} that need your attention.
            Click on any task to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="space-y-2">
            {tasks.map((task) => {
              const topicCount = task.topics?.length || 0;
              
              return (
                <div
                  key={task.id}
                  onClick={handleTaskClick}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[var(--color-primary)] hover:bg-gray-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                        {task.taskName}
                      </h4>
                      <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Created by: {task.assignedTo}
                        </div>
                        {topicCount > 0 && (
                          <div className="text-sm text-gray-500">
                            {topicCount} topic{topicCount !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
