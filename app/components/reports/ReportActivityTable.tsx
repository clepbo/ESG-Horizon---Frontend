"use client";

import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import Pagination from "@/app/components/Pagination";
import SearchInput from "@/app/components/ui/SearchInput";
import SelectFilter from "@/app/components/ui/SearchFilter";
import Spinner from "../ui/Spinner";

// Custom status badge styles based on status text
const statusStyles: Record<string, string> = {
  Published: "bg-green-500 text-white",
  Rejected: "bg-red-500 text-white",
  "Under Review": "bg-yellow-400 text-white",
  Approved: "bg-blue-500 text-white",
  Draft: "bg-gray-400 text-white",
};

function StatusBadge({ status }: { status: string }) {
  const baseStyle =
    "inline-block px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap";
  return (
    <span className={`${baseStyle} ${statusStyles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}

const allReports = [
  {
    id: 1,
    title: "Q3 2024 ESG Performance Report",
    company: "GreenTech Solutions",
    type: "Quarterly",
    submissionDate: "2021-01-01",
    status: "Published",
  },
  {
    id: 2,
    title: "2024 Sustainability Snapshot",
    company: "EcoBuild Limited",
    type: "Annual",
    submissionDate: "2020-08-08",
    status: "Rejected",
  },
  {
    id: 3,
    title: "H1 2024 Social Impact Report",
    company: "BlueEarth Corp",
    type: "Bi-Annual",
    submissionDate: "2025-12-12",
    status: "Under Review",
  },
  {
    id: 4,
    title: "Q2 2024 Environmental Data Submission",
    company: "ClearWater Technologies",
    type: "Sustainability",
    submissionDate: "2020-08-08",
    status: "Approved",
  },
  {
    id: 5,
    title: "2023 Governance and Compliance Summary",
    company: "SafeGrid Partners",
    type: "Compliance",
    submissionDate: "2022-10-10",
    status: "Draft",
  },
  {
    id: 6,
    title: "Q1 2024 Investor ESG Disclosure",
    company: "EcoVista Holdings",
    type: "Quarterly",
    submissionDate: "2022-10-10",
    status: "Approved",
  },
  {
    id: 7,
    title: "Q4 2023 ESG Overview",
    company: "NexaGreen Industries",
    type: "Annual",
    submissionDate: "2022-10-10",
    status: "Published",
  },
  {
    id: 8,
    title: "Mid-Year Regulatory ESG Filing",
    company: "UrbanRenew Group",
    type: "Bi-Annual",
    submissionDate: "2020-08-08",
    status: "Under Review",
  },
  {
    id: 9,
    title: "2024 ESG Baseline Metrics Submission",
    company: "RenewAble Futures Ltd.",
    type: "Sustainability",
    submissionDate: "2022-10-10",
    status: "Published",
  },
  {
    id: 10,
    title: "Q3 2024 Impact & Risk Summary",
    company: "VerdeTech Innovations",
    type: "Compliance",
    submissionDate: "2025-12-12",
    status: "Rejected",
  },
];

const typeOptions = [
  "All",
  "Annual",
  "Quarterly",
  "Bi-Annual",
  "Sustainability",
  "Compliance",
];

const statusOptions = [
  "All",
  "Published",
  "Rejected",
  "Under Review",
  "Approved",
  "Draft",
];

export default function ReportActivityTable() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return allReports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.company.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || report.type === typeFilter;
      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const totalItems = filtered.length;

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (limit: number) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
        <div className="flex gap-2">
          <SelectFilter
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
          />
          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
      </div>
      <div className="relative overflow-x-auto bg-white shadow rounded-xl">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
            <Spinner />
          </div>
        )}

        {/* Table */}

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Report Title</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Submission Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{report.title}</td>
                <td className="px-4 py-3">{report.company}</td>
                <td className="px-4 py-3">{report.type}</td>
                <td className="px-4 py-3">{report.submissionDate}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 text-white text-sm hover:bg-green-600 transition-colors cursor-pointer"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
