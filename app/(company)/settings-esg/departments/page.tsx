"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import Header from "@/app/components/layout/Header";
import DepartmentsTable from "@/app/components/company/teams/DepartmentsTable";
import AddDepartmentModal from "@/app/components/company/teams/AddDepartmentModal";
import { Input } from "@/app/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/app/components/ui/select";
import Spinner from "@/app/components/ui/reusables/Spinner";
import { companyService } from "@/services/company.service";
import {
    CreateDepartment,
    Department,
    departmentService,
} from "@/services/department.service";
import { User } from "@/services/user.service";
import RoleGuard from "@/lib/RoleGuard";
import { getCurrentUser } from "@/lib/utils";


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


   

console.log("USERS", users);

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

            const createdDepartment = await departmentService.create(
                yourCompany.id,
                createPayload
            );
            setDepartments((prev) => [createdDepartment, ...prev]);
        } catch (error) {
            console.error("Failed to add department", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDepartments = useMemo(() => {
        return departments.filter((dept) => {
            const leadName = `${dept.lead?.first_name || ""} ${
                dept.lead?.last_name || ""
            }`
                .trim()
                .toLowerCase();
            const searchLower = search.toLowerCase();

            const matchesSearch =
                dept.name.toLowerCase().includes(searchLower) ||
                leadName.includes(searchLower);

            return matchesSearch;
        });
    }, [departments, search]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <main className="flex-1 h-full overflow-y-auto p-6">
                <Header />

                {/* Title & Add Button */}
                <div className="flex justify-between">
                    <div className="mt-4">
                        <h2 className="text-2xl font-semibold">Departments</h2>
                        <p className="text-gray-600">
                            Manage company departments and their assigned
                            members
                        </p>
                    </div>

                    <div className="flex justify-between items-center mb-6 mt-4">
                       <RoleGuard allowedRoles={["company_esg_admin", "company_esg_subadmin"]}>

                        <button
                            className="border bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-sm text-sm flex items-center cursor-pointer"
                            onClick={() => setShowAddDepartmentModal(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Department
                        </button>
                        </RoleGuard>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white rounded-lg p-4 shadow-sm">
                    <div className="relative w-full">
                        <Input
                            id="search-input"
                            placeholder="Search by department or lead"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs text-white">
                            <Search className="h-3.5 w-3.5" />
                            Search
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Status">Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow">
                        <DepartmentsTable departments={filteredDepartments} />
                    </div>
                )}
            </main>

            {/* Modal */}
            {showAddDepartmentModal && (
                <AddDepartmentModal
                    onClose={() => setShowAddDepartmentModal(false)}
                    onAddDepartment={handleAddDepartment}
                    users={users}
                />
            )}
        </div>
    );
}
