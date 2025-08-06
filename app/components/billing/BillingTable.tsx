"use client";

import { useMemo, useState } from "react";
import { Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";

import { billingData } from "@/mockData/billingData";
import Pagination from "@/app/components/Pagination";
import SearchInput from "@/app/components/SearchInput";
import SelectFilter from "@/app/components/SearchFilter";
import Spinner from "@/app/components/Spinner";

const statusColorMap: Record<string, string> = {
  Active: "bg-green-500 text-white",
  Pending: "bg-yellow-400 text-white",
  Expired: "bg-red-500 text-white",
};

const StatusBadge = ({ status }: { status: string }) => {
  const classes = statusColorMap[status] || "bg-gray-200 text-gray-700";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
};

export default function BillingTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const filteredData = useMemo(() => {
    return billingData.filter((item) => {
      const matchesSearch = item.company
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesPlan =
        selectedPlan === "All Plans" || item.plan === selectedPlan;
      const matchesStatus =
        selectedStatus === "All Status" || item.status === selectedStatus;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [search, selectedPlan, selectedStatus]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalItems = filteredData.length;

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    setLoading(false);
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
            value={selectedPlan}
            onChange={(val: string) => {
              setSelectedPlan(val);
              setCurrentPage(1);
            }}
            options={["All Plans", "Free", "Basic", "Premium", "Enterprise"]}
          />
          <SelectFilter
            value={selectedStatus}
            onChange={(val: string) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
            options={["All Status", "Active", "Pending", "Expired"]}
          />
        </div>
      </div>

      <div className="relative overflow-x-auto bg-white shadow rounded-xl">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Spinner />
          </div>
        )}

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Cycle</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Last Payment</th>
              <th className="px-4 py-3">Next Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 ">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{item.company}</td>
                <td className="px-4 py-3">{item.plan}</td>
                <td className="px-4 py-3">{item.cycle}</td>
                <td className="px-4 py-3">{item.amount}</td>
                <td className="px-4 py-3">{item.last}</td>
                <td className="px-4 py-3">{item.next}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 ">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => router.push(`/billing/${item.id}`)}
                      className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 transition"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 transition">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2 text-sm">
          <span>Rows per page</span>
          <select
            value={itemsPerPage}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 25, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 px-4 pb-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}
