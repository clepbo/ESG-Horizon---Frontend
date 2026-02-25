import React from "react";
import AirQualityCard from "./AirQualityCard";
import AirQualityForm from "./AirQualityForm";
import { SuccessScreen } from "../../../../SuccessScreen";
import { useRouter, useParams } from "next/navigation";
import { TotalsResponse } from "@/services/assessment.service";

interface AirQualityProps {
    backToDisclosureTopics: () => void;
    backToAssessmentHub: () => void;
}

export default function AirQuality({
    backToDisclosureTopics,
    backToAssessmentHub,
}: AirQualityProps) {
    const [step, setStep] = React.useState<number>(0);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [totals, setTotals] = React.useState<TotalsResponse | null>(null);
    const router = useRouter();
    const params = useParams();

    const reportId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const handleViewReport = () => {
        if (reportId) {
            router.push(`/reports-and-analytics/${reportId}?tab=environmental`);
        } else {
            router.push("/reports-and-analytics");
        }
    };

    if (showSuccess) {
        return (
            <SuccessScreen
                assessmentName="Air Quality Assessment"
                nextAssessment="Water WasteWater Management"
                totals={totals ?? undefined}
                reportId={reportId}
                onContinue={handleViewReport}
                onBackToHub={backToDisclosureTopics}
            />
        );
    }

    if (step === 0) {
        return (
            <AirQualityCard
                backToDisclosureTopics={backToDisclosureTopics}
                backToAssessmentHub={backToAssessmentHub}
                handleCardClick={() => setStep(1)}
            />
        );
    }

    if (step === 1) {
        return (
            <div>
                <AirQualityForm
                    backToDisclosureTopics={backToDisclosureTopics}
                    backToAssessmentHub={backToAssessmentHub}
                    backToAirQualityCard={() => setStep(0)}
                    onSubmit={(submissionTotals) => {
                        setTotals(submissionTotals);
                        setShowSuccess(true);
                    }}
                />
            </div>
        );
    }

    return null;
}
