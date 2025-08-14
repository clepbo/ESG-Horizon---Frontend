"use client";

import { useState, useEffect } from "react";
import EditUserModal from "@/app/components/modals/EditUser";
import SettingsAndPassword from "@/app/components/settings/SettingsAndPassword";
import Header from "@/app/components/layout/Header";
import NotificationsSettings from "@/app/components/settings/NotificationsSettings";
import DataManagement from "@/app/components/settings/DataManagement";
import { User } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import TabBar from "@/app/components/settings/accounts/TopBar";
import ProfileTab from "@/app/components/settings/accounts/ProfileTab";
import Spinner from "@/app/components/Spinner";

const TABS = ["Profile", "Security & Password", "Notifications", "Data"];

export default function AccountPage() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  useEffect(() => {
    if (authUser) {
      setUserData({
        ...authUser,
        avatar: authUser.avatar?.trim() ? authUser.avatar : "/image.png",
      });
    }
  }, [authUser]);

  const handleUpdateUser = (updatedUser: User) => {
    setUserData(updatedUser);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Header />
      <TabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ✅ Show Spinner while loading */}
      {!userData ? (
        <div className="flex justify-center items-center py-10">
          <Spinner />
        </div>
      ) : (
        <>
          {activeTab === "Profile" && (
            <ProfileTab user={userData} onEdit={() => setIsModalOpen(true)} />
          )}
          {activeTab === "Security & Password" && <SettingsAndPassword />}
          {activeTab === "Notifications" && <NotificationsSettings />}
          {activeTab === "Data" && <DataManagement />}
        </>
      )}

      {isModalOpen && userData && (
        <EditUserModal
          user={userData}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
}
