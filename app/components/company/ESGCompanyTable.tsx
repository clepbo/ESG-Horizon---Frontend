"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Eye, CircleCheckBig, RotateCcw, Ban } from "lucide-react";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import Spinner from "@/app/components/ui/reusables/Spinner";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import { Company, companyService } from "@/services/company.service";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

type CompanyTableProps = { companies: Company[] };

export default function ESGCompanyTable({ companies }: CompanyTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<Company["status"] | null>(null);
  const handleView = (id: number) => router.push(`/company/${id}`);

  const openModal = (id: number, newStatus: Company["status"]) => {
    setSelectedCompanyId(id);
    setTargetStatus(newStatus);
    setModalOpen(true);
  };

  const statusActions: Record<
    Company["status"],
    {
      icon: ReactNode;
      color: string;
      newStatus: Company["status"];
      title: string;
    }
  > = {
    pending: {
      icon: <CircleCheckBig className="w-4 h-4 text-green-600" />,
      color: "border-green-500 hover:bg-green-200",
      newStatus: "active",
      title: "Approve",
    },
    suspended: {
      icon: <RotateCcw className="w-4 h-4 text-yellow-600" />,
      color: "border-yellow-500 hover:bg-yellow-100",
      newStatus: "active",
      title: "Activate",
    },
    active: {
      icon: <Ban className="w-4 h-4 text-red-600" />,
      color: "border-red-500 hover:bg-red-100",
      newStatus: "suspended",
      title: "Suspend",
    },
    disabled: {
      icon: <CircleCheckBig className="w-4 h-4 text-green-600" />,
      color: "border-green-500 hover:bg-green-200",
      newStatus: "active",
      title: "Approve",
    },
  };

  const handleStatusChange = async () => {
    if (!selectedCompanyId || !targetStatus) return;

    if (selectedCompanyId && targetStatus) {
      try {
        await companyService.updateStatus(selectedCompanyId, targetStatus);
        queryClient.setQueryData<Company[]>(["companies"], (prev) =>
          prev?.map((company) =>
            company.id === selectedCompanyId ? { ...company, status: targetStatus } : company
          )
        );
        toast.info(`Company status updated to ${targetStatus}`);
      } catch (error) {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        console.error("Failed to update status:", error);
        toast.error("Failed to update status. Please try again.");
      } finally {
        setLoading(false);
        setModalOpen(false);
      }
    }
  };

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ESG companies found.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto bg-white shadow rounded-xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
          <Spinner />
        </div>
      )}

      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Industry (Sector)</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Website</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{company.name}</td>
              <td className="px-4 py-3">
                {company.industry?.industry} ({company.industry?.sector})
              </td>
              <td className="px-4 py-3">{company.contact_email}</td>
              <td className="px-4 py-3">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center"
                >
                  {company.website ? "Visit" : "N/A"}
                  {/* {company.website && <ExternalLink size={16} className="ml-1" />} */}
                </a>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={company.status} />
              </td>
              <td className="px-4 py-3 flex space-x-2">
                <button
                  className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                  title="View"
                  onClick={() => handleView(company.id)}
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                {statusActions[company.status] && (
                  <button
                    className={`rounded-md border p-2 cursor-pointer ${
                      statusActions[company.status].color
                    }`}
                    title={statusActions[company.status].title}
                    onClick={() => openModal(company.id, statusActions[company.status].newStatus)}
                  >
                    {statusActions[company.status].icon}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        open={modalOpen}
        title="Confirm Status Change"
        message={
          <span>
            Are you sure you want to change this company&apos;s status to{" "}
            <strong>{targetStatus}</strong>?
          </span>
        }
        onCancel={() => setModalOpen(false)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
