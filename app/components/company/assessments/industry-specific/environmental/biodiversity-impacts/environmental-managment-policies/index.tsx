"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, ArrowRight, Info, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { toast } from "react-toastify";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { uploadService } from "@/services/upload.service";

interface ReservesInConflictAreasProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

// Helper function to calculate progress
function calculateProgress(conditions: boolean[]): { filled: number; total: number } {
  const filled = conditions.filter(Boolean).length;
  const total = conditions.length;
  return { filled, total };
}

export default function ReservesInConflictAreas({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ReservesInConflictAreasProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);

  const [formData, setFormData] = useState({
    hasConflictReserves: "",
    description: "",
  });

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // Calculate progress based on form completion
  const progress = useMemo(() => {
    const hasSelection = formData.hasConflictReserves !== "";
    const hasDescription = formData.description.trim() !== "";
    const hasEvidence = filesAndLinks.length > 0;

    const { filled, total } = calculateProgress([hasSelection, hasDescription, hasEvidence]);
    const percentage = Math.round((filled / total) * 100);

    return { filled, total, percentage };
  }, [formData.hasConflictReserves, formData.description, filesAndLinks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hasConflictReserves) {
      newErrors.hasConflictReserves = "Please select an option";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);

    const payload = {
      hasConflictReserves: formData.hasConflictReserves,
      description: formData.description,
      filesAndLinks: filesAndLinks,
    };

    console.log("DATA TO SAVE:", payload);

    toast.success("Progress saved! You can continue later.");
    setIsSaving(false);
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      hasConflictReserves: formData.hasConflictReserves,
      description: formData.description,
      filesAndLinks: filesAndLinks,
    };

    console.log("FINAL SUBMISSION:", payload);

    toast.success("Moving to next section");
    onContinueToNextAssessment();
  };

  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Reserves in or near Areas of Conflict
          </h1>
          <p className="text-gray-600">
            Describe your organization's reserves located in or near areas of active conflict, as
            defined by the Uppsala Conflict Data Program (UCDP). This form covers metric
            EM-EP-160a.1, which is qualitative and descriptive.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8 space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Section {stepIndex} of {totalSteps}
                </span>
                <span className="text-gray-600">{progress.percentage}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Question 1: Do you have reserves in conflict areas? */}
            <div className="space-y-4 pt-4">
              <Label className="text-base font-medium text-gray-900">
                Do you have proved or probable reserves in or near areas of conflict?
              </Label>
              <RadioGroup
                value={formData.hasConflictReserves}
                onValueChange={(value) => handleInputChange("hasConflictReserves", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {errors.hasConflictReserves && (
                <p className="text-red-600 text-sm">{errors.hasConflictReserves}</p>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium text-gray-900">
                  Description of Reserves in Conflict Areas
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                  >
                    <h6>Description of Reserves in Conflict Areas</h6>
                    <p className="text-sm">
                      Provide details about the location, volume, and status of reserves in or near
                      conflict areas. Include information about security measures, risk assessments,
                      and any operational impacts.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the reserves, their locations relative to conflict zones, associated risks, and any mitigation measures in place..."
                  className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
                />
              </div>
              {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600">
                Upload supporting documents like maps of operational areas cross-referenced with
                community land boundaries and Social Impact Assessment (SIA) reports that identify
                local ethnic groups.
              </p>

              <div className="mt-6">
                <AddMoreFilesLinks
                  onFieldsChange={handleFilesAndLinksChange}
                  initialData={filesAndLinks}
                  uploadService={uploadService}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>

              <Button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save & Continue Later"}
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
