import Image from "next/image";
import { XCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { FileWithMeta } from "./types";

interface FilePreviewOverlayProps {
  file: FileWithMeta;
  onClose: () => void;
}

export function FilePreviewOverlay({ file, onClose }: FilePreviewOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="font-semibold text-lg">{file.name}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle className="w-6 h-6" />
          </Button>
        </div>
        <div className="p-4">
          {file.url?.endsWith(".pdf") ? (
            <iframe src={file.url} className="w-full h-[80vh]" title={file.name} />
          ) : (
            <Image
              src={file.url || ""}
              alt={file.name}
              width={800}
              height={600}
              className="max-w-full h-auto rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}
