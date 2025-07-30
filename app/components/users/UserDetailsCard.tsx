"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit } from "lucide-react";
import StatusBadge from "@/app/components/ui/StatusBadge";
import EditUserModal from "@/app/components/users/EditUserModal";

interface UserDetailsCardProps {
  user: {
    id: string;
    name: string;
    company: string;
    companyLogo: string;
    role: string;
    status: string;
    email: string;
    phone: string;
    permission: string;
    avatar?: string;
    website?: string;
    address?: string;
    companyPhone?: string;
    companyEmail?: string;
    registrationNumber?: string;
    staffStrength?: string;
    industry?: string;
  };
}

export default function UserDetailsCard({ user }: UserDetailsCardProps) {
  const [firstName, lastName] = user.name.split(" ");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-6">
      {/* User Header */}
      <section className="rounded-xl border border-gray-200 shadow p-4 md:p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-12">
            <Image
              src={user.companyLogo || "/images/image2.png"}
              alt="Company Logo"
              width={48}
              height={48}
              className="rounded-full border border-gray-200 absolute top-0 left-0 z-0"
            />
            <Image
              src={user.avatar || "/images/image.png"}
              alt="User Avatar"
              width={48}
              height={48}
              className="rounded-full border-2 border-white shadow absolute top-0 left-8 z-10"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={user.status} />
              <span className="text-sm text-gray-500">
                {user.permission}, {user.company}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </section>

      {/* Personal Info */}
      <SectionCard
        title="Personal Information"
        onEdit={openModal}
        icon="/images/image.png"
      >
        <InfoGrid
          items={[
            { label: "First Name", value: firstName },
            { label: "Last Name", value: lastName },
            { label: "Email Address", value: user.email },
            { label: "Phone Number", value: user.phone },
            { label: "Role", value: user.role || "Sustainability Officer" },
            { label: "Permission", value: user.permission },
          ]}
        />
      </SectionCard>

      {/* Company Info */}
      <SectionCard
        title="Company Information"
        onEdit={openModal}
        icon={user.companyLogo || "/images/image2.png"}
      >
        <InfoGrid
          items={[
            { label: "Company Name", value: user.company },
            { label: "Industry Type", value: user.industry || "Consulting" },
            {
              label: "Email Address",
              value: user.companyEmail || "info@teasooconsulting.com",
            },
            {
              label: "Contact Phone Number",
              value: user.companyPhone || user.phone,
            },
            {
              label: "Website Address",
              value: user.website || "www.teasooconsulting.com",
            },
            {
              label: "Company Address",
              value:
                user.address || "4, Oghosa Crescent, Off Ihama, GRA Benin City",
            },
            {
              label: "Company Registration Number",
              value: user.registrationNumber || "555-0102",
            },
            {
              label: "Staff Strength",
              value: user.staffStrength || "20",
            },
          ]}
        />
      </SectionCard>

      {/* Modal */}
      {isModalOpen && <EditUserModal user={user} onClose={closeModal} />}
    </div>
  );
}

// Section wrapper with edit button
function SectionCard({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 shadow bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 font-semibold text-gray-900 text-base">
          <Image
            src={icon}
            alt={`${title} Icon`}
            width={28}
            height={28}
            className="rounded-full"
          />
          {title}
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

// Displays a grid of InfoItem components
function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
      {items.map((item, idx) => (
        <InfoItem key={idx} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

// Label + Value item
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
