"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, X, Plus, Trash2, Link } from "lucide-react";
import { Label } from "../label";
import { Input } from "../input";

export interface FileOrLinkData {
  id?: string;
  name: string;
  type: "file" | "link";
  file?: File | null;
  url?: string;
  link?: string;
  publicId?: string;
  size?: number;
  lastModified?: number;
}

interface AddMoreFilesLinksProps {
  onFieldsChange?: (fields: FileOrLinkData[]) => void;
  initialData?: FileOrLinkData[];
  uploadService?: {
    uploadImage: (file: File) => Promise<{ url: string; publicId: string }>;
    deleteImage: (publicId: string) => Promise<void>;
  };
  showToast?: (message: string, type: "success" | "error") => void;
}

export function AddMoreFilesLinks({
  onFieldsChange,
  initialData,
  uploadService,
  showToast,
}: AddMoreFilesLinksProps) {
  const [fields, setFields] = useState<FileOrLinkData[]>(
    initialData || [{ name: "", type: "file", file: null }]
  );
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(fields)) {
      setFields(initialData);
    }
  }, [initialData]);

  const notifyChange = (newFields: FileOrLinkData[]) => {
    setFields(newFields);
    onFieldsChange?.(newFields);
  };

  const handleAddField = () => {
    const newFields = [...fields, { name: "", type: "file" as const, file: null }];
    notifyChange(newFields);
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    notifyChange(newFields);
  };

  const handleNameChange = (index: number, value: string) => {
    const newFields = fields.map((item, i) => (i === index ? { ...item, name: value } : item));
    notifyChange(newFields);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newFields = fields.map((item, i) =>
      i === index ? { ...item, link: value, type: "link" as const } : item
    );
    notifyChange(newFields);
  };

  const handleFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast?.("File too large. Please select a file smaller than 10MB.", "error");
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [index]: true }));

      let uploadedUrl: string;
      let uploadedPublicId: string;

      if (uploadService) {
        const uploaded = await uploadService.uploadImage(file);
        uploadedUrl = uploaded.url;
        uploadedPublicId = uploaded.publicId;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        uploadedUrl = URL.createObjectURL(file);
        uploadedPublicId = `demo_${Date.now()}`;
      }

      const newFields = fields.map((item, i) =>
        i === index
          ? {
              ...item,
              name: item.name || file.name,
              type: "file" as const,
              file: file,
              url: uploadedUrl,
              publicId: uploadedPublicId,
              size: file.size,
              lastModified: file.lastModified,
            }
          : item
      );

      notifyChange(newFields);
      showToast?.(`${file.name} uploaded successfully.`, "success");
    } catch (err) {
      console.error("Upload failed:", err);
      showToast?.("There was an error uploading your file.", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fieldData = fields[index];

    if (fieldData?.publicId && uploadService) {
      try {
        setDeleting((prev) => ({ ...prev, [index]: true }));
        await uploadService.deleteImage(fieldData.publicId);
        showToast?.("File was successfully removed.", "success");
      } catch (err) {
        console.error("Delete failed:", err);
        showToast?.("There was an error deleting the file.", "error");
        setDeleting((prev) => ({ ...prev, [index]: false }));
        return;
      } finally {
        setDeleting((prev) => ({ ...prev, [index]: false }));
      }
    }

    const newFields = fields.map((item, i) =>
      i === index ? { ...item, file: null, url: undefined, publicId: undefined } : item
    );
    notifyChange(newFields);
  };

  return (
    <div className="space-y-4">
      {fields.map((fieldData, index) => (
        <div key={index} className="space-y-4">
          {/* Top Row: Name and Upload File */}
          <div className="flex gap-4 items-start">
            {/* Name Input - Left Side */}
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block text-gray-700">
                Name of file/evidence
              </Label>
              <Input
                placeholder="Enter the name of the file/evidence you are about to upload"
                value={fieldData.name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="border-gray-300 w-full"
                disabled={uploading[index] || deleting[index]}
              />
            </div>

            {/* File Upload Section - Right Side */}
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block text-gray-700">Upload File</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 justify-start min-w-0"
                  onClick={() => {
                    const input = document.getElementById(
                      `file-input-${index}`
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                  disabled={uploading[index] || deleting[index]}
                >
                  {uploading[index] ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                      <span className="truncate">Uploading...</span>
                    </span>
                  ) : deleting[index] ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full" />
                      <span className="truncate text-red-500">Deleting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 min-w-0">
                      <CloudUpload className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {fieldData.file?.name ||
                          fieldData.url?.split("/").pop() ||
                          "Select the file you want to upload (max. 10mb)"}
                      </span>
                    </span>
                  )}
                </Button>

                {fieldData.file && !uploading[index] && !deleting[index] && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveField(index)}
                  className="border-red-300 text-red-500 hover:bg-red-50 shrink-0"
                  disabled={uploading[index] || deleting[index]}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                id={`file-input-${index}`}
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(index, e)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
          </div>

          {/* Bottom Row: Link Input */}
          <div className="w-full">
            <Label className="text-sm font-medium mb-2 block text-gray-700">
              Or Upload via Link
            </Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter or paste the link to the evidence/file"
                value={fieldData.link || ""}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                className="border-gray-300 pl-10"
                disabled={uploading[index] || deleting[index]}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add More Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddField}
        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add More Files/Links
      </Button>
    </div>
  );
}
