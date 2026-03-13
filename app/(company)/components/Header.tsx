"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { formatRoleName } from "@/lib/utils";
import { AutoBreadcrumb } from "@/app/components/ui/CustomBreadcrumb";
import NotificationDropdown from "./NotificationDropdown";
import { useMyTasks } from "@/services/hooks/assignTask.hooks";
import { useBreadcrumb } from "../reports-and-analytics/context/ReportBreadcrumbContext";
import { usePathname } from "next/navigation";

export default function Header({
  showSearchBar = true,
  customBreadcrumb,
}: {
  showSearchBar?: boolean;
  customBreadcrumb?: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const shouldFetch =
    (pathname?.startsWith("/assessments") || pathname?.startsWith("/tasks")) &&
    user?.role?.name !== "company_esg_admin";

  const { data: allTasks = [], isLoading } = useMyTasks({ enabled: shouldFetch });
  const { lastLabelOverride } = useBreadcrumb();

  const myTasks = allTasks.filter((task) => task.assignedUserIds?.includes(user?.id || 0));

  const avatarSrc =
    user?.profile_photo_url && user.profile_photo_url.trim() !== ""
      ? user.profile_photo_url
      : "/image.png";

  const isFallbackImage = !user?.profile_photo_url || user.profile_photo_url.trim() === "";

  return (
    <header className="w-full flex items-center justify-between mb-4">
      <div className="flex-1 max-w-xl">
        {showSearchBar &&
          (customBreadcrumb || <AutoBreadcrumb lastLabelOverride={lastLabelOverride} />)}
      </div>

      <div className="flex items-center gap-4">
        {!isLoading && <NotificationDropdown tasks={myTasks} />}

        <div className="flex items-center gap-2">
          <Image
            src={avatarSrc}
            alt={user?.first_name || "User"}
            width={36}
            height={36}
            className={`rounded-full object-cover ${
              isFallbackImage ? "opacity-50 blur-[1px]" : ""
            }`}
          />

          <div className="flex flex-col text-sm">
            <span className="text-gray-900 font-medium">
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </span>

            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-lg">
              {formatRoleName(user?.role?.name || "N/A")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
