import React from "react";
import Header from "../components/Header";
import { ReportBreadcrumbProvider } from "./context/ReportBreadcrumbContext";

interface ReportLayoutProps {
  children: React.ReactNode;
}
export default function ReportLayout({ children }: ReportLayoutProps) {
  return (
    <ReportBreadcrumbProvider>
      <div className=" py-4 gap-8 md:gap-16 md:py-8 px-8 w-full min-h-screen">
        <Header />
        {children}
      </div>
    </ReportBreadcrumbProvider>
  );
}
