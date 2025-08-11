"use client";

import Image from "next/image";
import { useState } from "react";
import { Edit } from "lucide-react";
import EditUserModal from "@/app/components/modals/EditUser";
import SettingsAndPassword from "@/app/components/settings/SettingsAndPassword";
import Header from "@/app/components/layout/Header";
import NotificationsSettings from "@/app/components/settings/NotificationsSettings";
import { User } from "@/types/user";
import DataManagement from "@/app/components/settings/DataManagement";

const TABS = ["Profile", "Security & Password", "Notifications", "Data"];

const INITIAL_USER: User = {
  firstName: "Israel",
  lastName: "Oni",
  email: "israel.oni@teasooconsulting.com",
  phone: "+234 813 679 3904",
  department: "Digital",
  jobTitle: "Junior Associate - Digital",
  permission: "Super Admin",
  avatar: "/image.png",
};

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Header />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Profile" && (
        <ProfileTab user={user} onEdit={() => setIsModalOpen(true)} />
      )}
      {activeTab === "Security & Password" && <SettingsAndPassword />}
      {activeTab === "Notifications" && <NotificationsSettings />}
      {activeTab === "Data" && <DataManagement />}

      {isModalOpen && (
        <EditUserModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
}

function TabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="flex gap-3 border border-gray-200 rounded-lg p-2 bg-white">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 px-6 py-2 rounded border transition-colors cursor-pointer ${
            activeTab === tab
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-green-600 border-green-500 hover:bg-green-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function ProfileTab({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Profile</h2>

        <ProfileCard user={user} onEdit={onEdit} />
        <PersonalInfoCard user={user} />
      </div>
    </div>
  );
}

function ProfileCard({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={user.avatar ?? "/default-avatar.png"}
          alt={`${user.firstName} ${user.lastName}`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h2 className="text-xl font-semibold">
            {user.firstName} {user.lastName}
          </h2>
          <span className="text-sm bg-blue-500 text-white px-3 py-0.5 rounded-full">
            {user.permission}
          </span>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 cursor-pointer"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
    </div>
  );
}

function PersonalInfoCard({ user }: { user: User }) {
  const infoFields: { label: string; value: string }[] = [
    { label: "First Name", value: user.firstName },
    { label: "Last Name", value: user.lastName },
    { label: "Email Address", value: user.email },
    { label: "Phone Number", value: user.phone },
    { label: "Job Title", value: user.jobTitle },
    { label: "Role", value: user.permission },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
        {infoFields.map((field) => (
          <InfoField
            key={field.label}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
