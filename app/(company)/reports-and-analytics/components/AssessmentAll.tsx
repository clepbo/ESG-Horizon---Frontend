import { Card, CardContent } from "@/app/components/ui/card";
import { TrendingUp } from "lucide-react";
import { GoDotFill } from "react-icons/go";
import React from "react";
import { formatNumberFigures } from "../../components/ranking/FormatNumberFigures";

export function generateAssessmentData(reportData: any) {
  const { report, percentage_emission_summary } = reportData;

  return [
    {
      title: "Total Emissions",
      value: report.ghg_total_emissions,
      unit: "tCO₂e",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      percentage: null,
      colorClass: "",
      textColorClass: "text-foreground",
    },
    {
      title: "Scope 1",
      value: report.ghg_scope_one,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full text-orange-500" />,
      colorClass: "bg-orange-500",
      percentage: parseFloat(percentage_emission_summary.scope1_emission_summary.toFixed(2)),
      textColorClass: "text-orange-500",
    },
    {
      title: "Scope 2",
      value: report.ghg_scope_two,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full text-blue-500" />,
      colorClass: "bg-blue-500",
      percentage: parseFloat(percentage_emission_summary.scope2_emission_summary.toFixed(2)),
      textColorClass: "text-blue-500",
    },
    {
      title: "Scope 3",
      value: report.ghg_scope_three,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full text-purple-500" />,
      colorClass: "bg-purple-500",
      percentage: parseFloat(percentage_emission_summary.scope3_emission_summary.toFixed(2)),
      textColorClass: "text-purple-500",
    },
  ];
}

export const data: AssessmentItem[] = [
  {
    title: "Total Emissions",
    value: 26230,
    unit: "tCO₂e",
    icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    percentage: null,
    colorClass: "",
    textColorClass: "text-foreground",
  },
  {
    title: "Scope 1",
    value: 16300,
    unit: "tCO₂e",
    icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full  text-orange-500" />,
    colorClass: "bg-orange-500",
    percentage: 61,
    textColorClass: "text-orange-500",
  },
  {
    title: "Scope 2",
    value: 7500,
    unit: "tCO₂e",
    icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full  text-blue-500" />,
    colorClass: "bg-blue-500",

    percentage: 28,
    textColorClass: "text-blue-500",
  },
  {
    title: "Scope 3",
    value: 3030,
    unit: "tCO₂e",
    icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full  text-purple-500" />,
    colorClass: "bg-purple-500",
    percentage: 11,
    textColorClass: "text-purple-500",
  },
];
interface AssessmentAllProps {
  reportData?: {
    report: {
      ghg_total_emissions: number;
      ghg_scope_one: number;
      ghg_scope_two: number;
      ghg_scope_three: number;
    };
    percentage_emission_summary: {
      scope1_emission_summary: number;
      scope2_emission_summary: number;
      scope3_emission_summary: number;
    };
  };
}

export default function AssessmentAll({ reportData }: AssessmentAllProps) {
  const displayData = reportData
    ? [
        {
          title: "Total Emissions",
          value: reportData.report.ghg_total_emissions,
          unit: "tCO₂e",
          icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
          percentage: null,
          colorClass: "",
          textColorClass: "text-foreground",
        },
        {
          title: "Scope 1",
          value: reportData.report.ghg_scope_one,
          unit: "tCO₂e",
          icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full text-orange-500" />,
          colorClass: "bg-orange-500",
          percentage: parseFloat(
            reportData.percentage_emission_summary.scope1_emission_summary.toFixed(2)
          ),
          textColorClass: "text-orange-500",
        },
        {
          title: "Scope 2",
          value: reportData.report.ghg_scope_two,
          unit: "tCO₂e",
          icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full text-blue-500" />,
          colorClass: "bg-blue-500",
          percentage: parseFloat(
            reportData.percentage_emission_summary.scope2_emission_summary.toFixed(2)
          ),
          textColorClass: "text-blue-500",
        },
        {
          title: "Scope 3",
          value: reportData.report.ghg_scope_three,
          unit: "tCO₂e",
          icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full text-purple-500" />,
          colorClass: "bg-purple-500",
          percentage: parseFloat(
            reportData.percentage_emission_summary.scope3_emission_summary.toFixed(2)
          ),
          textColorClass: "text-purple-500",
        },
      ]
    : data;

  return (
    <div className="w-full">
      <Card className="bg-white border-0 shadow-sm w-full">
        <CardContent className="p-6 lg:p-8">
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">
            Greenhouse Gas Emissions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {displayData.map((item, index) => (
              <Card className="bg-white shadow-sm border" key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground"> {item.title} </h3>
                    <div className={` rounded-full inline-block  ${item.colorClass}`}>
                      {item.icon}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">
                      {" "}
                      {formatNumberFigures(item?.value ?? 0)}{" "}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {index === 0 ? item.unit : `${item.percentage}% of total emissions`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AssessmentItem {
  title: string;
  value: number;
  unit?: string;
  percentage?: number | null;
  icon: React.ReactNode;
  colorClass: string;
  textColorClass?: string;
}

interface AssessmentAllProps {
  heading: string;
  data: AssessmentItem[];
  gridCols?: string;
}

export function PillarAssessmentCard({
  heading,
  data,
  gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}: AssessmentAllProps) {
  return (
    <div className="w-full">
      <Card className="bg-white border-0 shadow-sm w-full">
        <CardContent className="p-6 lg:p-8">
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">{heading}</h2>

          <div className={`grid ${gridCols} gap-4 mb-8`}>
            {data.map((item, index) => (
              <Card className="bg-white shadow-sm border" key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
                    <div className={`rounded-full inline-block ${item.colorClass}`}>
                      {item.icon}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-2xl font-semibold ${item.textColorClass}`}>
                      {formatNumberFigures(item?.value ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {index === 0 ? item.unit : `${item.percentage ?? 0}% of total emissions`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function generateEnvironmentalData() {
  return [
    {
      title: "Total Environmental",
      value: 0,
      unit: "tCO₂e",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      percentage: null,
      colorClass: "",
      textColorClass: "text-foreground",
    },
    {
      title: "Scope 1",
      value: 0,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full text-orange-500" />,
      colorClass: "bg-orange-500",
      percentage: 0,
      textColorClass: "text-orange-500",
    },
    {
      title: "Scope 2",
      value: 0,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full text-blue-500" />,
      colorClass: "bg-blue-500",
      percentage: 0,
      textColorClass: "text-blue-500",
    },
    {
      title: "Scope 3",
      value: 0,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full text-purple-500" />,
      colorClass: "bg-purple-500",
      percentage: 0,
      textColorClass: "text-purple-500",
    },
  ];
}

export function generateGovernanceData() {
  return [
    {
      title: "Total Governance",
      value: 0,
      unit: "metrics",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      percentage: null,
      colorClass: "",
      textColorClass: "text-foreground",
    },
    {
      title: "Category 1",
      value: 0,
      unit: "metrics",
      icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full text-orange-500" />,
      colorClass: "bg-orange-500",
      percentage: 0,
      textColorClass: "text-orange-500",
    },
    {
      title: "Category 2",
      value: 0,
      unit: "metrics",
      icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full text-blue-500" />,
      colorClass: "bg-blue-500",
      percentage: 0,
      textColorClass: "text-blue-500",
    },
    {
      title: "Category 3",
      value: 0,
      unit: "metrics",
      icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full text-purple-500" />,
      colorClass: "bg-purple-500",
      percentage: 0,
      textColorClass: "text-purple-500",
    },
  ];
}

export function generateSocialData() {
  return [
    {
      title: "Total Social",
      value: 0,
      unit: "metrics",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      percentage: null,
      colorClass: "",
      textColorClass: "text-foreground",
    },
    {
      title: "Category 1",
      value: 0,
      unit: "metrics",
      icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full text-orange-500" />,
      colorClass: "bg-orange-500",
      percentage: 0,
      textColorClass: "text-orange-500",
    },
    {
      title: "Category 2",
      value: 0,
      unit: "metrics",
      icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full text-blue-500" />,
      colorClass: "bg-blue-500",
      percentage: 0,
      textColorClass: "text-blue-500",
    },
    {
      title: "Category 3",
      value: 0,
      unit: "metrics",
      icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full text-purple-500" />,
      colorClass: "bg-purple-500",
      percentage: 0,
      textColorClass: "text-purple-500",
    },
  ];
}
