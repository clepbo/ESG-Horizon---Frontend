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
import {
  AssessmentData,
  FileData,
  FileMetadata,
  useAssessment,
} from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AdditionalFileUpload } from "@/app/components/company/assessments/AdditionalFileUpload";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { uploadService } from "@/services/upload.service";
import { toast } from "react-toastify";
import { CreateLocationBasedPayload } from "@/services/locationBased.service";

interface PurchasedElectricityFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  additional_documents?: Array<{
    name: string;
    url: string;
    publicId: string;
  }>;
}

const uploadFields = [
  "Electricity bills/invoices from Elect. Distr. Companies",
  "Smart meter or sub-meter readings",
  "Utility contracts or purchase agreements",
];

export function PurchasedElectricityForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
}: PurchasedElectricityFormProps) {
  const {
    state,
    dispatch,
    submitAssessment, // Get the mutation function
    isSubmitting, // Use the state from the mutation
    submitError, // Use the error from the mutation
    isSubmitSuccess, // Use the success state from the mutation
  } = useAssessment();
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [electricityConsumed, setElectricityConsumed] = useState("");
  const [supplier, setSupplier] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
  const [localErrors, setLocalErrors] = useState<{
    electricityConsumed?: string;
    supplier?: string;
    files?: string;
  }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const existingData = state.assessmentData?.electricity as NonNullable<
      AssessmentData["electricity"]
    >;

    if (existingData) {
      setElectricityConsumed(existingData.electricityConsumed ?? "");
      setSupplier(existingData.supplier ?? "");
      setFiles(
        existingData.files ??
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData?.electricity]);

  const { filled, total } = useMemo(() => {
    return calculateProgress([
      electricityConsumed,
      supplier,
      Object.values(files).some(Boolean) || additionalFields.length > 0,
    ]);
  }, [electricityConsumed, supplier, files, additionalFields]);

  const validateForm = () => {
    const newErrors: {
      electricityConsumed?: string;
      supplier?: string;
      files?: string;
    } = {};

    if (!electricityConsumed || Number(electricityConsumed) <= 0) {
      newErrors.electricityConsumed = "Please enter a valid positive number";
    }
    if (!supplier.trim()) {
      newErrors.supplier = "Supplier name is required";
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleFileChange = async (
  //   field: string,
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   if (file.size > 10 * 1024 * 1024) {
  //     setLocalErrors((prev) => ({
  //       ...prev,
  //       files: `File "${field}" exceeds 10MB limit`,
  //     }));
  //     return;
  //   }

  //   try {
  //     setUploading((prev) => ({ ...prev, [field]: true }));

  //     const uploaded = await uploadService.uploadImage(file);

  //     if (uploaded?.url) {
  //       setFiles((prev) => ({
  //         ...prev,
  //         [field]: {
  //           name: file.name,
  //           size: file.size,
  //           lastModified: file.lastModified,
  //           url: uploaded.url,
  //           publicId: uploaded.publicId, // Make sure publicId is included
  //         },
  //       }));
  //       toast.success(`${file.name} uploaded successfully`);
  //     } else {
  //       toast.error("Failed to upload file");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Error uploading file");
  //   } finally {
  //     setUploading((prev) => ({ ...prev, [field]: false }));
  //   }

  //   if (localErrors.files)
  //     setLocalErrors((prev) => ({ ...prev, files: undefined }));
  // };
  const handleFileChange = async (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setLocalErrors((prev) => ({
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
            // Store the original file object here
            file: file,
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

    if (localErrors.files)
      setLocalErrors((prev) => ({ ...prev, files: undefined }));
  };
  const handleAdditionalFieldsChange = (fields: FileData[]) => {
    setAdditionalFields(fields);
  };

  // const handleRemoveFile = async (key: string) => {
  //   const file = files[key];
  //   if (file?.publicId) {
  //     try {
  //       await uploadService.deleteImage(file.publicId);
  //       toast.success("File deleted successfully");
  //     } catch (err) {
  //       toast.error("Failed to delete file");
  //       console.error(err);
  //     }
  //   }

  //   setFiles((prev) => ({
  //     ...prev,
  //     [key]: null,
  //   }));

  //   if (inputRefs.current[key]) {
  //     inputRefs.current[key]!.value = "";
  //   }

  //   if (localErrors.files) {
  //     setLocalErrors((prev) => ({ ...prev, files: undefined }));
  //   }
  // };

  // New function to map your local form state to the server payload format
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

    if (localErrors.files) {
      setLocalErrors((prev) => ({ ...prev, files: undefined }));
    }
  };
  // const createPayload = (): CreateLocationBasedPayload => {
  //   const mappedAdditionalDocuments = additionalFields.map((fileData) => ({
  //     name: fileData.name,
  //     url: fileData.url,
  //     publicId: fileData.publicId,
  //   }));
  //   return {
  //     total_electricity_consumption: Number(electricityConsumed),
  //     electricity_supplier: supplier,
  //     // Access the original File object from the state
  //     invoice_from_electricity_distribution_companies_url:
  //       files["Electricity bills/invoices from Elect. Distr. Companies"]?.file,
  //     invoice_from_electricity_distribution_companies_url_public_id:
  //       files["Electricity bills/invoices from Elect. Distr. Companies"]
  //         ?.publicId,
  //     smart_or_sub_meter_reading_url:
  //       files["Smart meter or sub-meter readings"]?.file,
  //     smart_or_sub_meter_reading_url_public_id:
  //       files["Smart meter or sub-meter readings"]?.publicId,
  //     utility_contract_or_purchase_agreement_url:
  //       files["Utility contracts or purchase agreements"]?.file,
  //     utility_contract_or_purchase_agreement_url_public_id:
  //       files["Utility contracts or purchase agreements"]?.publicId,
  //     additional_documents: mappedAdditionalDocuments,
  //   };
  // };
  const createPayload = (): CreateLocationBasedPayload => {
    const mappedAdditionalDocuments = additionalFields.map((fileData) => ({
      name: fileData.name,
      url: fileData.url,
      publicId: fileData.publicId,
      size: fileData.size,
      lastModified: fileData.lastModified,
    }));

    return {
      total_electricity_consumption: Number(electricityConsumed),
      electricity_supplier: supplier,

      // Corrected logic: Use the `url` property from the state
      invoice_from_electricity_distribution_companies_url:
        files["Electricity bills/invoices from Elect. Distr. Companies"]?.url,
      invoice_from_electricity_distribution_companies_url_public_id:
        files["Electricity bills/invoices from Elect. Distr. Companies"]
          ?.publicId,

      smart_or_sub_meter_reading_url:
        files["Smart meter or sub-meter readings"]?.url,
      smart_or_sub_meter_reading_url_public_id:
        files["Smart meter or sub-meter readings"]?.publicId,

      utility_contract_or_purchase_agreement_url:
        files["Utility contracts or purchase agreements"]?.url,
      utility_contract_or_purchase_agreement_url_public_id:
        files["Utility contracts or purchase agreements"]?.publicId,

      additional_documents: mappedAdditionalDocuments,
    };
  };
  const handleSaveAndContinue = () => {
    if (!validateForm()) return;

    const payload = createPayload();
    dispatch({
      type: "UPDATE_ELECTRICITY",
      payload: {
        electricityConsumed,
        supplier,
        files,
        additionalFields,
      },
    });
    dispatch({ type: "SAVE_PROGRESS" });
  };

  const handleNext = () => {
    if (!validateForm()) return;
    const payload = createPayload();
    // This calls the useMutation hook, which sends the data to the API.
    submitAssessment(payload);
    onNext();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
              Purchased Electricity (Scope 2)
            </h3>
            <p className="text-muted-foreground text-base">
              Report emissions from purchased electricity, based on local grid
              or supplier emission factors.
            </p>
          </div>
        </div>

        <Card className="bg-gray-50 pt-6">
          <CardContent className="space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Purchased Electricity
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Total Electricity Consumed (kwh)</Label>
                <Input
                  type="number"
                  placeholder="Enter total electricity consumed in kWh"
                  value={electricityConsumed}
                  onChange={(e) => {
                    setElectricityConsumed(e.target.value);
                    if (localErrors.electricityConsumed)
                      setLocalErrors((prev) => ({
                        ...prev,
                        electricityConsumed: undefined,
                      }));
                  }}
                  className={`w-full border-gray-400 ${
                    localErrors.electricityConsumed ? "border-red-500" : ""
                  }`}
                />
              </div>
              {localErrors.electricityConsumed && (
                <p className="text-sm text-red-500 mt-1">
                  {localErrors.electricityConsumed}
                </p>
              )}
            </div>

            <div className="space-y-4 ml-6">
              <Label>Electricity Supplier</Label>
              <Input
                placeholder="Enter supplier name"
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value);
                  if (localErrors.supplier)
                    setLocalErrors((prev) => ({
                      ...prev,
                      supplier: undefined,
                    }));
                }}
                className={`w-full border-gray-400 ${
                  localErrors.supplier ? "border-red-500" : ""
                }`}
              />
              {localErrors.supplier && (
                <p className="text-sm text-red-500 mt-1">
                  {localErrors.supplier}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-medium text-gray-900 mb-2 block">
                1.2 Documents / Evidence Upload
              </Label>
              <div className="mx-6">
                {localErrors.files && (
                  <p className="text-sm text-red-500 mb-2">
                    {localErrors.files}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
                        {field}
                      </Label>
                      <Card className="p-4 flex flex-col items-center justify-center border hover:border-solid hover:border-primary transition-all">
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
              </div>
              <div className="mx-6 mt-6">
                <AdditionalFileUpload
                  onFieldsChange={handleAdditionalFieldsChange}
                />
              </div>
            </div>

            {/* Save Status (Using local state for local save, mutation state for submission) */}
            {isSubmitting ? (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <LoadingSpinner size="sm" /> Submitting...
              </div>
            ) : isSubmitSuccess ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Submitted successfully!
              </p>
            ) : null}

            {/* Display submission error */}
            {submitError && (
              <p className="text-sm text-red-500 mt-1">
                Submission failed: {submitError.message}
              </p>
            )}

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
                disabled={isSubmitting}
                className="justify-self-center bg-green-500 text-white hover:bg-green-300 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : isSubmitSuccess ? (
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
                disabled={isSubmitting}
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

// import { useState, useEffect, useRef, useMemo } from "react";
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
// import {
//   AssessmentData,
//   FileMetadata,
//   useAssessment,
// } from "@/hooks/useAssessment";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
// import {
//   AdditionalFileUpload,
//   FileData,
// } from "@/app/components/company/assessments/AdditionalFileUpload";
// import { calculateProgress } from "@/lib/utils";
// import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
// import { uploadService } from "@/services/upload.service";
// import { toast } from "react-toastify";

// interface PurchasedElectricityFormProps {
//   onBack: () => void;
//   onNext: () => void;
//   stepIndex: number;
//   totalSteps: number;
// }

// const uploadFields = [
//   "Electricity bills/invoices from Elect. Distr. Companies",
//   "Smart meter or sub-meter readings",
//   "Utility contracts or purchase agreements",
// ];

// export function PurchasedElectricityForm({
//   onBack,
//   onNext,
//   stepIndex,
//   totalSteps,
// }: PurchasedElectricityFormProps) {
//   const { state, dispatch } = useAssessment();
//   const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
//   const [electricityConsumed, setElectricityConsumed] = useState("");
//   const [supplier, setSupplier] = useState("");
//   const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
//     Object.fromEntries(uploadFields.map((field) => [field, null]))
//   );
//   const [additionalFields, setAdditionalFields] = useState<FileData[]>([]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [showSaveSuccess, setShowSaveSuccess] = useState(false);
//   const [errors, setErrors] = useState<{
//     electricityConsumed?: string;
//     supplier?: string;
//     files?: string;
//   }>({});
//   const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

//   useEffect(() => {
//     const existingData = state.assessmentData?.electricity as NonNullable<
//       AssessmentData["electricity"]
//     >;

//     if (existingData) {
//       setElectricityConsumed(existingData.electricityConsumed ?? "");

//       setSupplier(existingData.supplier ?? "");
//       setFiles(
//         existingData.files ??
//           Object.fromEntries(uploadFields.map((field) => [field, null]))
//       );
//     }
//   }, [state.assessmentData?.electricity]);

//   // Use the filled and total values from the calculateProgress function
//   const { filled, total } = useMemo(() => {
//     return calculateProgress([
//       electricityConsumed,
//       supplier,
//       Object.values(files).some(Boolean) || additionalFields.length > 0,
//     ]);
//   }, [electricityConsumed, supplier, files, additionalFields]);
//   const validateForm = () => {
//     const newErrors: {
//       electricityConsumed?: string;
//       supplier?: string;
//       files?: string;
//     } = {};

//     if (!electricityConsumed || Number(electricityConsumed) <= 0) {
//       newErrors.electricityConsumed = "Please enter a valid positive number";
//     }
//     if (!supplier.trim()) {
//       newErrors.supplier = "Supplier name is required";
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

//     if (errors.files) setErrors((prev) => ({ ...prev, files: undefined }));
//   };

//   const savePayload = () => {
//     const payload = {
//       electricityConsumed,
//       supplier,
//       files,
//     };
//     dispatch({ type: "UPDATE_ELECTRICITY", payload });
//     return payload;
//   };

//   const handleAdditionalFieldsChange = (fields: FileData[]) => {
//     setAdditionalFields(fields);
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

//   const handleRemoveFile = async (key: string) => {
//     const file = files[key];
//     if (file?.publicId) {
//       try {
//         await uploadService.deleteImage(file.publicId);
//         toast.success("File deleted successfully");
//       } catch (err) {
//         toast.error("Failed to delete file");
//         console.error(err);
//       }
//     }

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
//               Purchased Electricity (Scope 2)
//             </h3>
//             <p className="text-muted-foreground text-base">
//               Report emissions from purchased electricity, based on local grid
//               or supplier emission factors.
//             </p>
//           </div>
//         </div>

//         <Card className="bg-gray-50 pt-6">
//           <CardContent className="space-y-8">
//             {/* Overall Assessment Progress */}
//             <AssessmentProgressBar
//               stepIndex={stepIndex}
//               totalSteps={totalSteps}
//               fieldsCompleted={filled}
//               totalFields={total}
//               isSubmitted={false}
//             />

//             {/* Electricity Consumed */}
//             <div>
//               <Label className="text-md font-semibold mb-2 block">
//                 1.1 Purchased Electricity
//               </Label>
//               <div className="space-y-4 ml-6">
//                 <Label>Total Electricity Consumed (kwh)</Label>
//                 <Input
//                   type="number"
//                   placeholder="Enter total electricity consumed in kWh"
//                   value={electricityConsumed}
//                   onChange={(e) => {
//                     setElectricityConsumed(e.target.value);
//                     if (errors.electricityConsumed)
//                       setErrors((prev) => ({
//                         ...prev,
//                         electricityConsumed: undefined,
//                       }));
//                   }}
//                   className={`w-full border-gray-400 ${
//                     errors.electricityConsumed ? "border-red-500" : ""
//                   }`}
//                 />
//               </div>
//               {errors.electricityConsumed && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.electricityConsumed}
//                 </p>
//               )}
//             </div>

//             {/* Electricity Supplier */}
//             <div className="space-y-4 ml-6">
//               <Label>Electricity Supplier</Label>
//               <Input
//                 placeholder="Enter supplier name"
//                 value={supplier}
//                 onChange={(e) => {
//                   setSupplier(e.target.value);
//                   if (errors.supplier)
//                     setErrors((prev) => ({ ...prev, supplier: undefined }));
//                 }}
//                 className={`w-full border-gray-400 ${
//                   errors.supplier ? "border-red-500" : ""
//                 }`}
//               />
//               {errors.supplier && (
//                 <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>
//               )}
//             </div>

//             {/* Uploads */}
//             <div>
//               <Label className="text-base font-medium text-gray-900 mb-2 block">
//                 1.2 Documents / Evidence Upload
//               </Label>
//               <div className="mx-6">
//                 {errors.files && (
//                   <p className="text-sm text-red-500 mb-2">{errors.files}</p>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {uploadFields.map((field) => (
//                     <div key={field} className="flex flex-col gap-2">
//                       <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
//                         {field}
//                       </Label>
//                       <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
//                         <Label
//                           htmlFor={`upload-${field
//                             .replace(/\s/g, "-")
//                             .toLowerCase()}`}
//                           className="cursor-pointer flex flex-col items-center gap-2"
//                         >
//                           <CloudUpload className="h-6 w-6 text-muted-foreground" />
//                           <span className="text-xs text-gray-400 text-center">
//                             Upload {field} (Max. 10MB)
//                           </span>
//                         </Label>
//                         <Input
//                           id={`upload-${field
//                             .replace(/\s/g, "-")
//                             .toLowerCase()}`}
//                           type="file"
//                           ref={(el) => {
//                             inputRefs.current[field] = el;
//                           }}
//                           className="hidden"
//                           onChange={(e) => handleFileChange(field, e)}
//                           accept=".pdf,.jpg,.jpeg,.png"
//                           aria-label={`Upload ${field}`}
//                         />
//                         {uploading[field] ? (
//                           <div className="flex items-center gap-2 mt-2 text-gray-500">
//                             <LoadingSpinner size="sm" /> Uploading...
//                           </div>
//                         ) : files[field] ? (
//                           <div className="flex items-center gap-2 mt-2">
//                             <p className="text-sm text-green-600 break-words max-w-full text-center">
//                               Uploaded: {files[field]!.name}
//                             </p>
//                             <button
//                               type="button"
//                               onClick={() => handleRemoveFile(field)}
//                               className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
//                               aria-label={`Remove ${field}`}
//                             >
//                               <X />
//                             </button>
//                           </div>
//                         ) : null}
//                       </Card>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="mx-6 mt-6">
//                 <AdditionalFileUpload
//                   onFieldsChange={handleAdditionalFieldsChange}
//                 />
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
// import {
//   AssessmentData,
//   FileMetadata,
//   useAssessment,
// } from "@/hooks/useAssessment";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

// interface PurchasedElectricityFormProps {
//   onBack: () => void;
//   onNext: () => void;
//   stepIndex: number;
//   totalSteps: number;
//   percent: number;
// }

// const uploadFields = [
//   "Electricity bills/invoices from Elect. Distr. Companies",
//   "Smart meter or sub-meter readings",
//   "Utility contracts or purchase agreements",
// ];

// export function PurchasedElectricityForm({
//   onBack,
//   onNext,
//   stepIndex,
//   totalSteps,
//   percent,
// }: PurchasedElectricityFormProps) {
//   const { state, dispatch } = useAssessment();
//   const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
//   const [electricityConsumed, setElectricityConsumed] = useState("");
//   const [supplier, setSupplier] = useState("");
//   const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
//     Object.fromEntries(uploadFields.map((field) => [field, null]))
//   );

//   const [isSaving, setIsSaving] = useState(false);
//   const [showSaveSuccess, setShowSaveSuccess] = useState(false);
//   const [errors, setErrors] = useState<{
//     electricityConsumed?: string;
//     supplier?: string;
//     files?: string;
//   }>({});

//   useEffect(() => {
//     const existingData = state.assessmentData?.electricity as NonNullable<
//       AssessmentData["electricity"]
//     >;

//     if (existingData) {
//       setElectricityConsumed(existingData.electricityConsumed ?? "");

//       setSupplier(existingData.supplier ?? "");
//       setFiles(
//         existingData.files ??
//           Object.fromEntries(uploadFields.map((field) => [field, null]))
//       );
//     }
//   }, [state.assessmentData?.electricity]);

//   const validateForm = () => {
//     const newErrors: {
//       electricityConsumed?: string;
//       supplier?: string;
//       files?: string;
//     } = {};

//     if (!electricityConsumed || Number(electricityConsumed) <= 0) {
//       newErrors.electricityConsumed = "Please enter a valid positive number";
//     }
//     if (!supplier.trim()) {
//       newErrors.supplier = "Supplier name is required";
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
//     const payload = {
//       electricityConsumed,
//       supplier,
//       files,
//     };
//     dispatch({ type: "UPDATE_ELECTRICITY", payload });
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
//               Purchased Electricity (Scope 2)
//             </h3>
//             <p className="text-muted-foreground text-base">
//               Report emissions from purchased electricity, based on local grid
//               or supplier emission factors.
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

//             {/* Electricity Consumed */}
//             <div>
//               <Label className="text-md font-semibold mb-2 block">
//                 1.1 Purchased Electricity
//               </Label>
//               <div className="space-y-4 ml-6">
//                 <Label>Total Electricity Consumed (kwh)</Label>
//                 <Input
//                   type="number"
//                   placeholder="Enter total electricity consumed in kWh"
//                   value={electricityConsumed}
//                   onChange={(e) => {
//                     setElectricityConsumed(e.target.value);
//                     if (errors.electricityConsumed)
//                       setErrors((prev) => ({
//                         ...prev,
//                         electricityConsumed: undefined,
//                       }));
//                   }}
//                   className={`w-full border-gray-400 ${
//                     errors.electricityConsumed ? "border-red-500" : ""
//                   }`}
//                 />
//               </div>
//               {errors.electricityConsumed && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.electricityConsumed}
//                 </p>
//               )}
//             </div>

//             {/* Electricity Supplier */}
//             <div className="space-y-4 ml-6">
//               <Label>Electricity Supplier</Label>
//               <Input
//                 placeholder="Enter supplier name"
//                 value={supplier}
//                 onChange={(e) => {
//                   setSupplier(e.target.value);
//                   if (errors.supplier)
//                     setErrors((prev) => ({ ...prev, supplier: undefined }));
//                 }}
//                 className={`w-full border-gray-400 ${
//                   errors.supplier ? "border-red-500" : ""
//                 }`}
//               />
//               {errors.supplier && (
//                 <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>
//               )}
//             </div>

//             {/* Uploads */}
//             <div>
//               <Label className="text-base font-medium text-gray-900 mb-2 block">
//                 1.2 Documents / Evidence Upload
//               </Label>
//               <div className="mx-6">
//                 {errors.files && (
//                   <p className="text-sm text-red-500 mb-2">{errors.files}</p>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {uploadFields.map((field) => (
//                     <div key={field} className="flex flex-col gap-2">
//                       <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
//                         {field}
//                       </Label>
//                       <Card className="p-4 flex flex-col items-center justify-center border  hover:border-solid hover:border-primary transition-all">
//                         <Label
//                           htmlFor={`upload-${field
//                             .replace(/\s/g, "-")
//                             .toLowerCase()}`}
//                           className="cursor-pointer flex flex-col items-center gap-2"
//                         >
//                           <CloudUpload className="h-6 w-6 text-muted-foreground" />
//                           <span className="text-xs text-gray-400 text-center">
//                             Upload {field} (Max. 10MB)
//                           </span>
//                         </Label>
//                         <Input
//                           id={`upload-${field
//                             .replace(/\s/g, "-")
//                             .toLowerCase()}`}
//                           type="file"
//                           ref={(el) => {
//                             inputRefs.current[field] = el;
//                           }}
//                           className="hidden"
//                           onChange={(e) => handleFileChange(field, e)}
//                           accept=".pdf,.jpg,.jpeg,.png"
//                           aria-label={`Upload ${field}`}
//                         />
//                         {files[field] && (
//                           <div className="flex items-center gap-2 mt-2">
//                             <p className="text-sm text-green-600 break-words max-w-full text-center">
//                               Uploaded: {files[field]!.name}
//                             </p>
//                             <button
//                               type="button"
//                               onClick={() => handleRemoveFile(field)}
//                               className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
//                               aria-label={`Remove ${field}`}
//                             >
//                               <X />
//                             </button>
//                           </div>
//                         )}
//                       </Card>
//                     </div>
//                   ))}
//                 </div>
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
