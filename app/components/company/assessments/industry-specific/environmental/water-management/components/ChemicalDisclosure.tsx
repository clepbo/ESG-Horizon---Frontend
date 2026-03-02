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
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const totalNumberOfFracturedWells = useFormattedNumber("");
  const numberOfWellsWithPublicDisclosure = useFormattedNumber("");

  const { state, dispatch } = useAssessment();
  const { saveNow, isLoading: isActionLoading } = useAssessmentFlow("chemical-disclosure");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [operatesHydraulicFracturingWells, setOperatesHydraulicFracturingWells] =
    useState<string>("");

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
    totalNumberOfFracturedWellsUnit: "Wells",
    numberOfWellsWithPublicDisclosureUnit: "Wells",
  });

  useEffect(() => {
    const existingData =
      state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts
        ?.chemicalDisclosure;
    if (existingData && Object.keys(existingData).length > 0) {
      setOperatesHydraulicFracturingWells(existingData.operatesHydraulicFracturingWells || "");
      if (existingData.operatesHydraulicFracturingWells === "yes") {
        totalNumberOfFracturedWells.handleChange(
          String(existingData.totalNumberOfFracturedWells || "")
        );
        numberOfWellsWithPublicDisclosure.handleChange(
          String(existingData.numberOfWellsWithPublicDisclosure || "")
        );
        setFormData({
          totalNumberOfFracturedWellsUnit: existingData.totalNumberOfFracturedWellsUnit || "Wells",
          numberOfWellsWithPublicDisclosureUnit:
            existingData.numberOfWellsWithPublicDisclosureUnit || "Wells",
        });
      }
      setFilesAndLinks(existingData.filesAndLinks || []);
    }
  }, [
    state.assessmentData.environment?.waterManagement?.hydraulicFracturingImpacts
      ?.chemicalDisclosure,
    numberOfWellsWithPublicDisclosure,
    totalNumberOfFracturedWells,
  ]);

  const { filled, total } = useMemo(() => {
    const hasRadioSelection = operatesHydraulicFracturingWells !== "";

    let hasAdditionalFields = false;
    if (operatesHydraulicFracturingWells === "yes") {
      const hasTotalWells =
        totalNumberOfFracturedWells.rawValue !== "" &&
        formData.totalNumberOfFracturedWellsUnit !== "";
      const hasDisclosureWells =
        numberOfWellsWithPublicDisclosure.rawValue !== "" &&
        formData.numberOfWellsWithPublicDisclosureUnit !== "";
      hasAdditionalFields = hasTotalWells && hasDisclosureWells;
    } else if (operatesHydraulicFracturingWells === "no") {
      hasAdditionalFields = true; // No additional fields needed for "No"
    }

    return calculateProgress([hasRadioSelection, hasAdditionalFields]);
  }, [
    operatesHydraulicFracturingWells,
    totalNumberOfFracturedWells.rawValue,
    numberOfWellsWithPublicDisclosure.rawValue,
    formData.totalNumberOfFracturedWellsUnit,
    formData.numberOfWellsWithPublicDisclosureUnit,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate radio button selection
    if (!operatesHydraulicFracturingWells) {
      newErrors.operatesHydraulicFracturingWells = "This field is required";
    }

    // Validate fields based on selection
    if (operatesHydraulicFracturingWells === "yes") {
      if (!totalNumberOfFracturedWells.rawValue) {
        newErrors.totalNumberOfFracturedWells = "Number of wells is required";
      }
      if (!formData.totalNumberOfFracturedWellsUnit) {
        newErrors.totalNumberOfFracturedWellsUnit = "Unit is required";
      }

      if (!numberOfWellsWithPublicDisclosure.rawValue) {
        newErrors.numberOfWellsWithPublicDisclosure = "Number of wells is required";
      }
      if (!formData.numberOfWellsWithPublicDisclosureUnit) {
        newErrors.numberOfWellsWithPublicDisclosureUnit = "Unit is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = {
      operatesHydraulicFracturingWells,
      ...(operatesHydraulicFracturingWells === "yes" && {
        totalNumberOfFracturedWells: Number(totalNumberOfFracturedWells.rawValue),
        totalNumberOfFracturedWellsUnit: formData.totalNumberOfFracturedWellsUnit,
        numberOfWellsWithPublicDisclosure: Number(numberOfWellsWithPublicDisclosure.rawValue),
        numberOfWellsWithPublicDisclosureUnit: formData.numberOfWellsWithPublicDisclosureUnit,
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
      toast.success("Data saved successfully");
      setTimeout(() => {
        setShowSaveSuccess(false);
        router.push("/assessments/new-assessment");
      }, 1500);
    } catch {
      toast.error("Failed to save data.");
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      operatesHydraulicFracturingWells,
      ...(operatesHydraulicFracturingWells === "yes" && {
        totalNumberOfFracturedWells: Number(totalNumberOfFracturedWells.rawValue),
        totalNumberOfFracturedWellsUnit: formData.totalNumberOfFracturedWellsUnit,
        numberOfWellsWithPublicDisclosure: Number(numberOfWellsWithPublicDisclosure.rawValue),
        numberOfWellsWithPublicDisclosureUnit: formData.numberOfWellsWithPublicDisclosureUnit,
      }),
      filesAndLinks: filesAndLinks,
    };

    dispatch({ type: "UPDATE_WATER_CHEMICAL", payload });

    try {
      await saveNow(
        "environment.waterManagement.hydraulicFracturingImpacts.chemicalDisclosure",
        payload
      );
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to save data.");
    }
  };

  const handlePrevious = () => {
    // toast.info("Returning to previous section");
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-6 mb-4 mt-4">
          <div>
            <h3 className="text-2xl font-semibold">
              {operatesHydraulicFracturingWells === "no"
                ? "Hydraulic Fracturing"
                : "Chemical Disclosure"}
            </h3>
            <p className="text-muted-foreground text-base">
              {operatesHydraulicFracturingWells === "no"
                ? "Report on the use of hydraulic fracturing to extract oil and gas from underground rock formations."
                : "Report on the public disclosure of fracturing fluid chemicals for wells that were hydraulically fractured during the reporting year."}
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
              fieldsCompleted={filled}
              totalFields={total}
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
                value={operatesHydraulicFracturingWells}
                onValueChange={(value) => {
                  setOperatesHydraulicFracturingWells(value);
                  setErrors((prev) => ({ ...prev, operatesHydraulicFracturingWells: "" }));
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

              {errors.operatesHydraulicFracturingWells && (
                <p className="text-sm text-red-600">{errors.operatesHydraulicFracturingWells}</p>
              )}
            </div>

            {/* Conditional Fields for YES response */}
            {operatesHydraulicFracturingWells === "yes" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <ReusableInput
                  label="Total Number of Hydraulically Fractured Wells"
                  tooltipTitle="Total Number of Hydraulically Fractured Wells"
                  tooltipBody="Report the total count of wells that were hydraulically fractured during the reporting period. Include all wells where fracturing operations took place, regardless of production status."
                  inputValue={totalNumberOfFracturedWells.displayValue}
                  unitValue={formData.totalNumberOfFracturedWellsUnit}
                  onInputChange={(num) => {
                    totalNumberOfFracturedWells.handleChange(String(num));
                    setErrors((prev) => ({ ...prev, totalNumberOfFracturedWells: "" }));
                  }}
                  onUnitChange={(unit) => {
                    handleInputChange("totalNumberOfFracturedWellsUnit", unit);
                    setErrors((prev) => ({ ...prev, totalNumberOfFracturedWellsUnit: "" }));
                  }}
                  error={errors.totalNumberOfFracturedWells}
                  unitError={errors.totalNumberOfFracturedWellsUnit}
                  formatNumbers={false}
                  placeholder="e.g., 150"
                />

                <ReusableInput
                  label="Number of Wells with Public Disclosure of All Chemicals"
                  tooltipTitle="Number of Wells with Public Disclosure of All Chemicals"
                  tooltipBody="How many of the hydraulically fractured wells have full chemical disclosure publicly reported through government databases or platforms such as FracFocus or regulator portals."
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
                  placeholder="e.g., 120"
                />
              </div>
            )}

            {/* Conditional Document/Evidence Upload - Only show when Yes or No is selected */}
            {operatesHydraulicFracturingWells !== "" && (
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 animate-in fade-in duration-300">
                <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>

                <p className="text-sm text-gray-600">
                  {operatesHydraulicFracturingWells === "yes"
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
            )}

            {/* Navigation buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="justify-self-start border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
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
