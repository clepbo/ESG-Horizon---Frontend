"use client";
import { useEffect } from "react";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import Header from "@/app/components/layout/Header";
import TeamsTable from "@/app/components/company/teams/TeamsTable";
import InviteUserModal from "@/app/(company)/components/InviteUserModal";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import { companyService } from "@/services/company.service";
import { TeamUserStatus, User } from "@/services/user.service";
import { Department, departmentService } from "@/services/department.service";
import { motion } from "framer-motion";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import { useRoles } from "@/lib/roles";
import PermissionTooltip from "@/app/components/ui/PermissionTooltip";

export default function TeamsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [roleFilter, setRoleFilter] = useState("Roles");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const { isSuperAdmin } = useRoles();
  const canInvite = isSuperAdmin;

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const yourCompany = await companyService.getDetails();
      if (!yourCompany) {
        console.error("No company details found");
        setLoading(false);
        return;
      }
      try {
        const depts = await departmentService.getAll(yourCompany.id);
        setDepartments(depts);

        const companyUsers = await companyService.getUsers(yourCompany.id);
        setUsers(companyUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Status" || user.status === statusFilter;
      const matchesRole = roleFilter === "Roles" || user.role?.name === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const handleStatusUpdate = async (id: number, newStatus: TeamUserStatus) => {
    try {
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, status: newStatus } : user))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="flex h-screen  overflow-hidden">
      <motion.main
        className="flex-1 h-full overflow-y-auto p-6"
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

        {/* Title & Invite */}
        <div className="flex justify-between">
          <div className="mt-4">
            <h2 className="text-2xl font-semibold">Teams</h2>
            <p className="text-gray-600">Manage platform users and their access permissions</p>
          </div>

          <div className="flex justify-between items-center mb-6 mt-4">
            <div className="relative group">
              <button
                className={`text-white px-4 py-2 rounded-sm text-sm flex items-center ${
                  canInvite
                    ? "bg-green-400 hover:bg-green-500 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed opacity-60"
                }`}
                onClick={canInvite ? () => setShowInviteModal(true) : undefined}
                disabled={!canInvite}
              >
                <Plus className="h-4 w-4 mr-1" />
                Invite User
              </button>
              {!canInvite && (
                <PermissionTooltip message="Only Super Admin can invite platform users" />
              )}
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white rounded-lg p-4 shadow-sm">
          {/* Search */}
          <div className="relative w-full">
            <Input
              id="search-input"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs text-white">
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* Dropdowns */}
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Roles">Roles</SelectItem>
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
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <CardSkeleton />
          </div>
        ) : (
          <TeamsTable
            users={filteredData}
            setUsers={setUsers}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </motion.main>

      {showInviteModal && (
        <InviteUserModal
          departments={departments}
          onClose={() => setShowInviteModal(false)}
          onInvite={() => {
            (async () => {
              setLoading(true);
              const yourCompany = await companyService.getDetails();
              if (yourCompany) {
                const companyUsers = await companyService.getUsers(yourCompany.id);
                setUsers(companyUsers);
              }
              setLoading(false);
            })();
          }}
        />
      )}
    </div>
  );
}
