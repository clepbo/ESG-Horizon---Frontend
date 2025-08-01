"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit } from "lucide-react";
import EditUserModal from "@/app/components/users/EditUserModal";
import Header from "@/app/(dashboard-esg)/components/Header";
import Sidebar from "@/app/(dashboard-esg)/components/Sidebar";

const user = {
  name: "Israel Oni",
  email: "israel.oni@teasooconsulting.com",
  phone: "+234 813 679 3904",
  permission: "Super Admin",
  status: "Active",
  company: "Teasoo Consulting",
  avatar: "/images/image.png",
};

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Account");

  const [firstName, lastName] = user.name.split(" ");
  const tabs = ["Account", "Organization", "Notifications", "Security"];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-6">
        {/* Header */}
        <Header />

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Small Left Navigation */}
          <aside className="bg-white rounded-lg p-4 w-full md:w-64 h-fit shadow">
            <nav className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-left px-4 py-2 rounded-lg font-medium ${
                    activeTab === tab
                      ? "bg-green-200 text-green-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </aside>

          {/* Settings Content */}
          <div className="flex-1 space-y-6">
            <header>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Manage your account preferences and organization settings.
              </p>
            </header>

            {activeTab === "Account" && (
              <>
                {/* Account Information */}
                <section className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">
                      Account Information
                    </h2>
                    <EditButton onClick={openModal} />
                  </div>

                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <Image
                      src={user.avatar}
                      alt={`${user.name} Avatar`}
                      width={64}
                      height={64}
                      className="rounded-full object-cover border border-gray-200"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-sm">
                      <InfoItem label="First Name" value={firstName} />
                      <InfoItem label="Last Name" value={lastName} />
                      <InfoItem label="Email Address" value={user.email} />
                      <InfoItem label="Phone Number" value={user.phone} />
                      <InfoItem
                        label="Role"
                        value="Junior Associate - Digital"
                      />
                      <InfoItem label="Permission" value={user.permission} />
                    </div>
                  </div>
                </section>

                {/* Preferences */}
                <section className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Preferences</h2>
                    <EditButton onClick={openModal} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Language
                      </p>
                      <select className="mt-1 border rounded-lg px-3 py-2 text-sm w-40">
                        <option>English</option>
                        <option>French</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Time Zone
                      </p>
                      <select className="mt-1 border rounded-lg px-3 py-2 text-sm w-40">
                        <option>UTC</option>
                        <option>GMT+1</option>
                      </select>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === "Organization" && (
              <section className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Organization Settings</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Organization settings content goes here.
                </p>
              </section>
            )}

            {activeTab === "Notifications" && (
              <section className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Notification Settings</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Notification settings content goes here.
                </p>
              </section>
            )}

            {activeTab === "Security" && (
              <section className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Security Settings</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Security settings content goes here.
                </p>
              </section>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isModalOpen && <EditUserModal onClose={closeModal} user={user} />}
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
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
