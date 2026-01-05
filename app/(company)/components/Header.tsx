"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { formatRoleName } from "@/lib/utils";
import { AutoBreadcrumb } from "@/app/components/ui/CustomBreadcrumb";
import NotificationDropdown from "./NotificationDropdown";
import { useMyTasks } from "@/services/hooks/assignTask.hooks";

export default function Header({ showSearchBar = true }: { showSearchBar?: boolean }) {
  const { user } = useAuth();
  const { data: allTasks = [], isLoading } = useMyTasks();

  // Filter tasks to only show those assigned to the logged-in user
  const myTasks = allTasks.filter((task) => {
    // Check if the logged-in user's ID is in the assignedUserIds array
    return task.assignedUserIds && task.assignedUserIds.includes(user?.id || 0);
  });

  const avatarSrc =
    user?.profile_photo_url && user.profile_photo_url.trim() !== ""
      ? user.profile_photo_url
      : "/image.png";

  const isFallbackImage = !user?.profile_photo_url || user.profile_photo_url.trim() === "";

  return (
    <header className="w-full flex items-center justify-between mb-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        {showSearchBar && (
          // <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
          // <CustomBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Report" }]} />
          <AutoBreadcrumb />
        )}
      </div>

      {/* Notifications & User Info */}
      <div className="flex items-center gap-4">
        {!isLoading && <NotificationDropdown tasks={myTasks} />}

        <div className="flex items-center gap-2">
          <Image
            src={avatarSrc}
            alt={`${user?.first_name || "N/A"}`}
            width={36}
            height={36}
            className={`rounded-full object-cover ${isFallbackImage ? "opacity-50 blur-[1px]" : ""
              }`}
          />
          <div className="flex flex-col justify-center items-start text-sm">
            <span className="text-gray-900 font-medium ">
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </span>
            <span
              className="bg-[var(--color-primary)]
 text-white text-xs px-2 py-0.5 rounded-lg"
            >
              {formatRoleName(user?.role?.name || "N/A")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
