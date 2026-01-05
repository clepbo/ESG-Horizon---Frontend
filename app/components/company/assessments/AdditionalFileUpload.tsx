// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import { CloudUpload, X, Plus, Trash2, FileText, Eye, ExternalLink } from "lucide-react";
// import { uploadService } from "@/services/upload.service";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
// import { toast } from "react-toastify";

// export interface FileData {
//   id?: string;
//   name: string;
//   size?: number;
//   lastModified?: number;
//   url?: string;
//   publicId?: string;
//   file?: File | null;
// }

// interface AdditionalFileUploadProps {
//   onFieldsChange?: (fields: FileData[]) => void;
//   initialData?: FileData[];
// }

// export function AdditionalFileUpload({ onFieldsChange, initialData }: AdditionalFileUploadProps) {
//   const [additionalFields, setAdditionalFields] = useState<FileData[]>(initialData || []);
//   const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
//   const [deleting, setDeleting] = useState<{ [key: number]: boolean }>({});
//   const [previewFile, setPreviewFile] = useState<FileData | null>(null);
//   const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

//   useEffect(() => {
//     if (initialData && JSON.stringify(initialData) !== JSON.stringify(additionalFields)) {
//       setAdditionalFields(initialData);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [initialData]);

//   const handleAddField = () => {
//     const newFields = [...additionalFields, { name: "", file: null }];
//     setAdditionalFields(newFields);
//     onFieldsChange?.(newFields);
//   };

//   const handleRemoveField = (index: number) => {
//     const newFields = additionalFields.filter((_, i) => i !== index);
//     setAdditionalFields(newFields);
//     onFieldsChange?.(newFields);
//   };

//   const handleFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error("File too large. Please select a file smaller than 10MB.");
//       return;
//     }

//     try {
//       setUploading((prev) => ({ ...prev, [index]: true }));

//       const uploaded = await uploadService.uploadImage(file);

//       console.log("Uploaded URL:", uploaded.url);

//       const newFields = additionalFields.map((item, i) =>
//         i === index
//           ? {
//               ...item,
//               name: item.name || file.name,
//               file: file,
//               url: uploaded.url,
//               publicId: uploaded.publicId,
//               size: file.size,
//               lastModified: file.lastModified,
//             }
//           : item
//       );

//       setAdditionalFields(newFields);
//       onFieldsChange?.(newFields);

//       setImageErrors((prev) => ({ ...prev, [index]: false }));

//       toast.success(`${file.name} uploaded successfully.`);
//     } catch (err) {
//       console.error("Upload failed:", err);
//       toast.error("There was an error uploading your file.");
//     } finally {
//       setUploading((prev) => ({ ...prev, [index]: false }));
//     }
//   };

//   const handleRemoveFile = async (index: number) => {
//     const fileData = additionalFields[index];

//     if (fileData?.publicId) {
//       try {
//         setDeleting((prev) => ({ ...prev, [index]: true }));
//         await uploadService.deleteImage(fileData.publicId);
//         toast.success("File was successfully removed.");
//       } catch (err) {
//         console.error("Delete failed:", err);
//         toast.error("There was an error deleting the file.");
//       } finally {
//         setDeleting((prev) => ({ ...prev, [index]: false }));
//       }
//     }

//     const newFields = additionalFields.map((item, i) =>
//       i === index ? { ...item, file: null, url: undefined, publicId: undefined } : item
//     );
//     setAdditionalFields(newFields);
//     onFieldsChange?.(newFields);

//     setImageErrors((prev) => ({ ...prev, [index]: false }));
//   };

//   const handleNameChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
//     const name = event.target.value;
//     const newFields = additionalFields.map((item, i) => (i === index ? { ...item, name } : item));
//     setAdditionalFields(newFields);
//     onFieldsChange?.(newFields);
//   };

//   const getFileExtension = (filename: string): string => {
//     if (!filename) return "";
//     return filename.split(".").pop()?.toLowerCase() || "";
//   };

//   const getFileType = (fieldData: FileData): "image" | "pdf" | "document" | "unknown" => {
//     if (fieldData.file?.type) {
//       if (fieldData.file.type.startsWith("image/")) return "image";
//       if (fieldData.file.type === "application/pdf") return "pdf";
//       if (fieldData.file.type.includes("document") || fieldData.file.type.includes("word"))
//         return "document";
//     }

//     const filename = fieldData.file?.name || fieldData.name || fieldData.url || "";
//     const ext = getFileExtension(filename);

//     const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
//     const pdfExtensions = ["pdf"];
//     const documentExtensions = ["doc", "docx", "txt", "rtf", "odt"];

//     if (imageExtensions.includes(ext)) return "image";
//     if (pdfExtensions.includes(ext)) return "pdf";
//     if (documentExtensions.includes(ext)) return "document";

//     return "unknown";
//   };

//   const isImageFile = (fieldData: FileData): boolean => {
//     return getFileType(fieldData) === "image";
//   };

//   const isPDFFile = (fieldData: FileData): boolean => {
//     return getFileType(fieldData) === "pdf";
//   };

//   const handlePreview = (fieldData: FileData) => {
//     setPreviewFile(fieldData);
//   };

//   const closePreview = () => {
//     setPreviewFile(null);
//   };

//   // Get thumbnail URL for display (converts PDF to image for Cloudinary)
//   const getThumbnailUrl = (fieldData: FileData): string => {
//     if (!fieldData.url) return "";

//     if (isPDFFile(fieldData) && fieldData.url.includes("cloudinary")) {
//       return fieldData.url.replace(/\.pdf$/, ".jpg");
//     }

//     return fieldData.url;
//   };

//   return (
//     <>
//       <div className="space-y-4">
//         {additionalFields.map((fieldData, index) => (
//           <div
//             key={index}
//             className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
//           >
//             <div className="flex-1 min-w-0">
//               <Label className="text-sm font-medium mb-2 block text-gray-700">
//                 Name of file/evidence
//               </Label>
//               <Input
//                 placeholder="Enter the name of the file/evidence"
//                 value={fieldData.name}
//                 onChange={(e) => handleNameChange(index, e)}
//                 className="border-gray-300 w-full"
//                 disabled={uploading[index] || deleting[index]}
//               />
//             </div>

//             <div className="flex-1 min-w-0">
//               <Label className="text-sm font-medium mb-2 block text-gray-700">Upload File</Label>

//               <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-start whitespace-nowrap min-w-0"
//                   onClick={() => {
//                     const input = document.getElementById(
//                       `additional-file-${index}`
//                     ) as HTMLInputElement;
//                     input?.click();
//                   }}
//                   disabled={uploading[index] || deleting[index]}
//                 >
//                   <div className="flex items-center gap-2 min-w-0">
//                     {uploading[index] ? (
//                       <>
//                         <LoadingSpinner size="sm" />
//                         <span className="truncate">Uploading...</span>
//                       </>
//                     ) : deleting[index] ? (
//                       <>
//                         <LoadingSpinner size="sm" />
//                         <span className="truncate text-red-500">Deleting...</span>
//                       </>
//                     ) : (
//                       <>
//                         <CloudUpload className="h-4 w-4 shrink-0" />
//                         <span className="truncate">
//                           {fieldData.file?.name ||
//                             fieldData.name ||
//                             fieldData.url?.split("/").pop() ||
//                             "Select file (max. 10MB)"}
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 </Button>

//                 <div className="flex items-center gap-2 shrink-0 flex-wrap">
//                   {fieldData.file && !uploading[index] && !deleting[index] && (
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleRemoveFile(index)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   )}

//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="icon"
//                     onClick={() => handleRemoveField(index)}
//                     className="border-red-300 text-red-500 hover:bg-red-50"
//                     disabled={uploading[index] || deleting[index]}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>

//               <Input
//                 id={`additional-file-${index}`}
//                 type="file"
//                 className="hidden"
//                 onChange={(e) => handleFileChange(index, e)}
//                 accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//               />

//               {/* Thumbnail Preview */}
//               {fieldData.url && (
//                 <div className="mt-3">
//                   <button
//                     type="button"
//                     onClick={() => handlePreview(fieldData)}
//                     className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-all shadow-sm bg-white w-24 h-24 flex items-center justify-center"
//                     title="Click to preview"
//                   >
//                     {isImageFile(fieldData) ||
//                     (isPDFFile(fieldData) && fieldData.url.includes("cloudinary")) ? (
//                       <div className="relative w-full h-full flex items-center justify-center bg-white">
//                         <Image
//                           src={getThumbnailUrl(fieldData)}
//                           alt={fieldData.name || "Preview"}
//                           width={96}
//                           height={96}
//                           className="w-full h-full object-cover block"
//                           unoptimized
//                           priority
//                           onError={() => setImageErrors((prev) => ({ ...prev, [index]: true }))}
//                         />
//                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
//                           <Eye className="h-6 w-6 text-white" />
//                         </div>
//                         {isPDFFile(fieldData) && (
//                           <div className="absolute bottom-0 left-0 right-0 bg-red-600/80 text-white text-[10px] py-0.5 text-center font-bold">
//                             PDF
//                           </div>
//                         )}
//                       </div>
//                     ) : (
//                       <div className="flex flex-col items-center justify-center p-2 text-blue-600">
//                         <FileText className="h-10 w-10" />
//                         <span className="text-[10px] font-bold uppercase mt-1">
//                           {getFileExtension(fieldData.file?.name || fieldData.name)}
//                         </span>
//                       </div>
//                     )}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}

//         <Button
//           type="button"
//           variant="outline"
//           onClick={handleAddField}
//           className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Add More Files
//         </Button>
//       </div>

//       {/* Preview Modal */}
//       {previewFile && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-9999"
//           onClick={closePreview}
//         >
//           <div
//             className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
//               <h3 className="text-lg font-semibold text-gray-900 truncate">
//                 {previewFile.name || previewFile.file?.name || "File Preview"}
//               </h3>
//               <button
//                 onClick={closePreview}
//                 className="text-gray-500 hover:text-gray-700 transition-colors shrink-0"
//               >
//                 <X className="h-6 w-6" />
//               </button>
//             </div>

//             {/* Content */}
//             <div className="flex-1 overflow-auto p-6 bg-gray-50">
//               {isImageFile(previewFile) ? (
//                 <div className="relative w-full min-h-[400px] flex items-center justify-center bg-white rounded-lg p-4">
//                   <Image
//                     src={previewFile.url!}
//                     alt={previewFile.name}
//                     width={800}
//                     height={600}
//                     className="max-w-full h-auto object-contain"
//                     unoptimized
//                     priority
//                   />
//                 </div>
//               ) : isPDFFile(previewFile) ? (
//                 <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
//                   <FileText className="h-20 w-20 mb-6 text-red-500" />
//                   <p className="text-xl mb-2 font-semibold text-gray-700">PDF Document</p>
//                   <p className="text-sm text-gray-500 mb-2 text-center max-w-md">
//                     {previewFile.name || "Document.pdf"}
//                   </p>
//                   <p className="text-xs text-gray-400 mb-8 text-center max-w-md">
//                     Click the button below to view or download this PDF file
//                   </p>
//                   <div className="flex gap-3">
//                     <Button
//                       type="button"
//                       onClick={() => {
//                         const link = document.createElement("a");
//                         link.href = previewFile.url!;
//                         link.target = "_blank";
//                         link.rel = "noopener noreferrer";
//                         document.body.appendChild(link);
//                         link.click();
//                         document.body.removeChild(link);
//                       }}
//                       className="bg-red-600 hover:bg-red-700 text-white"
//                     >
//                       <ExternalLink className="h-4 w-4 mr-2" />
//                       Open PDF
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         const link = document.createElement("a");
//                         link.href = previewFile.url!;
//                         link.download = previewFile.name || "document.pdf";
//                         document.body.appendChild(link);
//                         link.click();
//                         document.body.removeChild(link);
//                       }}
//                       className="border-gray-300"
//                     >
//                       Download PDF
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white rounded-lg">
//                   <FileText className="h-16 w-16 mb-4 text-blue-600" />
//                   <p className="text-lg mb-2 font-semibold text-gray-700">Document File</p>
//                   <p className="text-sm text-gray-500 mb-4">{previewFile.name || "Unknown file"}</p>
//                   <p className="text-sm text-gray-400 mb-6 max-w-md text-center">
//                     Preview not available for{" "}
//                     {getFileExtension(previewFile.name || "").toUpperCase()} files. Download to
//                     view.
//                   </p>
//                   <Button
//                     type="button"
//                     onClick={() => window.open(previewFile.url, "_blank")}
//                     className="bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     <ExternalLink className="h-4 w-4 mr-2" />
//                     Download File
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CloudUpload, X, Plus, Trash2, FileText, Eye, ExternalLink } from "lucide-react";
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
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

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

      console.log("Uploaded URL:", uploaded.url);

      const newFields = additionalFields.map((item, i) =>
        i === index
          ? {
              ...item,
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

      setImageErrors((prev) => ({ ...prev, [index]: false }));

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

    setImageErrors((prev) => ({ ...prev, [index]: false }));
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
    if (fieldData.file?.type) {
      if (fieldData.file.type.startsWith("image/")) return "image";
      if (fieldData.file.type === "application/pdf") return "pdf";
      if (fieldData.file.type.includes("document") || fieldData.file.type.includes("word"))
        return "document";
    }

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

  // Get thumbnail URL for display (converts PDF to image for Cloudinary)
  const getThumbnailUrl = (fieldData: FileData): string => {
    if (!fieldData.url) return "";

    // For PDFs uploaded to Cloudinary, convert to jpg for thumbnail
    if (isPDFFile(fieldData) && fieldData.url.includes("cloudinary")) {
      // Replace the file extension in the URL with .jpg
      // This works because Cloudinary automatically converts PDFs to images
      return fieldData.url.replace(/\.[^.]+$/, ".jpg");
    }

    return fieldData.url;
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

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
              {fieldData.url && !imageErrors[index] && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handlePreview(fieldData)}
                    className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-all shadow-sm bg-white w-24 h-24 flex items-center justify-center"
                    title="Click to preview"
                  >
                    {isImageFile(fieldData) || isPDFFile(fieldData) ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-white">
                        <Image
                          src={getThumbnailUrl(fieldData)}
                          alt={fieldData.name || "Preview"}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover block"
                          unoptimized
                          priority
                          onError={() => {
                            console.error("Image load error for:", getThumbnailUrl(fieldData));
                            setImageErrors((prev) => ({ ...prev, [index]: true }));
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                        {isPDFFile(fieldData) && (
                          <div className="absolute bottom-0 left-0 right-0 bg-red-600/80 text-white text-[10px] py-0.5 text-center font-bold">
                            PDF
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-blue-600">
                        <FileText className="h-10 w-10" />
                        <span className="text-[10px] font-bold uppercase mt-1">
                          {getFileExtension(fieldData.file?.name || fieldData.name)}
                        </span>
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
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-9999"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col shadow-2xl"
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
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {isImageFile(previewFile) ? (
                <div className="relative w-full min-h-[400px] flex items-center justify-center bg-white rounded-lg p-4">
                  <Image
                    src={previewFile.url!}
                    alt={previewFile.name}
                    width={800}
                    height={600}
                    className="max-w-full h-auto object-contain"
                    unoptimized
                    priority
                  />
                </div>
              ) : isPDFFile(previewFile) ? (
                <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <FileText className="h-20 w-20 mb-6 text-red-500" />
                  <p className="text-xl mb-2 font-semibold text-gray-700">PDF Document</p>
                  <p className="text-sm text-gray-500 mb-2 text-center max-w-md">
                    {previewFile.name || "Document.pdf"}
                  </p>
                  <p className="text-xs text-gray-400 mb-8 text-center max-w-md">
                    Click the button below to view or download this PDF file
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = previewFile.url!;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open PDF
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = previewFile.url!;
                        link.download = previewFile.name || "document.pdf";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="border-gray-300"
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white rounded-lg">
                  <FileText className="h-16 w-16 mb-4 text-blue-600" />
                  <p className="text-lg mb-2 font-semibold text-gray-700">Document File</p>
                  <p className="text-sm text-gray-500 mb-4">{previewFile.name || "Unknown file"}</p>
                  <p className="text-sm text-gray-400 mb-6 max-w-md text-center">
                    Preview not available for{" "}
                    {getFileExtension(previewFile.name || "").toUpperCase()} files. Download to
                    view.
                  </p>
                  <Button
                    type="button"
                    onClick={() => window.open(previewFile.url, "_blank")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
