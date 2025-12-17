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

interface ContractEmployeesFormProps {
  onBack: () => void;
  onContinueToNextAssessment: () => void;
  onProgressChange: (progress: { filled: number; total: number }) => void;
}

export default function ContractEmployeesForm({
  onBack,
  onContinueToNextAssessment,
  onProgressChange,
}: ContractEmployeesFormProps) {
  const totalHoursWorked = useFormattedNumber("");
  const recordableIncidents = useFormattedNumber("");
  const fatalities = useFormattedNumber("");
  const nearMisses = useFormattedNumber("");
  const safetyTrainingHours = useFormattedNumber("");

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState<FileOrLinkData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    totalHoursWorkedUnit: "Hours",
    recordableIncidentsUnit: "Incidents",
    fatalitiesUnit: "Fatalities",
    nearMissesUnit: "Near Misses",
    safetyTrainingHoursUnit: "Hours",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!totalHoursWorked.rawValue) {
      newErrors.totalHoursWorked = "Count is required";
    }
    if (!recordableIncidents.rawValue) {
      newErrors.recordableIncidents = "Count is required";
    }
    if (!fatalities.rawValue) {
      newErrors.fatalities = "Count is required";
    }
    if (!nearMisses.rawValue) {
      newErrors.nearMisses = "Count is required";
    }
    if (!safetyTrainingHours.rawValue) {
      newErrors.safetyTrainingHours = "Count is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { filled, total } = useMemo(() => {
    const hasTotalHoursWorked = totalHoursWorked.rawValue !== "";
    const hasRecordableIncidents = recordableIncidents.rawValue !== "";
    const hasFatalities = fatalities.rawValue !== "";
    const hasNearMisses = nearMisses.rawValue !== "";
    const hasSafetyTrainingHours = safetyTrainingHours.rawValue !== "";
    const hasEvidence = filesAndLinks.length > 0;

    return calculateProgress([
      hasTotalHoursWorked,
      hasRecordableIncidents,
      hasFatalities,
      hasNearMisses,
      hasSafetyTrainingHours,
      hasEvidence,
    ]);
  }, [
    totalHoursWorked.rawValue,
    recordableIncidents.rawValue,
    fatalities.rawValue,
    nearMisses.rawValue,
    safetyTrainingHours.rawValue,
    filesAndLinks,
  ]);

  useEffect(() => {
    onProgressChange({ filled, total });
  }, [filled, total, onProgressChange]);
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    setShowSaveSuccess(true);
    setIsSaving(true);

    const payload = {
      totalHoursWorked: Number(totalHoursWorked.rawValue),
      totalHoursWorkedUnit: formData.totalHoursWorkedUnit,

      recordableIncidents: Number(recordableIncidents.rawValue),
      recordableIncidentsUnit: formData.recordableIncidentsUnit,

      fatalities: Number(fatalities.rawValue),
      fatalitiesUnit: formData.fatalitiesUnit,

      nearMisses: Number(nearMisses.rawValue),
      nearMissesUnit: formData.nearMissesUnit,

      safetyTrainingHours: Number(safetyTrainingHours.rawValue),
      safetyTrainingHoursUnit: formData.safetyTrainingHoursUnit,

      filesAndLinks: filesAndLinks,
    };

    console.log("CONTRACT EMPLOYEES DATA:", payload);
    toast.success("Data saved successfully.");

    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(false);
    }, 2000);
  };

  const handleNext = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }
    toast.success("Moved to next section");
    onContinueToNextAssessment();
  };

  const handleFilesAndLinksChange = (fields: FileOrLinkData[]) => {
    setFilesAndLinks(fields);
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
        unitValue={formData.totalHoursWorkedUnit}
        onInputChange={(num) => {
          totalHoursWorked.handleChange(String(num));
          setErrors((prev) => ({ ...prev, totalHoursWorked: "" }));
        }}
        onUnitChange={(unit) => {
          handleInputChange("totalHoursWorkedUnit", unit);
        }}
        error={errors.totalHoursWorked}
        formatNumbers={false}
        placeholder="e.g., 8,900,000"
      />

      {/* Number of Recordable Incidents */}
      <ReusableInput
        label="Number of Recordable Incidents"
        tooltipTitle="Number of Recordable Incidents"
        tooltipBody="Report the total number of work-related injuries or illnesses that meet the criteria for recordable incidents under applicable occupational health and safety standards. This helps track safety performance and identify high-risk areas."
        inputValue={recordableIncidents.displayValue}
        unitValue={formData.recordableIncidentsUnit}
        onInputChange={(num) => {
          recordableIncidents.handleChange(String(num));
          setErrors((prev) => ({ ...prev, recordableIncidents: "" }));
        }}
        onUnitChange={(unit) => {
          handleInputChange("recordableIncidentsUnit", unit);
        }}
        error={errors.recordableIncidents}
        formatNumbers={false}
        placeholder="e.g., 20"
      />

      {/* Number of Fatalities */}
      <ReusableInput
        label="Number of Fatalities"
        tooltipTitle="Number of Fatalities"
        tooltipBody="Disclose the total number of work-related fatalities that occurred during the reporting period. Include both employees and contractors. This metric indicates the severity of workplace safety risks."
        inputValue={fatalities.displayValue}
        unitValue={formData.fatalitiesUnit}
        onInputChange={(num) => {
          fatalities.handleChange(String(num));
          setErrors((prev) => ({ ...prev, fatalities: "" }));
        }}
        onUnitChange={(unit) => {
          handleInputChange("fatalitiesUnit", unit);
        }}
        error={errors.fatalities}
        formatNumbers={false}
        placeholder="e.g., 1"
      />

      {/* Number of Near Misses */}
      <ReusableInput
        label="Number of Near Misses"
        tooltipTitle="Number of Near Misses"
        tooltipBody="Enter the number of incidents that did not result in injury, illness, or damage but had the potential to do so. Tracking near misses helps identify hazards before they lead to serious incidents."
        inputValue={nearMisses.displayValue}
        unitValue={formData.nearMissesUnit}
        onInputChange={(num) => {
          nearMisses.handleChange(String(num));
          setErrors((prev) => ({ ...prev, nearMisses: "" }));
        }}
        onUnitChange={(unit) => {
          handleInputChange("nearMissesUnit", unit);
        }}
        error={errors.nearMisses}
        formatNumbers={false}
        placeholder="e.g., 1"
      />

      {/* Average Hours of Safety Training per Employee */}
      <ReusableInput
        label="Average Hours of Safety Training per Employee"
        tooltipTitle="Average Hours of Safety Training per Employee"
        tooltipBody="Report the average number of hours each employee spent on health and safety training during the reporting period. This metric reflects your company’s investment in preventive safety practices and workforce competence."
        inputValue={safetyTrainingHours.displayValue}
        unitValue={formData.safetyTrainingHoursUnit}
        onInputChange={(num) => {
          safetyTrainingHours.handleChange(String(num));
          setErrors((prev) => ({ ...prev, safetyTrainingHours: "" }));
        }}
        onUnitChange={(unit) => {
          handleInputChange("safetyTrainingHoursUnit", unit);
        }}
        error={errors.safetyTrainingHours}
        formatNumbers={false}
        placeholder="e.g., 1"
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
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
