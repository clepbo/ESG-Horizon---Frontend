import { Card, CardContent } from "@/app/components/ui/card";
import React from "react";
import { data } from "./AssessmentAll";

export default function OverallSummaryCard() {
  return (
    <div className={`w-full grid bg-white rounded-lg`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data.map((item, index) => (
          <Card className=" shadow-sm border" key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground"> {item.title} </h3>
                <div className={` rounded-full inline-block  ${item.colorClass}`}>{item.icon}</div>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-semibold ${item.textColorClass}`}>
                  {" "}
                  {item.value.toLocaleString()}{" "}
                </p>
                <p className="text-xs text-muted-foreground">
                  {index === 0 ? item.unit : `${item.percentage}% of total emissions`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function OverallSummary() {
  return (
    <div className={`w-full grid bg-transparent rounded-lg`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data.map((item, index) => (
          <Card className=" shadow-sm border" key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground"> {item.title} </h3>
                <div className={` rounded-full inline-block  ${item.colorClass}`}>{item.icon}</div>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-semibold ${item.textColorClass}`}>
                  {" "}
                  {item.value.toLocaleString()}{" "}
                </p>
                <p className="text-xs text-muted-foreground">
                  {index === 0 ? item.unit : `${item.percentage}% of total emissions`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
