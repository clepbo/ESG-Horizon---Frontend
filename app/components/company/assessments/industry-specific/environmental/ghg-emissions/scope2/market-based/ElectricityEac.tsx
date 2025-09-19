"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  CloudUpload,
  X,
} from "lucide-react";
import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";

interface ElectricityEACFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Energy Attribute Certificates (EACs) or RECs",
  "Grid consumption invoices",
  "Contracts/purchase agreements",
];

export function ElectricityEACForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
}: ElectricityEACFormProps) {
  const { state, dispatch } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [gridElectricity, setGridElectricity] = useState("");
  const [emissionFactor, setEmissionFactor] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [errors, setErrors] = useState<{
    gridElectricity?: string;
    emissionFactor?: string;
    files?: string;
  }>({});
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const existingData = state.assessmentData.eac;
    if (existingData) {
      setGridElectricity(existingData.gridElectricity || "");
      setEmissionFactor(existingData.emissionFactor || "");
      setFiles(
        existingData.files ??
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
      setAdditionalFields(existingData.additionalFields || []);
    }
  }, [state.assessmentData?.eac]);
  // Use the filled and total values from the calculateProgress function
  const { filled, total } = useMemo(() => {
    return calculateProgress([
      gridElectricity,
      emissionFactor,
      Object.values(files).some(Boolean) ||
        additionalFields.some((field) => field.file),
    ]);
  }, [gridElectricity, emissionFactor, files, additionalFields]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!gridElectricity || Number(gridElectricity) <= 0) {
      newErrors.gridElectricity = "Please enter a valid positive number.";
    }
    if (!emissionFactor || Number(emissionFactor) <= 0) {
      newErrors.emissionFactor =
        "Please enter a valid positive emission factor.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
            publicId: uploaded.publicId,
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

  const savePayload = () => {
    const payload = {
      gridElectricity,
      emissionFactor,
      files,
      additionalFields,
    };
    dispatch({ type: "UPDATE_EAC", payload });

    return payload;
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;

    setIsSaving(true);
    savePayload();
    dispatch({ type: "SAVE_PROGRESS" });

    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;
    savePayload();
    onNext();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };
  const handleRemoveFile = async (key: string) => {
    const file = files[key];
    if (file?.publicId) {
      try {
        // Start the deleting state for this specific file
        setDeleting((prev) => ({ ...prev, [key]: true }));

        await uploadService.deleteImage(file.publicId);
        toast.success("File deleted successfully");
      } catch (err) {
        toast.error("Failed to delete file");
        console.error(err);
      } finally {
        // Stop the deleting state regardless of success or failure
        setDeleting((prev) => ({ ...prev, [key]: false }));

        // Always remove the file from local state and clear the input field
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
      }
    } else {
      // If there is no publicId, just remove the file from the local state
      setFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
      if (inputRefs.current[key]) {
        inputRefs.current[key]!.value = "";
      }
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
              Purchased Electricity with Energy Attribute Certificates (Scope 2
              – Market Based)
            </h3>
            <p className="text-muted-foreground text-base">
              Report grid electricity consumption backed by Energy Attribute
              Certificates (EACs/RECs) and supplier-specific emission factors.
            </p>
          </div>
        </div>

        <Card className="bg-gray-50 pt-6">
          <CardContent className="space-y-8">
            {/* Progress */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Grid Electricity */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                2.1 Purchased Electricity (with Energy Attribute Certificates –
                EACs / RECs)
              </Label>
              <div className="space-y-4 ml-6">
                <Label className="text-base font-medium text-gray-900 mb-2 block">
                  Total grid electricity consumed (kWh)
                </Label>
                <Input
                  type="number"
                  placeholder="Enter total grid electricity consumed"
                  value={gridElectricity}
                  onChange={(e) => {
                    setGridElectricity(e.target.value);
                    if (errors.gridElectricity)
                      setErrors((prev) => ({
                        ...prev,
                        gridElectricity: undefined,
                      }));
                  }}
                  className={`w-full border-gray-400 ${
                    errors.gridElectricity ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.gridElectricity && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.gridElectricity}
                </p>
              )}
            </div>

            {/* EAC / REC Certificate Upload */}
            <div className="ml-6 mt-6">
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                Upload EAC / REC Certificate
              </Label>
              <Card className="p-4 flex flex-col items-center justify-center border-2">
                <Label
                  htmlFor="upload-eac-rec"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <CloudUpload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-gray-400 text-center">
                    Attach Energy Attribute Certificate or Renewable Energy
                    Certificate proving renewable sourcing. (Max. 10mb)
                  </span>
                </Label>

                <Input
                  id="upload-eac-rec"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange("EAC / REC Certificate", e)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                {files["EAC / REC Certificate"] && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-green-600 break-words max-w-full text-center">
                      Uploaded: {files["EAC / REC Certificate"]!.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("EAC / REC Certificate")}
                      className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <X />
                    </button>
                  </div>
                )}
              </Card>
            </div>

            {/* Emission Factor */}
            <div className="ml-6">
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                Emission Factor Applied
              </Label>
              <Input
                type="number"
                step="0.0001"
                placeholder="Enter supplier-specific emission factor"
                value={emissionFactor}
                onChange={(e) => {
                  setEmissionFactor(e.target.value);
                  if (errors.emissionFactor)
                    setErrors((prev) => ({
                      ...prev,
                      emissionFactor: undefined,
                    }));
                }}
                className={`w-full border-gray-400 ${
                  errors.emissionFactor ? "border-red-500" : ""
                }`}
              />
              {errors.emissionFactor && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.emissionFactor}
                </p>
              )}
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                2.2 Documents / Evidence Upload
              </Label>
              <div className="ml-6">
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
                          id={`upload-${field
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
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
                        ) : deleting[field] ? (
                          <div className="flex items-center gap-2 mt-2 text-red-500">
                            <LoadingSpinner size="sm" /> Deleting...
                          </div>
                        ) : files[field] ? (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-sm text-green-600 break-words max-w-full text-center">
                              Uploaded: {files[field]!.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(field)}
                              disabled={deleting[field]} // Disable button while deleting
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
              </div>
              <div className="mt-6">
                <AdditionalFileUpload
                  onFieldsChange={handleAdditionalFieldsChange}
                  initialData={additionalFields}
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
// import {
//   ArrowLeft,
//   ArrowRight,
//   Save,
//   CheckCircle2,
//   CloudUpload,
//   X,
// } from "lucide-react";
// import { FileMetadata, useAssessment } from "@/hooks/useAssessment";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

// interface ElectricityEACFormProps {
//   onBack: () => void;
//   onNext: () => void;
//   stepIndex: number;
//   totalSteps: number;
//   percent: number;
// }

// const uploadFields = [
//   "Energy Attribute Certificates (EACs) or RECs",
//   "Grid consumption invoices",
//   "Contracts/purchase agreements",
// ];

// export function ElectricityEACForm({
//   onBack,
//   onNext,
//   stepIndex,
//   totalSteps,
//   percent,
// }: ElectricityEACFormProps) {
//   const { state, dispatch } = useAssessment();
//   const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
//   const [gridElectricity, setGridElectricity] = useState("");
//   const [emissionFactor, setEmissionFactor] = useState("");
//   const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
//     Object.fromEntries(uploadFields.map((field) => [field, null]))
//   );

//   const [errors, setErrors] = useState<{
//     gridElectricity?: string;
//     emissionFactor?: string;
//     files?: string;
//   }>({});

//   const [isSaving, setIsSaving] = useState(false);
//   const [showSaveSuccess, setShowSaveSuccess] = useState(false);

//   useEffect(() => {
//     const existingData = state.assessmentData.eac;
//     if (existingData) {
//       setGridElectricity(existingData.gridElectricity || "");
//       setEmissionFactor(existingData.emissionFactor || "");
//       setFiles(
//         existingData.files ??
//           Object.fromEntries(uploadFields.map((field) => [field, null]))
//       );
//     }
//   }, [state.assessmentData?.eac]);

//   const validateForm = () => {
//     const newErrors: typeof errors = {};

//     if (!gridElectricity || Number(gridElectricity) <= 0) {
//       newErrors.gridElectricity = "Please enter a valid positive number.";
//     }
//     if (!emissionFactor || Number(emissionFactor) <= 0) {
//       newErrors.emissionFactor =
//         "Please enter a valid positive emission factor.";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
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

//   const savePayload = () => {
//     const payload = { gridElectricity, emissionFactor, files };
//     dispatch({ type: "UPDATE_EAC", payload });

//     return payload;
//   };

//   const handleSaveAndContinue = () => {
//     if (!validateForm()) return;

//     setIsSaving(true);
//     savePayload();
//     dispatch({ type: "SAVE_PROGRESS" });

//     setIsSaving(false);
//     setShowSaveSuccess(true);
//     setTimeout(() => setShowSaveSuccess(false), 2000);
//   };

//   const handleNext = () => {
//     if (!validateForm()) return;
//     savePayload();
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
//               Purchased Electricity with Energy Attribute Certificates (Scope 2
//               – Market Based)
//             </h3>
//             <p className="text-muted-foreground text-base">
//               Report grid electricity consumption backed by Energy Attribute
//               Certificates (EACs/RECs) and supplier-specific emission factors.
//             </p>
//           </div>
//         </div>

//         <Card className="bg-gray-50 pt-6">
//           <CardContent className="space-y-8">
//             {/* Progress */}
//             <div className="mb-6">
//               <div className="flex justify-between mb-2">
//                 <span className="text-sm text-gray-500">
//                   Section {stepIndex} of {totalSteps}
//                 </span>
//                 <span className="text-sm text-gray-500">
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

//             {/* Grid Electricity */}
//             <div>
//               <Label className="text-base font-medium text-gray-900 mb-2 block">
//                 2.1 Purchased Electricity (with Energy Attribute Certificates –
//                 EACs / RECs)
//               </Label>
//               <div className="space-y-4 ml-6">
//                 <Label className="text-base font-medium text-gray-900 mb-2 block">
//                   Total grid electricity consumed (kWh)
//                 </Label>
//                 <Input
//                   type="number"
//                   placeholder="Enter total grid electricity consumed"
//                   value={gridElectricity}
//                   onChange={(e) => {
//                     setGridElectricity(e.target.value);
//                     if (errors.gridElectricity)
//                       setErrors((prev) => ({
//                         ...prev,
//                         gridElectricity: undefined,
//                       }));
//                   }}
//                   className={`w-full border-gray-400 ${
//                     errors.gridElectricity ? "border-red-500" : ""
//                   }`}
//                 />
//               </div>
//               {errors.gridElectricity && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.gridElectricity}
//                 </p>
//               )}
//             </div>

//             {/* EAC / REC Certificate Upload */}
//             <div className="ml-6 mt-6">
//               <Label className="text-base font-medium text-gray-900 mb-2 block">
//                 Upload EAC / REC Certificate
//               </Label>
//               <Card className="p-4 flex flex-col items-center justify-center border-2">
//                 <Label
//                   htmlFor="upload-eac-rec"
//                   className="cursor-pointer flex flex-col items-center gap-2"
//                 >
//                   <CloudUpload className="h-6 w-6 text-muted-foreground" />
//                   <span className="text-xs text-gray-400 text-center">
//                     Attach Energy Attribute Certificate or Renewable Energy
//                     Certificate proving renewable sourcing. (Max. 10mb)
//                   </span>
//                 </Label>

//                 <Input
//                   id="upload-eac-rec"
//                   type="file"
//                   className="hidden"
//                   onChange={(e) => handleFileChange("EAC / REC Certificate", e)}
//                   accept=".pdf,.jpg,.jpeg,.png"
//                 />

//                 {files["EAC / REC Certificate"] && (
//                   <div className="flex items-center gap-2 mt-2">
//                     <p className="text-sm text-green-600 break-words max-w-full text-center">
//                       Uploaded: {files["EAC / REC Certificate"]!.name}
//                     </p>
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveFile("EAC / REC Certificate")}
//                       className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
//                     >
//                       <X />
//                     </button>
//                   </div>
//                 )}
//               </Card>
//             </div>

//             {/* Emission Factor */}
//             <div className="ml-6">
//               <Label className="text-base font-medium text-gray-900 mb-2 block">
//                 Emission Factor Applied
//               </Label>
//               <Input
//                 type="number"
//                 step="0.0001"
//                 placeholder="Enter supplier-specific emission factor"
//                 value={emissionFactor}
//                 onChange={(e) => {
//                   setEmissionFactor(e.target.value);
//                   if (errors.emissionFactor)
//                     setErrors((prev) => ({
//                       ...prev,
//                       emissionFactor: undefined,
//                     }));
//                 }}
//                 className={`w-full border-gray-400 ${
//                   errors.emissionFactor ? "border-red-500" : ""
//                 }`}
//               />
//               {errors.emissionFactor && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.emissionFactor}
//                 </p>
//               )}
//             </div>

//             {/* Uploads */}
//             <div>
//               <Label className="text-base font-medium text-gray-900 mb-2 block">
//                 2.2 Documents / Evidence Upload
//               </Label>
//               {errors.files && (
//                 <p className="text-sm text-red-500 mb-2">{errors.files}</p>
//               )}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-8">
//                 {uploadFields.map((field) => (
//                   <div key={field} className="flex flex-col gap-2">
//                     <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
//                       {field}
//                     </Label>
//                     <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
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
