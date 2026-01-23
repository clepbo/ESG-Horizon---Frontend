import HumanStepOne from "./humanCapital/HumanStepOne";
import HumanStepTwo from "./humanCapital/HumanStepTwo";
import { ReportResponse } from "@/types/report/reportResponse";

interface ReportHumanCapitalProps {
  reportData?: ReportResponse;
}

export default function ReportHumanCapital({ reportData }: ReportHumanCapitalProps) {
  return (
    <div className="w-full grid gap-4">
      <HumanStepOne reportData={reportData} />
      <HumanStepTwo />
    </div>
  );
}
