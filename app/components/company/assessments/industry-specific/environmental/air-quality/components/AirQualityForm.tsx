import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import React from "react";
import { PagetitleAndDescription } from "../../../social-capital/community-relations/components/PagetitleAndDescription";
import OperationsDelayReusableInput from "../../../social-capital/community-relations/components/OperationsDelayReusableInput";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { EvidenceList } from "../../../social-capital/community-relations/components/ItemCards";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-toastify";

interface AirQualityFormProps {
  backToDisclosureTopics: () => void;
  backToAssessmentHub: () => void;
  backToAirQualityCard: () => void;
}

export default function AirQualityForm({
  backToDisclosureTopics,
  backToAssessmentHub,
  backToAirQualityCard,
}: AirQualityFormProps) {
  const features = [
    {
      label: "Assessments",
      onClick: backToAssessmentHub,
    },
    {
      label: "Disclosure Topics",
      onClick: backToDisclosureTopics,
    },
    {
      label: "Air Quality",
      onClick: backToAirQualityCard,
    },
    {
      label: "Air Pollutant Emissions",
    },
  ];
  const [formData, setFormData] = React.useState({
    oxidesOfNitrogen: 0,
    oxidesOfNitrogenUnit: "",
    oxidesOfSuplphur: 0,
    oxidesOfSulphurUnit: "",
    volatileOrganicCompound: 0,
    volatileOrganicCompoundUnit: "",
    particulateMatter: 0,
    particulateMatterUnit: "",
    evidenceList: [],
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const setCount = (key: keyof typeof formData) => (value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const setUnit = (key: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if all emission values are filled and greater than 0
    if (!formData.oxidesOfNitrogen || formData.oxidesOfNitrogen <= 0) {
      newErrors.oxidesOfNitrogen = "Oxides of Nitrogen emissions value is required";
    }
    if (!formData.oxidesOfNitrogenUnit) {
      newErrors.oxidesOfNitrogenUnit = "Unit for Oxides of Nitrogen is required";
    }

    if (!formData.oxidesOfSuplphur || formData.oxidesOfSuplphur <= 0) {
      newErrors.oxidesOfSuplphur = "Oxides of Sulphur emissions value is required";
    }
    if (!formData.oxidesOfSulphurUnit) {
      newErrors.oxidesOfSulphurUnit = "Unit for Oxides of Sulphur is required";
    }

    if (!formData.volatileOrganicCompound || formData.volatileOrganicCompound <= 0) {
      newErrors.volatileOrganicCompound = "Volatile Organic Compounds emissions value is required";
    }
    if (!formData.volatileOrganicCompoundUnit) {
      newErrors.volatileOrganicCompoundUnit = "Unit for Volatile Organic Compounds is required";
    }

    if (!formData.particulateMatter || formData.particulateMatter <= 0) {
      newErrors.particulateMatter = "Particulate Matter emissions value is required";
    }
    if (!formData.particulateMatterUnit) {
      newErrors.particulateMatterUnit = "Unit for Particulate Matter is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function handleSaveAndContinue() {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(true);

      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 2000);
    }, 1500);
  }

  function handlePrevious() {
    // Logic to go back to the previous step
  }

  function handleSubmit() {
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fill in all required fields before submitting");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Form submitted successfully!");
      // Further actions after submission can be added here
    }, 2000);
  }

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    return (
      formData.oxidesOfNitrogen > 0 &&
      formData.oxidesOfNitrogenUnit !== "" &&
      formData.oxidesOfSuplphur > 0 &&
      formData.oxidesOfSulphurUnit !== "" &&
      formData.volatileOrganicCompound > 0 &&
      formData.volatileOrganicCompoundUnit !== "" &&
      formData.particulateMatter > 0 &&
      formData.particulateMatterUnit !== ""
    );
  };

  return (
    <div>
      <section className="min-h-screen bg-green-50 p-6">
        <div className="flex flex-row gap-4 md:flex-col md:justify-between w-full">
          <CustomBreadcrumbDynamic features={features} />
          <div className="flex flex-col gap-2">
            <PagetitleAndDescription
              title={"Air Pollutant Emissions"}
              description={
                "Provide the total direct air emissions from all your operational activities for the reporting year. Enter the data for each pollutant in metric tonnes. The total emissions will be calculated automatically."
              }
            />
          </div>
          <Card className="w-full p-6 flex min-h-[80vh] flex-col gap-3 lg:gap-5 bg-white rounded-md shadow-md">
            <AssessmentProgressBar
              stepIndex={1}
              totalSteps={1}
              fieldsCompleted={1}
              totalFields={4}
              isSubmitted={false}
            />

            <OperationsDelayReusableInput
              title={"Oxides of Nitrogen (NOx)"}
              tipTitle={"Oxides of Nitrogen (NOx)"}
              tipMessage={
                "NOx refers to nitrogen oxides released from combustion processes such as gas turbines, engines, and flares. It includes NO and NO₂ (but not N₂O). These emissions contribute to smog, acid rain, and respiratory health risks."
              }
              count={formData.oxidesOfNitrogen}
              countPlaceholder={"Enter volume of Emissions"}
              setCount={setCount("oxidesOfNitrogen")}
              unitPlaceholder="Metric Ton (Mt)"
              unit={formData.oxidesOfNitrogenUnit}
              setUnit={setUnit("oxidesOfNitrogenUnit")}
              countLabel="Volume of Emissions"
              required={true}
              error={errors.oxidesOfNitrogen || errors.oxidesOfNitrogenUnit}
            />

            <OperationsDelayReusableInput
              title={"Oxides of Sulphur (SOx)"}
              tipTitle={"Oxides of Sulphur (SOx)"}
              tipMessage={
                "SOx emissions are mainly produced from burning fuels containing sulfur, such as diesel or fuel oil. They include SO₂ and SO₃ and can cause acid rain, corrosion, and air quality degradation near communities."
              }
              count={formData.oxidesOfSuplphur}
              countPlaceholder={"Enter volume of Emissions"}
              setCount={setCount("oxidesOfSuplphur")}
              unitPlaceholder="Metric Ton (Mt)"
              unit={formData.oxidesOfSulphurUnit}
              setUnit={setUnit("oxidesOfSulphurUnit")}
              countLabel="Volume of Emissions"
              required={true}
              error={errors.oxidesOfSuplphur || errors.oxidesOfSulphurUnit}
            />

            <OperationsDelayReusableInput
              title={"Volatile Organic Compounds (VOCs)"}
              tipTitle={"Volatile Organic Compounds (VOCs)"}
              tipMessage={
                "VOCs are carbon-based gases released from storage tanks, leaks, venting, and processing activities. They contribute to ground-level ozone and smog formation. Methane and CO₂ are excluded from this category."
              }
              count={formData.volatileOrganicCompound}
              countPlaceholder={"Enter volume of Emissions"}
              setCount={setCount("volatileOrganicCompound")}
              unitPlaceholder="Metric Ton (Mt)"
              unit={formData.volatileOrganicCompoundUnit}
              setUnit={setUnit("volatileOrganicCompoundUnit")}
              countLabel="Volume of Emissions"
              required={true}
              error={errors.volatileOrganicCompound || errors.volatileOrganicCompoundUnit}
            />

            <OperationsDelayReusableInput
              title={"Particulate Matter (PM₁₀)"}
              tipTitle={"Particulate Matter (PM10)"}
              tipMessage={
                "PM10 refers to airborne particles with a diameter of 10 micrometres or less. These can come from combustion, dust, or processing activities and pose respiratory and cardiovascular health risks."
              }
              count={formData.particulateMatter}
              countPlaceholder={"Enter volume of Emissions"}
              setCount={setCount("particulateMatter")}
              unitPlaceholder="Metric Ton (Mt)"
              unit={formData.particulateMatterUnit}
              setUnit={setUnit("particulateMatterUnit")}
              countLabel="Volume of Emissions"
              required={true}
              error={errors.particulateMatter || errors.particulateMatterUnit}
            />

            <EvidenceList />

            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="justify-self-start border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-primary text-white hover:bg-teal-300 transition-colors"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save & Continue Later
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={isSaving || isSubmitting || !isFormValid()}
                className="justify-self-end hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
