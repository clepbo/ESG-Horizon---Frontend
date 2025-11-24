import { AssessmentProvider } from "@/hooks/useAssessment";
import ContinueAssessment from "./ContinueAssessment";

export default function AssessmentsPage() {
  return (
    <AssessmentProvider>
      <ContinueAssessment />
    </AssessmentProvider>
  );
}
