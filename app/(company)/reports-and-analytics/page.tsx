"use client";

import { useState, useEffect } from "react";
import { Leaf, Users, Building, BarChart3, TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import Header from "../components/Header";
import { ESGScoreCard } from "../components/ESGScoreCard";
import { ESGJourneyChart } from "../components/ESGJourneyChart";
import { AssessmentDataProvider } from "./AssessmentDataProvider";
import { Scope1EmissionsChart } from "./components/Scope1EmissionsChart";
import { Scope2EmissionsChart } from "./components/Scope2EmissionsChart";
import { EmissionsBreakdownChart } from "./components/EmissionsBreakdownChart";
import { AssessmentProgressCard } from "./components/AssessmentProgressCard";
import { EmissionsSummaryCard } from "./components/EmissionsSummaryCard";
import { DataQualityIndicator } from "./components/DataQualityIndicator";

export default function ReportsAnalyticsPage() {
  return (
    <AssessmentDataProvider>
      <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
        <main className="flex-1 h-full overflow-y-auto p-6">
          <Header />

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ESG Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive analysis of your environmental impact and ESG performance</p>
          </div>

          {/* ESG Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ESGScoreCard
              title="Overall ESG Score"
              score={78}
              maxScore={100}
              trend="up"
              trendValue="12%"
              bgColor="bg-gradient-to-r from-green-500 to-green-600"
              icon={<BarChart3 className="w-5 h-5" />}
            />
            <ESGScoreCard
              title="Environmental Score"
              score={82}
              maxScore={100}
              trend="up"
              trendValue="15%"
              bgColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
              icon={<Leaf className="w-5 h-5" />}
            />
            <ESGScoreCard
              title="Scope 1 Emissions"
              score={75}
              maxScore={100}
              trend="down"
              trendValue="8%"
              bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
              icon={<Activity className="w-5 h-5" />}
            />
            <ESGScoreCard
              title="Scope 2 Emissions"
              score={68}
              maxScore={100}
              trend="down"
              trendValue="12%"
              bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
              icon={<Zap className="w-5 h-5" />}
            />
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Scope1EmissionsChart />
            <Scope2EmissionsChart />
          </div>

          {/* Emissions Breakdown and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <EmissionsBreakdownChart />
            <AssessmentProgressCard />
            <DataQualityIndicator />
          </div>

          {/* ESG Journey and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ESGJourneyChart />
            <EmissionsSummaryCard />
          </div>
        </main>
      </div>
    </AssessmentDataProvider>
  );
}
