"use client";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { toast } from "react-toastify";

export interface LinkData {
  id?: string;
  name: string;
  url: string;
}

interface AdditionalLinkUploadProps {
  onFieldsChange?: (fields: LinkData[]) => void;
  initialData?: LinkData[];
}

export function AdditionalLinkUpload({ onFieldsChange, initialData }: AdditionalLinkUploadProps) {
  const [additionalFields, setAdditionalFields] = useState<LinkData[]>(initialData || []);

  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(additionalFields)) {
      setAdditionalFields(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleAddField = () => {
    const newFields = [...additionalFields, { name: "", url: "" }];
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  const handleRemoveField = (index: number) => {
    const newFields = additionalFields.filter((_, i) => i !== index);
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
    toast.info("Link field removed");
  };

  const handleUrlChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    const newFields = additionalFields.map((item, i) => (i === index ? { ...item, url } : item));
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlBlur = (index: number) => {
    const link = additionalFields[index];
    if (link.url && !validateUrl(link.url)) {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
    }
  };

  return (
    <div className="space-y-4">
      {additionalFields.map((fieldData, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
        >
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium mb-2 block text-gray-700">URL</Label>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={fieldData.url}
                  onChange={(e) => handleUrlChange(index, e)}
                  onBlur={() => handleUrlBlur(index)}
                  className="border-gray-300 w-full pl-10"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveField(index)}
                className="border-red-300 text-red-500 hover:bg-red-50 shrink-0"
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
        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add More Links
      </Button>
    </div>
  );
}
