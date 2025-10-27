"use client";
import { Card, CardContent } from "@/app/components/ui/card";
// import { Progress } from "@/app/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { GoDotFill } from "react-icons/go";

interface SummaryProps {
  report: any;
}

export function OverallSummary({ report }: SummaryProps) {
  const data = [
    {
      title: "Total Emissions",
      value: report?.report?.ghg_total_emissions,
      unit: "tCO₂e",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      percentage: null,
      colorClass: "",
      textColorClass: "text-foreground",
    },
    {
      title: "Scope 1",
      value: report?.report?.ghg_scope_one,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full text-orange-500" />,
      colorClass: "bg-orange-500",
      percentage: report?.percentage_emission_summary?.scope1_emission_summary,
      textColorClass: "text-orange-500",
    },
    {
      title: "Scope 2",
      value: report?.report?.ghg_scope_two ?? 0,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full text-blue-500" />,
      colorClass: "bg-blue-500",
      percentage: report?.percentage_emission_summary?.scope2_emission_summary ?? 0,
      textColorClass: "text-blue-500",
    },
    {
      title: "Scope 3",
      value: report?.report?.ghg_scope_three ?? 0,
      unit: "tCO₂e",
      icon: <GoDotFill className="h-4 w-4 bg-purple-500 rounded-full text-purple-500" />,
      colorClass: "bg-purple-500",
      percentage: report?.percentage_emission_summary?.scope3_emission_summary ?? 0,
      textColorClass: "text-purple-500",
    },
  ];

  return (
    <div className="w-full">
      <Card className="bg-white border-0 shadow-sm w-full">
        <CardContent className="p-6 lg:p-8">
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">
            Overall Emissions Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {data.map((item, index) => (
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
                      {item.value != null ? item.value.toLocaleString() : "0"}
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
