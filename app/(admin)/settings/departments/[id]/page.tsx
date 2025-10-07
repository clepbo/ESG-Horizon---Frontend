/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { fetchTeamUsers, fetchDepartments } from "@/lib/api/departmentsApi";
import { TeamUser, Department } from "@/lib/mockData/mockDepartment";
import { Input } from "@/app/components/ui/input";
import { Plus, Search, Edit } from "lucide-react";
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

export default function DepartmentTeamUsersPage() {
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // data state
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);

  /** Fetch all departments and team users */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [departmentsData, teamData] = await Promise.all([
        fetchDepartments(),
        fetchTeamUsers(),
      ]);

      const dept = departmentsData.find((d) => d.id === id) || null;
      setDepartment(dept);
      setTeamUsers(teamData);
    } catch (err) {
      console.error("Error fetching department/team users:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = useMemo(() => {
    return teamUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter, teamUsers]);

  const handleEditClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsEditOpen(true);
  };

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
          <button
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => handleEditClick(department)} // ✅ Use handler
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
          <InfoRow label="Department Name" value={department.name} />
          <InfoRow label="Description" value={department.description} />
          <InfoRow label="Department Lead" value={department.lead} />
          <InfoRow label="Email" value={department.email} />
          <InfoRow
            label="Team Members"
            value={department.teamSize?.toString() || "0"}
          />
          <InfoRow label="Status" value={department.status} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-sm text-sm flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" />
          Invite New User
        </button>
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
        {/* <TeamMembersTable members={paginatedMembers} users={teamUsers} /> */}
      </div>

      {/* Pagination */}
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

      {/* Modals */}
      {/* {showInviteModal && (
        <InviteUserModal onClose={() => setShowInviteModal(false)} />
      )}

      {isEditOpen && selectedDepartment && (
        <EditDepartmentModal
          department={selectedDepartment}
          onClose={() => setIsEditOpen(false)}
        />
      )} */}
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

// export async function generateStaticParams() {
//     const yourCompany = await companyService.getDetails();
//     if (!yourCompany) return [];

//     const departments = await departmentService.getAll(yourCompany.id);

//     return departments.map((dept: Department) => ({
//         id: String(dept.id),
//     }));
// }
