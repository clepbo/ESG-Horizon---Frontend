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
import { Input } from "@/app/components/ui/input";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";

interface FileOrLinkData {
  name: string;
  file?: File;
  link?: string;
}

interface ReservesInConflictAreasProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
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

  const [formData, setFormData] = useState({
    hasConflictReserves: "",
    description: "",
    filesAndLinks: [] as FileOrLinkData[],
  });

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  const progress = useMemo(() => {
    let filled = 0;
    const total = 3;

    if (formData.hasConflictReserves) filled++;
    if (formData.description.trim()) filled++;
    if (formData.filesAndLinks.length > 0) filled++;

    return { filled, total, percentage: Math.round((filled / total) * 100) };
  }, [formData]);

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

  const handleSaveAndContinue = () => {
    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      console.log("DATA TO SAVE:", formData);
      toast.success("Data saved successfully!");
      setIsSaving(false);
    }, 1000);
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      return;
    }
    toast.success("Moving to next section");
    onContinueToNextAssessment();
  };

  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };

  const addFileOrLink = () => {
    setFormData((prev) => ({
      ...prev,
      filesAndLinks: [...prev.filesAndLinks, { name: "", file: undefined, link: "" }],
    }));
  };

  const updateFileOrLink = (index: number, field: keyof FileOrLinkData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      filesAndLinks: prev.filesAndLinks.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeFileOrLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      filesAndLinks: prev.filesAndLinks.filter((_, i) => i !== index),
    }));
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
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, hasConflictReserves: value }));
                  setErrors((prev) => ({ ...prev, hasConflictReserves: "" }));
                }}
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
                    <h6> Description of Reserves in Conflict Areas</h6>
                    <p className="text-sm">
                      Provide details about the location, volume, and status of reserves in or near
                      conflict areas. Include information about security measures, risk assessments,
                      and any operational impacts.Description of Environmental Management Policies
                      and Practices Provide details of your company’s policies and operational
                      practices designed to protect biodiversity and reduce environmental impacts.
                      This may include habitat conservation plans, protected species management,
                      environmental monitoring programs, spill prevention measures, and site
                      restoration commitments.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <Textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }));
                    setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  placeholder="Describe the reserves, their locations relative to conflict zones, associated risks, and any mitigation measures in place..."
                  className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
                />
              </div>
              {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
            </div>

            {/* Document/Evidence Upload */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Document/Evidence Upload
                </h3>
                <p className="text-sm text-gray-600">
                  Upload supporting documents like your reserves statement, internal security risk
                  assessments for relevant regions, and citations for the UCDP data used.
                </p>
              </div>

              <div className="space-y-4">
                {formData.filesAndLinks.map((item, index) => (
                  <div key={index} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Name of file/evidence
                        </Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateFileOrLink(index, "name", e.target.value)}
                          placeholder="Enter the name of the file/evidence you are about to upload"
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Upload File</Label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) updateFileOrLink(index, "file", file);
                              }}
                              className="border-gray-300"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeFileOrLink(index)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <span className="text-lg">×</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Or Upload via Link
                      </Label>
                      <Input
                        value={item.link}
                        onChange={(e) => updateFileOrLink(index, "link", e.target.value)}
                        placeholder="Enter or paste the link to the evidence/file"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addFileOrLink}
                  className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:border-teal-500 hover:text-teal-600"
                >
                  + Add More Files/Links
                </Button>
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
