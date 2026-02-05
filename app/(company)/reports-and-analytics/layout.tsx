"use client";

import React from "react";
import Header from "../components/Header";
import { ReportBreadcrumbProvider } from "./context/ReportBreadcrumbContext";
import { useParams } from "next/navigation";
import { useSingleReport } from "./components/service/useReport";
import { CustomBreadcrumb } from "@/app/components/ui/CustomBreadcrumb";

interface ReportLayoutProps {
  children: React.ReactNode;
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  const params = useParams();
  const reportId = Number(params?.id);
  const { data: report } = useSingleReport(reportId);

  let customBreadcrumb;

  if (reportId && report) {
    customBreadcrumb = (
      <CustomBreadcrumb
        items={[
          { label: "Home", href: "/dashboard-esg" },
          { label: "Reports & Analytics", href: "/reports-and-analytics" },
          { label: report.title || "Report Details" },
        ]}
      />
    );
  }

  return (
    <ReportBreadcrumbProvider>
      <div className=" py-4 gap-8 md:gap-16 md:py-8 px-8 w-full min-h-screen">
        <Header />
        {children}
      </div>
    </ReportBreadcrumbProvider>
  );
}
