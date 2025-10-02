import { AssessmentProvider } from "@/hooks/useAssessment";
import AssessmentPage from "./AssessmentPage";

export default function AssessmentsPage() {
    return (
        <AssessmentProvider>
            <AssessmentPage />
        </AssessmentProvider>
    );
}
