import { FileText, Download } from "lucide-react";
import type { FileWithMeta } from "./types";

interface DocumentsSectionProps {
  files: FileWithMeta[];
  onFileClick: (file: FileWithMeta) => void;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { bg: "bg-red-50", text: "text-red-500" };
  if (ext === "xlsx" || ext === "xls" || ext === "csv")
    return { bg: "bg-teal-50", text: "text-teal-600" };
  if (ext === "doc" || ext === "docx") return { bg: "bg-indigo-50", text: "text-indigo-500" };
  return { bg: "bg-gray-50", text: "text-gray-500" };
}

function getFileExtLabel(name: string) {
  return name.split(".").pop()?.toUpperCase() || "FILE";
}

function formatFileSize(bytes?: number) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `Uploaded ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export function DocumentsSection({ files, onFileClick }: DocumentsSectionProps) {
  const isEmpty = files.length === 0;

  // The `no-export` class is always applied. The class itself has no
  // visual effect (no CSS rule targets it), so the live report viewer
  // and the assessment details modal both keep showing this section
  // normally. But the html-to-image filter in pdfUtils.captureSection
  // checks for it and skips any matching subtree during PDF/PNG export
  // — the per-section supporting docs are redundant in the export
  // because the PDF appendix already lists every uploaded file as a
  // clickable link, and the empty placeholder shouldn't appear at all.
  return (
    <div className="no-export rounded-xl border border-gray-100 bg-white p-5">
      <h5 className="text-sm font-bold text-gray-900 mb-3">Supporting Documents</h5>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            No supporting documents have been uploaded for this section.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Evidence can be attached during the assessment process via the assessment form.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((file, i) => {
            const iconStyle = getFileIcon(file.name);
            const ext = getFileExtLabel(file.name);
            const size = formatFileSize(file.size);
            const date = formatUploadDate(file.uploadedAt);
            const meta = [ext, size, date].filter(Boolean).join(" · ");

            return (
              <button
                key={i}
                onClick={() => onFileClick(file)}
                className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all text-left w-full"
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${iconStyle.bg}`}>
                  <FileText className={`w-5 h-5 ${iconStyle.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-700 mt-0.5">{meta}</p>
                </div>
                <Download className="w-4 h-4 text-gray-300 group-hover:text-teal-600 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
