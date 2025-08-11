"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Mail, Phone, RotateCcw } from "lucide-react";
import { User } from "@/mockData/users";
import ConfirmModal from "@/app/components/modals/ConfirmModal";

type Props = {
  company: User;
};

export default function CompanyInfo({ company }: Props) {
  const [status, setStatus] = useState(company.status || "Suspended");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<User["status"]>();

  const openModal = (id: string, newStatus: User["status"]) => {
    setSelectedUserId(id);
    setTargetStatus(newStatus);
    setModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (selectedUserId && targetStatus) {
      // Replace with actual API call
      setStatus(targetStatus);
    }
    setModalOpen(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Company Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2">
          <div className="flex items-start gap-4 mb-6">
            <Image
              src={company.companyLogo || "/icons/default-company.svg"}
              alt={company.company || "Company Logo"}
              width={48}
              height={48}
              className="rounded-full object-contain"
            />
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Info label="Company Name" value={company.company} />
              <Info label="Industry Type" value={company.industry} />
              <Info label="Email Address" value={company.companyEmail} />
              <Info label="Contact Phone Number" value={company.companyPhone} />
              <Info label="Website Address" value={company.website} />
              <Info label="Staff Strength" value={company.staffStrength} />
              <Info
                label="Company Registration Number"
                value={company.registrationNumber}
              />
              <Info label="Company Address" value={company.address} />
            </div>
          </div>

          {/* Primary Contact */}
          <hr className="my-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Primary Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {company.contactPersonName || "N/A"}
              </div>
              <div className="text-xs text-gray-500">
                {company.role || "N/A"}
              </div>
            </div>
            <ContactInfo icon={<Mail size={16} />} value={company.email} />
            <ContactInfo icon={<Phone size={16} />} value={company.phone} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Registration Details */}
          <DetailCard
            title="Registration Details"
            icon={<Calendar size={14} />}
          >
            <Info label="Registration Date" value={company.activity} />
            <Info
              label="Days Since Registration"
              value={`${company.recentActivities?.length || 0} days`}
            />
          </DetailCard>

          {/* Company Status */}
          <DetailCard
            title="Company Status"
            icon={
              <Image
                src="/icons/company.svg" // your actual calendar image path
                alt="Calendar Icon"
                width={14}
                height={14}
              />
            }
          >
            <div className="flex justify-between items-center">
              <Info
                label="Current Status"
                value={<StatusBadge status={status} />}
              />
              <button
                onClick={() =>
                  openModal(
                    company.id,
                    status.toLowerCase() === "approved"
                      ? "Suspended"
                      : "Approved"
                  )
                }
                className={`flex items-center gap-1 w-full md:w-auto px-4 py-1.5 text-xs font-medium rounded-lg transition ${
                  status.toLowerCase() === "approved"
                    ? "bg-red-500 text-white hover:bg-red-600" // Suspend
                    : "bg-yellow-500 text-white hover:bg-yellow-600" // Restore
                }`}
              >
                {status.toLowerCase() === "approved" ? (
                  "Suspend"
                ) : (
                  <>
                    <RotateCcw size={14} /> Restore
                  </>
                )}
              </button>
            </div>
          </DetailCard>
        </div>
      </div>

      {/* Confirm Modal */}
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
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}

/* Sub Components */
function Info({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode | undefined;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value || "N/A"}</div>
    </div>
  );
}

function ContactInfo({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <span className="text-sm font-medium text-gray-900">
        {value || "N/A"}
      </span>
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
  const colors =
    status.toLowerCase() === "approved"
      ? "bg-green-500 text-white"
      : "bg-red-500 text-white";

  return (
    <span className={`px-3 py-0.5 text-xs rounded-full font-medium ${colors}`}>
      {status || "N/A"}
    </span>
  );
}
