import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Calendar, User, Clock, Flag } from "lucide-react";
import { ITask } from "@/app/(company)/assessments/tasks/page";

interface TaskDetailDrawerProps {
  task: ITask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const getPriorityBadge = (priority?: "low" | "medium" | "high") => {
  if (!priority) return null;

  const config = {
    low: { className: "bg-muted text-muted-foreground" },
    medium: { className: "bg-warning-100 text-warning-600 border-warning" },
    high: { className: "bg-danger-100 text-danger-600 border-danger" },
  };

  return (
    <Badge variant="outline" className={config[priority].className}>
      {priority}
    </Badge>
  );
};

export function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">{task.taskName}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Assigned To</div>
                <div className="font-medium">{task.assignedTo}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Date Assigned</div>
                <div className="font-medium">
                  {new Date(task.dateAssigned).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Due Date</div>
                <div className="font-medium">
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {task.priority && (
              <div className="flex items-center gap-3 text-sm">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Priority</div>
                  <div className="font-medium capitalize">{task.priority}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Additional Details Section */}
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-semibold">Task ID</h4>
            <p className="text-sm text-muted-foreground font-mono">{task.id}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
