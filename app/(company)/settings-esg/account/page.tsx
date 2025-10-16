"use client";
import { useState, useEffect } from "react";
import Header from "@/app/(company)/components/Header";
import EditUserModal from "@/app/components/ui/modals/EditUser";
import SettingsAndPassword from "@/app/components/settings/SettingsAndPassword";
import NotificationsSettings from "@/app/components/settings/NotificationsSettings";
import DataManagement from "@/app/components/settings/DataManagement";
import TabBar from "@/app/components/settings/accounts/TopBar";
import ProfileTab from "@/app/components/settings/accounts/ProfileTab";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
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

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!userData) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...dataToUpdate } = updatedUser;
    setUserData({ ...userData, ...dataToUpdate });
    setIsModalOpen(false);
  };

  return (
    <motion.div
      className="bg-[#F2FBF3] min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      <div className="px-6 py-4">
        <Header />
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

      {!userData ? (
        <div className="flex justify-center items-center py-10">
          <PageSkeleton />
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {activeTab === "Profile" && (
            <>
              <ProfileTab user={userData} onEdit={() => setIsModalOpen(true)} />

              {/*  Preferences section still here in AccountPage */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold">Preferences</h2>
                <p className="text-sm text-gray-500 mb-6">Customize your account preferences</p>

                {/* Language */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-gray-500">Change your preferred language</p>
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

                {/* Time Zone */}
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
            </>
          )}

          {activeTab === "Security & Password" && <SettingsAndPassword />}
          {activeTab === "Notifications" && <NotificationsSettings />}
          {activeTab === "Data" && <DataManagement />}
        </div>
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
