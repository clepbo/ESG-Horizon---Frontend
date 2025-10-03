import { AssessmentProvider } from "@/hooks/useAssessment";
import AssessmentHub from "./AssessmentHub";

export default function AssessmentsPage() {
    return (
        <AssessmentProvider>
            <AssessmentHub />
        </AssessmentProvider>
    );
}
