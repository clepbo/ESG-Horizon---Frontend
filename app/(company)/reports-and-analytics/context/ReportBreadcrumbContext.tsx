"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BreadcrumbContextValue {
  lastLabelOverride?: string;
  setLastLabelOverride: (label?: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export const ReportBreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastLabelOverride, setLastLabelOverride] = useState<string | undefined>();
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];

    const isNumericDetailPage = segments[0] === "reports-and-analytics" && /^\d+$/.test(last);

    if (!isNumericDetailPage) {
      setLastLabelOverride(undefined);
    }
  }, [pathname]);

  return (
    <BreadcrumbContext.Provider value={{ lastLabelOverride, setLastLabelOverride }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

const defaultBreadcrumbValue: BreadcrumbContextValue = {
  lastLabelOverride: undefined,
  setLastLabelOverride: () => {},
};

export const useBreadcrumb = () => {
  const ctx = useContext(BreadcrumbContext);
  return ctx ?? defaultBreadcrumbValue;
};

/** Shorten month to 3 letters (e.g. "January" -> "Jan") */
export function shortenMonth(month: string): string {
  if (!month || typeof month !== "string") return "";
  const trimmed = month.trim();
  if (trimmed.length <= 3) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1, 3).toLowerCase();
}

type ReportLike = {
  subsidiary?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  report?: ReportLike;
};

/**
 * Format report breadcrumb: "Subsidiary Name - Jan 2024 - Dec 2024"
 * Supports both flat response and nested report.report from API.
 */
export function formatReportBreadcrumbLabel(report: ReportLike | null | undefined): string {
  const r = report?.report ?? report;
  const subsidiary = (r?.subsidiary ?? report?.subsidiary)?.trim() || "Report";
  const startMonth = r?.startMonth ?? report?.startMonth;
  const startYear = r?.startYear ?? report?.startYear;
  const endMonth = r?.endMonth ?? report?.endMonth;
  const endYear = r?.endYear ?? report?.endYear;
  const startShort = startMonth && startYear ? `${shortenMonth(startMonth)} ${startYear}` : "";
  const endShort = endMonth && endYear ? `${shortenMonth(endMonth)} ${endYear}` : "";
  const period = [startShort, endShort].filter(Boolean).join(" - ");
  return period ? `${subsidiary} - ${period}` : subsidiary;
}
