"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import UserAvatar from "../../users/_components/UserAvatar";
import UserRolePill from "../../users/_components/UserRolePill";
import ModulePill from "./ModulePill";
import ActionStatusPill from "./ActionStatusPill";
import FilterSelect from "../../components/FilterSelect";
import Pagination from "../../components/Pagination";
import { auditEvents } from "../_fixtures/events";
import type { UserRole } from "../../users/_fixtures/users";

const MODULE_OPTIONS = [
  "All Modules",
  "Algorithm",
  "Assessment",
  "Auth",
  "Roles",
  "Reports",
  "Users",
];
const ACTION_OPTIONS = ["All Actions", "Modified", "Added", "Created", "Submitted", "Failed"];
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

// Audit actor roles map loosely to the user role vocabulary for pill reuse.
function mapRole(role: string): UserRole {
  if (role === "Officer") return "Data Officer";
  if (role === "Unknown") return "Viewer";
  return role as UserRole;
}

export default function AuditTrailTable() {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState(MODULE_OPTIONS[0]);
  const [action, setAction] = useState(ACTION_OPTIONS[0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filtered = useMemo(() => {
    return auditEvents.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${e.actor.firstName} ${e.actor.lastName}`.toLowerCase();
        const hay = `${fullName} ${e.action} ${e.entity}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (module !== MODULE_OPTIONS[0] && e.module !== module) return false;
      if (action !== ACTION_OPTIONS[0] && !e.action.toLowerCase().startsWith(action.toLowerCase()))
        return false;
      return true;
    });
  }, [search, module, action]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageRows = filtered.slice(pageStart, pageStart + rowsPerPage);

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_200px_200px] gap-3">
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
          <FilterSelect value={module} onChange={setModule} options={MODULE_OPTIONS} />
          <FilterSelect value={action} onChange={setAction} options={ACTION_OPTIONS} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-800">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 text-gray-900"
          />
          <span className="text-gray-700">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 text-gray-900"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase border-t border-b border-gray-100">
              <th className="px-5 py-3">Timestamp</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Module</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Entity</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-700">
                  No events match your filters.
                </td>
              </tr>
            ) : (
              pageRows.map((e) => {
                const unknown = e.actor.unknown;
                const displayName = unknown
                  ? "Unknown"
                  : `${e.actor.firstName} ${e.actor.lastName}`;
                return (
                  <tr key={e.id} className="border-b border-gray-100 last:border-b-0 align-top">
                    <td className="px-5 py-4 whitespace-nowrap text-gray-900">{e.timestamp}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {unknown ? (
                          <div
                            className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs font-semibold"
                            aria-hidden="true"
                          >
                            ??
                          </div>
                        ) : (
                          <UserAvatar
                            firstName={e.actor.firstName}
                            lastName={e.actor.lastName}
                            color={e.actor.color}
                          />
                        )}
                        <span
                          className={
                            unknown ? "font-medium text-red-600" : "font-medium text-gray-900"
                          }
                        >
                          {displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {e.role === "Unknown" ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <UserRolePill role={mapRole(e.role)} />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <ModulePill module={e.module} />
                    </td>
                    <td className={`px-5 py-4 ${unknown ? "text-red-600" : "text-gray-800"}`}>
                      {e.action}
                    </td>
                    <td className="px-5 py-4 text-gray-800">{e.entity}</td>
                    <td className="px-5 py-4">
                      <ActionStatusPill status={e.status} />
                    </td>
                  </tr>
                );
              })
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
