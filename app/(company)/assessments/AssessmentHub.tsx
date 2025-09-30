"use client";
import { useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { useAssessment } from "@/hooks/useAssessment";
import { DisclosureTopics } from "@/app/components/company/assessments/DisclosureTopics";
import Header from "../components/Header";
import { useCompanySubsidiaries } from "@/services/hooks/subsidiaries.hooks";
import { useAuth } from "@/context/AuthContext";
import { useCreateAssessment } from "@/services/hooks/assessment.hooks";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const years = ["2025", "2024", "2023", "2022", "2021", "2020"];

export default function AssessmentHub() {
    const { state, dispatch } = useAssessment();
    const { user } = useAuth();
    const { mutateAsync: createAssessment } = useCreateAssessment();

    const {
        data: subsidiaries = [],
        isLoading,
        error,
    } = useCompanySubsidiaries();

    useEffect(() => {
        if (
            !isLoading &&
            subsidiaries.length === 0 &&
            !state.assessmentData.subsidiary
        ) {
            dispatch({
                type: "UPDATE_BASIC_DATA",
                payload: {
                    subsidiary: user?.company?.name || "Company",
                },
            });
        }
    }, [
        isLoading,
        subsidiaries,
        user,
        state.assessmentData.subsidiary,
        dispatch,
    ]);

    const handleProceed = async () => {
        const newId = await createAssessment();
        dispatch({ type: "SET_ASSESSMENT_ID", payload: newId });

        dispatch({
            type: "UPDATE_BASIC_DATA",
            payload: {
                subsidiary: state.assessmentData.subsidiary,
                startMonth: state.assessmentData.startMonth,
                startYear: state.assessmentData.startYear,
                endMonth: state.assessmentData.endMonth,
                endYear: state.assessmentData.endYear,
            },
        });
        dispatch({ type: "SET_VIEW", payload: "disclosure" });
    };

    const handleBack = () => {
        dispatch({ type: "RESET_ASSESSMENT" });
        dispatch({ type: "SET_VIEW", payload: "hub" });
    };

    const handleInputChange = (field: string, value: string) => {
        dispatch({
            type: "UPDATE_BASIC_DATA",
            payload: { [field]: value },
        });
    };

    if (state.currentView === "disclosure") {
        return <DisclosureTopics onBack={handleBack} />;
    }

    const isFormValid =
        state.assessmentData.subsidiary &&
        state.assessmentData.startMonth &&
        state.assessmentData.startYear &&
        state.assessmentData.endMonth &&
        state.assessmentData.endYear;

    return (
        <div className="flex h-screen bg-green-50 overflow-hidden">
            <main className="flex-1 h-full overflow-y-auto p-6">
                <Header />
                <div className="space-y-1 mb-6">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Assessment Hub
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Track your ESG data collection progress across all
                        pillars
                    </p>
                </div>

                <Card className="bg-white p-8 space-y-8 shadow-none border-none">
                    <CardContent className="space-y-6 p-0">
                        {/* ✅ Only render subsidiary select if company has subsidiaries */}
                        {subsidiaries.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-foreground">
                                    Select Subsidiary
                                </label>
                                <Select
                                    value={state.assessmentData.subsidiary}
                                    onValueChange={(value) =>
                                        handleInputChange("subsidiary", value)
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="mt-3 w-full hover:cursor-pointer border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
                                        <SelectValue
                                            placeholder={
                                                isLoading
                                                    ? "Loading..."
                                                    : "Choose a subsidiary"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {error && (
                                            <div className="px-3 py-2 text-red-500 text-sm">
                                                Failed to load subsidiaries
                                            </div>
                                        )}
                                        {subsidiaries.map((subsidiary) => (
                                            <SelectItem
                                                key={subsidiary.id}
                                                value={subsidiary.name}
                                            >
                                                {subsidiary.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Reporting Period */}
                        <div className="space-y-4">
                            <div>
                                <span className="block text-lg font-semibold text-foreground mb-2">
                                    Reporting Period
                                </span>
                                <div className="flex flex-col gap-4">
                                    {/* Starting Period */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-foreground w-28">
                                            Starting Period
                                        </label>
                                        <Select
                                            value={
                                                state.assessmentData.startMonth
                                            }
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "startMonth",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-32 border border-slate-300 hover:cursor-pointer focus:ring-2 focus:ring-green-500">
                                                <SelectValue placeholder="Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem
                                                        key={month}
                                                        value={month}
                                                    >
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={
                                                state.assessmentData.startYear
                                            }
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "startYear",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-24 border border-slate-300 hover:cursor-pointer focus:ring-2 focus:ring-green-500">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year}
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Ending Period */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-foreground w-28">
                                            Ending Period
                                        </label>
                                        <Select
                                            value={
                                                state.assessmentData.endMonth
                                            }
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "endMonth",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-32 border border-slate-300 hover:cursor-pointer focus:ring-2 focus:ring-green-500">
                                                <SelectValue placeholder="Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem
                                                        key={month}
                                                        value={month}
                                                    >
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={state.assessmentData.endYear}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "endYear",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-24 border border-slate-300 hover:cursor-pointer focus:ring-2 focus:ring-green-500">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year}
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white max-w-[120px] w-full h-8 px-3 text-sm rounded-md mt-2"
                                disabled={!isFormValid}
                                onClick={handleProceed}
                            >
                                Proceed
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
