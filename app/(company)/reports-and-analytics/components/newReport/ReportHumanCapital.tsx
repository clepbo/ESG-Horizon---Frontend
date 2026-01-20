import HumanStepOne from "./humanCapital/HumanStepOne";
import HumanStepTwo from "./humanCapital/HumanStepTwo";

export default function ReportHumanCapital() {
  return (
    <div className="w-full grid gap-4">
      <HumanStepOne />
      <HumanStepTwo />
    </div>
  );
}
