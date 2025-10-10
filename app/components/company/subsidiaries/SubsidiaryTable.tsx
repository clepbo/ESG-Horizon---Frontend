"use client";

import { useState, useMemo, useEffect } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import EditSubsidiaryModal from "@/app/components/company/subsidiaries/EditSubsidiary";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import Pagination from "@/app/components/ui/reusables/Pagination";
import { Subsidiary } from "@/services/subsidiaries.service";
import { Card } from "../../ui/card";

interface SubsidiaryTableProps {
  subsidiaries: Subsidiary[];
  onDelete?: (id: string | number) => void;
  onEdit?: (subsidiary: Subsidiary) => void;
}

export default function SubsidiaryTable({
  subsidiaries,
  onDelete,
  onEdit,
}: SubsidiaryTableProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] =
    useState<Subsidiary | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [subsidiaryToDelete, setSubsidiaryToDelete] =
    useState<Subsidiary | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const paginatedSubsidiaries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return subsidiaries.slice(start, start + itemsPerPage);
  }, [subsidiaries, currentPage, itemsPerPage]);

  const handleEditClick = (subsidiary: Subsidiary) => {
    setSelectedSubsidiary(subsidiary);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (subsidiary: Subsidiary) => {
    setSubsidiaryToDelete(subsidiary);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (subsidiaryToDelete?.id !== undefined) {
      onDelete?.(subsidiaryToDelete.id);
      setSubsidiaryToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      {subsidiaries.length === 0 ? (
        <Card>
          <p className="px-4 py-6 text-center text-gray-500 text-sm">
            No subsidiaries found.
          </p>
        </Card>
      ) : (
        <section>
          <div className="relative overflow-x-auto rounded-xl bg-white scrollbar-hide shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">Subsidiary Name</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSubsidiaries.map((subsidiary) => (
                  <tr key={subsidiary.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {subsidiary.name}
                    </td>
                    <td className="px-4 py-3">{subsidiary.industry?.sector}</td>
                    <td className="px-4 py-3">
                      {subsidiary.industry?.industry}
                    </td>
                    <td className="px-4 py-3">{subsidiary.address}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={subsidiary.status} />
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleEditClick(subsidiary)}
                        title="Edit"
                      >
                        <SquarePen className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDeleteClick(subsidiary)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="mt-4 px-4 pb-4">
            <Pagination
              totalItems={subsidiaries.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </section>
      )}

      {/* edit modal */}
      {isEditOpen && selectedSubsidiary && (
        <EditSubsidiaryModal
          subsidiary={selectedSubsidiary}
          onClose={() => setIsEditOpen(false)}
          onUpdate={(updated) => {
            onEdit?.(updated);
            setIsEditOpen(false);
          }}
        />
      )}

      {/* delete confirm modal */}
      <ConfirmModal
        open={isDeleteOpen}
        title="Delete Subsidiary"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium">{subsidiaryToDelete?.name}</span>?
            This action cannot be undone.
          </>
        }
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
