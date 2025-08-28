"use client";

import {
    Leaf,
    BarChart3,
    TrendingDown,
    Activity,
    Zap,
} from "lucide-react";
import Header from "../components/Header";
import { ESGJourneyChart } from "../components/ESGJourneyChart";
import { AssessmentDataProvider } from "./AssessmentDataProvider";
import { Scope1EmissionsChart } from "./components/Scope1EmissionsChart";
import { Scope2EmissionsChart } from "./components/Scope2EmissionsChart";
import { EmissionsBreakdownChart } from "./components/EmissionsBreakdownChart";
import { AssessmentProgressCard } from "./components/AssessmentProgressCard";
import { DataQualityIndicator } from "./components/DataQualityIndicator";
import { EmissionsSummaryCard } from "./components/EmissionsSummaryCard";

export default function ReportsAnalyticsPage() {
    return (
        <AssessmentDataProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <main className="flex-1 h-full overflow-y-auto p-6">
                    <Header />
                    <div className="p-6">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Reports & Analytics
                            </h1>
                            <p className="text-gray-600">
                                Comprehensive ESG assessment reports and
                                emissions analytics
                            </p>
                        </div>

                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Emissions
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            3,726.5
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            tonnes CO2e
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Leaf className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                                    <span className="text-green-600">
                                        -13.2%
                                    </span>
                                    <span className="text-gray-500 ml-1">
                                        vs last year
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Scope 1
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            2,676.5
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            tonnes CO2e
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Activity className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                                    <span className="text-green-600">
                                        -8.5%
                                    </span>
                                    <span className="text-gray-500 ml-1">
                                        vs last year
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Scope 2
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            1,050.0
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            tonnes CO2e
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Zap className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                                    <span className="text-green-600">
                                        -22.1%
                                    </span>
                                    <span className="text-gray-500 ml-1">
                                        vs last year
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Assessment Progress
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            65%
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            completed
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-blue-600">
                                        2 of 4 sections
                                    </span>
                                    <span className="text-gray-500 ml-1">
                                        completed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Main Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <Scope1EmissionsChart />
                            <Scope2EmissionsChart />
                        </div>

                        {/* Secondary Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <EmissionsBreakdownChart />
                            <AssessmentProgressCard />
                            <DataQualityIndicator />
                        </div>

                        {/* Summary Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <EmissionsSummaryCard />
                            <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    ESG Journey Overview
                                </h3>
                                <ESGJourneyChart />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AssessmentDataProvider>
    );
}
