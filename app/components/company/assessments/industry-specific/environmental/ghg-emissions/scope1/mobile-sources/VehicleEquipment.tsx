"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  CloudUpload,
  CheckCircle2,
  Save,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface VentingNaturalGasProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

interface UploadFile {
  file: File | null;
  error: string | null;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const gasCompositionFields = [
  { label: "Methane (CH₄) %", name: "methane" },
  { label: "Carbon Dioxide (CO₂) %", name: "carbonDioxide" },
  { label: "Ethane (C₂H₆) %", name: "ethane" },
  { label: "Propane (C₃H₈) %", name: "propane" },
  { label: "Butanes (C₄H₁₀) %", name: "butanes" },
  { label: "Wellheads %", name: "wellheads" },
  { label: "Nitrogen (N₂) %", name: "nitrogen" },
  { label: "Hydrogen Sulfide (H₂S) %", name: "hydrogenSulfide" },
];

export function VentingNaturalGas({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: VentingNaturalGasProps) {
  const {
    state: {
      assessmentData: { fugitiveEmissions },
    },
    dispatch,
  } = useAssessment();

  const ventingNaturalGas = fugitiveEmissions?.ventingNaturalGas;

  const [formState, setFormState] = useState<Record<string, string>>({
    volumeOfGasVented: "",
    methane: "",
    carbonDioxide: "",
    ethane: "",
    propane: "",
    butanes: "",
    wellheads: "",
    nitrogen: "",
    hydrogenSulfide: "",
    others: "",
  });

  const [ventingEventLogs, setVentingEventLogs] = useState<UploadFile>({
    file: null,
    error: null,
  });
  const [simulationModelOutputs, setSimulationModelOutputs] =
    useState<UploadFile>({
      file: null,
      error: null,
    });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ventingNaturalGas) {
      setFormState({
        volumeOfGasVented: ventingNaturalGas.volumeOfGasVented?.toString() ?? "",
        methane: ventingNaturalGas.methane?.toString() ?? "",
        carbonDioxide: ventingNaturalGas.carbonDioxide?.toString() ?? "",
        ethane: ventingNaturalGas.ethane?.toString() ?? "",
        propane: ventingNaturalGas.propane?.toString() ?? "",
        butanes: ventingNaturalGas.butanes?.toString() ?? "",
        wellheads: ventingNaturalGas.wellheads?.toString() ?? "",
        nitrogen: ventingNaturalGas.nitrogen?.toString() ?? "",
        hydrogenSulfide: ventingNaturalGas.hydrogenSulfide?.toString() ?? "",
        others: ventingNaturalGas.others?.toString() ?? "",
      });
    }
  }, [ventingNaturalGas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) {
      setFormState((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFileState: React.Dispatch<React.SetStateAction<UploadFile>>
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setFileState({ file: null, error: null });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileState({ file: null, error: "File size must be under 10MB" });
      return;
    }
    setFileState({ file, error: null });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.volumeOfGasVented || Number(formState.volumeOfGasVented) < 0) {
      newErrors.volumeOfGasVented = "Value cannot be negative or empty";
    }

    gasCompositionFields.forEach(({ name }) => {
      const val = formState[name];
      if (val !== "") {
        const n = Number(val);
        if (isNaN(n) || n < 0 || n > 100) {
          newErrors[name] = "Value must be between 0 and 100";
        }
      }
    });

    if (!ventingEventLogs.file && !simulationModelOutputs.file) {
      newErrors.files = "Please upload at least one document";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildMetadata = (file: File | null) =>
    file
      ? { name: file.name, size: file.size, lastModified: file.lastModified }
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch({
      type: "UPDATE_FUGITIVE_VENTING",
      payload: {
        volumeOfGasVented: Number(formState.volumeOfGasVented),
        methane: Number(formState.methane),
        carbonDioxide: Number(formState.carbonDioxide),
        ethane: Number(formState.ethane),
        propane: Number(formState.propane),
        butanes: Number(formState.butanes),
        wellheads: Number(formState.wellheads),
        nitrogen: Number(formState.nitrogen),
        hydrogenSulfide: Number(formState.hydrogenSulfide),
        others: Number(formState.others),
        files: {
          ventingEventLogs: buildMetadata(ventingEventLogs.file),
          simulationModelOutputs: buildMetadata(simulationModelOutputs.file),
        },
      },
    });

    onNext();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Fugitive Emissions
            </h3>
            <p className="text-muted-foreground text-base">
              Venting of Natural Gas from Wells and Processing Facilities.
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 pt-6 pb-8">
          <CardContent className="space-y-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Section {stepIndex} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {percent}% complete
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Volume of Gas Vented full width */}
              <div className="flex flex-col ml-6">
                <Label
                  htmlFor="volumeOfGasVented"
                  className="text-gray-700 text-sm font-medium"
                >
                  Volume of Gas Vented (m³)
                </Label>
                <Input
                  id="volumeOfGasVented"
                  name="volumeOfGasVented"
                  type="number"
                  min={0}
                  step="any"
                  value={formState.volumeOfGasVented}
                  onChange={handleChange}
                  className={
                    errors.volumeOfGasVented
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  aria-invalid={!!errors.volumeOfGasVented}
                  aria-describedby={
                    errors.volumeOfGasVented ? "volumeOfGasVented-error" : undefined
                  }
                />
                {errors.volumeOfGasVented && (
                  <p
                    id="volumeOfGasVented-error"
                    className="text-red-600 text-xs mt-1"
                  >
                    {errors.volumeOfGasVented}
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-1">
                  Provide the measured or estimated volume of gas released.
                </p>
              </div>

              {/* Gas composition inputs: 2 per row */}
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                {gasCompositionFields.map(({ label, name }) => (
                  <div key={name} className="flex flex-col">
                    <Label
                      htmlFor={name}
                      className="text-gray-700 text-sm font-medium"
                    >
                      {label}
                    </Label>
                    <Input
                      id={name}
                      name={name}
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={formState[name]}
                      onChange={handleChange}
                      className={
                        errors[name] ? "border-red-500 focus:border-red-500" : ""
                      }
                      aria-invalid={!!errors[name]}
                      aria-describedby={errors[name] ? `${name}-error` : undefined}
                    />
                    {errors[name] && (
                      <p id={`${name}-error`} className="text-red-600 text-xs mt-1">
                        {errors[name]}
                      </p>
                    )}
                  </div>
                ))}

                {/* Others full width */}
                <div className="col-span-full flex flex-col">
                  <Label
                    htmlFor="others"
                    className="text-gray-700 text-sm font-medium"
                  >
                    Others %
                  </Label>
                  <Input
                    id="others"
                    name="others"
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={formState.others}
                    onChange={handleChange}
                    className={
                      errors.others ? "border-red-500 focus:border-red-500" : ""
                    }
                    aria-invalid={!!errors.others}
                    aria-describedby={errors.others ? "others-error" : undefined}
                  />
                  {errors.others && (
                    <p id="others-error" className="text-red-600 text-xs mt-1">
                      {errors.others}
                    </p>
                  )}
                </div>
              </div>

              {/* Uploads */}
              <section className="space-y-6 ml-6">
                <h3 className="text-gray-800 text-md font-semibold">
                  1.2 Documents/Evidence Upload
                </h3>

                <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="ventingEventLogsFile"
                      className="text-gray-700 text-sm font-medium"
                    >
                      Venting event logs (time, duration, pressure). Upload (Max. 10MB)
                    </Label>
                    <input
                      id="ventingEventLogsFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileChange(e, setVentingEventLogs)}
                      className="mt-1"
                    />
                    {ventingEventLogs.error && (
                      <p className="text-red-600 text-xs mt-1">
                        {ventingEventLogs.error}
                      </p>
                    )}
                    {ventingEventLogs.file && (
                      <p className="text-gray-700 text-xs mt-1">
                        {ventingEventLogs.file.name}
                      </p>
                    )}
                    <div className="border border-gray-300 rounded h-32 mt-2 flex items-center justify-center text-gray-400 text-sm">
                      Upload Venting event logs
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="simulationModelOutputsFile"
                      className="text-gray-700 text-sm font-medium"
                    >
                      Simulation model outputs (when direct measurement missing).
                      Upload (Max. 10MB)
                    </Label>
                    <input
                      id="simulationModelOutputsFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileChange(e, setSimulationModelOutputs)}
                      className="mt-1"
                    />
                    {simulationModelOutputs.error && (
                      <p className="text-red-600 text-xs mt-1">
                        {simulationModelOutputs.error}
                      </p>
                    )}
                    {simulationModelOutputs.file && (
                      <p className="text-gray-700 text-xs mt-1">
                        {simulationModelOutputs.file.name}
                      </p>
                    )}
                    <div className="border border-gray-300 rounded h-32 mt-2 flex items-center justify-center text-gray-400 text-sm">
                      Upload Simulation model outputs
                    </div>
                  </div>
                </div>
              </section>

              {/* Navigation buttons */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="justify-self-start border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                  aria-label="Previous step"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="justify-self-end bg-green-600 text-white hover:bg-green-700 transition-colors px-4 py-2 rounded"
                  aria-label="Next step"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent } from "@/app/components/ui/card";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
// import {
//     ArrowLeft,
//     Save,
//     CheckCircle2,
//     CloudUpload,
//     ArrowRight,
// } from "lucide-react";
// import { useAssessment } from "@/hooks/useAssessment";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
// import type { AssessmentData } from "@/hooks/useAssessment";

// interface VehicleEquipmentProps {
//     onBack: () => void;
//     onNext: () => void;
//     stepIndex: number;
//     totalSteps: number;
//     percent: number;
// }

// interface FileMetadata {
//     name: string;
//     size: number;
//     lastModified: number;
// }

// const uploadFields = [
//     "Refueling logs or farm storage tank logs",
//     "LPG cylinder replacement records",
//     "Operational hours log per equipment",
//     "Land area serviced (for tractors)",
// ];

// export function VehicleEquipment({
//     onBack,
//     onNext,
//     stepIndex,
//     totalSteps,
//     percent,
// }: VehicleEquipmentProps) {
//     const { state, dispatch } = useAssessment();
//     const [forkliftFuelType, setForkliftFuelType] = useState("");
//     const [forkliftVolume, setForkliftVolume] = useState("");
//     const [heavyDutyFuelType, setHeavyDutyFuelType] = useState("Diesel");
//     const [heavyDutyVolume, setHeavyDutyVolume] = useState("");
//     const [tractorFuelType, setTractorFuelType] = useState("Diesel");
//     const [tractorVolume, setTractorVolume] = useState("");
//     const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
//         Object.fromEntries(uploadFields.map((field) => [field, null]))
//     );
//     const [isSaving, setIsSaving] = useState(false);
//     const [showSaveSuccess, setShowSaveSuccess] = useState(false);
//     const [errors, setErrors] = useState<{
//         forkliftFuelType?: string;
//         forkliftVolume?: string;
//         heavyDutyFuelType?: string;
//         heavyDutyVolume?: string;
//         tractorFuelType?: string;
//         tractorVolume?: string;
//         files?: string;
//     }>({});

//     // useEffect(() => {
//     //   const existingData =
//     //     state.assessmentData.mobileSources?.vehicleEquipment ||
//     //     JSON.parse(localStorage.getItem("esg-assessment-data") || "{}").mobileSources?.vehicleEquipment ||
//     //     {};
//     //   if (existingData) {
//     //     setForkliftFuelType(existingData.forkliftFuelType || "");
//     //     setForkliftVolume(existingData.forkliftVolume || "");
//     //     setHeavyDutyFuelType(existingData.heavyDutyFuelType || "Diesel");
//     //     setHeavyDutyVolume(existingData.heavyDutyVolume || "");
//     //     setTractorFuelType(existingData.tractorFuelType || "Diesel");
//     //     setTractorVolume(existingData.tractorVolume || "");
//     //     setFiles(existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null])));
//     //   }
//     // }, [state.assessmentData.mobileSources?.vehicleEquipment]);

//     useEffect(() => {
//         const existingData = state.assessmentData.mobileSources
//             ?.vehicleEquipment as NonNullable<
//             AssessmentData["mobileSources"]
//         >["vehicleEquipment"];
//         if (existingData) {
//             setForkliftFuelType(existingData.forkliftFuelType ?? "");
//             setForkliftVolume(existingData.forkliftVolume?.toString() ?? "");
//             setHeavyDutyFuelType(existingData.heavyDutyFuelType ?? "Diesel");
//             setHeavyDutyVolume(existingData.heavyDutyVolume?.toString() ?? "");
//             setTractorFuelType(existingData.tractorFuelType ?? "Diesel");
//             setTractorVolume(existingData.tractorVolume?.toString() ?? "");
//             setFiles(
//                 existingData.files ??
//                     Object.fromEntries(
//                         uploadFields.map((field) => [field, null])
//                     )
//             );
//         }
//     }, [state.assessmentData.mobileSources?.vehicleEquipment]);

//     const validateForm = () => {
//         const newErrors: {
//             forkliftFuelType?: string;
//             forkliftVolume?: string;
//             heavyDutyFuelType?: string;
//             heavyDutyVolume?: string;
//             tractorFuelType?: string;
//             tractorVolume?: string;
//             files?: string;
//         } = {};

//         if (!forkliftFuelType) {
//             newErrors.forkliftFuelType =
//                 "Please select a fuel type for forklifts";
//         }
//         if (!forkliftVolume) {
//             newErrors.forkliftVolume =
//                 "Please enter the fuel volume for forklifts";
//         } else if (
//             isNaN(Number(forkliftVolume)) ||
//             Number(forkliftVolume) < 0
//         ) {
//             newErrors.forkliftVolume = "Please enter a valid positive number";
//         }

//         if (!heavyDutyFuelType) {
//             newErrors.heavyDutyFuelType =
//                 "Please select a fuel type for heavy-duty vehicles";
//         }
//         if (!heavyDutyVolume) {
//             newErrors.heavyDutyVolume =
//                 "Please enter the fuel volume for heavy-duty vehicles";
//         } else if (
//             isNaN(Number(heavyDutyVolume)) ||
//             Number(heavyDutyVolume) < 0
//         ) {
//             newErrors.heavyDutyVolume = "Please enter a valid positive number";
//         }

//         if (!tractorFuelType) {
//             newErrors.tractorFuelType =
//                 "Please select a fuel type for tractors";
//         }
//         if (!tractorVolume) {
//             newErrors.tractorVolume =
//                 "Please enter the fuel volume for tractors";
//         } else if (isNaN(Number(tractorVolume)) || Number(tractorVolume) < 0) {
//             newErrors.tractorVolume = "Please enter a valid positive number";
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleFileChange = (
//         field: string,
//         event: React.ChangeEvent<HTMLInputElement>
//     ) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             if (file.size > 10 * 1024 * 1024) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     files: `File "${field}" exceeds 10MB limit`,
//                 }));
//                 return;
//             }
//             setFiles((prev) => ({
//                 ...prev,
//                 [field]: {
//                     name: file.name,
//                     size: file.size,
//                     lastModified: file.lastModified,
//                 },
//             }));
//             if (errors.files) {
//                 setErrors((prev) => ({ ...prev, files: undefined }));
//             }
//         }
//     };

//     const handleSaveAndContinue = () => {
//         if (!validateForm()) return;

//         setIsSaving(true);
//         const payload = {
//             forkliftFuelType,
//             forkliftVolume: Number(forkliftVolume),
//             heavyDutyFuelType,
//             heavyDutyVolume: Number(heavyDutyVolume),
//             tractorFuelType,
//             tractorVolume: Number(tractorVolume),
//             files,
//         };
//         dispatch({
//             type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT",
//             payload,
//         });
//         dispatch({ type: "SAVE_PROGRESS" });
//         setIsSaving(false);
//         setShowSaveSuccess(true);
//         setTimeout(() => setShowSaveSuccess(false), 2000);
//     };

//     const handleNext = () => {
//         if (!validateForm()) return;
//         const payload = {
//             forkliftFuelType,
//             forkliftVolume: Number(forkliftVolume),
//             heavyDutyFuelType,
//             heavyDutyVolume: Number(heavyDutyVolume),
//             tractorFuelType,
//             tractorVolume: Number(tractorVolume),
//             files,
//         };
//         dispatch({
//             type: "UPDATE_MOBILE_VEHICLE_EQUIPMENT",
//             payload,
//         });
//         dispatch({ type: "SAVE_PROGRESS" });
//         console.log(
//             "Vehicle Equipment Data:",
//             state.assessmentData.mobileSources
//         );
//         onNext();
//     };

//     return (
//         <div className="min-h-screen bg-green-50 p-6">
//             <div className="max-w-4xl mx-auto space-y-6">
//                 <div className="flex items-center gap-6 mb-4">
//                     <Button
//                         variant="outline"
//                         onClick={onBack}
//                         className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
//                         aria-label="Go back to previous step"
//                     >
//                         <ArrowLeft className="h-4 w-4" />
//                         Back
//                     </Button>
//                     <div>
//                         <h3 className="text-2xl font-bold text-foreground">
//                             Mobile Sources
//                         </h3>
//                         <p className="text-muted-foreground text-base">
//                             Emissions from moving equipment or vehicles, such as
//                             trucks, ships, or planes.
//                         </p>
//                     </div>
//                 </div>

//                 <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
//                     <CardContent className="space-y-8">
//                         <div className="mb-6">
//                             <div className="flex justify-between items-center mb-2">
//                                 <span className="text-sm font-medium text-gray-500">
//                                     Section {stepIndex} of {totalSteps}
//                                 </span>
//                                 <span className="text-sm font-medium text-gray-500">
//                                     {percent}% complete
//                                 </span>
//                             </div>
//                             <div className="w-full h-3 bg-green-300 rounded-lg">
//                                 <div
//                                     className="h-3 bg-green-800 rounded transition-all duration-300"
//                                     style={{ width: `${percent}%` }}
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <h4 className="text-xl font-medium text-foreground">
//                                 Off-road Vehicles & Equipment
//                             </h4>
//                             <p className="text-muted-foreground text-base">
//                                 Emissions from vehicles and machinery not used
//                                 on public roads, such as construction, mining,
//                                 or agricultural equipment.
//                             </p>
//                         </div>

//                         {/* 1.1 Forklifts and Other Machinery */}
//                         <div>
//                             <Label className="text-md font-semibold mb-2 block">
//                                 1.1 Forklifts and Other Machinery Used in
//                                 Warehouses and Factory Floors
//                             </Label>
//                             <div className="space-y-4 ml-6">
//                                 <Label>Type of Fuel</Label>
//                                 <RadioGroup
//                                     value={forkliftFuelType}
//                                     onValueChange={(value) => {
//                                         setForkliftFuelType(value);
//                                         if (errors.forkliftFuelType) {
//                                             setErrors((prev) => ({
//                                                 ...prev,
//                                                 forkliftFuelType: undefined,
//                                             }));
//                                         }
//                                     }}
//                                     className={`flex flex-col space-y-2 ${
//                                         errors.forkliftFuelType
//                                             ? "border-red-500 p-2 rounded"
//                                             : ""
//                                     }`}
//                                 >
//                                     {[
//                                         "Diesel",
//                                         "Liquefied Petroleum Gas (LPG)",
//                                         "Petrol (Premium Motor Spirit - PMS)",
//                                     ].map((fuel) => (
//                                         <div
//                                             key={fuel}
//                                             className="flex items-center space-x-2"
//                                         >
//                                             <RadioGroupItem
//                                                 value={fuel}
//                                                 id={fuel
//                                                     .replace(/\s/g, "-")
//                                                     .toLowerCase()}
//                                             />
//                                             <Label
//                                                 htmlFor={fuel
//                                                     .replace(/\s/g, "-")
//                                                     .toLowerCase()}
//                                             >
//                                                 {fuel}
//                                             </Label>
//                                         </div>
//                                     ))}
//                                 </RadioGroup>
//                                 {errors.forkliftFuelType && (
//                                     <p className="text-sm text-red-500">
//                                         {errors.forkliftFuelType}
//                                     </p>
//                                 )}

//                                 <div className="space-y-2 mt-4">
//                                     <Label htmlFor="forklift-volume">
//                                         Volume of Fuel Consumed (Litres)
//                                     </Label>
//                                     <Input
//                                         id="forklift-volume"
//                                         type="number"
//                                         placeholder="Enter volume of fuel consumed"
//                                         value={forkliftVolume}
//                                         onChange={(e) => {
//                                             setForkliftVolume(e.target.value);
//                                             if (errors.forkliftVolume) {
//                                                 setErrors((prev) => ({
//                                                     ...prev,
//                                                     forkliftVolume: undefined,
//                                                 }));
//                                             }
//                                         }}
//                                         className={`w-full border-gray-400 ${
//                                             errors.forkliftVolume
//                                                 ? "border-red-500 focus:border-red-500"
//                                                 : ""
//                                         }`}
//                                         aria-describedby={
//                                             errors.forkliftVolume
//                                                 ? "forklift-volume-error"
//                                                 : undefined
//                                         }
//                                     />
//                                     {errors.forkliftVolume && (
//                                         <p
//                                             id="forklift-volume-error"
//                                             className="text-sm text-red-500"
//                                         >
//                                             {errors.forkliftVolume}
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* 1.2 Heavy-duty Vehicles and Equipment */}
//                         <div>
//                             <Label className="text-md font-semibold mb-2 block">
//                                 1.2 Heavy-duty Vehicles and Equipment Used in
//                                 Construction and Mining Subsidiaries
//                             </Label>
//                             <div className="space-y-4 ml-6">
//                                 <Label>Type of Fuel</Label>
//                                 <RadioGroup
//                                     value={heavyDutyFuelType}
//                                     onValueChange={(value) => {
//                                         setHeavyDutyFuelType(value);
//                                         if (errors.heavyDutyFuelType) {
//                                             setErrors((prev) => ({
//                                                 ...prev,
//                                                 heavyDutyFuelType: undefined,
//                                             }));
//                                         }
//                                     }}
//                                     className={`flex flex-col space-y-2 ${
//                                         errors.heavyDutyFuelType
//                                             ? "border-red-500 p-2 rounded"
//                                             : ""
//                                     }`}
//                                 >
//                                     <div className="flex items-center space-x-2">
//                                         <RadioGroupItem
//                                             value="Diesel"
//                                             id="diesel-heavy-duty"
//                                         />
//                                         <Label htmlFor="diesel-heavy-duty">
//                                             Diesel
//                                         </Label>
//                                     </div>
//                                 </RadioGroup>
//                                 {errors.heavyDutyFuelType && (
//                                     <p className="text-sm text-red-500">
//                                         {errors.heavyDutyFuelType}
//                                     </p>
//                                 )}

//                                 <div className="space-y-2 mt-4">
//                                     <Label htmlFor="heavy-duty-volume">
//                                         Volume of Fuel Consumed (Litres)
//                                     </Label>
//                                     <Input
//                                         id="heavy-duty-volume"
//                                         type="number"
//                                         placeholder="Enter volume of fuel consumed"
//                                         value={heavyDutyVolume}
//                                         onChange={(e) => {
//                                             setHeavyDutyVolume(e.target.value);
//                                             if (errors.heavyDutyVolume) {
//                                                 setErrors((prev) => ({
//                                                     ...prev,
//                                                     heavyDutyVolume: undefined,
//                                                 }));
//                                             }
//                                         }}
//                                         className={`w-full border-gray-400 ${
//                                             errors.heavyDutyVolume
//                                                 ? "border-red-500 focus:border-red-500"
//                                                 : ""
//                                         }`}
//                                         aria-describedby={
//                                             errors.heavyDutyVolume
//                                                 ? "heavy-duty-volume-error"
//                                                 : undefined
//                                         }
//                                     />
//                                     {errors.heavyDutyVolume && (
//                                         <p
//                                             id="heavy-duty-volume-error"
//                                             className="text-sm text-red-500"
//                                         >
//                                             {errors.heavyDutyVolume}
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* 1.3 Tractors and Other Machinery */}
//                         <div>
//                             <Label className="text-md font-semibold mb-2 block">
//                                 1.3 Tractors and Other Machinery on Large
//                                 Commercial Farms
//                             </Label>
//                             <div className="space-y-4 ml-6">
//                                 <Label>Type of Fuel</Label>
//                                 <RadioGroup
//                                     value={tractorFuelType}
//                                     onValueChange={(value) => {
//                                         setTractorFuelType(value);
//                                         if (errors.tractorFuelType) {
//                                             setErrors((prev) => ({
//                                                 ...prev,
//                                                 tractorFuelType: undefined,
//                                             }));
//                                         }
//                                     }}
//                                     className={`flex flex-col space-y-2 ${
//                                         errors.tractorFuelType
//                                             ? "border-red-500 p-2 rounded"
//                                             : ""
//                                     }`}
//                                 >
//                                     <div className="flex items-center space-x-2">
//                                         <RadioGroupItem
//                                             value="Diesel"
//                                             id="diesel-tractor"
//                                         />
//                                         <Label htmlFor="diesel-tractor">
//                                             Diesel
//                                         </Label>
//                                     </div>
//                                 </RadioGroup>
//                                 {errors.tractorFuelType && (
//                                     <p className="text-sm text-red-500">
//                                         {errors.tractorFuelType}
//                                     </p>
//                                 )}

//                                 <div className="space-y-2 mt-4">
//                                     <Label htmlFor="tractor-volume">
//                                         Volume of Fuel Consumed (Litres)
//                                     </Label>
//                                     <Input
//                                         id="tractor-volume"
//                                         type="number"
//                                         placeholder="Enter volume of fuel consumed"
//                                         value={tractorVolume}
//                                         onChange={(e) => {
//                                             setTractorVolume(e.target.value);
//                                             if (errors.tractorVolume) {
//                                                 setErrors((prev) => ({
//                                                     ...prev,
//                                                     tractorVolume: undefined,
//                                                 }));
//                                             }
//                                         }}
//                                         className={`w-full border-gray-400 ${
//                                             errors.tractorVolume
//                                                 ? "border-red-500 focus:border-red-500"
//                                                 : ""
//                                         }`}
//                                         aria-describedby={
//                                             errors.tractorVolume
//                                                 ? "tractor-volume-error"
//                                                 : undefined
//                                         }
//                                     />
//                                     {errors.tractorVolume && (
//                                         <p
//                                             id="tractor-volume-error"
//                                             className="text-sm text-red-500"
//                                         >
//                                             {errors.tractorVolume}
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* 1.4 Document/Evidence Upload */}
//                         <div>
//                             <Label className="text-md font-semibold mb-2 block">
//                                 1.4 Document/Evidence Upload
//                             </Label>
//                             <div className="ml-6">
//                                 {errors.files && (
//                                     <p className="text-sm text-red-500">
//                                         {errors.files}
//                                     </p>
//                                 )}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {uploadFields.map((field) => (
//                                         <div
//                                             key={field}
//                                             className="flex flex-col gap-2"
//                                         >
//                                             <Label className="text-sm font-medium mb-1 ml-1">
//                                                 {field}
//                                             </Label>
//                                             <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
//                                                 <Label
//                                                     htmlFor={`upload-${field
//                                                         .replace(/\s/g, "-")
//                                                         .toLowerCase()}`}
//                                                     className="cursor-pointer flex flex-col items-center gap-2"
//                                                 >
//                                                     <CloudUpload className="h-6 w-6 text-muted-foreground" />
//                                                     <span className="text-xs text-gray-400 text-center">
//                                                         Upload {field} (Max.
//                                                         10MB)
//                                                     </span>
//                                                 </Label>
//                                                 <Input
//                                                     id={`upload-${field
//                                                         .replace(/\s/g, "-")
//                                                         .toLowerCase()}`}
//                                                     type="file"
//                                                     className="hidden"
//                                                     onChange={(e) =>
//                                                         handleFileChange(
//                                                             field,
//                                                             e
//                                                         )
//                                                     }
//                                                     accept=".pdf,.jpg,.jpeg,.png"
//                                                     aria-label={`Upload ${field}`}
//                                                 />
//                                                 {files[field] && (
//                                                     <p className="text-sm text-green-600 mt-2 text-center truncate">
//                                                         Uploaded:{" "}
//                                                         {files[field]!.name}
//                                                     </p>
//                                                 )}
//                                             </Card>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-3 gap-4 pt-8">
//                             <Button
//                                 variant="outline"
//                                 onClick={onBack}
//                                 className="justify-self-start hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
//                                 aria-label="Previous step"
//                             >
//                                 <ArrowLeft className="h-4 w-4" />
//                                 Previous
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 onClick={handleSaveAndContinue}
//                                 disabled={isSaving}
//                                 className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
//                                 aria-label="Save and continue later"
//                             >
//                                 {isSaving ? (
//                                     <>
//                                         <LoadingSpinner
//                                             size="sm"
//                                             className="mr-2"
//                                         />
//                                         Saving...
//                                     </>
//                                 ) : showSaveSuccess ? (
//                                     <>
//                                         <CheckCircle2 className="h-4 w-4 mr-2" />
//                                         Saved!
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save className="h-4 w-4 mr-2" />
//                                         Save & Continue Later
//                                     </>
//                                 )}
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 onClick={handleNext}
//                                 disabled={isSaving}
//                                 className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
//                                 aria-label="Next step"
//                             >
//                                 Next
//                                 <ArrowRight className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }
