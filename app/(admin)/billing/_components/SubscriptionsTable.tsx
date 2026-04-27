"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { subscriptions, type Subscription } from "../_fixtures/subscriptions";
import PlanPill from "./PlanPill";
import StatusPill from "./StatusPill";
import Pagination from "../../components/Pagination";
import FilterSelect from "../../components/FilterSelect";

const CATEGORY_OPTIONS = ["All Categories", "Enterprise", "Premium", "Basic", "Free"];
const INDUSTRY_OPTIONS = [
  "All Industry",
  "Energy",
  "Renewable Energy",
  "Manufacturing",
  "Finance",
  "Retail",
];
const STATUS_OPTIONS = ["All Statuses", "Active", "Expired", "Pending", "Cancelled"];
const ROWS_PER_PAGE_OPTIONS = [4, 10, 25];

function formatAmount(amount: number) {
  if (amount === 0) return "₦0";
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return iso.slice(0, 10);
}

interface SubscriptionsTableProps {
  onViewSubscription: (subscription: Subscription) => void;
}

export default function SubscriptionsTable({ onViewSubscription }: SubscriptionsTableProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (search && !s.company.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== CATEGORY_OPTIONS[0] && s.plan !== category) return false;
      if (status !== STATUS_OPTIONS[0] && s.status !== status) return false;
      // Industry filter is decorative in the fixture — real wiring later
      return true;
    });
  }, [search, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageRows = filtered.slice(pageStart, pageStart + rowsPerPage);

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search anything..."
            className="w-full h-10 pl-10 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 focus:border-[#119B95]/40 placeholder:text-gray-500 text-gray-900"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterSelect value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
          <FilterSelect value={industry} onChange={setIndustry} options={INDUSTRY_OPTIONS} />
          <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase border-t border-b border-gray-100">
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Billing</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Last Payment</th>
              <th className="px-5 py-3">Next Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-700">
                  No subscriptions match your filters.
                </td>
              </tr>
            ) : (
              pageRows.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-5 py-4 font-medium text-gray-900">{s.company}</td>
                  <td className="px-5 py-4">
                    <PlanPill plan={s.plan} />
                  </td>
                  <td className="px-5 py-4">{s.billing}</td>
                  <td className="px-5 py-4">{formatAmount(s.amount)}</td>
                  <td className="px-5 py-4">{formatDate(s.lastPayment)}</td>
                  <td className="px-5 py-4">{formatDate(s.nextPayment)}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={s.status} />
                  </td>
                  <td className="px-5 py-4 relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                      className="p-1.5 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      aria-label="Row actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === s.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                          aria-hidden="true"
                        />
                        <div className="absolute right-5 top-12 z-20 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onViewSubscription(s);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                          >
                            View details
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Rows per page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="h-8 pl-2 pr-6 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#119B95]/20"
          >
            {ROWS_PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
