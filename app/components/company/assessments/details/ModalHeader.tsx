import { X, UserPlus, CheckCircle } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { STATUS_CONFIG } from "./constants";

interface ModalHeaderProps {
  status: string;
  onClose: () => void;
  onAssignTask?: () => void;
  onSubmitForReview?: () => void;
}

export function ModalHeader({
  status,
  onClose,
  onAssignTask,
  onSubmitForReview,
}: ModalHeaderProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.in_progress;
  const StatusIcon = config.icon;

  return (
    <div className="sticky top-0 bg-white border-b z-10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Assessment Details</h2>
          <Badge className={`${config.color} flex items-center gap-1 text-xs`}>
            <StatusIcon className="w-3.5 h-3.5" /> {config.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {onAssignTask && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-teal-600 text-teal-700 hover:bg-teal-50"
              onClick={onAssignTask}
            >
              <UserPlus className="w-4 h-4" />
              Assign Task
            </Button>
          )}
          {onSubmitForReview && (
            <Button
              size="sm"
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={onSubmitForReview}
            >
              <CheckCircle className="w-4 h-4" />
              Submit for Review
            </Button>
          )}
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
