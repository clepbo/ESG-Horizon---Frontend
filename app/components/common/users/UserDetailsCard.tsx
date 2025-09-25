/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit } from "lucide-react";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import EditUserModal from "@/app/components/common/users/EditUserModal";
import { User } from "@/services/user.service";

export default function UserDetailsCard(user: User) {
    const [firstName, lastName] = user.first_name;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="space-y-6">
            {/* User Header */}
            <section className="rounded-xl border border-gray-200 shadow p-4 md:p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-20 h-12">
                        {/* <Image
              src={user.companyLogo || "/images/image2.png"}
              alt="Company Logo"
              width={48}
              height={48}
              className="rounded-full border border-gray-200 absolute top-0 left-0 z-0"
            /> */}
                        <Image
                            src={user.profile_photo_url || "/images/image.png"}
                            alt="User Avatar"
                            width={48}
                            height={48}
                            className="rounded-full border-2 border-white shadow absolute top-0 left-8 z-10"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {user.first_name}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <StatusBadge status={user.status} />
                            <span className="text-sm text-gray-500">
                                {user.role?.name}, {user.company?.name}
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
                        {
                            label: "Phone Number",
                            value: user.phone_number || "",
                        },
                        { label: "Role", value: user.role?.name || "" },
                        { label: "Permission", value: user.role?.name || "" },
                    ]}
                />
            </SectionCard>

            {/* Company Info */}
            <SectionCard
                title="Company Information"
                onEdit={openModal}
                icon={"/images/image2.png"}
            >
                <InfoGrid
                    items={[
                        { label: "Company Name", value: user.company?.name || "" },
                        { label: "Industry Type", value: "Consulting" },
                        {
                            label: "Email Address",
                            value: user.email || "info@teasooconsulting.com",
                        },
                        {
                            label: "Contact Phone Number",
                            value: user.phone_number || "",
                        },
                        {
                            label: "Website Address",
                            value: "www.teasooconsulting.com",
                        },
                        {
                            label: "Company Address",
                            value: "4, Oghosa Crescent, Off Ihama, GRA Benin City",
                        },
                        {
                            label: "Company Registration Number",
                            value: "555-0102",
                        },
                        {
                            label: "Platform Users Count",
                            value: "20",
                        },
                    ]}
                />
            </SectionCard>

            {/* Modal */}
            {/* {isModalOpen && <EditUserModal user={user} onClose={closeModal} />} */}
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
