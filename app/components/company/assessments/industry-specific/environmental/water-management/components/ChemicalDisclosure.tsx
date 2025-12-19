"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Save } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import ReusableInput from "./ReusableInput";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";

interface ChemicalDisclosureProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  backToAssessment: () => void;
  backToDisclosureTopic: () => void;
  backToWaterWasteManagement: () => void;
}

export default function ChemicalDisclosure({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  backToAssessment,
  backToDisclosureTopic,
  backToWaterWasteManagement,
}: ChemicalDisclosureProps) {
  const numberOfWellsWithPublicDisclosure = useFormattedNumber("");
  const volumeRecycledReused = useFormattedNumber("");

  const { state, dispatch } = useAssessment();
  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow("chemical-disclosure");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [operatesFrackedWells, setOperatesFrackedWells] = useState<string>("");

  const features = [
    {
      label: "Assessments",
      onClick: backToAssessment,
    },
    {
      label: "Disclosure Topic",
      onClick: backToDisclosureTopic,
    },
    {
      label: "Water and Waterwaste management",
      onClick: backToWaterWasteManagement,
    },
    {
      label: "Chemical Disclosure",
    },
  ];

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const [formData, setFormData] = useState({
    numberOfWellsWithPublicDisclosureUnit: "",
    volumeRecycledReusedUnit: "",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts
        ?.chemicalDisclosure;
    if (existingData && Object.keys(existingData).length > 0) {
      setOperatesFrackedWells(existingData.operatesFrackedWells || "");
      if (existingData.operatesFrackedWells === "yes") {
        numberOfWellsWithPublicDisclosure.handleChange(
          String(existingData.numberOfWellsWithPublicDisclosure || "")
        );
        volumeRecycledReused.handleChange(String(existingData.volumeRecycledReused || ""));
        setFormData({
          numberOfWellsWithPublicDisclosureUnit:
            existingData.numberOfWellsWithPublicDisclosureUnit || "",
          volumeRecycledReusedUnit: existingData.volumeRecycledReusedUnit || "",
        });
      }
      setFilesAndLinks(existingData.filesAndLinks || []);
    }
  }, [
    state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts
      ?.chemicalDisclosure,
    numberOfWellsWithPublicDisclosure,
    volumeRecycledReused,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate radio button selection
    if (!operatesFrackedWells) {
      newErrors.operatesFrackedWells = "This field is required";
    }

    // Validate fields based on selection
    if (operatesFrackedWells === "yes") {
      if (!numberOfWellsWithPublicDisclosure.rawValue) {
        newErrors.numberOfWellsWithPublicDisclosure = "Number of wells is required";
      }
      if (!formData.numberOfWellsWithPublicDisclosureUnit) {
        newErrors.numberOfWellsWithPublicDisclosureUnit = "Unit is required";
      }

      if (!volumeRecycledReused.rawValue) {
        newErrors.volumeRecycledReused = "Volume is required";
      }
      if (!formData.volumeRecycledReusedUnit) {
        newErrors.volumeRecycledReusedUnit = "Unit is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useMemo(() => {
    const hasRadioSelection = operatesFrackedWells !== "";

    let hasAdditionalFields = false;
    if (operatesFrackedWells === "yes") {
      const hasNumberOfWells =
        numberOfWellsWithPublicDisclosure.rawValue !== "" &&
        formData.numberOfWellsWithPublicDisclosureUnit !== "";
      const hasVolumeRecycled =
        volumeRecycledReused.rawValue !== "" && formData.volumeRecycledReusedUnit !== "";
      hasAdditionalFields = hasNumberOfWells && hasVolumeRecycled;
    } else if (operatesFrackedWells === "no") {
      hasAdditionalFields = true; // No additional fields needed for "No"
    }

    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([hasRadioSelection, hasAdditionalFields, hasEvidence]);
  }, [
    operatesFrackedWells,
    numberOfWellsWithPublicDisclosure.rawValue,
    volumeRecycledReused.rawValue,
    formData.numberOfWellsWithPublicDisclosureUnit,
    formData.volumeRecycledReusedUnit,
    filesAndLinks,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = {
      operatesFrackedWells,
      ...(operatesFrackedWells === "yes" && {
        numberOfWellsWithPublicDisclosure: Number(numberOfWellsWithPublicDisclosure.rawValue),
        numberOfWellsWithPublicDisclosureUnit: formData.numberOfWellsWithPublicDisclosureUnit,
        volumeRecycledReused: Number(volumeRecycledReused.rawValue),
        volumeRecycledReusedUnit: formData.volumeRecycledReusedUnit,
      }),
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_CHEMICAL", payload });

    try {
      await saveNow(
        "environment.waterManagement.hydraulicFracturingImpacts.chemicalDisclosure",
        payload
      );
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch {
      toast.error("Failed to save data");
    }
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      operatesFrackedWells,
      ...(operatesFrackedWells === "yes" && {
        numberOfWellsWithPublicDisclosure: Number(numberOfWellsWithPublicDisclosure.rawValue),
        numberOfWellsWithPublicDisclosureUnit: formData.numberOfWellsWithPublicDisclosureUnit,
        volumeRecycledReused: Number(volumeRecycledReused.rawValue),
        volumeRecycledReusedUnit: formData.volumeRecycledReusedUnit,
      }),
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_CHEMICAL", payload });
    onContinueToNextAssessment();
  };

  const handlePrevious = () => {
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
    if (errors.filesAndLinks && fields.length > 0) {
      setErrors((prev) => ({ ...prev, filesAndLinks: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={features} />
      <div className="max-w-5xl mx-auto space-y-6 ">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">Chemical Disclosure</h3>
            <p className="text-muted-foreground text-base">
              Report on hydraulic fracturing operations and chemical disclosure practices during the
              reporting period.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            {/* Progress Bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={3}
              totalFields={4}
              isSubmitted={false}
            />

            {/* Radio Button Question */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  Does your company operate hydraulically fractured wells during the reporting
                  period?
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Indicate whether your company operated any hydraulically fractured (fracking)
                      wells during the reporting period. This helps determine if reporting on
                      chemical use and water quality impacts is required.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <RadioGroup
                value={operatesFrackedWells}
                onValueChange={(value) => {
                  setOperatesFrackedWells(value);
                  setErrors((prev) => ({ ...prev, operatesFrackedWells: "" }));
                }}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>

              {errors.operatesFrackedWells && (
                <p className="text-sm text-red-600">{errors.operatesFrackedWells}</p>
              )}
            </div>

            {/* Conditional Fields for YES response */}
            {operatesFrackedWells === "yes" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <ReusableInput
                  label={"Number of Wells with Public Disclosure of All Chemicals"}
                  tooltipTitle={"Number of Wells with Public Disclosure of All Chemicals"}
                  tooltipBody={
                    "How many of the hydraulically fractured wells have full chemical disclosure publicly reported through government databases or platforms such as FracFocus or regulator portals."
                  }
                  inputValue={numberOfWellsWithPublicDisclosure.displayValue}
                  unitValue={formData.numberOfWellsWithPublicDisclosureUnit}
                  onInputChange={(num) => {
                    numberOfWellsWithPublicDisclosure.handleChange(String(num));
                    setErrors((prev) => ({ ...prev, numberOfWellsWithPublicDisclosure: "" }));
                  }}
                  onUnitChange={(unit) => {
                    handleInputChange("numberOfWellsWithPublicDisclosureUnit", unit);
                    setErrors((prev) => ({ ...prev, numberOfWellsWithPublicDisclosureUnit: "" }));
                  }}
                  error={errors.numberOfWellsWithPublicDisclosure}
                  unitError={errors.numberOfWellsWithPublicDisclosureUnit}
                  formatNumbers={false}
                />

                <ReusableInput
                  label={"Volume Recycled/Reused"}
                  tooltipTitle={"Volume Recycled/Reused"}
                  tooltipBody={
                    "Total volume of hydraulic fracturing fluids or flowback water that was treated and reused instead of disposed. Indicates level of chemical and water stewardship in operations."
                  }
                  inputValue={volumeRecycledReused.displayValue}
                  unitValue={formData.volumeRecycledReusedUnit}
                  onInputChange={(num) => {
                    volumeRecycledReused.handleChange(String(num));
                    setErrors((prev) => ({ ...prev, volumeRecycledReused: "" }));
                  }}
                  onUnitChange={(unit) => {
                    handleInputChange("volumeRecycledReusedUnit", unit);
                    setErrors((prev) => ({ ...prev, volumeRecycledReusedUnit: "" }));
                  }}
                  error={errors.volumeRecycledReused}
                  unitError={errors.volumeRecycledReusedUnit}
                  formatNumbers={false}
                />
              </div>
            )}

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
                {operatesFrackedWells === "yes" && (
                  <span className="text-sm text-blue-600 font-medium">
                    Required for all submissions
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600">
                {operatesFrackedWells === "yes"
                  ? "Upload supporting documents such as FracFocus disclosure reports, chemical inventory lists, recycling program documentation, and regulatory compliance records for hydraulic fracturing operations."
                  : "Upload supporting documents or statements confirming that no hydraulic fracturing operations were conducted during the reporting period, along with any relevant policy documentation."}
              </p>

              <div className="mt-6">
                <AddMoreFilesLinks
                  onFieldsChange={handleFilesAndLinksChange}
                  initialData={filesAndLinks}
                  uploadService={uploadService}
                />
              </div>

              {errors.filesAndLinks && (
                <p className="text-sm text-red-600 mt-2">{errors.filesAndLinks}</p>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="justify-self-start border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isActionLoading}
                className="justify-self-center bg-primary text-white hover:bg-teal-300 flex items-center gap-2"
              >
                {isActionLoading ? (
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
                disabled={isActionLoading}
                className="justify-self-end border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
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
