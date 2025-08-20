"use client";

import { Edit, Eye } from "lucide-react";
import Pagination from "@/app/components/ui/reusables/Pagination";
import EditDepartmentModal from "@/app/components/ui/modals/EditDepartment";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Department } from "@/services/department.service";

type Props = {
    departments: Department[];
};

export default function DepartmentsTable({ departments }: Props) {
    const router = useRouter();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const paginatedDepartments = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return departments.slice(start, start + itemsPerPage);
    }, [departments, currentPage, itemsPerPage]);

    // Modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);

    const handleEditClick = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsEditOpen(true);
    };

    return (
        <>
            <div className="relative overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-700">
                        <tr>
                            <th className="px-4 py-3">Department Name</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Lead</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Team Size</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedDepartments.map((dept) => {
                            return (
                                <tr key={dept.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{dept.name}</td>
                                    <td className="px-4 py-3">
                                        {dept.description}
                                    </td>
                                    <td className="px-4 py-3">
                                        {dept?.lead?.first_name || ""}{" "}
                                        {dept?.lead?.last_name || ""}
                                    </td>
                                    <td className="px-4 py-3">
                                        {dept.contact_email || ""}
                                    </td>
                                    <td className="px-4 py-3">-</td>

                                    <td className="px-4 py-3 flex space-x-2">
                                        {/* View */}
                                        <button
                                            className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                router.push(
                                                    `/settings-esg/departments/${dept.id}`
                                                )
                                            }
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4 text-gray-600" />
                                        </button>
                                        {/* Edit button */}
                                        <button
                                            className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                                handleEditClick(dept)
                                            }
                                            title="Edit Department"
                                        >
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="mt-4 px-4 pb-4">
                    <Pagination
                        totalItems={departments.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>

            {/* Edit Department Modal */}
            {isEditOpen && selectedDepartment && (
                <EditDepartmentModal
                    department={selectedDepartment}
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </>
    );
}
