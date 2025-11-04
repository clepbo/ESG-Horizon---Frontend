"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CloudUpload, ArrowLeft, ArrowRight, Save, CheckCircle2, X } from "lucide-react";
import { useAssessment, FileMetadata } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import {
  AdditionalFileUpload,
  FileData,
} from "@/app/components/company/assessments/AdditionalFileUpload";
import { uploadService } from "@/services/upload.service";
import { useSaveAssessment } from "@/services/hooks/assessment.hooks";
import { toast } from "react-toastify";
import { useFormattedNumber } from "@/hooks/useNumberFormater";

interface VentingNaturalGasProps {
  onBack: () => void;
  onNext: () => void;
  onBackToHub: () => void;
  stepIndex: number;
  totalSteps: number;
}

const uploadFields = [
  "Venting event logs (time, duration, pressure)",
  "Simulation model outputs (when direct measurement missing)",
];

export function VentingNaturalGas({
  onBack,
  onNext,
  onBackToHub,
  stepIndex,
  totalSteps,
}: VentingNaturalGasProps) {
  const { state, dispatch } = useAssessment();
  const { assessmentData } = state;

  const ventingNaturalGas = assessmentData.fugitiveEmissions?.ventingNaturalGas;

  // Use the formatted number hook for volumeOfGasVented
  const volumeOfGasVented = useFormattedNumber(
    ventingNaturalGas?.volumeOfGasVented?.toString() ?? ""
  );

  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const { mutate: saveAssessment, isPending: isSaving } = useSaveAssessment();

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    if (ventingNaturalGas) {
      // Initialize the hook with the saved value
      volumeOfGasVented.setRawValue(ventingNaturalGas.volumeOfGasVented?.toString() ?? "");
      if (ventingNaturalGas.files) setFiles(ventingNaturalGas.files);
      setAdditionalFields(ventingNaturalGas.additionalFields || []);
    }
  }, [ventingNaturalGas, volumeOfGasVented]);

  const { filled, total } = useMemo(() => {
    const hasVolume = volumeOfGasVented.rawValue !== "";
    const hasFiles =
      Object.values(files).some(Boolean) || additionalFields.some((field) => field.file);
    return calculateProgress([hasVolume, hasFiles]);
  }, [volumeOfGasVented.rawValue, files, additionalFields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Use the hook's handleChange method
    volumeOfGasVented.handleChange(value);

    // Clear error if present
    if (errors.volumeOfGasVented) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.volumeOfGasVented;
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Use rawValue for validation
    if (!volumeOfGasVented.rawValue || Number(volumeOfGasVented.rawValue) < 0) {
      newErrors.volumeOfGasVented = "Value cannot be negative or empty";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploading((prev) => ({ ...prev, [field]: true }));
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
      setUploading((prev) => ({ ...prev, [field]: false }));
    }

    if (errors.files) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.files;
        return copy;
      });
    }
  };

  const handleSaveAndContinue = () => {
    const { assessmentId } = state.assessmentData;
    if (!assessmentId) {
      toast.error("Cannot save: Assessment ID is missing.");
      return;
    }
    if (!validateForm()) return;

    const payload = {
      // Use rawValue for saving
      volumeOfGasVented: Number(volumeOfGasVented.rawValue),
      files,
      additionalFields: additionalFields as FileMetadata[],
    };

    dispatch({ type: "UPDATE_FUGITIVE_VENTING", payload });

    saveAssessment(
      {
        assessmentId,
        data: {
          ...state.assessmentData,
          fugitiveEmissions: {
            ...state.assessmentData.fugitiveEmissions,
            ventingNaturalGas: payload,
          },
          lastSavedForm: "ghg-fugitive-emissions-venting-natural-gas",
        },
      },
      {
        onSuccess: () => {
          setShowSaveSuccess(true);
          setTimeout(() => {
            setShowSaveSuccess(false);
            onBackToHub();
          }, 1200);
        },
        onError: () => {
          toast.error("Failed to save data");
        },
      }
    );
  };

  const handleNext = () => {
    if (!validateForm()) return;

    dispatch({
      type: "UPDATE_FUGITIVE_VENTING",
      payload: {
        // Use rawValue for saving
        volumeOfGasVented: Number(volumeOfGasVented.rawValue),
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });
    onNext();
  };
  const handlePrevious = () => {
    if (!validateForm()) return;

    dispatch({
      type: "UPDATE_FUGITIVE_VENTING",
      payload: {
        // Use rawValue for saving
        volumeOfGasVented: Number(volumeOfGasVented.rawValue),
        files,
        additionalFields: additionalFields as FileMetadata[],
      },
    });
    onBack();
  };

  const handleRemoveFile = async (key: string) => {
    const file = files[key];
    if (file?.publicId) {
      try {
        setDeleting((prev) => ({ ...prev, [key]: true }));
        await uploadService.deleteImage(file.publicId);
        toast.success("File deleted successfully");
      } catch (err) {
        toast.error("Failed to delete file");
        console.error(err);
      } finally {
        setDeleting((prev) => ({ ...prev, [key]: false }));
        setFiles((prev) => ({ ...prev, [key]: null }));
        if (inputRefs.current[key]) inputRefs.current[key]!.value = "";
      }
    } else {
      setFiles((prev) => ({ ...prev, [key]: null }));
      if (inputRefs.current[key]) inputRefs.current[key]!.value = "";
    }
  };

  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };

  return (
    <div className="min-h-screen bg-green-50 p-6" ref={formRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold">Fugitive Emissions</h3>
            <p className="text-muted-foreground text-base">
              Venting of Natural Gas from Wells and Processing Facilities.
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Volume of Gas Vented */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                1.1 Venting of Natural Gas from Wells and Processing Facilities
              </Label>
              <div className="space-y-4 ml-6">
                <Label className="text-sm font-medium mb-1 ml-1 text-gray-700 pt-2">
                  Volume of Gas vented.
                </Label>
                <Input
                  id="volumeOfGasVented"
                  name="volumeOfGasVented"
                  placeholder="Provide the measured or estimated volume (m³)"
                  type="text" // Changed from "number" to "text" to display formatted value
                  value={volumeOfGasVented.displayValue} // Use displayValue for the input
                  onChange={handleChange}
                  className={`w-full border-gray-400 rounded-lg ${
                    errors.volumeOfGasVented ? "border-red-500" : ""
                  }`}
                />
                {errors.volumeOfGasVented && (
                  <p className="text-red-600 text-xs mt-1">{errors.volumeOfGasVented}</p>
                )}
              </div>
            </div>

            {/* File uploads */}
            <div>
              <Label className="text-md font-medium mb-2 block">1.2 Document/Evidence Upload</Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border hover:border-primary transition-all">
                        <Label
                          htmlFor={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
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
                              disabled={deleting[field]}
                              className="ml-2 text-red-500 hover:text-red-700"
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

            {/* Navigation buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="justify-self-start border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-[var(--color-primary)] text-white hover:bg-teal-300 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Continue Later
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleNext}
                disabled={isSaving}
                className="justify-self-end border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect, useMemo, useRef } from "react";
// import { Card, CardContent } from "@/app/components/ui/card";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import {
//   CloudUpload,
//   ArrowLeft,
//   ArrowRight,
//   Save,
//   CheckCircle2,
//   X,
// } from "lucide-react";
// import { useAssessment } from "@/hooks/useAssessment";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
// import type { AssessmentData, FileMetadata } from "@/hooks/useAssessment";
// import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
// import { calculateProgress } from "@/lib/utils";
// import {
//   AdditionalFileUpload,
//   FileData,
// } from "@/app/components/company/assessments/AdditionalFileUpload";
// import { uploadService } from "@/services/upload.service";
// import { toast } from "react-toastify";

// interface VentingNaturalGasProps {
//   onBack: () => void;
//   onNext: () => void;
//   onBackToHub: () => void;
//   stepIndex: number;
//   totalSteps: number;
// }
// const uploadFields = [
//   "Venting event logs (time, duration, pressure)",
//   "Simulation model outputs (when direct measurement missing)",
// ];

// export function VentingNaturalGas({
//   onBack,
//   onNext,
//   onBackToHub,
//   stepIndex,
//   totalSteps,
// }: VentingNaturalGasProps) {
//   const {
//     state: { assessmentData },
//     dispatch,
//   } = useAssessment();

//   const ventingNaturalGas = assessmentData.fugitiveEmissions?.ventingNaturalGas;

//   const [formState, setFormState] = useState({
//     volumeOfGasVented: ventingNaturalGas?.volumeOfGasVented?.toString() ?? "",
//   });

//   const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
//     Object.fromEntries(uploadFields.map((field) => [field, null]))
//   );

//   const [isSaving, setIsSaving] = useState(false);
//   const [showSaveSuccess, setShowSaveSuccess] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
//   const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
//   const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
//   const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

//   useEffect(() => {
//     const existingData = assessmentData.fugitiveEmissions
//       ?.ventingNaturalGas as NonNullable<
//       AssessmentData["fugitiveEmissions"]
//     >["ventingNaturalGas"];

//     if (existingData) {
//       setFormState({
//         volumeOfGasVented: existingData.volumeOfGasVented?.toString() ?? "",
//       });

//       if (existingData.files) {
//         setFiles(existingData.files);
//       }
//       setAdditionalFields(existingData.additionalFields || []);
//     }
//   }, [assessmentData.fugitiveEmissions?.ventingNaturalGas]);

//   // const { filled, total } = useMemo(() => {
//   //   const allInputs = [formState.volumeOfGasVented];

//   //   const numericProgress = allInputs.map((value) => value !== "");
//   //   const fileProgress = Object.values(files).map((file) => file !== null);

//   //   const progressStatus = [...numericProgress, ...fileProgress];

//   //   return calculateProgress(progressStatus);
//   // }, [formState, files]);

//   const { filled, total } = useMemo(() => {
//     const hasVolume = formState.volumeOfGasVented !== "";

//     // Check if any file exists in either the 'files' object or the 'additionalFields' array.
//     const hasFiles =
//       Object.values(files).some(Boolean) ||
//       additionalFields.some((field) => field.file);

//     // The 'filled' count will be the sum of these two booleans (1 if true, 0 if false).
//     // The 'total' count will always be 2, representing the two major criteria.
//     return calculateProgress([hasVolume, hasFiles]);
//   }, [formState.volumeOfGasVented, files, additionalFields]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     if (/^\d*\.?\d*$/.test(value)) {
//       setFormState((prev) => ({ ...prev, [name]: value }));
//       if (errors[name]) {
//         setErrors((prev) => {
//           const copy = { ...prev };
//           delete copy[name];
//           return copy;
//         });
//       }
//     }
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (
//       !formState.volumeOfGasVented ||
//       Number(formState.volumeOfGasVented) < 0
//     ) {
//       newErrors.volumeOfGasVented = "Value cannot be negative or empty";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleFileChange = async (
//     field: string,
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (file.size > 10 * 1024 * 1024) {
//       setErrors((prev) => ({
//         ...prev,
//         files: `File "${field}" exceeds 10MB limit`,
//       }));
//       return;
//     }

//     try {
//       setUploading((prev) => ({ ...prev, [field]: true })); // start spinner

//       const uploaded = await uploadService.uploadImage(file);

//       if (uploaded?.url) {
//         setFiles((prev) => ({
//           ...prev,
//           [field]: {
//             name: file.name,
//             size: file.size,
//             lastModified: file.lastModified,
//             url: uploaded.url,
//             publicId: uploaded.publicId,
//           },
//         }));

//         toast.success(`${file.name} uploaded successfully`);
//       } else {
//         toast.error("Failed to upload file");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error uploading file");
//     } finally {
//       setUploading((prev) => ({ ...prev, [field]: false })); // stop spinner
//     }

//     if (errors.files) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors.files;
//         return newErrors;
//       });
//     }
//   };

//     const handleSaveAndContinue = async () => {
//     if (!validateForm()) return;
//     setIsSaving(true);
//     try {
//       await new Promise((res) => setTimeout(res, 1000));
//       const payload = {
//         volumeOfGasVented: Number(formState.volumeOfGasVented),
//         files,
//         additionalFields: additionalFields as FileMetadata[], // ✅ cast
//       };
//       dispatch({ type: "UPDATE_FUGITIVE_VENTING", payload });
//       dispatch({ type: "SAVE_PROGRESS" });
//       toast.success("Data saved!");
//       setShowSaveSuccess(true);
//       setTimeout(() => {
//         setShowSaveSuccess(false);
//         onBackToHub();
//       }, 1500);
//     } catch (err) {
//       toast.error("Failed to save data");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleNext = () => {
//     if (!validateForm()) return;
//     dispatch({
//       type: "UPDATE_FUGITIVE_VENTING",
//       payload: {
//         volumeOfGasVented: Number(formState.volumeOfGasVented),
//         files,
//         additionalFields: additionalFields as FileMetadata[], // ✅ cast
//       },
//     });
//     onNext();
//   };

//   const handleRemoveFile = async (key: string) => {
//     const file = files[key];
//     if (file?.publicId) {
//       try {
//         // Start the deleting state for this specific file
//         setDeleting((prev) => ({ ...prev, [key]: true }));

//         await uploadService.deleteImage(file.publicId);
//         toast.success("File deleted successfully");
//       } catch (err) {
//         toast.error("Failed to delete file");
//         console.error(err);
//       } finally {
//         // Stop the deleting state regardless of success or failure
//         setDeleting((prev) => ({ ...prev, [key]: false }));

//         // Always remove the file from local state and clear the input field
//         setFiles((prev) => ({
//           ...prev,
//           [key]: null,
//         }));

//         if (inputRefs.current[key]) {
//           inputRefs.current[key]!.value = "";
//         }

//         if (errors.files) {
//           setErrors((prev) => {
//             const newErrors = { ...prev };
//             delete newErrors.files;
//             return newErrors;
//           });
//         }
//       }
//     } else {
//       // If there is no publicId, just remove the file from the local state
//       setFiles((prev) => ({
//         ...prev,
//         [key]: null,
//       }));
//       if (inputRefs.current[key]) {
//         inputRefs.current[key]!.value = "";
//       }
//     }
//   };

//   const handleAdditionalFieldsChange = (fields: FileData[]) => {
//     setAdditionalFields(fields);
//   };

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <div className="max-w-4xl mx-auto space-y-6">
//         <div className="flex items-center gap-6 mb-4">
//           <Button
//             variant="outline"
//             onClick={onBack}
//             className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
//             aria-label="Go back to previous step"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Back
//           </Button>
//           <div>
//             <h3 className="text-2xl font-semibold text-foreground">
//               Fugitive Emissions
//             </h3>
//             <p className="text-muted-foreground text-base">
//               Venting of Natural Gas from Wells and Processing Facilities.
//             </p>
//           </div>
//         </div>

//         <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
//           <CardContent className="space-y-8">
//             <AssessmentProgressBar
//               stepIndex={stepIndex}
//               totalSteps={totalSteps}
//               fieldsCompleted={filled}
//               totalFields={total}
//               isSubmitted={false}
//             />

//             <div>
//               <h4 className="text-xl font-medium text-foreground">
//                 Venting of Natural Gas
//               </h4>
//               <p className="text-muted-foreground text-base">
//                 Emissions from venting natural gas from wells and processing
//                 facilities.
//               </p>
//             </div>

//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleNext();
//               }}
//               className="space-y-6"
//             >
//               {/* Volume of Gas Vented */}
//               <div>
//                 <Label className="text-md font-medium mb-2 block">
//                   1.1 Venting of Natural Gas from Wells and Processing
//                   Facilities
//                 </Label>
//                 <div className="space-y-4 ml-6">
//                   <div className="space-y-2">
//                     <Label
//                       htmlFor="volumeOfGasVented"
//                       className="text-gray-700 text-sm font-medium"
//                     >
//                       Volume of Gas Vented (m³)
//                     </Label>
//                     <Input
//                       id="volumeOfGasVented"
//                       name="volumeOfGasVented"
//                       placeholder="Provide the measured or estimated volume of gas released."
//                       type="number"
//                       min={0}
//                       step="any"
//                       value={formState.volumeOfGasVented}
//                       onChange={handleChange}
//                       className={`w-full border-gray-400 rounded-lg ${
//                         errors.volumeOfGasVented
//                           ? "border-red-500 focus:border-red-500"
//                           : ""
//                       }`}
//                       aria-invalid={!!errors.volumeOfGasVented}
//                       aria-describedby={
//                         errors.volumeOfGasVented
//                           ? "volumeOfGasVented-error"
//                           : undefined
//                       }
//                     />
//                     {errors.volumeOfGasVented && (
//                       <p
//                         className="text-red-600 text-xs mt-1"
//                         id="volumeOfGasVented-error"
//                       >
//                         {errors.volumeOfGasVented}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* 1.2 Document/Evidence Upload */}
//               <div>
//                 <Label className="text-md font-medium mb-2 block">
//                   1.2 Document/Evidence Upload
//                 </Label>
//                 <div className="ml-6">
//                   {errors.files && (
//                     <p className="text-sm text-red-500">{errors.files}</p>
//                   )}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {uploadFields.map((field) => (
//                       <div key={field} className="flex flex-col gap-2">
//                         <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
//                           {field}
//                         </Label>
//                         <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
//                           <Label
//                             htmlFor={`upload-${field
//                               .replace(/\s/g, "-")
//                               .toLowerCase()}`}
//                             className="cursor-pointer flex flex-col items-center gap-2"
//                           >
//                             <CloudUpload className="h-6 w-6 text-muted-foreground" />
//                             <span className="text-xs text-gray-400 text-center">
//                               Upload {field} (Max. 10MB)
//                             </span>
//                           </Label>
//                           <Input
//                             id={`upload-${field
//                               .replace(/\s/g, "-")
//                               .toLowerCase()}`}
//                             type="file"
//                             ref={(el) => {
//                               inputRefs.current[field] = el;
//                             }}
//                             className="hidden"
//                             onChange={(e) => handleFileChange(field, e)}
//                             accept=".pdf,.jpg,.jpeg,.png"
//                             aria-label={`Upload ${field}`}
//                           />
//                           {uploading[field] ? (
//                             <div className="flex items-center gap-2 mt-2 text-gray-500">
//                               <LoadingSpinner size="sm" /> Uploading...
//                             </div>
//                           ) : deleting[field] ? (
//                             <div className="flex items-center gap-2 mt-2 text-red-500">
//                               <LoadingSpinner size="sm" /> Deleting...
//                             </div>
//                           ) : files[field] ? (
//                             <div className="flex items-center gap-2 mt-2">
//                               <p className="text-sm text-green-600 break-words max-w-full text-center">
//                                 Uploaded: {files[field]!.name}
//                               </p>
//                               <button
//                                 type="button"
//                                 onClick={() => handleRemoveFile(field)}
//                                 disabled={deleting[field]} // Disable button while deleting
//                                 className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
//                                 aria-label={`Remove ${field}`}
//                               >
//                                 <X />
//                               </button>
//                             </div>
//                           ) : null}
//                         </Card>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="mt-6">
//                   <AdditionalFileUpload
//                     onFieldsChange={handleAdditionalFieldsChange}
//                     initialData={additionalFields}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-4 pt-8">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={onBack}
//                   className="justify-self-start hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
//                   aria-label="Previous step"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Previous
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={handleSaveAndContinue}
//                   disabled={isSaving}
//                   className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
//                   aria-label="Save and continue later"
//                 >
//                   {isSaving ? (
//                     <>
//                       <LoadingSpinner size="sm" className="mr-2" />
//                       Saving...
//                     </>
//                   ) : showSaveSuccess ? (
//                     <>
//                       <CheckCircle2 className="h-4 w-4 mr-2" />
//                       Saved!
//                     </>
//                   ) : (
//                     <>
//                       <Save className="h-4 w-4 mr-2" />
//                       Save & Continue Later
//                     </>
//                   )}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={handleNext}
//                   disabled={isSaving}
//                   className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
//                   aria-label="Next step"
//                 >
//                   Next
//                   <ArrowRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
