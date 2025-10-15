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
    if (initialData) {
      setAdditionalFields(initialData);
    }
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
    <div>
      {additionalFields.map((fieldData, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-300 rounded-lg bg-white"
        >
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-700">
              Name of file/evidence
            </Label>
            <Input
              placeholder="Enter the name of the file/evidence you are about to upload"
              value={fieldData.name}
              onChange={(e) => handleNameChange(index, e)}
              className="border-gray-300"
              disabled={uploading[index] || deleting[index]}
            />
          </div>
          <div className="relative">
            <Label className="text-sm font-medium mb-2 block text-gray-700">Upload File</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                onClick={() => {
                  const input = document.getElementById(
                    `additional-file-${index}`
                  ) as HTMLInputElement;
                  input?.click();
                }}
                disabled={uploading[index] || deleting[index]}
              >
                <div className="flex items-center">
                  <CloudUpload className="h-4 w-4 mr-2" />
                  <span className="truncate">
                    {fieldData.file
                      ? fieldData.file.name
                      : "Select file you want to upload (max. 10mb)"}
                  </span>
                </div>
              </Button>
              {fieldData.file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-16 top-1/2 -mt-1 transform -translate-y-1/2"
                  onClick={() => handleRemoveFile(index)}
                  disabled={deleting[index]}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
              {uploading[index] && (
                <div className="absolute right-1/2 top-1/2 transform translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
                  <LoadingSpinner size="sm" /> Uploading...
                </div>
              )}
              {deleting[index] && (
                <div className="absolute right-1/2 top-1/2 transform translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-red-500">
                  <LoadingSpinner size="sm" /> Deleting...
                </div>
              )}
              <Input
                id={`additional-file-${index}`}
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(index, e)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
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
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddField}
        className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add More Files
      </Button>
    </div>
  );
}
