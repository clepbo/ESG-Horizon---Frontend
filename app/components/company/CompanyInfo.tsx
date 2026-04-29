"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone, RotateCcw, Ban, CircleCheckBig } from "lucide-react";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import { Company, companyService } from "@/services/company.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type Props = {
  company: Company;
  onStatusChange?: (newStatus: Company["status"]) => void;
};

const STATUS_CONFIG: Partial<
  Record<
    Company["status"],
    {
      label: string;
      icon: React.ReactNode;
      className: string;
      newStatus: Company["status"];
      confirmMessage: string;
    }
  >
> = {
  pending: {
    label: "Activate",
    icon: <CircleCheckBig size={14} />,
    className: "bg-green-600 text-white hover:bg-green-700",
    newStatus: "active",
    confirmMessage: "The company ESG admin(s) will be notified by email.",
  },
  active: {
    label: "Suspend",
    icon: <Ban size={14} />,
    className: "bg-red-500 text-white hover:bg-red-600",
    newStatus: "suspended",
    confirmMessage: "All company users will lose access immediately.",
  },
  suspended: {
    label: "Reactivate",
    icon: <RotateCcw size={14} />,
    className: "bg-green-600 text-white hover:bg-green-700",
    newStatus: "active",
    confirmMessage: "The company ESG admin(s) will be notified by email.",
  },
};

export default function CompanyInfo({ company, onStatusChange }: Props) {
  const [currentStatus, setCurrentStatus] = useState<Company["status"]>(company.status);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const action = STATUS_CONFIG[currentStatus];

  const handleConfirmStatusChange = async () => {
    if (!action) return;

    setUpdating(true);
    try {
      await companyService.updateStatus(company.id, action.newStatus);
      setCurrentStatus(action.newStatus);
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.info(`Company status updated to ${action.newStatus}`);
      onStatusChange?.(action.newStatus);
    } catch (error) {
      toast.error("Failed to update company status. Please try again.");
      console.error("Status update error:", error);
    } finally {
      setUpdating(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2">
          <div className="flex items-start gap-4 mb-6">
            <Image
              src={company.company_logo_url || "/icons/default-company.svg"}
              alt={company.name || "Company Logo"}
              width={48}
              height={48}
              className="rounded-full object-contain"
            />
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Info label="Company Name" value={company.name} />
              <Info label="Industry Type" value={company.industry?.name} />
              <Info label="Email Address" value={company.contact_email} />
              <Info label="Contact Phone Number" value={company.contact_phone} />
              <Info label="Website Address" value={company.website} />
              <Info label="Platform Users Count" value={company.staff_strength} />
              <Info label="Company Registration Number" value={company.registration_number} />
              <Info label="Company Address" value={company.address} />
            </div>
          </div>

          {/* Primary Contact */}
          <hr className="my-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-4">Primary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">{company.name || "N/A"}</div>
            </div>
            <ContactInfo icon={<Mail size={16} />} value={company.contact_email} />
            <ContactInfo icon={<Phone size={16} />} value={company.contact_phone} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Company Status */}
          <DetailCard
            title="Company Status"
            icon={<Image src="/icons/company.svg" alt="Company Icon" width={14} height={14} />}
          >
            <div className="flex flex-col gap-3">
              <Info label="Current Status" value={<StatusBadge status={currentStatus} />} />
              {action && (
                <button
                  onClick={() => setModalOpen(true)}
                  className={`flex items-center justify-center gap-1 w-full px-4 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${action.className}`}
                >
                  {action.icon}
                  {action.label}
                </button>
              )}
            </div>
          </DetailCard>
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Confirm Status Change"
        message={
          <>
            Are you sure you want to <span className="font-bold lowercase">{action?.label}</span>{" "}
            this company? {action?.confirmMessage}
          </>
        }
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        loading={updating}
      />
    </div>
  );
}

/* Sub Components */
function Info({ label, value }: { label: string; value: string | React.ReactNode | undefined }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value || "N/A"}</div>
    </div>
  );
}

function ContactInfo({ icon, value }: { icon: React.ReactNode; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{value || "N/A"}</span>
    </div>
  );
}

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="shadow-sm rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-green-500 text-white",
    pending: "bg-yellow-400 text-white",
    suspended: "bg-red-500 text-white",
  };
  const colors = colorMap[status] ?? "bg-gray-400 text-white";

  return (
    <span className={`px-3 py-0.5 text-xs rounded-full font-medium capitalize ${colors}`}>
      {status || "N/A"}
    </span>
  );
}
