import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// The `FileData` interface remains the same
export interface FileData {
  name: string;
  file: File | null;
}

interface AdditionalFileUploadProps {
  onFieldsChange?: (fields: FileData[]) => void;
  // Add a prop to pass initial data
  initialData?: FileData[];
}

export function AdditionalFileUpload({
  onFieldsChange,
  initialData, // Destructure the new prop
}: AdditionalFileUploadProps) {
  const { toast } = useToast();
  // Use a state that can be initialized with the `initialData` prop
  const [additionalFields, setAdditionalFields] = useState<FileData[]>(
    initialData || []
  );

  // Use a useEffect to listen for changes to the parent's data and update the local state
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

  const handleFileChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      // Note: You can't store a `File` object directly in local storage as it is not serializable.
      // This is another bug you'll need to address. A workaround is storing file metadata and then handling uploads separately.
      const newFields = additionalFields.map((item, i) =>
        i === index ? { ...item, file } : item
      );
      setAdditionalFields(newFields);
      onFieldsChange?.(newFields);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFields = additionalFields.map((item, i) =>
      i === index ? { ...item, file: null } : item
    );
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  const handleNameChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = event.target.value;
    const newFields = additionalFields.map((item, i) =>
      i === index ? { ...item, name } : item
    );
    setAdditionalFields(newFields);
    onFieldsChange?.(newFields);
  };

  return (
    <div>
      {/* Dynamic Additional Fields */}
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
            />
          </div>
          <div className="relative">
            <Label className="text-sm font-medium mb-2 block text-gray-700">
              Upload File
            </Label>
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
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
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
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Add More Files Button */}
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
