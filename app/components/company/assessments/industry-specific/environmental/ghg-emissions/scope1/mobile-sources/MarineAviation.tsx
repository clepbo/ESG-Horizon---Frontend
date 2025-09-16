"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { ArrowLeft, Save, CheckCircle2, CloudUpload } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import type { AssessmentData } from "@/hooks/useAssessment";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";

interface MarineAviationProps {
  onBack: () => void;
  onSubmit: () => void;
  stepIndex: number;
  totalSteps: number;
  isSubmitted: boolean;
}

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
}

const uploadFields = [
  "Vessel logbooks (fuel bunkered per trip)",
  "Supplier invoices (MGO/Jet A-1)",
  "Aviation fuel receipts",
  "Flight logs (distance, refueling events)",
];

export function MarineAviation({
  onBack,
  onSubmit,
  stepIndex,
  totalSteps,
  isSubmitted,
}: MarineAviationProps) {
  const { state, dispatch } = useAssessment();
  const [helicopterFuelType, setHelicopterFuelType] = useState(
    "Aviation Turbine Fuel (Jet A-1)"
  );
  const [helicopterVolume, setHelicopterVolume] = useState("");
  const [vesselFuelType, setVesselFuelType] = useState(
    "Marine Diesel Oil (MDO)"
  );
  const [otherFuelType, setOtherFuelType] = useState("");
  const [vesselVolume, setVesselVolume] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    helicopterFuelType?: string;
    helicopterVolume?: string;
    vesselFuelType?: string;
    otherFuelType?: string;
    vesselVolume?: string;
    files?: string;
  }>({});

  // useEffect(() => {
  //     const existingData =
  //         state.assessmentData.mobileSources?.marineAviation ||
  //         JSON.parse(localStorage.getItem("esg-assessment-data") || "{}")
  //             .mobileSources?.marineAviation ||
  //         {};
  //     if (existingData) {
  //         setHelicopterFuelType(
  //             existingData.helicopterFuelType ||
  //                 "Aviation Turbine Fuel (Jet A-1)"
  //         );
  //         setHelicopterVolume(existingData.helicopterVolume || "");
  //         setVesselFuelType(
  //             existingData.vesselFuelType || "Marine Diesel Oil (MDO)"
  //         );
  //         setOtherFuelType(existingData.otherFuelType || "");
  //         setVesselVolume(existingData.vesselVolume || "");
  //         setFiles(
  //             existingData.files ||
  //                 Object.fromEntries(
  //                     uploadFields.map((field) => [field, null])
  //                 )
  //         );
  //     }
  // }, [state.assessmentData.mobileSources?.marineAviation]);

  useEffect(() => {
    const existingData = state.assessmentData.mobileSources
      ?.marineAviation as NonNullable<
      AssessmentData["mobileSources"]
    >["marineAviation"];
    if (existingData) {
      setHelicopterFuelType(
        existingData.helicopterFuelType ?? "Aviation Turbine Fuel (Jet A-1)"
      );
      setHelicopterVolume(existingData.helicopterVolume?.toString() ?? "");
      setVesselFuelType(
        existingData.vesselFuelType ?? "Marine Diesel Oil (MDO)"
      );
      setOtherFuelType(existingData.otherFuelType ?? "");
      setVesselVolume(existingData.vesselVolume?.toString() ?? "");
      setFiles(
        existingData.files ??
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData.mobileSources?.marineAviation]);
  const { filled, total } = useMemo(() => {
    const allInputs = [helicopterVolume, vesselVolume];

    const numericProgress = allInputs.map(
      (value) => value !== "" && Number(value) >= 0
    );

    const fileProgress = Object.values(files).map((file) => file !== null);

    const fuelTypeProgress = [helicopterFuelType !== "", vesselFuelType !== ""];

    const progressStatus = [
      ...numericProgress,
      ...fileProgress,
      ...fuelTypeProgress,
    ];

    return calculateProgress(progressStatus);
  }, [
    helicopterVolume,
    vesselVolume,
    files,
    helicopterFuelType,
    vesselFuelType,
  ]);

  const validateForm = () => {
    const newErrors: {
      helicopterFuelType?: string;
      helicopterVolume?: string;
      vesselFuelType?: string;
      otherFuelType?: string;
      vesselVolume?: string;
      files?: string;
    } = {};

    if (!helicopterFuelType) {
      newErrors.helicopterFuelType =
        "Please select a fuel type for helicopters";
    }
    if (!helicopterVolume) {
      newErrors.helicopterVolume =
        "Please enter the fuel volume for helicopters";
    } else if (
      isNaN(Number(helicopterVolume)) ||
      Number(helicopterVolume) < 0
    ) {
      newErrors.helicopterVolume = "Please enter a valid positive number";
    }

    if (!vesselFuelType) {
      newErrors.vesselFuelType = "Please select a fuel type for vessels";
    }
    if (vesselFuelType === "Other Fuels" && !otherFuelType.trim()) {
      newErrors.otherFuelType = "Please specify the other fuel type";
    }
    if (!vesselVolume) {
      newErrors.vesselVolume = "Please enter the fuel volume for vessels";
    } else if (isNaN(Number(vesselVolume)) || Number(vesselVolume) < 0) {
      newErrors.vesselVolume = "Please enter a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      helicopterFuelType,
      helicopterVolume: Number(helicopterVolume),
      vesselFuelType,
      otherFuelType: vesselFuelType === "Other Fuels" ? otherFuelType : "",
      vesselVolume: Number(vesselVolume),
      files,
    };
    dispatch({
      type: "UPDATE_MOBILE_MARINE_AVIATION",
      payload,
    });
    dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const payload = {
      helicopterFuelType,
      helicopterVolume: Number(helicopterVolume),
      vesselFuelType,
      otherFuelType: vesselFuelType === "Other Fuels" ? otherFuelType : "",
      vesselVolume: Number(vesselVolume),
      files,
    };
    dispatch({
      type: "UPDATE_MOBILE_MARINE_AVIATION",
      payload,
    });
    dispatch({ type: "SAVE_PROGRESS" });
    onSubmit();
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
            <h3 className="text-2xl font-bold text-foreground">
              Mobile Sources
            </h3>
            <p className="text-muted-foreground text-base">
              Emissions from moving equipment or vehicles, such as trucks,
              ships, or planes.
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

            <div>
              <h4 className="text-xl font-medium text-foreground">
                Marine and Aviation
              </h4>
              <p className="text-muted-foreground text-base">
                Emissions from ships, boats, aircraft, and related subsidiaries
                for transport or industrial use.
              </p>
            </div>

            {/* 1.1 Helicopters */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Helicopters Used for Transporting Personnel and Equipment to
                Offshore Oil Platforms
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Type of Fuel</Label>
                <RadioGroup
                  value={helicopterFuelType}
                  onValueChange={(value) => {
                    setHelicopterFuelType(value);
                    if (errors.helicopterFuelType) {
                      setErrors((prev) => ({
                        ...prev,
                        helicopterFuelType: undefined,
                      }));
                    }
                  }}
                  className={`flex flex-col space-y-2 ${
                    errors.helicopterFuelType
                      ? "border-red-500 p-2 rounded"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Aviation Turbine Fuel (Jet A-1)"
                      id="jet-a1"
                    />
                    <Label htmlFor="jet-a1">
                      Aviation Turbine Fuel (Jet A-1)
                    </Label>
                  </div>
                </RadioGroup>
                {errors.helicopterFuelType && (
                  <p className="text-sm text-red-500">
                    {errors.helicopterFuelType}
                  </p>
                )}

                <div className="space-y-2 mt-4">
                  <Label htmlFor="helicopter-volume">
                    Volume of Fuel Consumed (Litres)
                  </Label>
                  <Input
                    id="helicopter-volume"
                    type="number"
                    placeholder="Enter volume of fuel consumed"
                    value={helicopterVolume}
                    onChange={(e) => {
                      setHelicopterVolume(e.target.value);
                      if (errors.helicopterVolume) {
                        setErrors((prev) => ({
                          ...prev,
                          helicopterVolume: undefined,
                        }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.helicopterVolume
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    aria-describedby={
                      errors.helicopterVolume
                        ? "helicopter-volume-error"
                        : undefined
                    }
                  />
                  {errors.helicopterVolume && (
                    <p
                      id="helicopter-volume-error"
                      className="text-sm text-red-500"
                    >
                      {errors.helicopterVolume}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 1.2 Company-owned Boats and Vessels */}
            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Company-owned Boats and Vessels for Transport in the Niger
                Delta and Offshore Subsidiaries
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Type of Fuel</Label>
                <RadioGroup
                  value={vesselFuelType}
                  onValueChange={(value) => {
                    setVesselFuelType(value);
                    if (value !== "Other Fuels") {
                      setOtherFuelType("");
                      setErrors((prev) => ({
                        ...prev,
                        otherFuelType: undefined,
                      }));
                    }
                    if (errors.vesselFuelType) {
                      setErrors((prev) => ({
                        ...prev,
                        vesselFuelType: undefined,
                      }));
                    }
                  }}
                  className={`flex flex-col space-y-2 ${
                    errors.vesselFuelType ? "border-red-500 p-2 rounded" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Marine Diesel Oil (MDO)" id="mdo" />
                    <Label htmlFor="mdo">Marine Diesel Oil (MDO)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other Fuels" id="other-fuels" />
                    <Label htmlFor="other-fuels">
                      Other Fuels (specify type)
                    </Label>
                  </div>
                </RadioGroup>
                {errors.vesselFuelType && (
                  <p className="text-sm text-red-500">
                    {errors.vesselFuelType}
                  </p>
                )}

                {vesselFuelType === "Other Fuels" && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="other-fuel-type">
                      Specify Other Fuel Type
                    </Label>
                    <Input
                      id="other-fuel-type"
                      type="text"
                      placeholder="Enter fuel type"
                      value={otherFuelType}
                      onChange={(e) => {
                        setOtherFuelType(e.target.value);
                        if (errors.otherFuelType) {
                          setErrors((prev) => ({
                            ...prev,
                            otherFuelType: undefined,
                          }));
                        }
                      }}
                      className={`w-full border-gray-400 ${
                        errors.otherFuelType
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      aria-describedby={
                        errors.otherFuelType
                          ? "other-fuel-type-error"
                          : undefined
                      }
                    />
                    {errors.otherFuelType && (
                      <p
                        id="other-fuel-type-error"
                        className="text-sm text-red-500"
                      >
                        {errors.otherFuelType}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <Label htmlFor="vessel-volume">
                    Volume of Fuel Consumed (Litres)
                  </Label>
                  <Input
                    id="vessel-volume"
                    type="number"
                    placeholder="Enter volume of fuel consumed"
                    value={vesselVolume}
                    onChange={(e) => {
                      setVesselVolume(e.target.value);
                      if (errors.vesselVolume) {
                        setErrors((prev) => ({
                          ...prev,
                          vesselVolume: undefined,
                        }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.vesselVolume
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    aria-describedby={
                      errors.vesselVolume ? "vessel-volume-error" : undefined
                    }
                  />
                  {errors.vesselVolume && (
                    <p
                      id="vessel-volume-error"
                      className="text-sm text-red-500"
                    >
                      {errors.vesselVolume}
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
                {errors.files && (
                  <p className="text-sm text-red-500">{errors.files}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1">
                        {field}
                      </Label>
                      <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
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
                onClick={handleSubmit}
                disabled={isSaving}
                className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                aria-label="Submit assessment"
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
