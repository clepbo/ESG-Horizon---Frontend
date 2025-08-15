"use client";

import { Camera } from "lucide-react";
import { useRef } from "react";

type PhotoUploadButtonProps = {
  onUpload?: (file: File) => void;
};

export default function PhotoUploadButton({
  onUpload,
}: PhotoUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <label
      className="absolute bottom-0 left-14 transform translate-x-1/2 translate-y-1/2 bg-white rounded-full border border-gray-300 p-2 shadow-sm hover:bg-gray-100 transition cursor-pointer"
      title="Upload Photo"
    >
      <Camera className="w-4 h-4 text-gray-700" />
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        ref={inputRef}
      />
    </label>
  );
}
