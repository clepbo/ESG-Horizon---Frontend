"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CloudUpload, X, Plus, Trash2, FileText, Eye } from "lucide-react";
import { uploadService } from "@/services/upload.service";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { toast } from "react-toastify";

export interface FileData {
  id?: string;
  name: string;
  size?: number;
  lastModified?: number;
  url?: string;
  publicId?: string;
  file?: File | null;
}

interface AdditionalFileUploadProps {
  onFieldsChange?: (fields: FileData[]) => void;
  initialData?: FileData[];
}

export function AdditionalFileUpload({ onFieldsChange, initialData }: AdditionalFileUploadProps) {
  const [additionalFields, setAdditionalFields] = useState<FileData[]>(initialData || []);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: number]: boolean }>({});
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(additionalFields)) {
      setAdditionalFields(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleAddField = () => {
    const newFields = [...additionalFields, { name: "", file: null }];
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  const handleRemoveField = (index: number) => {
    const newFields = additionalFields.filter((_, i) => i !== index);
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  const handleFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Please select a file smaller than 10MB.");
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [index]: true }));

      const uploaded = await uploadService.uploadImage(file);

      const newFields = additionalFields.map((item, i) =>
        i === index
          ? {
              ...item,
              // Only set name from file if the name field is empty
              name: item.name || file.name,
              file: file,
              url: uploaded.url,
              publicId: uploaded.publicId,
              size: file.size,
              lastModified: file.lastModified,
            }
          : item
      );

      setAdditionalFields(newFields);
      onFieldsChange?.(newFields);
      toast.success(`${file.name} uploaded successfully.`);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("There was an error uploading your file.");
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fileData = additionalFields[index];

    if (fileData?.publicId) {
      try {
        setDeleting((prev) => ({ ...prev, [index]: true }));
        await uploadService.deleteImage(fileData.publicId);
        toast.success("File was successfully removed.");
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("There was an error deleting the file.");
      } finally {
        setDeleting((prev) => ({ ...prev, [index]: false }));
      }
    }

    const newFields = additionalFields.map((item, i) =>
      i === index ? { ...item, file: null, url: undefined, publicId: undefined } : item
    );
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  const handleNameChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const newFields = additionalFields.map((item, i) => (i === index ? { ...item, name } : item));
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  const getFileExtension = (filename: string): string => {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const getFileType = (fieldData: FileData): "image" | "pdf" | "document" | "unknown" => {
    // Check MIME type first if available
    if (fieldData.file?.type) {
      if (fieldData.file.type.startsWith("image/")) return "image";
      if (fieldData.file.type === "application/pdf") return "pdf";
      if (fieldData.file.type.includes("document") || fieldData.file.type.includes("word"))
        return "document";
    }

    // Fallback to extension check
    const filename = fieldData.file?.name || fieldData.name || fieldData.url || "";
    const ext = getFileExtension(filename);

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const pdfExtensions = ["pdf"];
    const documentExtensions = ["doc", "docx", "txt", "rtf", "odt"];

    if (imageExtensions.includes(ext)) return "image";
    if (pdfExtensions.includes(ext)) return "pdf";
    if (documentExtensions.includes(ext)) return "document";

    return "unknown";
  };

  const isImageFile = (fieldData: FileData): boolean => {
    return getFileType(fieldData) === "image";
  };

  const isPDFFile = (fieldData: FileData): boolean => {
    return getFileType(fieldData) === "pdf";
  };

  const handlePreview = (fieldData: FileData) => {
    setPreviewFile(fieldData);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  return (
    <>
      <div className="space-y-4">
        {additionalFields.map((fieldData, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium mb-2 block text-gray-700">
                Name of file/evidence
              </Label>
              <Input
                placeholder="Enter the name of the file/evidence"
                value={fieldData.name}
                onChange={(e) => handleNameChange(index, e)}
                className="border-gray-300 w-full"
                disabled={uploading[index] || deleting[index]}
              />
            </div>

            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium mb-2 block text-gray-700">Upload File</Label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-start whitespace-nowrap min-w-0"
                  onClick={() => {
                    const input = document.getElementById(
                      `additional-file-${index}`
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                  disabled={uploading[index] || deleting[index]}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {uploading[index] ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="truncate">Uploading...</span>
                      </>
                    ) : deleting[index] ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="truncate text-red-500">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {fieldData.file?.name ||
                            fieldData.name ||
                            fieldData.url?.split("/").pop() ||
                            "Select file (max. 10MB)"}
                        </span>
                      </>
                    )}
                  </div>
                </Button>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {fieldData.file && !uploading[index] && !deleting[index] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveField(index)}
                    className="border-red-300 text-red-500 hover:bg-red-50"
                    disabled={uploading[index] || deleting[index]}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Input
                id={`additional-file-${index}`}
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(index, e)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />

              {/* Thumbnail Preview */}
              {fieldData.url && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handlePreview(fieldData)}
                    className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                    title="Click to preview"
                  >
                    {getFileType(fieldData) === "image" ? (
                      <div className="relative w-24 h-24 bg-gray-50">
                        <Image
                          src={fieldData.url}
                          alt={fieldData.name || "Preview"}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                      </div>
                    ) : getFileType(fieldData) === "pdf" ? (
                      <div className="relative w-24 h-24 bg-white flex flex-col items-center justify-center p-2">
                        <svg
                          className="h-12 w-12 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H12V10H18V20H6Z" />
                        </svg>
                        <span className="text-xs font-bold text-red-600 mt-1">PDF</span>
                        <div className="absolute inset-0 bg-red-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                          <Eye className="h-6 w-6 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : getFileType(fieldData) === "document" ? (
                      <div className="relative w-24 h-24 bg-white flex flex-col items-center justify-center p-2">
                        <FileText className="h-12 w-12 text-blue-500" />
                        <span className="text-xs font-bold text-blue-600 mt-1 uppercase">
                          {getFileExtension(fieldData.file?.name || fieldData.name)}
                        </span>
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                          <Eye className="h-6 w-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-24 h-24 bg-white flex flex-col items-center justify-center p-2">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 mt-1 uppercase">
                          {getFileExtension(fieldData.file?.name || fieldData.name) || "FILE"}
                        </span>
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                          <Eye className="h-6 w-6 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddField}
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add More Files
        </Button>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col shadow-2xl"
            style={{ position: "relative", zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {previewFile.name || previewFile.file?.name || "File Preview"}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 transition-colors shrink-0"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 bg-white flex items-center justify-center">
              {isImageFile(previewFile) && previewFile.url ? (
                <Image
                  src={previewFile.url}
                  alt={previewFile.name}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  style={{ display: "block" }}
                />
              ) : isPDFFile(previewFile) ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FileText className="h-16 w-16 mb-4 text-red-500" />
                  <p className="text-lg mb-2 font-semibold text-gray-700">PDF Document</p>
                  <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
                    Click the button below to open this PDF in a new tab
                  </p>
                  <Button
                    type="button"
                    onClick={() => window.open(previewFile.url, "_blank")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Open PDF in New Tab
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FileText className="h-16 w-16 mb-4" />
                  <p className="text-lg mb-2">Preview not available for this file type</p>
                  <p className="text-sm text-gray-400 mb-4">
                    File type: {getFileType(previewFile).toUpperCase()}
                  </p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Download file to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
