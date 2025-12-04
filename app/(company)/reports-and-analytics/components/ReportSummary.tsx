"use client";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssessmentAll, { generateEnvironmentalData, PillarAssessmentCard } from "./AssessmentAll";
import Link from "next/link";
import { exportPNG, generatePDF } from "./exportFiles";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import { formatLabel } from "./utils/dataTransfomer";
import AssessmentEnvironmental from "./AssessmentEnvironmental";

interface ReportSummaryProps {
  reportData?: {
    report: {
      id: number;
      assessmentId: number;
      ghg_total_emissions: number;
      startMonth: string | null;
      startYear: string | null;
      endMonth: string | null;
      endYear: string | null;
      subsidiary: string | null;
      progress: number | null;
      ghg_scope_one: number;
      ghg_scope_two: number;
      ghg_scope_three: number;
      ghg_datacount_scope_one: number;
      ghg_datacount_scope_two: number;
      ghg_datacount_scope_three: number;
    };
    status: string;
    percentage_emission_summary: {
      scope1_emission_summary: number;
      scope2_emission_summary: number;
      scope3_emission_summary: number;
    };
    summary: {
      startMonth: {
        startYear: string;
        startMonth: string;
        endYear: string;
        endMonth: string;
        subsidiary: string;
      };
    };
  };
}

// Helper function to generate assessment data from real data
// function generateAssessmentData(reportData: any) {
//   if (!reportData) return [];

//   const { report, percentage_emission_summary } = reportData;

//   return [
//     {
//       title: "Total Emissions",
//       value: Number(report?.ghg_total_emissions ?? 0),
//       unit: "tCO₂e",
//       icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
//       percentage: null,
//       colorClass: "",
//       textColorClass: "text-foreground",
//     },
//     {
//       title: "Scope 1",
//       value: Number(report?.ghg_scope_one ?? 0),
//       unit: "tCO₂e",
//       icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full text-orange-500" />,
//       colorClass: "bg-orange-500",
//       percentage: Math.round(Number(percentage_emission_summary?.scope1_emission_summary ?? 0)),
//       textColorClass: "text-orange-500",
//     },
//     {
//       title: "Scope 2",
//       value: Number(report?.ghg_scope_two ?? 0),
//       unit: "tCO₂e",
//       icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full text-blue-500" />,
//       colorClass: "bg-blue-500",
//       percentage: Math.round(Number(percentage_emission_summary?.scope2_emission_summary ?? 0)),
//       textColorClass: "text-blue-500",
//     },
//     {
//       title: "Scope 3",
//       value: Number(report?.ghg_scope_three ?? 0),
//       unit: "tCO₂e",
//       icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full text-purple-500" />,
//       colorClass: "bg-purple-500",
//       percentage: Math.round(Number(percentage_emission_summary?.scope3_emission_summary ?? 0)),
//       textColorClass: "text-purple-500",
//     },
//   ];
// }

const ReportSummary = (props: ReportSummaryProps) => {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(num));
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const { report } = props.reportData || {};
    if (!report) return 0;

    // Simple progress calculation - adjust based on your needs
    return report.progress || 0;
  };

  // Get reporting period
  const getReportingPeriod = () => {
    const { summary } = props.reportData || {};
    if (!summary?.startMonth) return "Not specified";

    const { startMonth, startYear, endMonth, endYear } = summary.startMonth;
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  };

  // Get subsidiary name
  const getSubsidiary = () => {
    return (
      props.reportData?.summary?.startMonth?.subsidiary ||
      props.reportData?.report?.subsidiary ||
      "Not specified"
    );
  };

  // Get status based on progress
  const getStatus = () => {
    return props?.reportData?.status;
  };

  async function exportfile(value: string) {
    if (value === "pdf") {
      await generatePDF("section", "esg-detail");
    } else if (value === "png") {
      await exportPNG("section");
    }
    setSelected(undefined);
  }

  const { reportData } = props;

  if (!reportData) {
    return <div>Loading report data...</div>;
  }

  const { report, percentage_emission_summary } = reportData;
  // const assessmentData = generateAssessmentData(reportData);
  console.log("REPORT:", reportData);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="my-4 flex space-x-4">
        <BackButton />
        <span>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground ">Summary View</h1>
        </span>
      </div>
      <div className="max-w-7xl mx-auto space-y-6" id="section">
        {/* Main Report Card */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6 lg:p-8">
            <h1 className="text-2xl font-semibold text-foreground mb-8">
              {`${getSubsidiary()} (${getReportingPeriod()})`}
            </h1>
            <div className="grid grid-flow-col auto-cols-auto items-start gap-4">
              <div className="space-y-2 ">
                <h3 className="text-sm font-medium text-foreground ">Reporting Period</h3>
                <p className="text-sm text-muted-foreground">{getReportingPeriod()}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Subsidiary</h3>
                <span className="text-sm text-muted-foreground">{getSubsidiary()}</span>
              </div>

              <div className="space-y-2 ">
                <h3 className="text-sm font-medium text-foreground">Status</h3>
                <div className="">
                  <div
                    className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                      getStatus() === "approved" || getStatus() === "submitted-approved"
                        ? "bg-green-500"
                        : getStatus() === "unapproved"
                          ? "bg-orange-500"
                          : "bg-gray-500"
                    } text-white text-xs font-medium`}
                  >
                    {formatLabel(getStatus())}
                  </div>
                  <div className="flex items-center gap-1">
                    <Progress value={calculateProgress()} className="h-2" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculateProgress()} %
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 lg:justify-end no-export" id="hide1">
                <Button className="bg-primary transform hover:scale-[1.02] text-white px-2 rounded">
                  <Link href={`/reports-and-analytics/${reportData?.report?.assessmentId}/report`}>
                    View Full Report
                  </Link>
                </Button>

                <Select value={selected} onValueChange={exportfile}>
                  <SelectTrigger className="w-[180px] rounded p-4">
                    <SelectValue placeholder="Export file" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf"> PDF</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Tabs defaultValue="all" className="w-full no-export">
          <TabsList className="bg-[#F1FCF3] w-full h-auto p-2 ">
            <TabsTrigger className="rounded-none cursor-pointer" value="all">
              View All
            </TabsTrigger>
            <TabsTrigger className="rounded-none cursor-pointer" value="environment">
              Environment
            </TabsTrigger>
            <TabsTrigger className="rounded-none cursor-pointer" value="social">
              Social
            </TabsTrigger>
            <TabsTrigger className="rounded-none cursor-pointer" value="governance">
              Governance
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <AssessmentAll heading={"All"} reportData={reportData} data={[]} />
          </TabsContent>
          <TabsContent value="environment">
            <AssessmentEnvironmental heading={"Environmental"} reportData={reportData} data={[]} />
          </TabsContent>
          <TabsContent value="social">
            <PillarAssessmentCard heading="Social" data={generateEnvironmentalData()} />
          </TabsContent>
          <TabsContent value="governance">
            <PillarAssessmentCard heading="Governance" data={generateEnvironmentalData()} />
          </TabsContent>
        </Tabs>

        {/* Rest of your component remains the same */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emission Summary */}
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-foreground mb-6">Emission Summary</h3>
              <div className="space-y-6">
                {/* Scope 1 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium text-foreground">Scope 1</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatNumber(report.ghg_scope_one)} tCO₂e (
                      {parseFloat(percentage_emission_summary.scope1_emission_summary.toFixed(2))}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-2xl">
                    <Progress
                      value={percentage_emission_summary.scope1_emission_summary}
                      className="h-2 bg-orange-500 rounded-2xl"
                      style={{ width: `${percentage_emission_summary.scope1_emission_summary}%` }}
                    />
                  </div>
                </div>

                {/* Scope 2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-foreground">Scope 2</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatNumber(report.ghg_scope_two)} tCO₂e (
                      {parseFloat(percentage_emission_summary.scope2_emission_summary.toFixed(2))}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-2xl">
                    <Progress
                      value={percentage_emission_summary.scope2_emission_summary}
                      className="h-2 bg-blue-500 rounded-2xl"
                      style={{ width: `${percentage_emission_summary.scope2_emission_summary}%` }}
                    />
                  </div>
                </div>

                {/* Scope 3 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium text-foreground">Scope 3</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatNumber(report.ghg_scope_three)} tCO₂e (
                      {parseFloat(percentage_emission_summary.scope3_emission_summary.toFixed(2))}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-2xl">
                    <Progress
                      value={percentage_emission_summary.scope3_emission_summary}
                      className="h-2 bg-purple-500 rounded-2xl"
                      style={{ width: `${percentage_emission_summary.scope3_emission_summary}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Data Count */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-foreground mb-6">Assessment Data Count</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Scope 1 Sources</span>
                  <span className="text-sm text-muted-foreground">
                    {report.ghg_datacount_scope_one > 0
                      ? `${report.ghg_datacount_scope_one} Sources`
                      : "No data"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Scope 2 Sources</span>
                  <span className="text-sm text-muted-foreground">
                    {report.ghg_datacount_scope_two > 0
                      ? `${report.ghg_datacount_scope_two} Sources`
                      : "No data"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Scope 3 Sources</span>
                  <span className="text-sm text-muted-foreground">
                    {report.ghg_datacount_scope_three > 0
                      ? `${report.ghg_datacount_scope_three} Sources`
                      : "No data"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
