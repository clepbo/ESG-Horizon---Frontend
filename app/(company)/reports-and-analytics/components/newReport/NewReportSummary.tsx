"use client";
import { Card } from "@/app/components/ui/card";
import { GoDotFill } from "react-icons/go";
import React, { useEffect, useState, lazy, Suspense } from "react";

import ReportOverview from "./ReportOverview";
import { ReportResponse } from "@/types/report/reportResponse";

// Lazy-load heavy tab content so only the active tab is fetched and mounted (faster initial load).
const ReportEnvironmental = lazy(() => import("./ReportEnvironmental"));
const SocialCapital = lazy(() => import("./SocialCapital"));
const ReportHumanCapital = lazy(() => import("./ReportHumanCapital"));
const BusinessModelPillar = lazy(() => import("./business-model/BusinessModelPillar"));
const ReportLeadershipPillar = lazy(() => import("./leadership/ReportLeadershipPillar"));
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSingleReport } from "../service/useReport";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import ReportEmptyState from "../ReportEmptyState";
import { formatStatus } from "@/lib/utils";
import { generateReportPDF, generateReportPNG, ExportProgress } from "../pdf-export/generateReportExport";
import { AlertTriangle } from "lucide-react";
import { useCompanyDetails } from "@/services/hooks/company.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shortenMonth, useBreadcrumb } from "../../context/ReportBreadcrumbContext";


export default function NewReportSummary() {
  // const [view, setView] = useState("overview");

  const router = useRouter();
  const searchParams = useSearchParams();

  const view = searchParams.get("tab") ?? "overview";

  const [reportData, setReportData] = React.useState<ReportResponse | undefined>(undefined);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({ percent: 0, stage: "" });
  const [exportError, setExportError] = useState<{ stage: string; format: "pdf" | "png" } | null>(null);

  const params = useParams();
  const { data, isError, isLoading } = useSingleReport(Number(params?.id));
  const { data: company } = useCompanyDetails();
  const { setLastLabelOverride } = useBreadcrumb();

  useEffect(() => {
    setReportData(data);
  }, [data]);

  useEffect(() => {
    if (reportData?.subsidiary) {
      setLastLabelOverride(
        `${reportData.subsidiary}: ${shortenMonth(reportData?.startMonth ?? "")} ${reportData.startYear} - ${shortenMonth(reportData?.endMonth ?? "")} ${reportData.endYear} Report`
      );
    }
  }, [reportData, setLastLabelOverride]);
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12 text-gray-600">
        <CardSkeleton />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="w-full flex justify-center items-center py-12 text-red-600">
        Failed to load report.
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
    progress: "bg-blue-400",
    completed: "bg-green-500",
  };

  // Tab config only – content is rendered below so only the active tab mounts (faster load).
  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Environmental", value: "environmental" },
    { label: "Social Capital", value: "social-capital" },
    { label: "Human Capital", value: "human-capital" },
    { label: "Business Model", value: "business-model" },
    { label: "Leadership", value: "leadership" },
  ];

  function renderActiveTabContent() {
    const tabContent = (() => {
      switch (view) {
        case "environmental":
          return <ReportEnvironmental reportData={reportData} />;
        case "social-capital":
          return <SocialCapital reportData={reportData} />;
        case "human-capital":
          return <ReportHumanCapital reportData={reportData} />;
        case "business-model":
          return <BusinessModelPillar reportData={reportData} />;
        case "leadership":
          return <ReportLeadershipPillar reportData={reportData} />;
        case "overview":
        default:
          return <ReportOverview reportData={reportData} />;
      }
    })();
    return <Suspense fallback={<CardSkeleton />}>{tabContent}</Suspense>;
  }

  async function exportfile(value: string) {
    if (value !== "pdf" && value !== "png") return;
    setExporting(true);
    setExportError(null);
    setExportProgress({ percent: 0, stage: "Starting…" });
    let lastStage = "Preparing report";
    try {
      const companyInfo = {
        name: company?.name ?? "",
        logoUrl: company?.company_logo_url ?? null,
        address: company?.address ?? "",
        country: company?.country ?? "",
      };
      const onProgress = (p: ExportProgress) => {
        lastStage = p.stage || lastStage;
        setExportProgress(p);
      };
      if (value === "pdf") {
        await generateReportPDF({ reportData: reportData!, company: companyInfo, onProgress });
      } else {
        await generateReportPNG({ reportData: reportData!, company: companyInfo, onProgress });
      }
      // Success — close the modal
      setExporting(false);
      setExportProgress({ percent: 0, stage: "" });
      setSelected(undefined);
    } catch (err) {
      console.error("Report export failed:", err);
      // Keep the modal open and swap to the error state — user can retry
      setExportError({ stage: lastStage, format: value });
    }
  }

  function dismissExportError() {
    setExportError(null);
    setExporting(false);
    setExportProgress({ percent: 0, stage: "" });
    setSelected(undefined);
  }

  function retryExport() {
    if (!exportError) return;
    exportfile(exportError.format);
  }

  return (
    <div className="min-h-screen flex flex-col gap-4 w-full overflow-auto" id="section">
      {exporting && (
        <div className="no-export fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl px-10 py-8 flex flex-col items-center gap-5 w-[380px]">
            {exportError ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-base font-semibold text-gray-800">
                    Report Generation Failed
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We couldn&apos;t generate your report. This is usually a
                    temporary issue — please try again. If it keeps happening,
                    contact support.
                  </p>
                  {exportError.stage && (
                    <p className="text-xs text-gray-400 mt-1">
                      Failed during: {exportError.stage}
                    </p>
                  )}
                </div>
                <div className="flex w-full gap-3 mt-1">
                  <button
                    type="button"
                    onClick={dismissExportError}
                    className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={retryExport}
                    className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:opacity-90 transition"
                  >
                    Try Again
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-gray-800">
                  Generating Report
                </p>
                {/* Progress bar */}
                <div className="w-full">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${exportProgress.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-start mt-2 h-5">
                    <p className="text-sm text-gray-600 truncate mr-2">{exportProgress.stage}</p>
                    <p className="text-sm font-medium text-gray-700 shrink-0">{exportProgress.percent}%</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Card className="p-4 rounded flex flex-col md:flex-row justify-between w-full items-center">
        <div className="flex flex-col gap-4">
          <div className="grid items-center gap-2 justify-start">
            <span className="text-start">ESG Performance Report</span>
            <span
              className={`rounded-3xl text-center p-1 py-0.5 text-white font-light text-xs ${bg.progress}`}
            >
              {formatStatus(reportData?.status ?? "progress")}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2 lg:gap-4 items-center">
            <span className=""> {reportData?.subsidiary ?? "Not specified"} </span>
            <span>
              <GoDotFill className="text-gray-500 hidden md:block" />
            </span>
            <span>
              {` ${reportData?.startMonth} ${reportData?.startYear} - ${reportData?.endMonth} ${reportData?.endYear}`}
            </span>
          </div>
        </div>

        <div className="no-export">
          <Select value={selected} onValueChange={exportfile} disabled={exporting}>
            <SelectTrigger
              className="rounded min-w-xs p-4 border-primary text-primary cursor-pointer
       hover:shadow-md hover:scale-[1.03]
      active:scale-[0.97]
      disabled:opacity-60 disabled:cursor-not-allowed
    "
            >
              <SelectValue
                placeholder={exporting ? "Exporting..." : "Export file"}
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
        <div className=" rounded">{renderActiveTabContent()}</div>
      </div>
    </div>
  );
}
