"use client";

import { Edit, Eye } from "lucide-react";
import Pagination from "@/app/components/ui/reusables/Pagination";
import EditDepartmentModal from "@/app/components/ui/modals/EditDepartment";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Department } from "@/services/department.service";
import { Card } from "../../ui/card";
import ActionDropdown from "../../ui/reusables/ActionDropdown";
import ParentCompanyBadge from "../../ui/reusables/ParentCompanyBadge";

type Props = {
  departments: Department[];
  onUpdate?: () => void;
  companyName?: string;
};

export default function DepartmentsTable({ departments, onUpdate, companyName }: Props) {
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
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const handleEditClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsEditOpen(true);
  };

  return (
    <>
      <div className="relative overflow-x-auto bg-white rounded-lg shadow">
        {paginatedDepartments.length === 0 ? (
          <Card>
            <div className="px-4 py-6 text-center text-gray-500 text-sm">No departments found.</div>
          </Card>
        ) : (
          <section>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">Department Name</th>
                  <th className="px-4 py-3">Subsidiary</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Lead</th>
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
                        {dept.subsidiary?.name || (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-gray-900">{companyName || "—"}</span>
                            <ParentCompanyBadge />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {dept.description || (
                          <span className="text-gray-400 font-medium text-sm italic">no desc.</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {dept?.lead?.first_name || ""} {dept?.lead?.last_name || ""}
                          </span>
                          <span className="text-xs text-gray-500">{dept?.lead?.email || ""}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {dept.teamSize || (dept.lead ? 1 : 0)}
                      </td>

                      <td className="px-4 py-3">
                        <ActionDropdown
                          actions={[
                            {
                              label: "View",
                              icon: <Eye className="w-4 h-4 text-gray-600" />,
                              onClick: () => router.push(`/settings-esg/departments/${dept.id}`),
                            },
                            {
                              label: "Edit Department",
                              icon: <Edit className="w-4 h-4 text-gray-600" />,
                              onClick: () => handleEditClick(dept),
                            },
                          ]}
                          buttonLabel="Actions"
                        />
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
          </section>
        )}
      </div>

      {/* Edit Department Modal */}
      {isEditOpen && selectedDepartment && (
        <EditDepartmentModal
          department={selectedDepartment}
          onClose={() => setIsEditOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
