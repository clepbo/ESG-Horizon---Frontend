"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";

type Scope1Category = {
    [key: string]: Record<string, unknown> | undefined;
};

export function AssessmentProgressCard() {
    const {
        state: { assessmentData, isLoading },
    } = useAssessment();

    const hasAnyNumberValue = (obj: unknown): boolean => {
        if (!obj || typeof obj !== "object") return false;

        return Object.values(obj as Record<string, unknown>).some(
            (v) => typeof v === "number" && (v as number) > 0
        );
    };

    const computeSections = () => {
        if (!assessmentData) return [];

        const sections = [
            {
                name: "Stationary Sources",
                keys: [
                    "electricityHeat",
                    "industrialProcesses",
                    "oilGasOperations",
                ] as const,
            },
            {
                name: "Mobile Sources",
                keys: [
                    "roadTransport",
                    "vehicleEquipment",
                    "marineAviation",
                ] as const,
            },
            {
                name: "Process Emissions",
                keys: [
                    "co2Release",
                    "gasFlaring",
                    "fertilizerEmissions",
                    "entericFermentation",
                    "methaneNitrousOxide",
                ] as const,
            },
            {
                name: "Fugitive Emissions",
                keys: [
                    "methaneLeaks",
                    "ventingNaturalGas",
                    "incompleteCombustion",
                    "hfcLeaks",
                ] as const,
            },
        ];

        return sections.map((section) => {
            let present = 0;
            let nonEmpty = 0;

            const container: Scope1Category | undefined = (
                section.name === "Stationary Sources"
                    ? assessmentData.stationarySources
                    : section.name === "Mobile Sources"
                    ? assessmentData.mobileSources
                    : section.name === "Process Emissions"
                    ? assessmentData.processEmissions
                    : assessmentData.fugitiveEmissions
            ) as Scope1Category | undefined;

            section.keys.forEach((k) => {
                const val = container ? container[k] : undefined;
                if (val && typeof val === "object") {
                    present++;
                    if (hasAnyNumberValue(val)) nonEmpty++;
                }
            });

            const progress =
                present === 0 ? 0 : (nonEmpty / section.keys.length) * 100;
            const completed = progress === 100;
            const inProgress = progress > 0 && progress < 100;

            return { name: section.name, completed, inProgress, progress };
        });
    };

    const sections = computeSections();
    const overallProgress = sections.length
        ? sections.reduce((s, x) => s + x.progress, 0) / sections.length
        : 0;

    if (isLoading) {
        return (
            <Card className="bg-white border-none shadow rounded-xl">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        Assessment Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border-none shadow rounded-xl">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Assessment Progress
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Completion status of GHG emissions assessment
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {overallProgress.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">
                            Overall Completion
                        </div>
                        <Progress value={overallProgress} className="mt-2" />
                    </div>

                    <div className="space-y-4">
                        {sections.map((section, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {section.completed ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : section.inProgress ? (
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span className="text-sm font-medium text-gray-700">
                                            {section.name}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {section.progress.toFixed(0)}%
                                    </span>
                                </div>
                                <Progress
                                    value={section.progress}
                                    className="h-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
