import { Card, CardHeader, CardContent, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@radix-ui/react-progress";
import React from "react";

// interface EmissionSource {
//   id: number;
//   name: string;
//   location: string;
//   value: number;
//   scope: string;
// }

export default function FullReportSummary({ data }: any) {
  // const emissionSources: EmissionSource[] = [
  //   {
  //     id: 1,
  //     name: "Diesel Generators",
  //     location: "Port Harcourt Refinery",
  //     value: 4420,
  //     scope: "Scope 1",
  //   },
  //   { id: 2, name: "Marine Vessels", location: "Lagos Terminal", value: 3660, scope: "Scope 3" },
  //   { id: 3, name: "Grid Electricity", location: "All facilities", value: 3200, scope: "Scope 2" },
  //   { id: 4, name: "Company Trucks", location: "Warri Depot", value: 2490, scope: "Scope 1" },
  //   { id: 5, name: "Process Flaring", location: "Kaduna Terminal", value: 2150, scope: "Scope 1" },
  // ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Assessment Data Count */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Data Count</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="flex justify-between text-sm font-medium">
              <span>Scope 1 Sources</span>
              <span>70%</span>
            </p>
            <div className={cn("w-full rounded-full bg-green-200 h-2")}>
              <Progress
                value={70}
                className="h-2 rounded-full bg-green-700"
                style={{
                  width: `${70}%`,
                }}
              />
            </div>
          </div>
          <div>
            <p className="flex justify-between text-sm font-medium">
              <span>Scope 2 Sources</span>
              <span>64%</span>
            </p>
            {/* <Progress value={64} className="h-2" /> */}
            <div className={cn("w-full rounded-full bg-green-200 h-2")}>
              <Progress
                value={64}
                className="h-2 rounded-full bg-green-700"
                style={{
                  width: `${64}%`,
                }}
              />
            </div>
          </div>
          <div>
            <p className="flex justify-between text-sm font-medium">
              <span>Scope 3 Sources</span>
              <span>30%</span>
            </p>
            <div className={cn("w-full rounded-full bg-green-200 h-2")}>
              <Progress
                value={30}
                className="h-2 rounded-full bg-green-700"
                style={{
                  width: `${30}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Towards Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Towards Targets</CardTitle>
          <p className="text-xs text-muted-foreground">
            2030 reduction goal: 20% from 2020 baseline
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-green-600">84%</h2>
          <p className="text-sm font-medium text-muted-foreground">Target Achievement</p>
          <div>
            <p className="text-xs mb-1">Current Progress</p>
            {/* <Progress value={83.4} className="h-2" /> */}
            <div className={cn("w-full rounded-full bg-green-200 h-2")}>
              <Progress
                value={84}
                className="h-2 rounded-full bg-green-700"
                style={{
                  width: `${84}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">83.4% of 20% target</p>
          </div>
          <div className="text-sm space-y-1">
            <p>
              2016 Baseline: <span className="font-medium">66,000 tCO₂e</span>
            </p>
            <p>
              2025 Actual: <span className="font-medium">54,200 tCO₂e</span>
            </p>
            <p>
              2030 Target: <span className="font-medium">52,800 tCO₂e</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Emission Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Emission Sources</CardTitle>
          <p className="text-xs text-muted-foreground">Highest contributors to total emissions</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.map((source: any, index: number) => (
              <li
                key={source.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-green-700 text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{source.fuelType}</p>
                    <p className="text-xs text-muted-foreground">{source.location ?? ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{source.volume.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground border rounded-3xl px-1 whitespace-nowrap">
                    {source.scope}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
