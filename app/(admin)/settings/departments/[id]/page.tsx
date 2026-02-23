"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { departmentService, DepartmentUser } from "@/services/department.service";
import { Input } from "@/app/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/app/components/ui/select";
import BackButton from "@/app/components/ui/reusables/BackButton";
import Header from "@/app/components/layout/Header";
import Pagination from "@/app/components/ui/reusables/Pagination";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";
import { useAuth } from "@/context/AuthContext";
import { Department } from "@/services/department.service";
import TeamMembersTable from "@/app/components/settings/departments/TeamMembersTable";

export default function DepartmentTeamUsersPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const companyId = user?.company?.id;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // data state
  const [teamUsers, setTeamUsers] = useState<DepartmentUser[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);

  /** Fetch department info and its team members */
  const loadData = useCallback(async () => {
    if (!companyId || !id) return;
    try {
      setLoading(true);
      const [departmentsData, teamData] = await Promise.all([
        departmentService.getAll(companyId),
        departmentService.getUsers(id as string),
      ]);

      const deptList = (departmentsData as unknown as Department[]) || [];
      const dept = deptList.find((d) => String(d.id) === String(id)) || null;
      setDepartment(dept);
      setTeamUsers(Array.isArray(teamData) ? teamData : []);
    } catch (err) {
      console.error("Error fetching department/team users:", err);
    } finally {
      setLoading(false);
    }
  }, [id, companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = useMemo(() => {
    return teamUsers.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || member.status === statusFilter;
      const matchesRole = roleFilter === "All" || member.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter, teamUsers]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  if (loading || !department) {
    return (
      <div className="flex justify-center items-center h-64">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      <Header />
      <BackButton />

      {/* Department Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">{department.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
          <InfoRow label="Department Name" value={department.name} />
          {department.description && (
            <InfoRow label="Description" value={department.description} />
          )}
          <InfoRow
            label="Department Lead"
            value={
              department.lead
                ? `${department.lead.first_name} ${department.lead.last_name}`
                : "—"
            }
          />
          <InfoRow label="Email" value={department.contact_email || department.lead?.email || "—"} />
          <InfoRow label="Team Members" value={String(teamUsers.length)} />
          <InfoRow label="Status" value={department.status || "Active"} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
        <h3 className="text-lg font-semibold">Team Members ({teamUsers.length})</h3>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white rounded-lg p-4 shadow-sm">
        <div className="relative w-full">
          <Input
            placeholder="Search by Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs text-white">
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>

        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value="Super Admin">Super Admin</SelectItem>
              <SelectItem value="Platform Admin">Platform Admin</SelectItem>
              <SelectItem value="Platform Manager">Platform Manager</SelectItem>
              <SelectItem value="Platform Viewer">Platform Viewer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto shadow rounded-lg bg-white">
        {paginatedMembers.length > 0 ? (
          <TeamMembersTable users={paginatedMembers} />
        ) : (
          <div className="px-4 py-10 text-center text-gray-500 text-sm">
            No team members in this department.
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <div className="mt-4 px-4 pb-4">
          <Pagination
            totalItems={filteredMembers.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
