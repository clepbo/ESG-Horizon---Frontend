import React, { useState } from "react";
import Image from "next/image";
import { X, Eye, FileText, CloudUpload, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export interface PreviewFileData {
  name: string;
  url?: string;
  publicId?: string;
  file?: File | null;
}

interface FilePreviewProps {
  file: PreviewFileData;
  onRemove?: () => void;
  disabled?: boolean;
}

const getFileExtension = (filename: string): string => {
  if (!filename) return "";
  return filename.split(".").pop()?.toLowerCase() || "";
};

const getFileType = (fileData: PreviewFileData): "image" | "pdf" | "document" | "unknown" => {
  if (fileData.file?.type) {
    if (fileData.file.type.startsWith("image/")) return "image";
    if (fileData.file.type === "application/pdf") return "pdf";
    if (fileData.file.type.includes("document") || fileData.file.type.includes("word"))
      return "document";
  }

  const filename = fileData.file?.name || fileData.name || fileData.url || "";
  const ext = getFileExtension(filename);

  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) return "document";

  return "unknown";
};

export function FilePreview({ file, onRemove, disabled }: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileType = getFileType(file);
  const isImageFile = fileType === "image";
  const isPDFFile = fileType === "pdf";
  const isDocFile = fileType === "document";

  // Use URL object if file prop exists but url doesn't, though typically url comes from server
  const fileUrl = file.url || (file.file ? URL.createObjectURL(file.file) : "");

  return (
    <>
      <div className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-teal-500 transition-all shadow-sm bg-white mt-2">
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="w-full text-left"
          title="Click to preview"
        >
          {isImageFile && fileUrl ? (
            <div className="relative w-24 h-24 flex items-center justify-center bg-gray-50 mx-auto">
              <Image
                src={fileUrl}
                alt={file.name || "Preview"}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                unoptimized={fileUrl.startsWith("blob:")}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : (
            <div className="relative w-24 h-24 flex flex-col items-center justify-center bg-gray-50 mx-auto">
              {isPDFFile ? (
                <FileText className="h-10 w-10 text-red-500" />
              ) : isDocFile ? (
                <FileText className="h-10 w-10 text-blue-500" />
              ) : (
                <FileText className="h-10 w-10 text-gray-500" />
              )}
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 max-w-[80px] truncate">
                {getFileExtension(file.name) || "FILE"}
              </span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}
        </button>

        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={disabled}
            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            title="Remove file"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1 max-w-[100px] truncate text-center" title={file.name}>
        {file.name}
      </p>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h3 className="font-semibold text-gray-900 truncate pr-4">
                {file.name || "File Preview"}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                {onRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      onRemove();
                      setIsPreviewOpen(false);
                    }}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                {fileUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={fileUrl} download={file.name} target="_blank" rel="noopener noreferrer">
                      <CloudUpload className="h-4 w-4 mr-2 rotate-180" />
                      Download
                    </a>
                  </Button>
                )}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-gray-100 overflow-hidden relative">
              {isImageFile && fileUrl ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={fileUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    width={1200}
                    height={800}
                    unoptimized={fileUrl.startsWith("blob:")}
                  />
                </div>
              ) : (isPDFFile || isDocFile) && fileUrl ? (
                <iframe
                  key={fileUrl}
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                    fileUrl
                  )}&embedded=true`}
                  className="w-full h-full border-none bg-white"
                  title="Document Preview"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">Preview not available</p>
                  {fileUrl && (
                    <Button asChild className="mt-4 bg-teal-600 hover:bg-teal-700">
                      <a href={fileUrl} download={file.name}>
                        Download to View
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
