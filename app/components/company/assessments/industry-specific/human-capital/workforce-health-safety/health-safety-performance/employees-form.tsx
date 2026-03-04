"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { calculateProgress } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { AddMoreFilesLinks, FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";
import ReusableInput from "../../../environmental/water-management/components/ReusableInput";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
// import { useRouter } from "next/router";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useRouter } from "next/navigation";
import type { EmployeeFormData } from "./types";

interface EmployeeFormProps {
  employeeType: "direct" | "contract";
  data: EmployeeFormData;
  onChange: (data: EmployeeFormData) => void;
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  onProgressChange: (progress: { filled: number; total: number }) => void;
}

function stripNumberInput(input: string): string {
  return String(input).replace(/,/g, "");
}

export default function EmployeeForm({
  employeeType,
  data,
  onChange,
  onBack,
  onContinueToNextAssessment,
  onProgressChange,
}: EmployeeFormProps) {
  const totalHoursWorked = useFormattedNumber(data.totalHoursWorked);
  const recordableIncidents = useFormattedNumber(data.recordableIncidents);
  const fatalities = useFormattedNumber(data.fatalities);
  const nearMisses = useFormattedNumber(data.nearMisses);
  const safetyTrainingHours = useFormattedNumber(data.safetyTrainingHours);

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filesAndLinks = data.filesAndLinks;

  useEffect(() => {
    totalHoursWorked.setRawValue(data.totalHoursWorked);
  }, [data.totalHoursWorked, totalHoursWorked]);
  useEffect(() => {
    recordableIncidents.setRawValue(data.recordableIncidents);
  }, [data.recordableIncidents, recordableIncidents]);
  useEffect(() => {
    fatalities.setRawValue(data.fatalities);
  }, [data.fatalities, fatalities]);
  useEffect(() => {
    nearMisses.setRawValue(data.nearMisses);
  }, [data.nearMisses, nearMisses]);
  useEffect(() => {
    safetyTrainingHours.setRawValue(data.safetyTrainingHours);
  }, [data.safetyTrainingHours, safetyTrainingHours]);

  const router = useRouter();
  const { saveNow, isSaving } = useAssessmentFlow(
    "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance",
    "humanCapital.workforceHealthSafety"
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.totalHoursWorked?.trim()) {
      newErrors.totalHoursWorked = "Count is required";
    }
    if (!data.recordableIncidents?.trim()) {
      newErrors.recordableIncidents = "Count is required";
    }
    if (!data.fatalities?.trim()) {
      newErrors.fatalities = "Count is required";
    }
    if (!data.nearMisses?.trim()) {
      newErrors.nearMisses = "Count is required";
    }
    if (!data.safetyTrainingHours?.trim()) {
      newErrors.safetyTrainingHours = "Count is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasTotalHoursWorked = (data.totalHoursWorked ?? "").trim() !== "";
    const hasRecordableIncidents = (data.recordableIncidents ?? "").trim() !== "";
    const hasFatalities = (data.fatalities ?? "").trim() !== "";
    const hasNearMisses = (data.nearMisses ?? "").trim() !== "";
    const hasSafetyTrainingHours = (data.safetyTrainingHours ?? "").trim() !== "";
    return calculateProgress([
      hasTotalHoursWorked,
      hasRecordableIncidents,
      hasFatalities,
      hasNearMisses,
      hasSafetyTrainingHours,
    ]);
  }, [
    data.totalHoursWorked,
    data.recordableIncidents,
    data.fatalities,
    data.nearMisses,
    data.safetyTrainingHours,
  ]);

  useEffect(() => {
    onProgressChange({ filled, total });
  }, [filled, total, onProgressChange]);

  const handleUnitChange = (field: keyof EmployeeFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const payload = {
    employeeType,
    totalHoursWorked: Number(data.totalHoursWorked) || 0,
    totalHoursWorkedUnit: data.totalHoursWorkedUnit,
    recordableIncidents: Number(data.recordableIncidents) || 0,
    recordableIncidentsUnit: data.recordableIncidentsUnit,
    fatalities: Number(data.fatalities) || 0,
    fatalitiesUnit: data.fatalitiesUnit,
    nearMisses: Number(data.nearMisses) || 0,
    nearMissesUnit: data.nearMissesUnit,
    safetyTrainingHours: Number(data.safetyTrainingHours) || 0,
    safetyTrainingHoursUnit: data.safetyTrainingHoursUnit,
    filesAndLinks: data.filesAndLinks,
  };
  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    try {
      await saveNow(
        `humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance.${employeeType}`,
        payload
      );
      setShowSaveSuccess(true);
      toast.success("Data saved successfully!");
      setTimeout(() => {
        router.push("/assessments/new-assessment");
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error("Failed to save data");
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }
    try {
      await saveNow(
        `humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance.${employeeType}`,
        payload
      );
      toast.success("Progress saved!");
      onContinueToNextAssessment();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save data");
    }
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    onChange({ ...data, filesAndLinks: fields });
  };

  const handlePrevious = () => {
    toast.info("Returning to previous section");
    onBack();
  };

  return (
    <div className="space-y-8">
      {/* Total Hours Worked */}
      <ReusableInput
        label="Total Hours Worked"
        tooltipTitle="Total Hours Worked"
        tooltipBody="Enter the total number of hours worked by all employees and contractors during the reporting period. This figure is used to calculate safety performance indicators, such as incident and injury rates."
        inputValue={totalHoursWorked.displayValue}
        unitValue={data.totalHoursWorkedUnit}
        onInputChange={(num) => {
          const raw = stripNumberInput(String(num));
          totalHoursWorked.handleChange(String(num));
          onChange({ ...data, totalHoursWorked: raw });
          setErrors((prev) => ({ ...prev, totalHoursWorked: "" }));
        }}
        onUnitChange={(unit) => handleUnitChange("totalHoursWorkedUnit", unit)}
        error={errors.totalHoursWorked}
        formatNumbers={false}
        placeholder="e.g., 8,900,000"
        customUnit={data.totalHoursWorkedUnit}
      />

      {/* Number of Recordable Incidents */}
      <ReusableInput
        label="Number of Recordable Incidents"
        tooltipTitle="Number of Recordable Incidents"
        tooltipBody="Report the total number of work-related injuries or illnesses that meet the criteria for recordable incidents under applicable occupational health and safety standards. This helps track safety performance and identify high-risk areas."
        inputValue={recordableIncidents.displayValue}
        unitValue={data.recordableIncidentsUnit}
        onInputChange={(num) => {
          const raw = stripNumberInput(String(num));
          recordableIncidents.handleChange(String(num));
          onChange({ ...data, recordableIncidents: raw });
          setErrors((prev) => ({ ...prev, recordableIncidents: "" }));
        }}
        onUnitChange={(unit) => handleUnitChange("recordableIncidentsUnit", unit)}
        error={errors.recordableIncidents}
        formatNumbers={false}
        placeholder="e.g., 20"
        customUnit={data.recordableIncidentsUnit}
      />

      {/* Number of Fatalities */}
      <ReusableInput
        label="Number of Fatalities"
        tooltipTitle="Number of Fatalities"
        tooltipBody="Disclose the total number of work-related fatalities that occurred during the reporting period. Include both employees and contractors. This metric indicates the severity of workplace safety risks."
        inputValue={fatalities.displayValue}
        unitValue={data.fatalitiesUnit}
        onInputChange={(num) => {
          const raw = stripNumberInput(String(num));
          fatalities.handleChange(String(num));
          onChange({ ...data, fatalities: raw });
          setErrors((prev) => ({ ...prev, fatalities: "" }));
        }}
        onUnitChange={(unit) => handleUnitChange("fatalitiesUnit", unit)}
        error={errors.fatalities}
        formatNumbers={false}
        placeholder="e.g., 1"
        customUnit={data.fatalitiesUnit}
      />

      {/* Number of Near Misses */}
      <ReusableInput
        label="Number of Near Misses"
        tooltipTitle="Number of Near Misses"
        tooltipBody="Enter the number of incidents that did not result in injury, illness, or damage but had the potential to do so. Tracking near misses helps identify hazards before they lead to serious incidents."
        inputValue={nearMisses.displayValue}
        unitValue={data.nearMissesUnit}
        onInputChange={(num) => {
          const raw = stripNumberInput(String(num));
          nearMisses.handleChange(String(num));
          onChange({ ...data, nearMisses: raw });
          setErrors((prev) => ({ ...prev, nearMisses: "" }));
        }}
        onUnitChange={(unit) => handleUnitChange("nearMissesUnit", unit)}
        error={errors.nearMisses}
        formatNumbers={false}
        placeholder="e.g., 1"
        customUnit={data.nearMissesUnit}
      />

      {/* Average Hours of Safety Training per Employee */}
      <ReusableInput
        label="Average Hours of Safety Training per Employee"
        tooltipTitle="Average Hours of Safety Training per Employee"
        tooltipBody="Report the average number of hours each employee spent on health and safety training during the reporting period. This metric reflects your company's investment in preventive safety practices and workforce competence."
        inputValue={safetyTrainingHours.displayValue}
        unitValue={data.safetyTrainingHoursUnit}
        onInputChange={(num) => {
          const raw = stripNumberInput(String(num));
          safetyTrainingHours.handleChange(String(num));
          onChange({ ...data, safetyTrainingHours: raw });
          setErrors((prev) => ({ ...prev, safetyTrainingHours: "" }));
        }}
        onUnitChange={(unit) => handleUnitChange("safetyTrainingHoursUnit", unit)}
        error={errors.safetyTrainingHours}
        formatNumbers={false}
        placeholder="e.g., 1"
        customUnit={data.safetyTrainingHoursUnit}
      />

      {/* Document/Evidence Upload */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Document/Evidence Upload</h3>
        <p className="text-sm text-gray-600">
          Upload supporting documents like your Annual HSE Performance Report, ISO 45001 audit
          results, and consolidated employee/contractor timesheets and training logs.
        </p>

        <div className="mt-6">
          <AddMoreFilesLinks
            onFieldsChange={handleFilesAndLinksChange}
            initialData={filesAndLinks}
            uploadService={uploadService}
          />
        </div>
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
          Back
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
          {isSaving ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
