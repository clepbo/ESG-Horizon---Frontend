import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import React from "react";
import { PagetitleAndDescription } from "./PagetitleAndDescription";
import { Card, CardContent } from "@/app/components/ui/card";
import { AssessmentProgressBar } from "../../../../AssessmentProgressBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import OperationsDelayReusableInput from "./OperationsDelayReusableInput";
import { AdditionalFileUpload } from "../../../../AdditionalFileUpload";

interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
}
export default function OperationalDelay({ onBack, onDisclosureTopics }: Props) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    delayCount: 0,
    delayUnit: "",
    durationOfDelaysCount: 0,
    durationOfDelaysUnit: "",
    numberOfDelaysInDaysCount: 0,
    numberOfDelaysInDaysUnit: "",
    numberOfDelaysPoliticalCount: 0,
    numberOfDelaysPoliticalUnit: "",
    numberOfDelaysOtherCount: 0,
    numberOfDelaysOtherUnit: "",
  });

  const features = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onDisclosureTopics },
    { label: "Community Relations", onClick: onBack },
    { label: "Operations Delays" },
  ];
  function handlePrevious() {
    onBack();
  }

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

  function handleSubmit() {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Further actions after submission can be added here
    }, 2000);
  }

  const setCount = (key: keyof typeof formData) => (value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setUnit = (key: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="min-h-screen bg-green-50 p-6">
      <CustomBreadcrumbDynamic features={features} />

      <div className="">
        <PagetitleAndDescription
          title={"Operational Delays (Non-Technical)"}
          description={
            "Report the total number and duration of site shutdowns or project delays caused by non-technical factors, such as community protests or stakeholder resistance, during the reporting year."
          }
        />
        <Card className="p-3 space-y-2 my-2">
          <CardContent className="space-y-8">
            <AssessmentProgressBar
              stepIndex={2}
              totalSteps={2}
              fieldsCompleted={2}
              totalFields={2}
              isSubmitted={false}
            />

            {/* DESCRIPTION FIELD */}

            <OperationsDelayReusableInput
              title={"Number of Delays (Community Protests)"}
              count={formData.delayCount}
              unit={formData.delayUnit}
              setCount={setCount("delayCount")}
              countPlaceholder={"e.g, 10"}
              setUnit={setUnit("delayUnit")}
              tipTitle={"Number of Delays (Community Protests)"}
              tipMessage={
                "Enter how many operational delays were caused by community protests within the reporting period. A “delay” refers to any interruption, slowdown, shutdown, or restricted access triggered directly by community action."
              }
              disabled={false}
              unitPlaceholder="Delays"
            />

            <OperationsDelayReusableInput
              title={"Duration of Delays (Community Protests, in days)"}
              count={formData.durationOfDelaysCount}
              unit={formData.durationOfDelaysUnit}
              setCount={setCount("durationOfDelaysCount")}
              countPlaceholder={"e.g, 2"}
              setUnit={setUnit("durationOfDelaysUnit")}
              tipTitle={"Duration of Delays – Community Protests (Days)"}
              tipMessage={
                "Report the total number of days operations were delayed due to community protests. If multiple events occurred, provide the combined duration in days (e.g., 3 delays totaling 12 days)"
              }
              disabled={false}
              unitPlaceholder="Days"
            />

            <OperationsDelayReusableInput
              title={"Number of Delays (Other Stakeholder/Political Issues)"}
              count={formData.numberOfDelaysInDaysCount}
              unit={formData.numberOfDelaysInDaysUnit}
              setCount={setCount("numberOfDelaysInDaysCount")}
              countPlaceholder={"e.g, 2"}
              setUnit={setUnit("numberOfDelaysInDaysCount")}
              tipTitle={"Duration of Delays – Community Protests (Days)"}
              tipMessage={
                "Report the total number of days operations were delayed due to community protests. If multiple events occurred, provide the combined duration in days (e.g., 3 delays totaling 12 days)"
              }
              disabled={false}
              unitPlaceholder="Delays"
            />

            <OperationsDelayReusableInput
              title={"Number of Delays (Other Stakeholder/Political Issues)"}
              count={formData.numberOfDelaysPoliticalCount}
              unit={formData.numberOfDelaysPoliticalUnit}
              setCount={setCount("numberOfDelaysPoliticalCount")}
              countPlaceholder={"e.g, 10"}
              setUnit={setUnit("numberOfDelaysPoliticalUnit")}
              tipTitle={"Number of Delays (Other Stakeholder or Political Issues)"}
              tipMessage={
                "Disclose the number of operational delays caused by non-technical issues such as government restrictions, land-access conflicts, regulatory actions, or disputes with other local stakeholders."
              }
              disabled={false}
              unitPlaceholder="Days"
            />

            <OperationsDelayReusableInput
              title={"Duration of Delays – Other Issues (Days)"}
              count={formData.numberOfDelaysOtherCount}
              unit={formData.numberOfDelaysOtherUnit}
              setCount={setCount("numberOfDelaysOtherCount")}
              countPlaceholder={"e.g, 10"}
              setUnit={setUnit("numberOfDelaysOtherUnit")}
              tipTitle={"Duration of Delays – Other Issues (Days)"}
              tipMessage={
                "Enter the total number of days operations could not proceed due to stakeholder or political issues. Combine all relevant events in the reporting year into one total duration."
              }
              disabled={false}
              unitPlaceholder="Delays"
            />

            <AdditionalFileUpload />
          </CardContent>

          {/* FOOTER BUTTONS */}
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
              onClick={() => handleSubmit()}
              disabled={isSaving || isSubmitting}
              className="justify-self-end hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
