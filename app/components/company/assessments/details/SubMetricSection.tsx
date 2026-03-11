import { Button } from "@/app/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DocumentsSection } from "./DocumentsSection";
import { StatusDot } from "./StatusDot";
import type { FileWithMeta } from "./types";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";

interface SubMetricSectionProps {
  title: string;
  status?: SectionStatus;
  onEdit?: () => void;
  onClear?: () => void;
  documents?: FileWithMeta[];
  onFileClick?: (file: FileWithMeta) => void;
  children: React.ReactNode;
}

export function SubMetricSection({
  title,
  status,
  onEdit,
  onClear,
  documents,
  onFileClick,
  children,
}: SubMetricSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {status && <StatusDot status={status} />}
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              size="sm"
              className="gap-1.5 h-8 bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={onEdit}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          )}
          {onClear && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 border-red-300 text-red-600 hover:bg-red-50 text-xs"
              onClick={onClear}
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Data
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {children}
        {documents !== undefined && onFileClick && (
          <div className="mt-4">
            <DocumentsSection files={documents} onFileClick={onFileClick} />
          </div>
        )}
      </div>
    </div>
  );
}
