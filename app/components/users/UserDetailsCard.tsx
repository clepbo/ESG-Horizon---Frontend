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
  };
}

export default function UserDetailsCard({ user }: UserDetailsCardProps) {
  const [firstName, lastName] = user.name.split(" ");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  console.log("Company logo:", user.companyLogo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-xl border border-gray-200 shadow p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div className="flex items-center gap-4">
          {/* Logo + Avatar Stack */}
          <div className="relative w-20 h-12">
            {/* Company Logo */}
            <Image
              src={user.companyLogo || "/images/image2.png"}
              alt={`${user.name} Company Logo`}
              width={48}
              height={48}
              className="rounded-full object-cover border border-gray-200 absolute top-0 left-0 z-0"
            />

            {/* User Avatar - overlapping */}
            <Image
              src={user.avatar || "/images/image.png"}
              alt={`${user.name} Avatar`}
              width={48}
              height={48}
              className="rounded-full object-cover border-2 border-white shadow absolute top-0 left-8 z-10"
            />
          </div>

          {/* User Info */}
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

        {/* Edit Button */}
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </section>

      {/* Personal Info */}
      <section className="rounded-xl border border-gray-200 shadow bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 font-semibold text-gray-900 text-base">
            <Image
              src="/images/image.png"
              alt="User Icon"
              width={28}
              height={28}
              className="rounded-full"
            />
            Personal Information
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <InfoItem label="First Name" value={firstName} />
          <InfoItem label="Last Name" value={lastName} />
          <InfoItem label="Email Address" value={user.email} />
          <InfoItem label="Phone Number" value={user.phone} />
          <InfoItem label="Role" value="Sustainability Officer" />
          <InfoItem label="Permission" value={user.permission} />
        </div>
      </section>

      {/* Company Info */}
      <section className="rounded-xl border border-gray-200 shadow bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 font-semibold text-gray-900 text-base">
            <Image
              src="/images/image.png"
              alt="Company Logo"
              width={28}
              height={28}
              className="rounded"
            />
            Company Information
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <InfoItem label="Company Name" value={user.company} />
          <InfoItem label="Industry Type" value="Consulting" />
        </div>
      </section>

      {/* Edit Modal */}
      {isModalOpen && <EditUserModal user={user} onClose={closeModal} />}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
