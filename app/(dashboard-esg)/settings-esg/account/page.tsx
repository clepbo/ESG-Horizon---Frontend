"use client";

import Image from "next/image";
import { useState } from "react";
import { Edit } from "lucide-react";
import EditUserModal from "@/app/components/modals/EditUser";
import SettingsAndPassword from "@/app/components/settings/SettingsAndPassword";
import NotificationsSettings from "@/app/components/settings/NotificationsSettings";
import DataManagement from "@/app/components/settings/DataManagement";
import { User } from "@/types/user";
import Header from "@/app/(dashboard-esg)/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

const TABS = ["Profile", "Security & Password", "Notifications", "Data"];

const INITIAL_USER: User = {
  firstName: "Darlene",
  lastName: "Robertson",
  email: "deanna.curtis@example.com",
  phone: "(684) 555-0102",
  department: "Sustainability",
  jobTitle: "Sustainability Officer",
  permission: "ESG Admin",
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
    <div className="bg-[#F2FBF3] min-h-screen">
      <div className="px-6 py-4">
        <Header />
      </div>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-6 space-y-6">
        {activeTab === "Profile" && (
          <ProfileTab user={user} onEdit={() => setIsModalOpen(true)} />
        )}
        {activeTab === "Security & Password" && <SettingsAndPassword />}
        {activeTab === "Notifications" && <NotificationsSettings />}
        {activeTab === "Data" && <DataManagement />}
      </div>

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
    <div className="flex gap-3 border border-gray-200 rounded-lg p-2 mx-5 bg-white ">
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
      {/* Account Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Account Information</h2>

        <div className="flex justify-between items-start mb-6">
          <Image
            src={user.avatar ?? "/default-avatar.png"}
            alt={`${user.firstName} ${user.lastName}`}
            width={48}
            height={48}
            className="rounded-full"
          />
          <button
            onClick={onEdit}
            className="cursor-pointer flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-4">
          <InfoField label="First Name" value={user.firstName} />
          <InfoField label="Last Name" value={user.lastName} />
          <InfoField label="Email Address" value={user.email} />
          <InfoField label="Phone Number" value={user.phone} />
          <InfoField label="Job Title" value={user.jobTitle} />
          <InfoField label="Permission" value={user.permission} />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <p className="text-sm text-gray-500 mb-6">
          Customize your account preferences
        </p>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium">Language</p>
            <p className="text-sm text-gray-500">
              Change your preferred language
            </p>
          </div>
          <Select defaultValue="en">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <hr className="border-gray-200" />

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium">Time Zone</p>
            <p className="text-sm text-gray-500">Set your local time zone</p>
          </div>
          <Select defaultValue="utc">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">UTC</SelectItem>
              <SelectItem value="est">EST</SelectItem>
              <SelectItem value="pst">PST</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
