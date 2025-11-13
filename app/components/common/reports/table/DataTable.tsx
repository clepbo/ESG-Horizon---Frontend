"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/app/components/ui/button";
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
import { TableFilters, TableRowType } from "@/types/table";
import SearchInput from "@/app/components/ui/reusables/SearchInput";
import { StatusButton, StatusVariant } from "../StatusButton";
import Link from "next/link";
import { exportToCSV } from "@/app/(company)/reports-and-analytics/components/exportFiles";
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

export function DataTable() {
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    status: "",
    date: "",
  });

  const report = useReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data: any[] = report.data || [];

  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
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

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.startingPeriod.toLowerCase().includes(search) ||
        row.original.endingPeriod.toLowerCase().includes(search) ||
        row.original.subsidiary.toLowerCase().includes(search) ||
        row.original.status.toLowerCase().includes(search)
      );
    },
    state: {
      globalFilter: filters.search,
    },
    onGlobalFilterChange: (value: any) => {
      setFilters((prev) => ({ ...prev, search: value }));
    },
  });

  const handleYearFilter = (year: string) => {
    setFilters((prev) => ({ ...prev, date: year }));
    if (year === "all") {
      table.getColumn("startingPeriod")?.setFilterValue(undefined);
    } else {
      table.getColumn("startingPeriod")?.setFilterValue(year);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    if (status === "all") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(status);
    }
  };

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
      {/* Header with search and filters */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <SearchInput
          placeholder="Search by subsidiary"
          value={filters.search}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        <div className="flex gap-2">
          <Button className={`text-white font-semibold`} onClick={() => exportToCSV(data)}>
            Export CSV
          </Button>

          <div className="flex items-center gap-2">
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Working on it">Working on it</SelectItem>
                <SelectItem value="Awaiting Review">Awaiting Review</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleYearFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent side="top">
                {[2021, 2022, 2023, 2024].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>›
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
