"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/app/components/ui/button";
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

const columnHelper = createColumnHelper<TableRowType>();

const columns = [
  columnHelper.accessor((row) => `${row.startMonth} ${row.startYear}`, {
    id: "startingPeriod",
    header: "Starting Period",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor((row) => `${row.endMonth} ${row.endYear}`, {
    id: "endingPeriod",
    header: "Ending Period",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("subsidiary", {
    header: "Subsidiaries",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusButton progress={90} status={info.getValue() as StatusVariant} />,
  }),
  columnHelper.display({
    id: "actions",
    header: "Quick Actions",
    cell: (info) => (
      <Button
        variant="default"
        size="sm"
        className="rounded-sm font-semibold text-white bg-primary hover:bg-green-600"
      >
        <Link href={`/reports-and-analytics/${info.row.original.id}`}>View Report</Link>
      </Button>
    ),
  }),
];

export function RecentReportsWidget() {
  const report = useReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data: any[] = report.data || [];

  // console.log("Table Data:", data);
  const recentReports = useMemo(() => {
    const filtered = data.filter((item: any) => {
      return (
        item.subsidiary != null &&
        item.subsidiary !== "" &&
        item.startYear != null &&
        item.startMonth != null &&
        item.endYear != null &&
        item.endMonth != null
      );
    });

    return filtered.slice(0, 3);
  }, [data]);

  const table = useReactTable({
    data: recentReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
              <Button className="bg-white text--[var(--color-primary)] border border-[var(--color-primary)] transform hover:scale-[1.02] hover:text-white">
                Start an Assessment
              </Button>
            </Link>
            <Button
              disabled
              className="bg-[var(--color-primary)] transform hover:scale-[1.02] text-white px-8 py-4 text-sm rounded-sm cursor-not-allowed"
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
      <div className="">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-b border-gray-300 font-semibold text-gray-700"
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`py-4 border-b border-gray-300`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center ">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-center mt-2">
          <Link href="/reports-and-analytics">
            <Button variant="outline" size="sm" className="font-semibold">
              View All Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
