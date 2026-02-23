"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { uploadService } from "@/services/upload.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import { BreadcrumbItemType, CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { useAssessment } from "@/hooks/useAssessment";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";

interface ProcessSafetyEventsFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  stepIndex: number;
  totalSteps: number;
  breadcrumb: BreadcrumbItemType[];
}

export default function ProcessSafetyEvents({
  onBack,
  onContinueToNextAssessment,
  stepIndex,
  totalSteps,
  breadcrumb,
}: ProcessSafetyEventsFormProps) {
  const { state, dispatch } = useAssessment();
  const current = "leadershipGovernance.criticalIncidentRiskManagement.processSafetyEvents";
  const { saveNow } = useAssessmentFlow(current);

  const totalHoursWorked = useFormattedNumber("");
  const numberOfEvents = useFormattedNumber("");
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  useEffect(() => {
    const existingData =
      state.assessmentData.leadershipGovernance?.criticalIncidentRiskManagement
        ?.processSafetyEvents;

    if (existingData && Object.keys(existingData).length > 0) {
      if (existingData.totalHoursWorked !== undefined) {
        totalHoursWorked.handleChange(String(existingData.totalHoursWorked));
      }
      if (existingData.numberOfEvents !== undefined) {
        numberOfEvents.handleChange(String(existingData.numberOfEvents));
      }
      if (existingData.filesAndLinks) {
        setFilesAndLinks(existingData.filesAndLinks);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.assessmentData.leadershipGovernance?.criticalIncidentRiskManagement?.processSafetyEvents,
  ]);

  // Calculate progress
  const { filled, total } = useMemo(() => {
    const fields = [
      totalHoursWorked.rawValue !== "",
      numberOfEvents.rawValue !== "",
      filesAndLinks.some((item) => item.name || item.link || item.file),
    ];
    const completed = fields.filter(Boolean).length;
    return { filled: completed, total: fields.length };
  }, [totalHoursWorked.rawValue, numberOfEvents.rawValue, filesAndLinks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalHoursWorked.rawValue) {
      newErrors.totalHoursWorked = "Total hours worked is required";
    }

    if (!numberOfEvents.rawValue) {
      newErrors.numberOfEvents = "Number of events is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
    if (errors.filesAndLinks && fields.length > 0) {
      setErrors((prev) => ({ ...prev, filesAndLinks: "" }));
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setShowSaveSuccess(false);

    const payload = {
      totalHoursWorked: Number(totalHoursWorked.rawValue),
      numberOfEvents: Number(numberOfEvents.rawValue),
      filesAndLinks: filesAndLinks.filter((item) => item.name || item.link || item.file),
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "criticalIncidentRiskManagement",
          section: "processSafetyEvents",
          data: payload,
        },
      });
      setShowSaveSuccess(true);
      toast.success("Data saved successfully.");
    } catch (error) {
      toast.error(`Failed to save data. ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    const payload = {
      totalHoursWorked: Number(totalHoursWorked.rawValue),
      numberOfEvents: Number(numberOfEvents.rawValue),
      filesAndLinks: filesAndLinks.filter((item) => item.name || item.link || item.file),
    };

    try {
      await saveNow(current, payload);
      dispatch({
        type: "UPDATE_LEADERSHIP_GOVERNANCE",
        payload: {
          category: "criticalIncidentRiskManagement",
          section: "processSafetyEvents",
          data: payload,
        },
      });
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch {
      toast.error("Failed to save progress");
    }
  };

  const handlePrevious = () => {
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={formRef}>
      <CustomBreadcrumbDynamic features={breadcrumb} />

      <div className="max-w-5xl mx-auto mt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Process Safety Events (Tier 1)
          </h1>
          <p className="text-sm text-gray-600">
            Report your organization&apos;s rate of Tier 1 Process Safety Events (PSEs) for the
            reporting year. The rate is calculated per 200,000 hours worked.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            {/* Total Hours Worked */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-900">
                  Total Hours Worked (Employees + Contractors)
                </label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Total Hours Worked (Employees + Contractors)"
                      message="Enter the total number of hours worked by all employees and contractors during the reporting period. This value is used to calculate safety incident rates and should reflect verified HR or operations time-tracking records."
                    />
                  }
                />
              </div>

              <div className="grid grid-cols-[1fr_200px] gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Value</label>
                  <input
                    type="text"
                    placeholder="e.g., 13,450,000"
                    value={totalHoursWorked.displayValue}
                    onChange={(e) => {
                      totalHoursWorked.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, totalHoursWorked: "" }));
                    }}
                    className={`w-full px-4 py-2 border ${errors.totalHoursWorked ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {errors.totalHoursWorked && (
                    <p className="text-sm text-red-600 mt-1">{errors.totalHoursWorked}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Unit</label>
                  <input
                    type="text"
                    value="Hour"
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Number of Events */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-900">
                  Number of Tier 1 Process Safety Events
                </label>

                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title="Number of Tier 1 Process Safety Events"
                      message="Report the total count of Tier 1 process safety events that occurred during the reporting period. Tier 1 events represent the most severe, loss-of-containment incidents as defined by API/IChemE. Use internal safety logs or investigation reports to ensure accuracy."
                    />
                  }
                />
              </div>

              <div className="grid grid-cols-[1fr_200px] gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Value</label>
                  <input
                    type="text"
                    placeholder="e.g., 2"
                    value={numberOfEvents.displayValue}
                    onChange={(e) => {
                      numberOfEvents.handleChange(e.target.value);
                      setErrors((prev) => ({ ...prev, numberOfEvents: "" }));
                    }}
                    className={`w-full px-4 py-2 border ${errors.numberOfEvents ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {errors.numberOfEvents && (
                    <p className="text-sm text-red-600 mt-1">{errors.numberOfEvents}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Unit</label>
                  <input
                    type="text"
                    value="Event"
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Document/Evidence Upload */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Document/Evidence Upload</h3>
              <p className="text-sm text-gray-600 mb-6">
                Upload your internal Process Safety event log/register and the official incident
                investigation reports for any Tier 1 LOPC events that occurred.
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
                disabled={isSaving}
                className="justify-self-center bg-primary text-white hover:bg-teal-300 flex items-center gap-2"
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
