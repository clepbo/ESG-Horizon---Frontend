"use client";

import { useEffect, useMemo, useState } from "react";
import TeamsTable from "@/app/components/company/teams/TeamsTable";
import InviteUserModal from "@/app/(company)/components/InviteUserModal";
import { companyService } from "@/services/company.service";
import { TeamUserStatus, User } from "@/services/user.service";
import { Department, departmentService } from "@/services/department.service";
import CompanySetupModal from "@/app/components/company/CompanySetupModal";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import Header from "@/app/(company)/components/Header";
import TableManagementControls from "@/app/components/company/TableManagementControls";
import { useRoles } from "@/lib/roles";

const ROLE_OPTIONS = [
  { label: "Company Admin", value: "company_esg_admin" },
  { label: "Company SubAdmin", value: "company_esg_subadmin" },
  { label: "Company Data Manager", value: "company_esg_data_manager" },
  { label: "Company Viewer", value: "company_esg_viewer" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
];

export default function TeamsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const { canManageUsers } = useRoles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"subsidiary" | "department" | "user">("user");

  async function fetchUsers() {
    setLoading(true);
    const yourCompany = await companyService.getDetails();
    if (!yourCompany) {
      console.error("No company details found");
      setLoading(false);
      return;
    }
    setCompanyName(yourCompany.name);
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
  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredData = useMemo(() => {
    const roleValue = ROLE_OPTIONS.find((r) => r.label === roleFilter)?.value;
    const statusValue = STATUS_OPTIONS.find((s) => s.label === statusFilter)?.value;

    return users.filter((user) => {
      const matchesSearch =
        user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "All Roles" || user.role?.name === roleValue;
      const matchesStatus = statusFilter === "All Status" || user.status === statusValue;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleStatusUpdate = async (id: number, newStatus: TeamUserStatus) => {
    try {
      await companyService.editUser(id, { status: newStatus });
      setUsers((prev) =>
        prev.map((user) => (user.id === Number(id) ? { ...user, status: newStatus } : user))
      );
      toast.success(`User status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update user status");
    }
  };

  const openModalWithTab = (tab: "subsidiary" | "department" | "user") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  interface SubmissionData {
    users: User[];
  }
  const handleModalSubmit = (data: SubmissionData) => {
    toast.success("Submitted Successfully");
    setIsModalOpen(false);
    console.log("Modal submitted data:", data);
    fetchUsers();
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

        <TableManagementControls
          title="Teams"
          description="Manage platform users and their access permissions"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or email"
          addButtonLabel="Invite User"
          onAdd={canManageUsers ? () => openModalWithTab("user") : undefined}
          addButtonDisabled={!canManageUsers}
          filters={[
            {
              label: roleFilter === "All Roles" ? "All Roles" : "Filter Roles",
              value: roleFilter,
              onChange: setRoleFilter,
              options: ["All Roles", ...ROLE_OPTIONS.map((r) => r.label)],
            },
            {
              label: statusFilter === "All Status" ? "All Status" : "Filter Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: ["All Status", ...STATUS_OPTIONS.map((s) => s.label)],
            },
          ]}
        />

        {loading ? (
          <CardSkeleton />
        ) : (
          <TeamsTable
            users={filteredData}
            setUsers={setUsers}
            onStatusUpdate={handleStatusUpdate}
            companyName={companyName}
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

      <CompanySetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        onSubmit={(data) => {
          handleModalSubmit(data);
        }}
      />
    </div>
  );
}
