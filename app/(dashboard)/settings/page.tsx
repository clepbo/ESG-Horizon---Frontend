"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit } from "lucide-react";
import StatusBadge from "@/app/components/ui/StatusBadge";
import EditUserModal from "@/app/components/users/EditUserModal";
import Header from "@/app/components/layout/Header";

const user = {
  name: "Israel Oni",
  email: "israel.oni@teasooconsulting.com",
  phone: "+234 813 679 3904",
  permission: "Super Admin",
  status: "Active",
  company: "Teasoo Consulting",
  avatar: "/images/image.png",
  companyLogo: "/images/image2.png",
};

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, lastName] = user.name.split(" ");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <section className="flex flex-col gap-6 w-full p-4 md:p-6">
      <Header />
      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-xl border border-gray-200 shadow p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white">
          <div className="flex items-center gap-4">
            <Image
              src={user.avatar}
              alt={`${user.name} Avatar`}
              width={64}
              height={64}
              className="rounded-full object-cover border border-gray-200"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.name}
              </h2>
              <StatusBadge status={user.permission} />
            </div>
          </div>

          <EditButton onClick={openModal} />
        </section>

        {/* Personal Info */}
        <SectionCard title="Personal Information" onEdit={openModal}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <InfoItem label="First Name" value={firstName} />
            <InfoItem label="Last Name" value={lastName} />
            <InfoItem label="Email Address" value={user.email} />
            <InfoItem label="Phone Number" value={user.phone} />
            <InfoItem label="Role" value="Junior Associate - Digital" />
            <InfoItem label="Permission" value={user.permission} />
          </div>
        </SectionCard>
      </div>
    </section>
  );
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 shadow bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        <EditButton onClick={onEdit} />
      </div>
      {children}
    </section>
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

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
    >
      <Edit className="w-4 h-4" />
      Edit
    </button>
  );
}
