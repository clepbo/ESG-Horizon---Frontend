"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Eye, Download, Search } from "lucide-react";

import { fetchBillingData } from "@/lib/api/billingApi";
import { BillingRecord } from "@/mockData/billingData";

import Pagination from "@/app/components/Pagination";
import Spinner from "@/app/components/Spinner";

import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";

// --- Constants ---
const PLAN_OPTIONS = ["All Plans", "Free", "Basic", "Premium", "Enterprise"];
const STATUS_OPTIONS = ["All Status", "Active", "Pending", "Expired"];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-500 text-white",
  Pending: "bg-yellow-400 text-white",
  Expired: "bg-red-500 text-white",
};

// --- Badge Component ---
const StatusBadge = ({ status }: { status: string }) => {
  const classes = STATUS_COLORS[status] || "bg-gray-200 text-gray-700";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
};

// --- Main Component ---
export default function BillingTable() {
  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBillingData();
        setBillingData(data);
      } catch (err) {
        console.error("Error fetching billing data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Handlers ---
  const handleItemsPerPageChange = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 300);
  }, []);

  // --- Filtered Data ---
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
  }, [billingData, search, selectedPlan, selectedStatus]);

  // --- Paginated Data ---
  const totalItems = filteredData.length;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full">
          <Input
            id="search-input"
            placeholder="Search Company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs text-white">
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>

        {/* Select Filters */}
        <div className="flex gap-2">
          <Select
            value={selectedPlan}
            onValueChange={(val) => {
              setSelectedPlan(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Plan" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_OPTIONS.map((plan) => (
                <SelectItem key={plan} value={plan}>
                  {plan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto bg-white shadow rounded-xl">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Spinner />
          </div>
        )}

        {!loading && (
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
                <th className="px-4 py-3">Actions</th>
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
                  <td className="px-4 py-3">
                    <div className="inline-flex gap-2">
                      <button className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 transition">
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
        )}
      </div>

      {/* Pagination */}
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
  );
}
