import { Card } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { GoDotFill, GoDownload } from "react-icons/go";
import React, { useState } from "react";

import ReportOverview from "./ReportOverview";
import ReportEnvironmental from "./ReportEnvironmental";
import SocialCapital from "./SocialCapital";
import ReportHumanCapital from "./ReportHumanCapital";
import BusinessModelPillar from "./BusinessModelPillar";
import ReportLeadershipPillar from "./ReportLeadershipPillar";

export default function NewReportSummary() {
  const [view, setView] = useState("overview");

  const bg = {
    progress: "bg-orange-300",
    completed: "bg-green-500",
  };

  const tabs = [
    { label: "Overview", value: "overview", content: <ReportOverview /> },
    { label: "Environmental", value: "environmental", content: <ReportEnvironmental /> },
    { label: "Social Capital", value: "social-capital", content: <SocialCapital /> },
    { label: "Human Capital", value: "human-capital", content: <ReportHumanCapital /> },
    { label: "Business Model", value: "business-model", content: <BusinessModelPillar /> },
    { label: "Leadership", value: "leadership", content: <ReportLeadershipPillar /> },
  ];

  return (
    <div className="min-h-screen flex flex-col gap-4">
      {/* Header Card */}
      <Card className="p-4 rounded flex flex-col lg:flex-row justify-between w-full items-center">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-start">
            <span className="text-start">ESG Performance Report</span>
            <span className={`rounded-3xl p-1 py-0.5 text-white font-light text-xs ${bg.progress}`}>
              Completed
            </span>
          </div>

          <div className="flex gap-2 lg:gap-4 items-center">
            <span>Dangote Sugar</span>
            <span>
              <GoDotFill className="text-gray-500" />
            </span>
            <span>Jan 2025 - Dec 2025</span>
          </div>
        </div>

        <div>
          <CustomButton variant="filled" className="text-white cursor-pointer rounded">
            <span className="flex items-center gap-3">
              <GoDownload />
              Import and Download
            </span>
          </CustomButton>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex w-full flex-col gap-6">
        <Card className="flex justify-between p-2 py-4 rounded w-full overflow-auto">
          {tabs.map((tab) => {
            const active = view === tab.value;

            return (
              <span
                key={tab.value}
                onClick={() => setView(tab.value)}
                className={`
                  px-4 cursor-pointer border border-t-2 p-2 rounded text-sm font-medium transition
                  ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-primary/40 hover:bg-primary/10"
                  }
                `}
              >
                {tab.label}
              </span>
            );
          })}
        </Card>

        {/* Content below */}
        <div className=" rounded">{tabs.find((tab) => tab.value === view)?.content}</div>
      </div>
    </div>
  );
}
