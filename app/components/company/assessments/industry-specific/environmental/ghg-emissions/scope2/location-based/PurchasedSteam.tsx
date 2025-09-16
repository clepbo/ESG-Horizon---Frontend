"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Textarea } from "@/app/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ArrowRight,
  CloudUpload,
  X,
} from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";

interface PurchasedSteamFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Supplier invoices for steam purchases",
  "Metered records of steam consumption",
  "Contracts or agreements with third-party providers",
];

const steamSources = [
  { id: "industrial-supplier", label: "Industrial Supplier" },
  { id: "district-heating", label: "District Heating/Steam Plant" },
];

export function PurchasedSteamForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
}: PurchasedSteamFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [steamConsumed, setSteamConsumed] = useState("");
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [otherComments, setOtherComments] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [errors, setErrors] = useState<{
    steamConsumed?: string;
    selectedSources?: string;
    files?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const existingData = state.assessmentData.steam;

    if (existingData) {
      setSteamConsumed(existingData.volume || "");

      setSelectedSources(existingData.selectedSources || []);
      setOtherComments(existingData.otherComments || "");
      setFiles(
        existingData.files ??
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData.steam]);
  const { total, filled } = calculateProgress([
    steamConsumed,
    Array.isArray(selectedSources) && selectedSources.length > 0,
    Object.values(files).some(Boolean) || additionalFields.length > 0,
  ]);
  const validateForm = () => {
    const newErrors: {
      steamConsumed?: string;
      selectedSources?: string;
      files?: string;
    } = {};

    if (!steamConsumed || Number(steamConsumed) <= 0) {
      newErrors.steamConsumed = "Please enter a valid positive number";
    }

    if (selectedSources.length === 0) {
      newErrors.selectedSources = "Please select at least one steam source";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSourceChange = (sourceId: string, checked: boolean) => {
    setSelectedSources((prev) =>
      checked ? [...prev, sourceId] : prev.filter((id) => id !== sourceId)
    );
    if (errors.selectedSources) {
      setErrors((prev) => ({ ...prev, selectedSources: undefined }));
    }
  };

  const handleFileChange = async (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        files: `File "${field}" exceeds 10MB limit`,
      }));
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [field]: true })); // start spinner

      const uploaded = await uploadService.uploadImage(file);

      if (uploaded?.url) {
        setFiles((prev) => ({
          ...prev,
          [field]: {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
            url: uploaded.url,
          },
        }));

        toast.success(`${file.name} uploaded successfully`);
      } else {
        toast.error("Failed to upload file");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading file");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false })); // stop spinner
    }

    if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
  };
  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };
  const handleSaveAndContinue = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      volume: steamConsumed,

      selectedSources,
      otherComments,
      files,
    };

    dispatch({ type: "UPDATE_STEAM", payload });
    dispatch({ type: "SAVE_PROGRESS" });

    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;

    const payload = {
      volume: steamConsumed,

      selectedSources,
      otherComments,
      files,
    };

    dispatch({
      type: "UPDATE_STEAM",
      payload,
    });

    onNext();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveFile = async (key: string) => {
    const file = files[key];
    if (file?.publicId) {
      try {
        await uploadService.deleteImage(file.publicId);
        toast.success("File deleted successfully");
      } catch (err) {
        toast.error("Failed to delete file");
        console.error(err);
      }
    }

    setFiles((prev) => ({
      ...prev,
      [key]: null,
    }));

    if (inputRefs.current[key]) {
      inputRefs.current[key]!.value = "";
    }

    if (errors.files) {
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Scope 2: Purchased Steam
            </h3>
            <p className="text-muted-foreground text-base">
              Emissions from steam purchased for your facilities
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            {/* Progress bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />
            {/* Steam Consumed */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                3.1 Purchased Steam
              </Label>
              <div className="space-y-4 ml-6">
                <Label htmlFor="steam-consumed">Steam Consumed (tonnes)</Label>
                <Input
                  id="steam-consumed"
                  type="number"
                  placeholder="Enter amount in tonnes"
                  value={steamConsumed}
                  onChange={(e) => setSteamConsumed(e.target.value)}
                  className={`w-full border-gray-400 ${
                    errors.steamConsumed ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.steamConsumed && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.steamConsumed}
                </p>
              )}
            </div>

            {/* Steam Sources */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                Source of Steam
              </Label>
              <div className="space-y-3 ml-6">
                {steamSources.map((src) => (
                  <div key={src.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={src.id}
                      checked={selectedSources.includes(src.id)}
                      onCheckedChange={(checked) =>
                        handleSourceChange(src.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={src.id}>{src.label}</Label>
                  </div>
                ))}
              </div>
              {errors.selectedSources && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.selectedSources}
                </p>
              )}
            </div>

            {/* Others */}
            <div className="ml-6">
              <Label htmlFor="other-comments">Others</Label>
              <Textarea
                id="others"
                placeholder="Please specify"
                value={otherComments}
                onChange={(e) => setOtherComments(e.target.value)}
                rows={3}
              />
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                3.2 Documents/Evidence Uploads
              </Label>
              {errors.files && (
                <p className="text-sm text-red-500">{errors.files}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadFields.map((field) => (
                  <div key={field} className="flex flex-col gap-2">
                    <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
                      {field}
                    </Label>
                    <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
                      <Label
                        htmlFor={`upload-${field
                          .replace(/\s/g, "-")
                          .toLowerCase()}`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <CloudUpload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-gray-400 text-center">
                          Upload {field} (Max. 10MB)
                        </span>
                      </Label>
                      <Input
                        id={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
                        type="file"
                        ref={(el) => {
                          inputRefs.current[field] = el;
                        }}
                        className="hidden"
                        onChange={(e) => handleFileChange(field, e)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        aria-label={`Upload ${field}`}
                      />
                      {uploading[field] ? (
                        <div className="flex items-center gap-2 mt-2 text-gray-500">
                          <LoadingSpinner size="sm" /> Uploading...
                        </div>
                      ) : files[field] ? (
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-sm text-green-600 break-words max-w-full text-center">
                            Uploaded: {files[field]!.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(field)}
                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                            aria-label={`Remove ${field}`}
                          >
                            <X />
                          </button>
                        </div>
                      ) : null}
                    </Card>
                  </div>
                ))}
              </div>
              <div className="mx-6 mt-6">
                <AdditionalFileUpload
                  onFieldsChange={handleAdditionalFieldsChange}
                />
              </div>
            </div>

            {/* Save Status */}
            {isSaving ? (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <LoadingSpinner size="sm" /> Saving...
              </div>
            ) : showSaveSuccess ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Saved successfully!
              </p>
            ) : null}

            {/* Nav Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="cursor-pointer justify-self-start border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 text-white hover:bg-green-300 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save & Continue Later
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={isSaving}
                className="cursor-pointer justify-self-end border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Card, CardContent } from "@/app/components/ui/card";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import { Checkbox } from "@/app/components/ui/checkbox";
// import { Textarea } from "@/app/components/ui/textarea";
// import {
//   ArrowLeft,
//   Save,
//   CheckCircle2,
//   ArrowRight,
//   CloudUpload,
//   X,
// } from "lucide-react";
// import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

// interface PurchasedSteamFormProps {
//   onBack: () => void;
//   onNext: () => void;
//   stepIndex: number;
//   totalSteps: number;
//   percent: number;
// }

// const uploadFields = [
//   "Supplier invoices for steam purchases",
//   "Metered records of steam consumption",
//   "Contracts or agreements with third-party providers",
// ];

// const steamSources = [
//   { id: "industrial-supplier", label: "Industrial Supplier" },
//   { id: "district-heating", label: "District Heating/Steam Plant" },
// ];

// export function PurchasedSteamForm({
//   onBack,
//   onNext,
//   stepIndex,
//   totalSteps,
//   percent,
// }: PurchasedSteamFormProps) {
//   const { state, dispatch } = useAssessment();
//   const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
//   const [steamConsumed, setSteamConsumed] = useState("");

//   const [selectedSources, setSelectedSources] = useState<string[]>([]);
//   const [otherComments, setOtherComments] = useState("");
//   const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
//     Object.fromEntries(uploadFields.map((field) => [field, null]))
//   );

//   const [errors, setErrors] = useState<{
//     steamConsumed?: string;
//     selectedSources?: string;
//     files?: string;
//   }>({});
//   const [isSaving, setIsSaving] = useState(false);
//   const [showSaveSuccess, setShowSaveSuccess] = useState(false);

//   useEffect(() => {
//     const existingData = state.assessmentData.steam;

//     if (existingData) {
//       setSteamConsumed(existingData.volume || "");

//       setSelectedSources(existingData.selectedSources || []);
//       setOtherComments(existingData.otherComments || "");
//       setFiles(
//         existingData.files ??
//           Object.fromEntries(uploadFields.map((field) => [field, null]))
//       );
//     }
//   }, [state.assessmentData.steam]);

//   const validateForm = () => {
//     const newErrors: {
//       steamConsumed?: string;
//       selectedSources?: string;
//       files?: string;
//     } = {};

//     if (!steamConsumed || Number(steamConsumed) <= 0) {
//       newErrors.steamConsumed = "Please enter a valid positive number";
//     }

//     if (selectedSources.length === 0) {
//       newErrors.selectedSources = "Please select at least one steam source";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSourceChange = (sourceId: string, checked: boolean) => {
//     setSelectedSources((prev) =>
//       checked ? [...prev, sourceId] : prev.filter((id) => id !== sourceId)
//     );
//     if (errors.selectedSources) {
//       setErrors((prev) => ({ ...prev, selectedSources: undefined }));
//     }
//   };

//   const handleFileChange = (
//     field: string,
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (file.size > 10 * 1024 * 1024) {
//         setErrors((prev) => ({
//           ...prev,
//           files: `File "${field}" exceeds 10MB limit`,
//         }));
//         return;
//       }
//       setFiles((prev) => ({
//         ...prev,
//         [field]: {
//           file,
//           name: file.name,
//           size: file.size,
//           lastModified: file.lastModified,
//         },
//       }));
//       if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
//     }
//   };

//   const handleSaveAndContinue = async () => {
//     if (!validateForm()) return;

//     setIsSaving(true);
//     const payload = {
//       volume: steamConsumed,

//       selectedSources,
//       otherComments,
//       files,
//     };

//     dispatch({ type: "UPDATE_STEAM", payload });
//     dispatch({ type: "SAVE_PROGRESS" });

//     setIsSaving(false);
//     setShowSaveSuccess(true);
//     setTimeout(() => setShowSaveSuccess(false), 2000);
//   };

//   const handleNext = () => {
//     if (!validateForm()) return;

//     const payload = {
//       volume: steamConsumed,

//       selectedSources,
//       otherComments,
//       files,
//     };

//     dispatch({
//       type: "UPDATE_STEAM",
//       payload,
//     });

//     onNext();
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleRemoveFile = (key: string) => {
//     setFiles((prev) => ({
//       ...prev,
//       [key]: null,
//     }));
//     if (inputRefs.current[key]) {
//       inputRefs.current[key]!.value = "";
//     }

//     if (errors.files) {
//       setErrors((prev) => ({ ...prev, files: undefined }));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex items-center gap-6 mb-4">
//           <Button
//             variant="outline"
//             onClick={onBack}
//             className="cursor-pointer flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
//           >
//             <ArrowLeft className="h-4 w-4" /> Back
//           </Button>
//           <div>
//             <h3 className="text-2xl font-semibold text-foreground">
//               Scope 2: Purchased Steam
//             </h3>
//             <p className="text-muted-foreground text-base">
//               Emissions from steam purchased for your facilities
//             </p>
//           </div>
//         </div>

//         <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
//           <CardContent className="space-y-8">
//             {/* Progress bar */}
//             <div className="mb-6">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-sm font-medium text-gray-500">
//                   Section {stepIndex} of {totalSteps}
//                 </span>
//                 <span className="text-sm font-medium text-gray-500">
//                   {percent}% complete
//                 </span>
//               </div>
//               <div className="w-full h-3 bg-green-300 rounded-lg">
//                 <div
//                   className="h-3 bg-green-800 rounded transition-all duration-300"
//                   style={{ width: `${percent}%` }}
//                 />
//               </div>
//             </div>

//             {/* Steam Consumed */}
//             <div>
//               <Label className="text-md font-semibold mb-2 block">
//                 3.1 Purchased Steam
//               </Label>
//               <div className="space-y-4 ml-6">
//                 <Label htmlFor="steam-consumed">Steam Consumed (tonnes)</Label>
//                 <Input
//                   id="steam-consumed"
//                   type="number"
//                   placeholder="Enter amount in tonnes"
//                   value={steamConsumed}
//                   onChange={(e) => setSteamConsumed(e.target.value)}
//                   className={`w-full border-gray-400 ${
//                     errors.steamConsumed ? "border-red-500" : ""
//                   }`}
//                 />
//               </div>
//               {errors.steamConsumed && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.steamConsumed}
//                 </p>
//               )}
//             </div>

//             {/* Steam Sources */}
//             <div>
//               <Label className="text-md font-medium mb-2 block">
//                 Source of Steam
//               </Label>
//               <div className="space-y-3 ml-6">
//                 {steamSources.map((src) => (
//                   <div key={src.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={src.id}
//                       checked={selectedSources.includes(src.id)}
//                       onCheckedChange={(checked) =>
//                         handleSourceChange(src.id, checked as boolean)
//                       }
//                     />
//                     <Label htmlFor={src.id}>{src.label}</Label>
//                   </div>
//                 ))}
//               </div>
//               {errors.selectedSources && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.selectedSources}
//                 </p>
//               )}
//             </div>

//             {/* Others */}
//             <div className="ml-6">
//               <Label htmlFor="other-comments">Others</Label>
//               <Textarea
//                 id="others"
//                 placeholder="Please specify"
//                 value={otherComments}
//                 onChange={(e) => setOtherComments(e.target.value)}
//                 rows={3}
//               />
//             </div>

//             {/* Uploads */}
//             <div>
//               <Label className="text-md font-semibold mb-2 block">
//                 3.2 Documents/Evidence Uploads
//               </Label>
//               {errors.files && (
//                 <p className="text-sm text-red-500">{errors.files}</p>
//               )}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {uploadFields.map((field) => (
//                   <div key={field} className="flex flex-col gap-2">
//                     <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
//                       {field}
//                     </Label>
//                     <Card className="p-4 flex flex-col items-center justify-center border hover:border-solid hover:border-primary transition-all">
//                       <Label
//                         htmlFor={`upload-${field
//                           .replace(/\s/g, "-")
//                           .toLowerCase()}`}
//                         className="cursor-pointer flex flex-col items-center gap-2"
//                       >
//                         <CloudUpload className="h-6 w-6 text-muted-foreground" />
//                         <span className="text-xs text-gray-400 text-center">
//                           Upload {field} (Max. 10MB)
//                         </span>
//                       </Label>
//                       <Input
//                         id={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
//                         type="file"
//                         ref={(el) => {
//                           inputRefs.current[field] = el;
//                         }}
//                         className="hidden"
//                         onChange={(e) => handleFileChange(field, e)}
//                         accept=".pdf,.jpg,.jpeg,.png"
//                         aria-label={`Upload ${field}`}
//                       />
//                       {files[field] && (
//                         <div className="flex items-center gap-2 mt-2">
//                           <p className="text-sm text-green-600 break-words max-w-full text-center">
//                             Uploaded: {files[field]!.name}
//                           </p>
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveFile(field)}
//                             className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
//                             aria-label={`Remove ${field}`}
//                           >
//                             <X />
//                           </button>
//                         </div>
//                       )}
//                     </Card>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Save Status */}
//             {isSaving ? (
//               <div className="text-sm text-gray-500 flex items-center gap-2">
//                 <LoadingSpinner size="sm" /> Saving...
//               </div>
//             ) : showSaveSuccess ? (
//               <p className="text-sm text-green-600 flex items-center gap-1">
//                 <CheckCircle2 className="h-4 w-4" /> Saved successfully!
//               </p>
//             ) : null}

//             {/* Nav Buttons */}
//             <div className="grid grid-cols-3 gap-4 pt-8">
//               <Button
//                 variant="outline"
//                 onClick={onBack}
//                 className="cursor-pointer justify-self-start border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
//               >
//                 <ArrowLeft className="h-4 w-4" /> Previous
//               </Button>

//               <Button
//                 variant="outline"
//                 onClick={handleSaveAndContinue}
//                 disabled={isSaving}
//                 className="justify-self-center bg-green-500 text-white hover:bg-green-300 cursor-pointer"
//               >
//                 {isSaving ? (
//                   <>
//                     <LoadingSpinner size="sm" className="mr-2" /> Saving...
//                   </>
//                 ) : showSaveSuccess ? (
//                   <>
//                     <CheckCircle2 className="h-4 w-4 mr-2" /> Saved!
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4 mr-2" /> Save & Continue Later
//                   </>
//                 )}
//               </Button>

//               <Button
//                 variant="outline"
//                 onClick={handleNext}
//                 disabled={isSaving}
//                 className="cursor-pointer justify-self-end border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
//               >
//                 Next <ArrowRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
