"use client";

import { useState, useEffect } from "react";
import EditUserModal from "@/app/components/ui/modals/EditUser";
import SettingsAndPassword from "@/app/components/settings/SettingsAndPassword";
import Header from "@/app/components/layout/Header";
import NotificationsSettings from "@/app/components/settings/NotificationsSettings";
import DataManagement from "@/app/components/settings/DataManagement";
import { useAuth } from "@/context/AuthContext";
import TabBar from "@/app/components/settings/accounts/TopBar";
import ProfileTab from "@/app/components/settings/accounts/ProfileTab";
import { User } from "@/services/user.service";
import { motion } from "framer-motion";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";

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
        profile_photo_url: authUser.profile_photo_url?.trim()
          ? authUser.profile_photo_url
          : "/image.png",
      });
    }
  }, [authUser]);

  const handleUpdateUser = async (updatedUser: User) => {
    if (!userData) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...dataToUpdate } = updatedUser;
    setUserData({ ...userData, ...dataToUpdate });
    setIsModalOpen(false);
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      <Header />
      <TabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

      {!userData ? (
        <div className="flex justify-center items-center py-10">
          <PageSkeleton />
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
    </motion.div>
  );
}
