"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { users, type UserRow } from "../_fixtures/users";
import UserAvatar from "./UserAvatar";
import UserRolePill from "./UserRolePill";
import UserStatusPill from "./UserStatusPill";
import Pagination from "../../components/Pagination";
import FilterSelect from "../../components/FilterSelect";

const ROLE_OPTIONS = ["All Roles", "Super Admin", "Sub Admin", "Data Officer", "Viewer"];
const COMPANY_OPTIONS = ["All Companies", "Teasoo", "GreenTech", "Barone LLC"];
const STATUS_OPTIONS = ["All Statuses", "Active", "Suspended", "Pending"];
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

interface UsersTableProps {
  onViewUser: (user: UserRow) => void;
  onSuspendUser: (user: UserRow) => void;
}

export default function UsersTable({ onViewUser, onSuspendUser }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [company, setCompany] = useState(COMPANY_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        if (!fullName.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      if (role !== ROLE_OPTIONS[0] && u.role !== role) return false;
      if (company !== COMPANY_OPTIONS[0] && u.company !== company) return false;
      if (status !== STATUS_OPTIONS[0] && u.status !== status) return false;
      return true;
    });
  }, [search, role, company, status]);

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
          <FilterSelect value={role} onChange={setRole} options={ROLE_OPTIONS} />
          <FilterSelect value={company} onChange={setCompany} options={COMPANY_OPTIONS} />
          <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase border-t border-b border-gray-100">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Last Active</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-700">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              pageRows.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        firstName={u.firstName}
                        lastName={u.lastName}
                        color={u.avatarColor}
                      />
                      <span className="font-medium text-gray-900">
                        {u.firstName} {u.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">{u.email}</td>
                  <td className="px-5 py-4">
                    <UserRolePill role={u.role} />
                  </td>
                  <td className="px-5 py-4">{u.department}</td>
                  <td className="px-5 py-4">{u.company}</td>
                  <td className="px-5 py-4">{u.lastActive}</td>
                  <td className="px-5 py-4">
                    <UserStatusPill status={u.status} />
                  </td>
                  <td className="px-5 py-4 relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      className="p-1.5 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      aria-label="Row actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === u.id && (
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
                              onViewUser(u);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onSuspendUser(u);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Suspend User
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
