"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import Header from "@/app/components/layout/Header";
import DepartmentsTable from "@/app/components/company/teams/DepartmentsTable";
import AddDepartmentModal from "@/app/components/company/teams/AddDepartmentModal";
import { Department } from "@/lib/mockData/mockDepartment";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import Spinner from "@/app/components/ui/reusables/Spinner";
import { fetchDepartments } from "@/lib/api/departmentsApi";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [loading, setLoading] = useState(true);

  /** Fetch departments from API or mock */
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  /** Add new department */
  const handleAddDepartment = (
    newDept: Omit<Department, "id" | "teamSize" | "status">
  ) => {
    const departmentWithDefaults: Department = {
      id: String(Date.now()),
      teamSize: 0,
      status: "Active",
      ...newDept,
    };
    setDepartments((prev) => [departmentWithDefaults, ...prev]);
  };
  /** Filter departments based on search & status */
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(search.toLowerCase()) ||
        dept.lead.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Status" || dept.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <main className="flex-1 h-full overflow-y-auto p-6">
        <Header />

        {/* Title & Add Button */}
        <div className="flex justify-between">
          <div className="mt-4">
            <h2 className="text-2xl font-semibold">Departments</h2>
            <p className="text-gray-600">
              Manage company departments and their assigned members
            </p>
          </div>

          <div className="flex justify-between items-center mb-6 mt-4">
            <button
              className="border bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-sm text-sm flex items-center cursor-pointer"
              onClick={() => setShowAddDepartmentModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Department
            </button>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
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
        />
      )}
    </div>
  );
}
