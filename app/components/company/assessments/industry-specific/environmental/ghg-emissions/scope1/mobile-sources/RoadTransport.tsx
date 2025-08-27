"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  CloudUpload,
  ArrowRight,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface RoadTransportProps {
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
  "Fuel card statements",
  "Fleet management reports (consumption per vehicle)",
  "Odometer/GPS mileage logs",
  "Fuel purchase receipts",
  "Vehicle inventory list (make, model, fuel type)",
];

export function RoadTransport({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: RoadTransportProps) {
  const { state, dispatch } = useAssessment();
  const [dieselTruckFuelType, setDieselTruckFuelType] = useState("Diesel");
  const [dieselTruckVolume, setDieselTruckVolume] = useState("");
  const [carFuelTypes, setCarFuelTypes] = useState<{ Petrol: boolean; Diesel: boolean }>({
    Petrol: false,
    Diesel: false,
  });
  const [carPetrolVolume, setCarPetrolVolume] = useState("");
  const [carDieselVolume, setCarDieselVolume] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    dieselTruckFuelType?: string;
    dieselTruckVolume?: string;
    carFuelTypes?: string;
    carPetrolVolume?: string;
    carDieselVolume?: string;
    files?: string;
  }>({});

  useEffect(() => {
    const existingData =
      state.assessmentData.mobileSources?.roadTransport ||
      JSON.parse(localStorage.getItem("esg-assessment-data") || "{}").mobileSources?.roadTransport ||
      {};
    if (existingData) {
      setDieselTruckFuelType(existingData.dieselTruckFuelType || "Diesel");
      setDieselTruckVolume(existingData.dieselTruckVolume || "");
      setCarFuelTypes({
        Petrol: !!existingData.carPetrolVolume,
        Diesel: !!existingData.carDieselVolume,
      });
      setCarPetrolVolume(existingData.carPetrolVolume || "");
      setCarDieselVolume(existingData.carDieselVolume || "");
      setFiles(existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null])));
    }
  }, [state.assessmentData.mobileSources?.roadTransport]);

  const validateForm = () => {
    const newErrors: {
      dieselTruckFuelType?: string;
      dieselTruckVolume?: string;
      carFuelTypes?: string;
      carPetrolVolume?: string;
      carDieselVolume?: string;
      files?: string;
    } = {};

    if (!dieselTruckFuelType) {
      newErrors.dieselTruckFuelType = "Please select a fuel type for trucks";
    }
    if (!dieselTruckVolume) {
      newErrors.dieselTruckVolume = "Please enter the diesel volume for trucks";
    } else if (isNaN(Number(dieselTruckVolume)) || Number(dieselTruckVolume) < 0) {
      newErrors.dieselTruckVolume = "Please enter a valid positive number";
    }

    if (!carFuelTypes.Petrol && !carFuelTypes.Diesel) {
      newErrors.carFuelTypes = "Please select at least one fuel type for company cars/buses";
    }
    if (carFuelTypes.Petrol && !carPetrolVolume) {
      newErrors.carPetrolVolume = "Please enter the petrol volume";
    } else if (
      carFuelTypes.Petrol &&
      (isNaN(Number(carPetrolVolume)) || Number(carPetrolVolume) < 0)
    ) {
      newErrors.carPetrolVolume = "Please enter a valid positive number";
    }
    if (carFuelTypes.Diesel && !carDieselVolume) {
      newErrors.carDieselVolume = "Please enter the diesel volume";
    } else if (
      carFuelTypes.Diesel &&
      (isNaN(Number(carDieselVolume)) || Number(carDieselVolume) < 0)
    ) {
      newErrors.carDieselVolume = "Please enter a valid positive number";
    }

    if (!Object.values(files).some((file) => file !== null)) {
      newErrors.files = "Please upload at least one document";
    }

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

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      dieselTruckFuelType,
      dieselTruckVolume,
      carPetrolVolume: carFuelTypes.Petrol ? carPetrolVolume : "",
      carDieselVolume: carFuelTypes.Diesel ? carDieselVolume : "",
      files,
    };
    dispatch({
      type: "UPDATE_MOBILE_ROAD_TRANSPORT",
      payload,
    });
    dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;
    const payload = {
      dieselTruckFuelType,
      dieselTruckVolume,
      carPetrolVolume: carFuelTypes.Petrol ? carPetrolVolume : "",
      carDieselVolume: carFuelTypes.Diesel ? carDieselVolume : "",
      files,
    };
    dispatch({
      type: "UPDATE_MOBILE_ROAD_TRANSPORT",
      payload,
    });
    dispatch({ type: "SAVE_PROGRESS" });
    console.log("Road Transport Data:", state.assessmentData.mobileSources);
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
            <h3 className="text-2xl font-bold text-foreground">Mobile Sources</h3>
            <p className="text-muted-foreground text-base">
              Emissions from moving equipment or vehicles, such as trucks, ships, or planes.
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
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

            <div>
              <h4 className="text-xl font-medium text-foreground">Road Transportation</h4>
              <p className="text-muted-foreground text-base">
                Emissions from moving equipment or vehicles, such as trucks.
              </p>
            </div>

            {/* 1.1 Fleet of Diesel Trucks */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Fleet of Diesel Trucks for Product Distribution and Logistics
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Type of Fuel</Label>
                <RadioGroup
                  value={dieselTruckFuelType}
                  onValueChange={(value) => {
                    setDieselTruckFuelType(value);
                    if (errors.dieselTruckFuelType) {
                      setErrors((prev) => ({ ...prev, dieselTruckFuelType: undefined }));
                    }
                  }}
                  className={`flex flex-col space-y-2 ${
                    errors.dieselTruckFuelType ? "border-red-500 p-2 rounded" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Diesel" id="diesel" />
                    <Label htmlFor="diesel">Diesel</Label>
                  </div>
                </RadioGroup>
                {errors.dieselTruckFuelType && (
                  <p className="text-sm text-red-500">{errors.dieselTruckFuelType}</p>
                )}

                <div className="space-y-2 mt-4">
                  <Label htmlFor="diesel-truck-volume">Volume of Diesel Consumed (Litres)</Label>
                  <Input
                    id="diesel-truck-volume"
                    type="number"
                    placeholder="Enter volume of diesel consumed"
                    value={dieselTruckVolume}
                    onChange={(e) => {
                      setDieselTruckVolume(e.target.value);
                      if (errors.dieselTruckVolume) {
                        setErrors((prev) => ({ ...prev, dieselTruckVolume: undefined }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.dieselTruckVolume ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.dieselTruckVolume ? "diesel-truck-volume-error" : undefined}
                  />
                  {errors.dieselTruckVolume && (
                    <p id="diesel-truck-volume-error" className="text-sm text-red-500">
                      {errors.dieselTruckVolume}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 1.2 Company Cars and Buses */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Company Cars and Buses Used for Employee Transportation
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Type of Fuel</Label>
                <div className={`flex flex-col space-y-2 ${errors.carFuelTypes ? "border-red-500 p-2 rounded" : ""}`}>
                  {["Petrol (Premium Motor Spirit - PMS)", "Diesel"].map((fuel) => (
                    <div key={fuel} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={fuel.replace(/\s/g, "-").toLowerCase()}
                        checked={carFuelTypes[fuel === "Petrol (Premium Motor Spirit - PMS)" ? "Petrol" : "Diesel"]}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCarFuelTypes((prev) => ({
                            ...prev,
                            [fuel === "Petrol (Premium Motor Spirit - PMS)" ? "Petrol" : "Diesel"]: checked,
                          }));
                          if (errors.carFuelTypes) {
                            setErrors((prev) => ({ ...prev, carFuelTypes: undefined }));
                          }
                          if (!checked) {
                            if (fuel === "Petrol (Premium Motor Spirit - PMS)") {
                              setCarPetrolVolume("");
                              setErrors((prev) => ({ ...prev, carPetrolVolume: undefined }));
                            } else {
                              setCarDieselVolume("");
                              setErrors((prev) => ({ ...prev, carDieselVolume: undefined }));
                            }
                          }
                        }}
                        className="h-4 w-4 rounded border-2 border-green-600 text-green-600 focus:ring-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Select ${fuel} fuel type`}
                      />
                      <Label htmlFor={fuel.replace(/\s/g, "-").toLowerCase()}>{fuel}</Label>
                    </div>
                  ))}
                </div>
                {errors.carFuelTypes && (
                  <p className="text-sm text-red-500">{errors.carFuelTypes}</p>
                )}

                <div className="space-y-2 mt-4">
                  <Label htmlFor="car-petrol-volume">Total Volume of Petrol Consumed (Litres)</Label>
                  <Input
                    id="car-petrol-volume"
                    type="number"
                    placeholder="Enter total volume of petrol consumed"
                    value={carPetrolVolume}
                    onChange={(e) => {
                      setCarPetrolVolume(e.target.value);
                      if (errors.carPetrolVolume) {
                        setErrors((prev) => ({ ...prev, carPetrolVolume: undefined }));
                      }
                    }}
                    disabled={!carFuelTypes.Petrol}
                    className={`w-full border-gray-400 ${
                      errors.carPetrolVolume ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.carPetrolVolume ? "car-petrol-volume-error" : undefined}
                  />
                  {errors.carPetrolVolume && (
                    <p id="car-petrol-volume-error" className="text-sm text-red-500">
                      {errors.carPetrolVolume}
                    </p>
                  )}
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="car-diesel-volume">Total Volume of Diesel Consumed (Litres)</Label>
                  <Input
                    id="car-diesel-volume"
                    type="number"
                    placeholder="Enter total volume of diesel consumed"
                    value={carDieselVolume}
                    onChange={(e) => {
                      setCarDieselVolume(e.target.value);
                      if (errors.carDieselVolume) {
                        setErrors((prev) => ({ ...prev, carDieselVolume: undefined }));
                      }
                    }}
                    disabled={!carFuelTypes.Diesel}
                    className={`w-full border-gray-400 ${
                      errors.carDieselVolume ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.carDieselVolume ? "car-diesel-volume-error" : undefined}
                  />
                  {errors.carDieselVolume && (
                    <p id="car-diesel-volume-error" className="text-sm text-red-500">
                      {errors.carDieselVolume}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 1.3 Document/Evidence Upload */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.3 Document/Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
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
                          className="hidden"
                          onChange={(e) => handleFileChange(field, e)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          aria-label={`Upload ${field}`}
                        />
                        {files[field] && (
                          <p className="text-sm text-green-600 mt-2 text-center truncate">
                            Uploaded: {files[field]!.name}
                          </p>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="justify-self-start hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
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
                variant="outline"
                onClick={handleNext}
                disabled={isSaving}
                className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Next step"
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