import type { FileWithMeta } from "./types";

/**
 * Extract files (supporting documents) from a data section.
 * Handles both `files: { [key]: FileMetadata }` and `additionalFields: FileMetadata[]` patterns.
 */
export function extractFiles(obj: any, section: string, target: FileWithMeta[]) {
  if (!obj) return;
  const push = (f: any) => {
    if (f?.url)
      target.push({
        name: f.name || "File",
        url: f.url,
        publicId: f.publicId,
        section,
        size: f.size,
        uploadedAt: f.uploadedAt || f.createdAt,
      });
  };
  if (obj.files && typeof obj.files === "object") {
    Object.values(obj.files).forEach(push);
  }
  if (Array.isArray(obj.additionalFields)) {
    obj.additionalFields.forEach(push);
  }
  if (Array.isArray(obj.filesAndLinks)) {
    obj.filesAndLinks.forEach(push);
  }
}
