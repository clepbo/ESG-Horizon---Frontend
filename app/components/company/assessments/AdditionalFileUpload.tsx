"use client";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
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

  return (
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
          <div className="relative">
            <Label className="text-sm font-medium mb-2 block text-gray-700">Upload File</Label>
            <div className="flex items-center gap-2">
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
                        {fieldData.file?.name ?? "Select file (max. 10MB)"}
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
  );
}
