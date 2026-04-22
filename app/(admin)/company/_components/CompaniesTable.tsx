"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { companies, type CompanyRow } from "../_fixtures/companies";
import PlanPill from "../../billing/_components/PlanPill";
import CategoryPill from "./CategoryPill";
import CompanyStatusPill from "./CompanyStatusPill";
import Pagination from "../../components/Pagination";
import FilterSelect from "../../components/FilterSelect";

const CATEGORY_OPTIONS = ["All Categories", "Company", "Investor", "Regulator"];
const INDUSTRY_OPTIONS = [
  "All Industry",
  "Renewable Energy",
  "Construction",
  "Financial Services",
  "Utilities",
  "Manufacturing",
  "Oil and Gas",
];
const STATUS_OPTIONS = ["All Statuses", "Approved", "Pending", "Suspended"];
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        N/A
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-[#119B95]">
      {score}%
    </span>
  );
}

interface CompaniesTableProps {
  onViewCompany: (company: CompanyRow) => void;
  onSuspendCompany: (company: CompanyRow) => void;
}

export default function CompaniesTable({ onViewCompany, onSuspendCompany }: CompaniesTableProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.contact.toLowerCase().includes(q)) return false;
      }
      if (category !== CATEGORY_OPTIONS[0] && c.category !== category) return false;
      if (industry !== INDUSTRY_OPTIONS[0] && c.industry !== industry) return false;
      if (status !== STATUS_OPTIONS[0] && c.status !== status) return false;
      return true;
    });
  }, [search, category, industry, status]);

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
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Industry</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Subscription</th>
              <th className="px-5 py-3">ESG Score</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-700">
                  No companies match your filters.
                </td>
              </tr>
            ) : (
              pageRows.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-5 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-4">
                    <CategoryPill category={c.category} />
                  </td>
                  <td className="px-5 py-4">{c.industry}</td>
                  <td className="px-5 py-4">{c.contact}</td>
                  <td className="px-5 py-4">
                    <PlanPill plan={c.subscription} />
                  </td>
                  <td className="px-5 py-4">
                    <ScoreBadge score={c.esgScore} />
                  </td>
                  <td className="px-5 py-4">
                    <CompanyStatusPill status={c.status} />
                  </td>
                  <td className="px-5 py-4 relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      className="p-1.5 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      aria-label="Row actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === c.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                          aria-hidden="true"
                        />
                        <div className="absolute right-5 top-12 z-20 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onViewCompany(c);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onSuspendCompany(c);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Suspend Company
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
