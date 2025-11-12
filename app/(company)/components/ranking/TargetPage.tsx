"use client";

import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Plus, Edit } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { useRouter } from "next/navigation";

interface ScopeData {
  name: string;
  value: number;
  emission: string;
  color: string;
}

const ESGPerformance = () => {
  const router = useRouter();

  // Main gauge data
  const baseline = 26830;
  const current = 17425;
  const percentage = Math.round((current / baseline) * 100);

  // Scope data
  const scopeData: ScopeData[] = [
    { name: "Scope 1", value: 61, emission: "16,300 tCO₂e", color: "hsl(var(--scope-1))" },
    { name: "Scope 2", value: 28, emission: "7,500 tCO2e", color: "hsl(var(--scope-2))" },
    { name: "Scope 3", value: 11, emission: "3,030 tCO2e", color: "hsl(var(--scope-3))" },
  ];

  // Gauge chart data
  const gaugeData = [
    {
      name: "Performance",
      value: percentage,
      fill: "hsl(var(--primary))",
    },
  ];

  const renderCircularProgress = (data: ScopeData) => {
    const chartData = [
      {
        name: data.name,
        value: data.value,
        fill: data.color,
      },
    ];
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <RadialBarChart
            width={180}
            height={180}
            cx={90}
            cy={90}
            innerRadius={60}
            outerRadius={80}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "hsl(var(--gauge-bg))" }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: data.color }}>
              {data.value}%
            </span>
          </div>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-foreground">{data.name}</h3>
        <p className="text-sm text-muted-foreground">{data.emission}</p>
      </div>
    );
  };

  return (
    <Card className="w-full p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Targets and Performance</h1>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/ranking/create")}
          >
            <Plus className="h-4 w-4" />
            Set New Target
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Edit className="h-4 w-4" />
            Edit Target
          </Button>
        </div>
      </div>

      {/* Overall ESG Performance */}
      <div className="mb-12">
        <h2 className="mb-8 text-center text-xl font-semibold text-foreground">
          Overall ESG Performance
        </h2>
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <RadialBarChart
              width={400}
              height={250}
              cx={200}
              cy={200}
              innerRadius={120}
              outerRadius={160}
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "hsl(var(--target))" }}
                dataKey="value"
                cornerRadius={30}
                fill="hsl(var(--primary))"
              />
            </RadialBarChart>
            <div
              className="absolute left-1/2 top-[200px] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
              style={{
                transform: `translate(-50%, -50%) rotate(${(percentage / 100) * 180 - 90}deg)`,
                transformOrigin: "50% 100%",
              }}
            >
              <div className="h-28 w-1 origin-bottom bg-primary" style={{ marginLeft: "2px" }} />
            </div>
            <div className="absolute left-1/2 top-[180px] -translate-x-1/2 text-center">
              <div className="text-4xl font-bold text-foreground">17,425 tCO₂e ({percentage}%)</div>
              <div className="mt-1 text-sm text-muted-foreground">Current Emission</div>
            </div>
          </div>

          {/* Baseline and Target */}
          <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-baseline">26,830 tCO₂e</div>
              <div className="mt-1 text-sm text-muted-foreground">Baseline Year Emission</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-target">11,537 tCO₂e</div>
              <div className="mt-1 text-sm text-muted-foreground">Target Year Emission</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Progress Circles */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {scopeData.map((scope) => (
          <div key={scope.name}>{renderCircularProgress(scope)}</div>
        ))}
      </div>
    </Card>
  );
};

export default ESGPerformance;
