"use client";

import { Eye, CircleCheckBig, RotateCcw, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import Spinner from "@/app/components/ui/reusables/Spinner";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Company, companyService } from "@/services/company.service";
import { toast } from "react-toastify";

interface CompanyTableProps {
  companies: Company[];
  loading?: boolean;
}

const STATUS_ACTIONS: Partial<
  Record<
    Company["status"],
    {
      icon: ReactNode;
      color: string;
      newStatus: Company["status"];
      title: string;
    }
  >
> = {
  pending: {
    icon: <CircleCheckBig className="w-4 h-4 text-green-600" />,
    color: "border-green-500 hover:bg-green-200",
    newStatus: "active",
    title: "Activate",
  },
  suspended: {
    icon: <RotateCcw className="w-4 h-4 text-yellow-600" />,
    color: "border-yellow-500 hover:bg-yellow-100",
    newStatus: "active",
    title: "Restart",
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
    title: "Activate",
  },
};

export default function CompanyTable({ companies, loading }: CompanyTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [updating, setUpdating] = useState(false);
  const [modalData, setModalData] = useState<{
    open: boolean;
    companyId: number | null;
    currentStatus: Company["status"] | null;
    newStatus: Company["status"] | null;
  }>({ open: false, companyId: null, currentStatus: null, newStatus: null });

  const openModal = (companyId: number, currentStatus: Company["status"], newStatus: Company["status"]) => {
    setModalData({ open: true, companyId, currentStatus, newStatus });
  };

  const closeModal = () => {
    setModalData({ open: false, companyId: null, currentStatus: null, newStatus: null });
  };

  const handleStatusChange = async () => {
    const { companyId, newStatus } = modalData;
    if (!companyId || !newStatus) return;

    setUpdating(true);
    try {
      await companyService.updateStatus(companyId, newStatus);

      queryClient.setQueryData<Company[]>(["companies"], (prev) =>
        prev?.map((company) =>
          company.id === companyId ? { ...company, status: newStatus } : company
        )
      );
      toast.info(`Company status updated to ${newStatus}`);
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.error("Failed to update company status. Please try again.");
      console.error("Status update error:", error);
    } finally {
      setUpdating(false);
      closeModal();
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-xl bg-white scrollbar-hide">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          <Spinner />
        </div>
      )}

      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Registration No.</th>
            <th className="px-4 py-3">Sector</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Quick Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {companies.map(({ id, name, registration_number, industry, status }) => {
            const action = STATUS_ACTIONS[status];
            return (
              <tr key={id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{name}</td>
                <td className="px-4 py-3">{registration_number || "N/A"}</td>
                <td className="px-4 py-3">{industry?.sector?.name || "N/A"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={status} />
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/company/${id}`)}
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>

                  {action && (
                    <button
                      className={`rounded-md border p-2 cursor-pointer ${action.color}`}
                      onClick={() => openModal(id, status, action.newStatus)}
                      title={action.title}
                    >
                      {action.icon}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConfirmModal
        open={modalData.open}
        title="Confirm Status Change"
        message={
          <>
            Are you sure you want to{" "}
            <span className="font-bold lowercase">
              {modalData.currentStatus ? STATUS_ACTIONS[modalData.currentStatus]?.title : modalData.newStatus}
            </span>{" "}
            this company?{" "}
            {modalData.newStatus === "suspended"
              ? "All company users will lose access immediately."
              : "The company ESG admin(s) will be notified by email."}
          </>
        }
        onCancel={closeModal}
        onConfirm={handleStatusChange}
        loading={updating}
      />
    </div>
  );
}
