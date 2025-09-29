"use client"

import { useState } from "react";
import { tableData } from "./data";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { TableFilters, TableRowType } from "@/types/table";
import SearchInput from "@/app/components/ui/reusables/SearchInput";
import { StatusButton } from "../StatusButton";
import Link from "next/link";
import { exportToCSV } from "@/app/(company)/reports-and-analytics/components/exportFiles";




const columnHelper = createColumnHelper<TableRowType>();
const reportId = 1
const columns = [
  columnHelper.accessor("startingPeriod", {
    header: "Starting Period",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("endingPeriod", {
    header: "Ending Period", 
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("subsidiaries", {
    header: "Subsidiaries",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusButton progress={90}
    status={info.getValue() as "Working on it" | "Awaiting Review" | "In Progress"}
    />
  }),
  columnHelper.display({
    id: "actions",
    header: "Quick Actions",
    cell: () => (
      <Button variant="default" size="sm" className="rounded-sm font-semibold text-white bg-green-400 hover:bg-green-600">
        <Link href={`/reports-and-analytics/${reportId}`}>View Report</Link>
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


  const [data] = useState(tableData);

   const table = useReactTable({
    data,
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
        row.original.subsidiaries.toLowerCase().includes(search) ||
        row.original.status.toLowerCase().includes(search)
      );
    },
    state: {
      globalFilter: filters.search,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onGlobalFilterChange: (value: any) => {
      setFilters((prev) => ({ ...prev, search: value }));
    },
  });

  const handleYearFilter = (year: string) => {
  setFilters((prev) => ({ ...prev, date: year }))
  if (year === "all") {
    table.getColumn("startingPeriod")?.setFilterValue(undefined)
  } else {
    table.getColumn("startingPeriod")?.setFilterValue(year)
  }
}


  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    if (status === "all") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(status);
    }
  };

  return (
    <div className="w-full space-y-4 rounded-md px-4 bg-white py-4">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between gap-4">
       
          <SearchInput placeholder="Search by subsidiary" value={filters.search} 
          onChange={(e) => table.setGlobalFilter(e.target.value)} />
          <Button className={`text-white font-semibold`} onClick={()=> exportToCSV(data)}>
            Export CSV
          </Button>

        <div className="flex items-center gap-2">
          <Select onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
              {/* <ChevronDown className="h-4 w-4 opacity-50" /> */}
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
              {/* <ChevronDown className="h-4 w-4 opacity-50" /> */}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="border-b border-gray-300 font-semibold text-gray-700">
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
              <span className="sr-only">Go to previous page</span>
              ‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              ›
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}