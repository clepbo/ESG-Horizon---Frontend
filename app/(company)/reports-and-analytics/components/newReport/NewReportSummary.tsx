import { Card } from "@/app/components/ui/card";
import { GoDotFill } from "react-icons/go";
import React, { useEffect, useState } from "react";

import ReportOverview from "./ReportOverview";
import ReportEnvironmental from "./ReportEnvironmental";
import SocialCapital from "./SocialCapital";
import ReportHumanCapital from "./ReportHumanCapital";
import BusinessModelPillar from "./business-model/BusinessModelPillar";
import ReportLeadershipPillar from "./leadership/ReportLeadershipPillar";
import { ReportResponse } from "@/types/report/reportResponse";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSingleReport } from "../service/useReport";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import ReportEmptyState from "../ReportEmptyState";
import { formatStatus } from "@/lib/utils";
import { exportPNG, generatePDF } from "../exportFiles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewReportSummary() {
  // const [view, setView] = useState("overview");

  const router = useRouter();
  const searchParams = useSearchParams();

  const view = searchParams.get("tab") ?? "overview";

  const [reportData, setReportData] = React.useState<ReportResponse | undefined>(undefined);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const params = useParams();
  const { data, isError, isLoading } = useSingleReport(Number(params?.id));

  useEffect(() => {
    setReportData(data);
  }, [data]);

  // console.log("ReportOverview Data", reportData);

  if (isError) {
    return (
      <div className="w-full flex justify-center items-center py-12 text-red-500">
        Failed to load report.
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12 text-gray-500">
        <CardSkeleton />
      </div>
    );
  }
  if (!data || data === undefined || data === null || Object.keys(data).length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-12 text-gray-600">
        <ReportEmptyState />
      </div>
    );
  }

  const bg = {
    progress: "bg-orange-300",
    completed: "bg-green-500",
  };

  const tabs = [
    {
      label: "Overview",
      value: "overview",
      content: <ReportOverview reportData={reportData} />,
    },
    {
      label: "Environmental",
      value: "environmental",
      content: <ReportEnvironmental reportData={reportData} />,
    },
    {
      label: "Social Capital",
      value: "social-capital",
      content: <SocialCapital reportData={reportData} />,
    },
    {
      label: "Human Capital",
      value: "human-capital",
      content: <ReportHumanCapital reportData={reportData} />,
    },
    {
      label: "Business Model",
      value: "business-model",
      content: <BusinessModelPillar reportData={reportData} />,
    },
    {
      label: "Leadership",
      value: "leadership",
      content: <ReportLeadershipPillar reportData={reportData} />,
    },
  ];

  async function exportfile(value: string) {
    if (value === "pdf") {
      await generatePDF("section", "esg-detail");
    } else if (value === "png") {
      await exportPNG("section");
    }
    setSelected(undefined);
  }

  return (
    <div className="min-h-screen flex flex-col gap-4" id="section">
      {/* Header Card */}
      <Card
        className="p-4 no-export rounded flex flex-col lg:flex-row justify-between w-full items-center"
        id="hide1"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-start">
            <span className="text-start">ESG Performance Report</span>
            <span className={`rounded-3xl p-1 py-0.5 text-white font-light text-xs ${bg.progress}`}>
              {formatStatus(reportData?.status ?? "progress")}
            </span>
          </div>

          <div className="flex gap-2 lg:gap-4 items-center">
            <span> {reportData?.subsidiary ?? "Not specified"} </span>
            <span>
              <GoDotFill className="text-gray-500" />
            </span>
            <span>
              {` ${reportData?.startMonth} ${reportData?.startYear} - ${reportData?.endMonth} ${reportData?.endYear}`}
            </span>
          </div>
        </div>

        <div>
          {/* <CustomButton  variant="filled" className="text-white cursor-pointer rounded">
            <span className="flex items-center gap-3">
              <GoDownload />
              Import and Download
            </span>
          </CustomButton> */}
          <Select value={selected} onValueChange={exportfile}>
            <SelectTrigger
              className="
      min-w-xs rounded p-4 border-primary text-primary cursor-pointer
       hover:shadow-md hover:scale-[1.03]
      active:scale-[0.97]
    "
            >
              <SelectValue
                placeholder="Export file"
                className="data-placeholder-shown:text-white"
              />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex w-full flex-col gap-6">
        <Card className="flex justify-between gap-4 p-4 rounded w-full overflow-auto">
          {tabs.map((tab) => {
            const active = view === tab.value;

            return (
              <span
                key={tab.value}
                onClick={() => {
                  router.push(`?tab=${tab.value}`, { scroll: false });
                }}
                className={`
                  flex-1 text-center whitespace-nowrap px-4 cursor-pointer border border-t-2 p-2 rounded text-sm font-medium transition
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
