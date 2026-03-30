import HumanStepOne from "./humanCapital/HumanStepOne";
import HumanStepTwo from "./humanCapital/HumanStepTwo";
import { ReportResponse } from "@/types/report/reportResponse";
import { DocumentsSection } from "@/app/components/company/assessments/details/DocumentsSection";

interface ReportHumanCapitalProps {
  reportData?: ReportResponse;
}

export default function ReportHumanCapital({ reportData }: ReportHumanCapitalProps) {
  return (
    <div className="w-full grid gap-4">
      <HumanStepOne reportData={reportData} />
      <HumanStepTwo reportData={reportData} />

      <DocumentsSection
        files={reportData?.evidence?.humanCapital ?? []}
        onFileClick={(file) => file.url && window.open(file.url, "_blank")}
      />
    </div>
  );
}
