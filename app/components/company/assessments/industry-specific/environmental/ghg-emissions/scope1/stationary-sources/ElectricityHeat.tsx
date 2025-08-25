"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { ArrowLeft, Save, CheckCircle2, Upload } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface ElectricityHeatFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
}

const uploadFields = [
  "Gas supply invoices from suppliers",
  "Calibrated gas meter readings (scm or scf logs)",
  "Turbine operation logs (hours, efficiency)",
  "Fuel purchase receipts for diesel generators",
  "Generator capacity certificates (kVA rating)",
  "On-site storage/fuel tank logs",
];

export function ElectricityHeatForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: ElectricityHeatFormProps) {
  const { state, dispatch } = useAssessment();
  const [dieselFuelType, setDieselFuelType] = useState("Diesel (Automotive Gas Oil - AGO)");
  const [dieselVolume, setDieselVolume] = useState("");
  const [gasFuelType, setGasFuelType] = useState("Natural Gas");
  const [gasVolume, setGasVolume] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    dieselVolume?: string;
    gasVolume?: string;
    files?: string;
  }>({});

  useEffect(() => {
    const existingData =
      state.assessmentData.stationarySources?.electricityHeat ||
      JSON.parse(localStorage.getItem("stationarySources.electricityHeat") || "{}");
    if (existingData) {
      setDieselFuelType(existingData.dieselFuelType || "Diesel (Automotive Gas Oil - AGO)");
      setDieselVolume(existingData.dieselVolume || "");
      setGasFuelType(existingData.gasFuelType || "Natural Gas");
      setGasVolume(existingData.gasVolume || "");
      setFiles(existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null])));
    }
  }, [state.assessmentData.stationarySources?.electricityHeat]);

  const validateForm = () => {
    const newErrors: { dieselVolume?: string; gasVolume?: string; files?: string } = {};
    if (!dieselVolume && !gasVolume) {
      newErrors.dieselVolume = "At least one volume field must be filled";
      newErrors.gasVolume = "At least one volume field must be filled";
    }
    if (dieselVolume && (isNaN(Number(dieselVolume)) || Number(dieselVolume) < 0)) {
      newErrors.dieselVolume = "Please enter a valid positive number";
    }
    if (gasVolume && (isNaN(Number(gasVolume)) || Number(gasVolume) < 0)) {
      newErrors.gasVolume = "Please enter a valid positive number";
    }
    // Optional: Require at least one file upload
    // if (!Object.values(files).some((file) => file !== null)) {
    //   newErrors.files = "Please upload at least one document";
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          files: `File "${field}" exceeds 10MB limit`,
        }));
        return;
      }
      setFiles((prev) => ({
        ...prev,
        [field]: {
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
        },
      }));
      if (errors.files) {
        setErrors((prev) => ({ ...prev, files: undefined }));
      }
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = { dieselFuelType, dieselVolume, gasFuelType, gasVolume, files };
    dispatch({
      type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
      payload,
    });
    dispatch({ type: "SAVE_PROGRESS" });
    localStorage.setItem("stationarySources.electricityHeat", JSON.stringify(payload));
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;
    dispatch({
      type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
      payload: { dieselFuelType, dieselVolume, gasFuelType, gasVolume, files },
    });
    localStorage.setItem(
      "stationarySources.electricityHeat",
      JSON.stringify({ dieselFuelType, dieselVolume, gasFuelType, gasVolume, files })
    );
    onNext();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 bg-transparent transition-colors hover:bg-accent"
          aria-label="Go back to previous step"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">
              Section {stepIndex} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-500">{percent}% complete</span>
          </div>
          <div className="w-full h-3 bg-green-300 rounded-lg">
            <div
              className="h-3 bg-green-800 rounded transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Electricity & Heat Generation
          </h1>
          <p className="text-muted-foreground">
            Input data for diesel-powered generators and gas-fired turbines
          </p>
          {state.lastSaved && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Last saved: {state.lastSaved.toLocaleString()}
            </p>
          )}
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle>Fuel Consumption Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Diesel-Powered Generators */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                Diesel-Powered Generators
              </Label>
              <div className="space-y-2">
                <Label>Type of Fuel</Label>
                <RadioGroup
                  value={dieselFuelType}
                  onValueChange={setDieselFuelType}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Diesel (Automotive Gas Oil - AGO)"
                      id="diesel-ago"
                      checked={dieselFuelType === "Diesel (Automotive Gas Oil - AGO)"}
                    />
                    <Label htmlFor="diesel-ago">Diesel (Automotive Gas Oil - AGO)</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diesel-volume">Volume of Diesel Consumed (Litres)</Label>
                <Input
                  id="diesel-volume"
                  type="number"
                  placeholder="Enter volume in litres"
                  value={dieselVolume}
                  onChange={(e) => {
                    setDieselVolume(e.target.value);
                    if (errors.dieselVolume) {
                      setErrors((prev) => ({ ...prev, dieselVolume: undefined }));
                    }
                  }}
                  className={`w-full ${
                    errors.dieselVolume ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  aria-describedby={errors.dieselVolume ? "diesel-volume-error" : undefined}
                />
                {errors.dieselVolume && (
                  <p id="diesel-volume-error" className="text-sm text-red-500">
                    {errors.dieselVolume}
                  </p>
                )}
              </div>
            </div>

            {/* Gas-Fired Turbines */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Gas-Fired Turbines</Label>
              <div className="space-y-2">
                <Label>Type of Fuel</Label>
                <RadioGroup
                  value={gasFuelType}
                  onValueChange={setGasFuelType}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Natural Gas"
                      id="natural-gas"
                      checked={gasFuelType === "Natural Gas"}
                    />
                    <Label htmlFor="natural-gas">Natural Gas</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas-volume">Volume of Gas Consumed (m³)</Label>
                <Input
                  id="gas-volume"
                  type="number"
                  placeholder="Enter volume in cubic meters"
                  value={gasVolume}
                  onChange={(e) => {
                    setGasVolume(e.target.value);
                    if (errors.gasVolume) {
                      setErrors((prev) => ({ ...prev, gasVolume: undefined }));
                    }
                  }}
                  className={`w-full ${
                    errors.gasVolume ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  aria-describedby={errors.gasVolume ? "gas-volume-error" : undefined}
                />
                {errors.gasVolume && (
                  <p id="gas-volume-error" className="text-sm text-red-500">
                    {errors.gasVolume}
                  </p>
                )}
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Document/Evidence Upload</Label>
              {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadFields.map((field) => (
                  <Card
                    key={field}
                    className="p-4 flex flex-col items-center justify-center border-dashed border-2 hover:border-solid hover:border-primary transition-all"
                  >
                    <Label
                      htmlFor={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-center">
                        Upload {field} (Max. 10MB)
                      </span>
                    </Label>
                    <Input
                      id={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(field, e)}
                      accept=".pdf,.jpg,.jpeg,.png"
                      aria-label={`Upload ${field}`}
                    />
                    {files[field] && (
                      <p className="text-sm text-green-600 mt-2 text-center">
                        Uploaded: {files[field]!.name}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                onClick={onBack}
                className="transition-colors bg-transparent"
                aria-label="Previous step"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 transition-colors"
                aria-label="Save and continue later"
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
                className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                onClick={handleNext}
                disabled={isSaving}
                aria-label="Next step"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import {
//     Card,
//     CardContent,
//     CardHeader,
//     CardTitle,
// } from "@/app/components/ui/card";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
// import { useAssessment } from "@/hooks/useAssessment";
// import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

// interface ElectricityHeatFormProps {
//     onBack: () => void;
//     onNext: () => void;
//     currentStep: number;
//     stepIndex: number;
//     totalSteps: number;
//     percent: number;
// }

// export function ElectricityHeatForm({
//     onBack,
//     onNext,
//     stepIndex,
//     totalSteps,
//     percent,
// }: ElectricityHeatFormProps) {
//     const { state, dispatch } = useAssessment();
//     const [dieselVolume, setDieselVolume] = useState("");
//     const [gasVolume, setGasVolume] = useState("");
//     const [isSaving, setIsSaving] = useState(false);
//     const [showSaveSuccess, setShowSaveSuccess] = useState(false);
//     const [errors, setErrors] = useState<{ diesel?: string; gas?: string }>({});

//     useEffect(() => {
//         // Load from local storage or state
//         const existingData =
//             state.assessmentData.stationarySources?.electricityHeat ||
//             JSON.parse(
//                 localStorage.getItem("stationarySources.electricityHeat") ||
//                     "{}"
//             );
//         if (existingData) {
//             setDieselVolume(existingData.dieselVolume || "");
//             setGasVolume(existingData.gasVolume || "");
//         }
//     }, [state.assessmentData.stationarySources?.electricityHeat]);

//     const validateForm = () => {
//         const newErrors: { diesel?: string; gas?: string } = {};
//         if (!dieselVolume && !gasVolume) {
//             newErrors.diesel = "At least one field must be filled";
//             newErrors.gas = "At least one field must be filled";
//         }
//         if (
//             dieselVolume &&
//             (isNaN(Number(dieselVolume)) || Number(dieselVolume) < 0)
//         ) {
//             newErrors.diesel = "Please enter a valid positive number";
//         }
//         if (gasVolume && (isNaN(Number(gasVolume)) || Number(gasVolume) < 0)) {
//             newErrors.gas = "Please enter a valid positive number";
//         }
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSaveAndContinue = async () => {
//         if (!validateForm()) return;

//         setIsSaving(true);
//         const payload = { dieselVolume, gasVolume };
//         dispatch({
//             type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
//             payload,
//         });
//         dispatch({ type: "SAVE_PROGRESS" });
//         localStorage.setItem(
//             "stationarySources.electricityHeat",
//             JSON.stringify(payload)
//         );
//         setIsSaving(false);
//         setShowSaveSuccess(true);
//         setTimeout(() => setShowSaveSuccess(false), 2000);
//     };

//     const handleNext = () => {
//         if (!validateForm()) return;
//         dispatch({
//             type: "UPDATE_STATIONARY_ELECTRICITY_HEAT",
//             payload: { dieselVolume, gasVolume },
//         });
//         localStorage.setItem(
//             "stationarySources.electricityHeat",
//             JSON.stringify({ dieselVolume, gasVolume })
//         );
//         onNext();
//     };

//     return (
//         <div className="min-h-screen bg-background p-6">
//             <div className="max-w-4xl mx-auto space-y-6">
//                 <Button
//                     variant="outline"
//                     onClick={onBack}
//                     className="flex items-center gap-2 bg-transparent transition-colors hover:bg-accent"
//                 >
//                     <ArrowLeft className="h-4 w-4" />
//                     Back
//                 </Button>

//                 <div className="mb-6">
//                     <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm font-medium text-gray-500">
//                             Section {stepIndex} of {totalSteps}
//                         </span>
//                         <span className="text-sm font-medium text-gray-500">
//                             {percent}% complete
//                         </span>
//                     </div>
//                     <div className="w-full h-3 bg-green-300 rounded-lg">
//                         <div
//                             className="h-3 bg-green-800 rounded transition-all duration-300"
//                             style={{ width: `${percent}%` }}
//                         />
//                     </div>
//                 </div>

//                 <div className="space-y-2">
//                     <h1 className="text-2xl font-bold text-foreground">
//                         Electricity & Heat Generation
//                     </h1>
//                     <p className="text-muted-foreground">
//                         Input data for diesel powered generators and gas fired
//                         turbines
//                     </p>
//                     {state.lastSaved && (
//                         <p className="text-sm text-green-600 flex items-center gap-1">
//                             <CheckCircle2 className="h-4 w-4" />
//                             Last saved: {state.lastSaved.toLocaleString()}
//                         </p>
//                     )}
//                 </div>

//                 <Card className="animate-in slide-in-from-bottom-4 duration-500">
//                     <CardHeader>
//                         <CardTitle>Fuel Consumption Data</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                         <div className="space-y-2">
//                             <Label htmlFor="diesel-volume">
//                                 Diesel Powered Generator (Litres)
//                             </Label>
//                             <Input
//                                 id="diesel-volume"
//                                 type="number"
//                                 placeholder="Enter volume in litres"
//                                 value={dieselVolume}
//                                 onChange={(e) => {
//                                     setDieselVolume(e.target.value);
//                                     if (errors.diesel)
//                                         setErrors((prev) => ({
//                                             ...prev,
//                                             diesel: undefined,
//                                         }));
//                                 }}
//                                 className={
//                                     errors.diesel
//                                         ? "border-red-500 focus:border-red-500"
//                                         : ""
//                                 }
//                             />
//                             {errors.diesel && (
//                                 <p className="text-sm text-red-500">
//                                     {errors.diesel}
//                                 </p>
//                             )}
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="gas-volume">
//                                 Gas Fired Turbine (m³)
//                             </Label>
//                             <Input
//                                 id="gas-volume"
//                                 type="number"
//                                 placeholder="Enter volume in cubic meters"
//                                 value={gasVolume}
//                                 onChange={(e) => {
//                                     setGasVolume(e.target.value);
//                                     if (errors.gas)
//                                         setErrors((prev) => ({
//                                             ...prev,
//                                             gas: undefined,
//                                         }));
//                                 }}
//                                 className={
//                                     errors.gas
//                                         ? "border-red-500 focus:border-red-500"
//                                         : ""
//                                 }
//                             />
//                             {errors.gas && (
//                                 <p className="text-sm text-red-500">
//                                     {errors.gas}
//                                 </p>
//                             )}
//                         </div>

//                         <div className="flex gap-4 pt-6">
//                             <Button
//                                 variant="outline"
//                                 onClick={onBack}
//                                 className="transition-colors bg-transparent"
//                             >
//                                 Previous
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 onClick={handleSaveAndContinue}
//                                 disabled={isSaving}
//                                 className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 transition-colors"
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
//                                 className="bg-green-600 hover:bg-green-700 text-white transition-colors"
//                                 onClick={handleNext}
//                                 disabled={isSaving}
//                             >
//                                 Next
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }