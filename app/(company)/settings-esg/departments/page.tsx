"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Header from "@/app/(company)/components/Header";
import DepartmentsTable from "@/app/components/company/teams/DepartmentsTable";
import AddDepartmentModal from "@/app/components/company/teams/AddDepartmentModal";
import { companyService } from "@/services/company.service";
import { CreateDepartment, Department, departmentService } from "@/services/department.service";
import { User } from "@/services/user.service";
import { getCurrentUser } from "@/lib/utils";
import CompanySetupModal from "@/app/components/company/CompanySetupModal";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import TableManagementControls from "@/app/components/company/TableManagementControls";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"subsidiary" | "department" | "user">("department");

  interface SubmissionData {
    departments: Department[];
  }

  const handleModalSubmit = (data: SubmissionData) => {
    toast.success("Submitted Successfully");
    setIsModalOpen(false);
    console.log("Modal submitted data:", data);
    loadDepartments();
  };

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const yourCompany = await companyService.getDetails();
      if (!yourCompany) {
        throw new Error("No company details found");
      }
      const data = await departmentService.getAll(yourCompany.id);
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const yourCompany = await companyService.getDetails();
      if (!yourCompany) throw new Error("No company details found");

      const companyUsers = await companyService.getUsers(yourCompany.id);
      setUsers(companyUsers);
    } catch (error) {
      console.error("Error fetching company users:", error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
    loadUsers();
    getCurrentUser().then(setCurrentUser);
  }, [loadDepartments, loadUsers]);

  const handleAddDepartment = async (newDept: {
    name: string;
    description?: string;
    lead?: Partial<User> | null;
    contact_email: string;
  }) => {
    try {
      setLoading(true);
      const yourCompany = await companyService.getDetails();
      if (!yourCompany) throw new Error("Company not found");

      const createPayload: CreateDepartment = {
        name: newDept.name,
        description: newDept.description,
        contact_email: newDept.contact_email || currentUser?.email,
        leadId: newDept.lead?.id ? Number(newDept.lead.id) : Number(currentUser?.id),
      };

      const createdDepartment = await departmentService.create(yourCompany.id, createPayload);
      setDepartments((prev) => [createdDepartment, ...prev]);
    } catch (error) {
      console.error("Failed to add department", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const leadName = `${dept.lead?.first_name || ""} ${dept.lead?.last_name || ""}`
        .trim()
        .toLowerCase();
      const searchLower = search.toLowerCase();

      const matchesSearch =
        dept.name.toLowerCase().includes(searchLower) || leadName.includes(searchLower);

      const matchesStatus = statusFilter === "Status" || dept.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const openModalWithTab = (tab: "subsidiary" | "department" | "user") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
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
          title="Departments"
          description="Manage company departments and their assigned members"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by department or lead"
          addButtonLabel="Add Department"
          onAdd={() => openModalWithTab("department")}
          filters={[
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: ["Status", "Active", "Inactive"],
            },
          ]}
        />

        {loading ? (
          <div className="">
            <CardSkeleton />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <DepartmentsTable departments={filteredDepartments} />
          </div>
        )}
      </motion.main>

      {/* Modal */}
      {showAddDepartmentModal && (
        <AddDepartmentModal
          onClose={() => setShowAddDepartmentModal(false)}
          onAddDepartment={handleAddDepartment}
          users={users}
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
