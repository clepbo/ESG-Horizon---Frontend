"use client";

import { useMemo, useState, useCallback } from "react";
import { useDebounce } from "use-debounce";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { TableRowType } from "@/types/table";
import { StatusButton, StatusVariant } from "../StatusButton";
import Link from "next/link";
import { useReport } from "@/app/(company)/reports-and-analytics/components/service/useReport";
import { Card, CardContent } from "@/app/components/ui/card";
import { Search, Eye, Pencil } from "lucide-react";

const columnHelper = createColumnHelper<TableRowType>();

function getReportTitle(row: TableRowType) {
  return `${row.subsidiary} - ${row.startMonth} ${row.startYear} to ${row.endMonth} ${row.endYear}`;
}

function normalizeStatus(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

/** Abbreviated range of start and end period, e.g. "Feb 25 - Mar 26". */
function formatPeriod(row: TableRowType): string {
  const abbr = (month: string) => {
    const s = (month || "").slice(0, 3);
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
  };
  const shortYear = (y: string) => (String(y || "").length >= 2 ? String(y).slice(-2) : String(y));
  return `${abbr(row.startMonth)} ${shortYear(row.startYear)} - ${abbr(row.endMonth)} ${shortYear(row.endYear)}`;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "submitted_approved", label: "Submitted Approved" },
  { value: "approved", label: "Approved" },
  { value: "unapproved", label: "Unapproved" },
  { value: "awaiting-review", label: "Awaiting Review" },
  { value: "in-progress", label: "In Progress" },
] as const;

const columns = [
  columnHelper.accessor(getReportTitle, {
    id: "reportTitle",
    header: "Report Title",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor(formatPeriod, {
    id: "period",
    header: "Period",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: (info) => (
      <StatusButton
        progress={Number(info.row.original.progress) ?? 0}
        status={info.getValue() as StatusVariant}
      />
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-md border-gray-300"
          asChild
        >
          <Link href={`/reports-and-analytics/${info.row.original.id}`} aria-label="View report">
            <Eye className="h-4 w-4 text-gray-600" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-md border-gray-300"
          asChild
        >
          <Link href={`/assessments/${info.row.original.id}`} aria-label="Edit report">
            <Pencil className="h-4 w-4 text-gray-600" />
          </Link>
        </Button>
      </div>
    ),
  }),
];

export function RecentReportsWidget() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const report = useReport();
  const data: TableRowType[] = Array.isArray(report.data) ? report.data : [];

  // console.log("Table data", data);
  const recentReports = useMemo(() => {
    return data.filter((item) => {
      return (
        item.subsidiary != null &&
        item.subsidiary !== "" &&
        item.startYear != null &&
        item.startMonth != null &&
        item.endYear != null &&
        item.endMonth != null
      );
    });
  }, [data]);

  const filteredReports = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const statusNorm = statusFilter === "all" ? null : normalizeStatus(statusFilter);

    return recentReports.filter((item) => {
      if (statusNorm) {
        const itemStatus = normalizeStatus(item.status ?? "");
        if (itemStatus !== statusNorm) return false;
      }
      if (!q) return true;
      const title = getReportTitle(item).toLowerCase();
      const subsidiary = (item.subsidiary ?? "").toLowerCase();
      const start = `${item.startMonth} ${item.startYear}`.toLowerCase();
      const end = `${item.endMonth} ${item.endYear}`.toLowerCase();
      return title.includes(q) || subsidiary.includes(q) || start.includes(q) || end.includes(q);
    });
  }, [recentReports, debouncedSearch, statusFilter]);

  const table = useReactTable({
    data: filteredReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const rows = table.getRowModel().rows;

  if (data.length === 0) {
    return (
      <Card className="max-w-4xl w-full mx-auto p-15 rounded-md bg-white border-none mb-10 shadow-md">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-semibold text-gray-700 mb-4">
            You haven&apos;t generated any <br /> reports yet
          </p>
          <p className="text-lg text-gray-500 mb-6 text-center">
            Once you complete an assessment, you can generate your first ESG <br /> report to track
            performance and share insights with stakeholders.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/assessments/new-assessment">
              <Button className="bg-white text--[var(--color-primary)] border border-primary transform hover:scale-[1.02] hover:text-white">
                Start an Assessment
              </Button>
            </Link>
            <Button
              disabled
              className="bg-primary transform hover:scale-[1.02] text-white px-8 py-4 text-sm rounded-sm cursor-not-allowed"
            >
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4 rounded-md px-4 bg-white py-4">
      {/* Filter bar: Search + Status only (no Type), responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-2 min-w-0">
          <Input
            type="search"
            placeholder="Search by name or company"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 min-w-0 rounded-md border border-gray-300 h-10"
          />
          <Button
            type="button"
            className="rounded-md bg-primary hover:bg-teal-600 text-white font-medium shrink-0 h-10 px-4 inline-flex items-center gap-2"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-md border border-gray-300 h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`border-b border-gray-300 font-semibold text-gray-700 ${
                      header.id === "actions" ? "text-right" : ""
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`py-4 border-b border-gray-300 ${cell.column.id === "actions" ? "text-right" : ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-center mt-2">
        <Link href="/reports-and-analytics">
          <Button variant="outline" size="sm" className="font-semibold">
            View All Reports
          </Button>
        </Link>
      </div>
    </div>
  );
}
