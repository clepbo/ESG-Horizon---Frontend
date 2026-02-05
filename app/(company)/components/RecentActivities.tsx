"use client";
import React from "react";
import { useState } from "react";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FolderDown,
  FileCheck,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Dialog from "@/app/components/ui/dialog";

interface ActivityIconProps {
  color: string;
  Icon: React.ElementType;
}

const ActivityIcon = ({ color, Icon }: ActivityIconProps) => (
  <div
    className={clsx(
      "w-8 h-8 rounded-full flex items-center justify-center p-1",
      color.split(" ")[0]
    )}
  >
    <Icon className={clsx("w-4 h-4", color.split(" ")[1])} />
  </div>
);

interface Activity {
  id: string | number;
  title: string;
  description?: string;
  date?: string;
  type?: string;
  status?: string;
  iconSrc?: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

export default function RecentActivities({ activities = [] }: RecentActivitiesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const previewCount = 5;
  const pageSize = 5;
  const totalPages = Math.ceil(activities.length / pageSize);
  const paginated = activities.slice((page - 1) * pageSize, page * pageSize);

  const badgeMap: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    success: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    upgrade: "bg-blue-100 text-blue-700",
    expired: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    updated: "bg-amber-100 text-amber-700",
    submitted: "bg-blue-100 text-blue-700",
  };

  const iconMap: Record<string, { Icon: React.ElementType; color: string }> = {
    published: { Icon: CheckCircle, color: "bg-emerald-100 text-emerald-700" },
    success: { Icon: CheckCircle, color: "bg-emerald-100 text-emerald-700" },
    failed: { Icon: XCircle, color: "bg-red-100 text-red-700" },
    upgrade: { Icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
    expired: { Icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
    cancelled: { Icon: XCircle, color: "bg-red-100 text-red-700" },
    updated: { Icon: FolderDown, color: "bg-amber-100 text-amber-700" },
    submitted: { Icon: FileCheck, color: "bg-blue-100 text-blue-700" },
  };

  const DefaultIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <FileText className="w-4 h-4 text-gray-500" />
    </div>
  );

  const ActivityList = ({ items }: { items: Activity[] }) => (
    <ul className="pr-1 min-w-0">
      {items.map((activity, i) => {
        const statusKey = activity.status || activity.type || "";
        const mappedIcon = iconMap[statusKey];

        return (
          <li
            key={activity.id ?? i}
            className={clsx(
              "flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 gap-2 sm:gap-3 lg:gap-6 transition-colors",
              "hover:bg-gray-50 border-b border-t border-gray-100 hover:border-gray-100"
            )}
          >
            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                {mappedIcon ? (
                  <ActivityIcon Icon={mappedIcon.Icon} color={mappedIcon.color} />
                ) : (
                  <DefaultIcon />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate sm:line-clamp-2">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2 sm:line-clamp-1 mt-0.5">
                  {activity.description || "No description available."}
                </p>
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:text-right flex-shrink-0 pl-10 sm:pl-0">
              <span className="text-xs text-gray-400">
                {activity.date ? new Date(activity.date).toLocaleDateString() : ""}
              </span>
              <span
                className={clsx(
                  "px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap",
                  badgeMap[activity.status || ""] || "bg-gray-100 text-gray-600"
                )}
              >
                {activity.status
                  ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1)
                  : "Activity"}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="h-full flex flex-col min-h-0 min-w-0">
      <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2 px-1 sm:px-2 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate min-w-0">
            Recent Activities
          </h2>
          {activities.length > previewCount && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-[var(--color-primary)] flex-shrink-0"
              onClick={() => setDialogOpen(true)}
            >
              View all
            </Button>
          )}
        </div>
        {activities.length > 0 ? (
          <div className="min-w-0 overflow-hidden">
            <ActivityList items={activities.slice(0, previewCount)} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 sm:py-16 text-center text-gray-500 px-2">
            <div className="p-3 sm:p-4 rounded-full bg-gray-100 mb-2 sm:mb-3">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700 text-sm sm:text-base">
              No recent activities yet
            </p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs mt-1">
              Your latest actions — like logins, approvals, or submissions — will appear here.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="All Recent Activities"
        className="max-w-[min(100vw-2rem,42rem)]"
      >
        <div className="space-y-3 min-w-0">
          <ActivityList items={paginated} />

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
