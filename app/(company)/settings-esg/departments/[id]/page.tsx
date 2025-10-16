"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Search, Edit } from "lucide-react";
import Header from "@/app/(company)/components/Header";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/app/components/ui/select";
import TeamMembersTable from "@/app/components/settings/departments/TeamMembersTable";
import Pagination from "@/app/components/ui/reusables/Pagination";
import InviteUserModal from "@/app/(company)/components/InviteUserModal";
import EditDepartmentModal from "@/app/components/ui/modals/EditDepartment";
import { departmentService, Department } from "@/services/department.service";
import { companyService } from "@/services/company.service";
import { TeamUserStatus, User } from "@/services/user.service";
import { motion } from "framer-motion";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";

export default function DepartmentTeamUsersPage() {
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Data state
  const [teamUsers, setTeamUsers] = useState<Partial<User>[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);

  // Fetch department details and its users
  const loadData = useCallback(async () => {
    const rawId = id;
    const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!cleanId) return;

    try {
      setLoading(true);
      setError(null);

      const yourCompany = await companyService.getDetails();
      if (!yourCompany) throw new Error("No company details found");

      const [departmentsData, teamData] = await Promise.all([
        departmentService.getAll(yourCompany.id),
        departmentService.getUsers(cleanId),
      ]);

      const safeDepartmentsData = Array.isArray(departmentsData) ? departmentsData : [];
      const safeTeamData = Array.isArray(teamData) ? teamData : [];

      // Find department in safe list
      const dept =
        safeDepartmentsData.find((d: Department) => String(d.id) === String(cleanId)) || null;

      function mapStatus(statusStr: string): TeamUserStatus | undefined {
        const validStatuses = ["Approved", "Pending", "Suspended"];
        if (validStatuses.includes(statusStr)) {
          return statusStr as TeamUserStatus;
        }
        return undefined;
      }

      const normalizedTeamUsers: Partial<User>[] = safeTeamData.map((user) => ({
        ...user,
        id: Number(user.id),
        status: mapStatus(user.status),
        role: { name: user.role },
      }));

      setDepartments(safeDepartmentsData);
      setDepartment(dept);
      setSelectedDepartment(dept);
      setTeamUsers(normalizedTeamUsers);
    } catch (err) {
      console.error("Error fetching department/team users:", err);
      setError("Failed to load department data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = useMemo(() => {
    const searchLower = search.toLowerCase();

    return teamUsers.filter((user) => {
      const firstName = user.first_name ?? "";
      const lastName = user.last_name ?? "";
      const email = user.email ?? "";

      const matchesSearch =
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesRole = roleFilter === "All" || user.role?.name === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter, teamUsers]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const handleEditClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsEditOpen(true);
  };

  useEffect(() => {
    async function loadDepartments() {
      const yourCompany = await companyService.getDetails();
      if (!yourCompany) return;
      const depts = await departmentService.getAll(yourCompany.id);
      setDepartments(depts);
    }
    loadDepartments();
  }, []);

  async function handleInvite() {
    setLoading(true);
    const rawId = id;
    const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!cleanId) {
      setLoading(false);
      return;
    }
    try {
      const yourCompany = await companyService.getDetails();
      if (yourCompany) {
        const updatedUsers = await departmentService.getUsers(cleanId);

        const safeUpdatedUsers = Array.isArray(updatedUsers) ? updatedUsers : [];

        function mapStatus(statusStr: string): TeamUserStatus | undefined {
          const validStatuses = ["Approved", "Pending", "Suspended"];
          if (validStatuses.includes(statusStr)) {
            return statusStr as TeamUserStatus;
          }
          return undefined;
        }

        const normalizedTeamUsers: Partial<User>[] = safeUpdatedUsers.map((user) => ({
          ...user,
          id: Number(user.id),
          status: mapStatus(user.status),
          role: { name: user.role },
        }));

        setTeamUsers(normalizedTeamUsers);
      }
    } catch (err) {
      console.error("Error inviting user:", err);
      setError("Failed to invite user");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;
  }

  if (!department) {
    return <div className="flex justify-center items-center h-64">Department not found.</div>;
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
            onClick={() => handleEditClick(department)}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
          <InfoRow label="Department Name" value={department.name} />
          <InfoRow label="Description" value={department.description || "-"} />
          <InfoRow
            label="Department Lead"
            value={
              department.lead ? `${department.lead.first_name} ${department.lead.last_name}` : "-"
            }
          />
          <InfoRow label="Email" value={department.contact_email || "-"} />
          <InfoRow label="Team Members" value={String(teamUsers.length)} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="text-white bg-[var(--color-primary)] transform hover:scale-[1.02] px-4 py-2 rounded-sm text-sm flex items-center cursor-pointer"
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
          <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-[var(--color-primary)]  hover:bg-teal-700 px-3 py-1.5 text-xs text-white">
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
        <TeamMembersTable users={paginatedMembers} />
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
      {showInviteModal && (
        <InviteUserModal
          departments={departments}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
        />
      )}

      {isEditOpen && selectedDepartment && (
        <EditDepartmentModal department={selectedDepartment} onClose={() => setIsEditOpen(false)} />
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

// export async function generateStaticParams() {
//     const yourCompany = await companyService.getDetails();
//     if (!yourCompany) return [];

//     const departments = await departmentService.getAll(yourCompany.id);

//     return departments.map((dept: Department) => ({
//         id: String(dept.id),
//     }));
// }
