// "use client";
// import React from "react";
// import { useState } from "react";
// import clsx from "clsx";
// import {
//   ChevronLeft,
//   ChevronRight,
//   DollarSign,
//   CreditCard,
//   ArrowUp,
//   X,
//   FileText,
//   AlertTriangle,
// } from "lucide-react";
// import { Button } from "@/app/components/ui/button";
// import Dialog from "@/app/components/ui/dialog";
// import { JSX } from "react";

// interface Activity {
//   id: string | number;
//   title: string;
//   description?: string;
//   date?: string;
//   type?: string;
//   status?: string;
// }

// interface RecentActivitiesProps {
//   activities?: Activity[];
// }
// // Custom Icon Components to match the image style (rounded background)
// /**
//  * Creates a rounded div with a specific background and text color
//  * @param {string} bgColor Tailwind background class
//  * @param {string} iconColor Tailwind text/icon class
//  * @param {JSX.Element} IconComponent Lucide icon to display
//  * @returns {JSX.Element}
//  */
// const ActivityIcon = ({
//   bgColor,
//   iconColor,
//   IconComponent,
// }: {
//   bgColor: string;
//   iconColor: string;
//   IconComponent: JSX.Element;
// }) => (
//   <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center", bgColor)}>
//     {React.cloneElement(IconComponent, { className: clsx("w-4 h-4", iconColor) })}
//   </div>
// );

// export default function RecentActivities({ activities = [] }: RecentActivitiesProps) {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [page, setPage] = useState(1);

//   const previewCount = 5; // Show 5 in dashboard preview
//   const pageSize = 5; // 5 per page in dialog
//   const totalPages = Math.ceil(activities.length / pageSize);
//   const paginated = activities.slice((page - 1) * pageSize, page * pageSize);

//   const badgeMap: Record<string, string> = {
//     published: "bg-emerald-100 text-emerald-700",
//     success: "bg-emerald-100 text-emerald-700",
//     failed: "bg-red-100 text-red-700",
//     upgrade: "bg-blue-100 text-blue-700",
//     expired: "bg-amber-100 text-amber-700",
//     cancelled: "bg-red-100 text-red-700",
//   };

//   const iconMap: Record<string, JSX.Element> = {
//     published: (
//       <ActivityIcon
//         bgColor="bg-emerald-100"
//         iconColor="text-emerald-500"
//         IconComponent={<DollarSign />}
//       />
//     ),
//     success: (
//       <ActivityIcon
//         bgColor="bg-emerald-100"
//         iconColor="text-emerald-500"
//         IconComponent={<DollarSign />}
//       />
//     ),

//     failed: (
//       <ActivityIcon bgColor="bg-red-100" iconColor="text-red-500" IconComponent={<CreditCard />} />
//     ),

//     upgrade: (
//       <ActivityIcon bgColor="bg-blue-100" iconColor="text-blue-500" IconComponent={<ArrowUp />} />
//     ),

//     expired: (
//       <ActivityIcon
//         bgColor="bg-amber-100"
//         iconColor="text-amber-500"
//         IconComponent={<AlertTriangle />}
//       />
//     ),

//     cancelled: <ActivityIcon bgColor="bg-red-100" iconColor="text-red-500" IconComponent={<X />} />,
//   };

//   const DefaultIcon = () => (
//     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
//       <FileText className="w-4 h-4 text-gray-500" />
//     </div>
//   );

//   const ActivityList = ({ items }: { items: Activity[] }) => (
//     <ul className=" pr-1">
//       {items.map((activity, i) => (
//         <li
//           key={activity.id ?? i}
//           className={clsx(
//             "flex items-center justify-between p-3 rounded-lg transition-colors",
//             "hover:bg-gray-50 border border-transparent hover:border-gray-100"
//           )}
//         >
//           <div className="flex items-start gap-3">
//             <div className="">
//               {iconMap[activity.status || activity.type || ""] ?? <DefaultIcon />}
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-900">{activity.title}</p>
//               <p className="text-xs text-gray-500">
//                 {activity.description || "No description available."}
//               </p>
//             </div>
//           </div>
//           <div className="flex flex-col items-end gap-1 text-right">
//             <span className="text-xs text-gray-400">
//               {activity.date ? new Date(activity.date).toLocaleDateString() : ""}
//             </span>
//             <span
//               className={clsx(
//                 "px-2 py-0.5 text-xs font-medium rounded-full",
//                 badgeMap[activity.status || ""] || "bg-gray-100 text-gray-600"
//               )}
//             >
//               {activity.status
//                 ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1)
//                 : "Activity"}
//             </span>
//           </div>
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <div className="h-full flex flex-col">
//       {/* Preview card */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
//         <div className="flex items-center justify-between mb-2">
//           <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
//           {activities.length > previewCount && (
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-sm text-[var(--color-primary)]"
//               onClick={() => setDialogOpen(true)}
//             >
//               View all
//             </Button>
//           )}
//         </div>
//         {activities.length > 0 ? (
//           <ActivityList items={activities.slice(0, previewCount)} />
//         ) : (
//           <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
//             {/* Updated the icon for the "No recent activities yet" state to match the style */}
//             <div className="p-4 rounded-full bg-gray-100 mb-3">
//               <FileText className="w-10 h-10 text-gray-400" />
//             </div>
//             <p className="font-medium text-gray-700">No recent activities yet</p>
//             <p className="text-sm text-gray-500 max-w-xs mt-1">
//               Your latest actions — like logins, approvals, or submissions — will appear here.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Dialog */}
//       <Dialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         title="All Recent Activities"
//         className="max-w-2xl"
//       >
//         <div className="space-y-3">
//           <ActivityList items={paginated} />

//           {totalPages > 1 && (
//             <div className="flex justify-center items-center mt-4 gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                 disabled={page === 1}
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </Button>
//               <span className="text-sm text-gray-600">
//                 Page {page} of {totalPages}
//               </span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={page === totalPages}
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </Button>
//             </div>
//           )}
//         </div>
//       </Dialog>
//     </div>
//   );
// }
"use client";
import React from "react";
import { useState } from "react";
import clsx from "clsx";
import Image from "next/image"; // <--- Ensure Image is imported
import {
  ChevronLeft,
  ChevronRight,
  FileText, // Kept for Default/Empty state
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Dialog from "@/app/components/ui/dialog";
import { JSX } from "react";

// 2. Updated Interface
interface Activity {
  id: string | number;
  title: string;
  description?: string;
  date?: string;
  type?: string;
  status?: string;
  iconSrc?: string; // Kept, in case you pass a custom path
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

// New component to handle rendering the image icon, replacing ActivityIcon
const ActivityImage = ({ src, alt }: { src: string; alt: string }) => (
  // Styling matches the rounded container from the ESG card and reference image
  <div
    className={clsx(
      "w-8 h-8 rounded-full flex items-center justify-center overflow-hidden p-1 bg-white" // Use a white/transparent background if the image has the color circle
    )}
  >
    <Image
      src={src}
      alt={alt}
      width={32}
      height={32}
      className="object-contain w-5 h-5" // Size the image within the container
    />
  </div>
);

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
    updated: "bg-blue-100 text-blue-700",
    submitted: "bg-gold-100 text-gold-500",
  };

  // 3. Status to Image Path Map (assuming /public/icons/ structure)
  const iconSrcMap: Record<string, string> = {
    // You must create these files in /public/icons/
    published: "/icons/subscription-activated.svg", // Green Check/Dollar icon
    success: "/icons/subscription-activated.svg",
    failed: "/icons/payment-failed.svg", // Red alert circle
    upgrade: "/icons/subscription-upgrade.svg", // Blue box/arrow icon
    expired: "/icons/trial-expired.svg", // Yellow alert circle
    cancelled: "/icons/subscription-cancelled.svg", // Red X circle
    updated: "/icons/profile-updated.svg", // Blue user/edit icon
  };

  // 4. Default Icon for activities without a mapped/provided icon
  const DefaultIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <FileText className="w-4 h-4 text-gray-500" />
    </div>
  );

  const ActivityList = ({ items }: { items: Activity[] }) => (
    <ul className=" pr-1">
      {items.map((activity, i) => (
        <li
          key={activity.id ?? i}
          className={clsx(
            "flex items-center justify-between p-3 rounded-lg transition-colors",
            "hover:bg-gray-50 border border-transparent hover:border-gray-100"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="">
              {/* 5. Icon rendering logic using the image map */}
              {iconSrcMap[activity.status || activity.type || ""] ? (
                <ActivityImage
                  src={iconSrcMap[activity.status || activity.type || ""]}
                  alt={activity.title}
                />
              ) : activity.iconSrc ? (
                // Fallback for custom iconSrc passed directly
                <ActivityImage src={activity.iconSrc} alt={activity.title} />
              ) : (
                <DefaultIcon />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500">
                {activity.description || "No description available."}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs text-gray-400">
              {activity.date ? new Date(activity.date).toLocaleDateString() : ""}
            </span>
            <span
              className={clsx(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                badgeMap[activity.status || ""] || "bg-gray-100 text-gray-600"
              )}
            >
              {activity.status
                ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1)
                : "Activity"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Preview card */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex-1">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          {activities.length > previewCount && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-[var(--color-primary)]"
              onClick={() => setDialogOpen(true)}
            >
              View all
            </Button>
          )}
        </div>
        {activities.length > 0 ? (
          <ActivityList items={activities.slice(0, previewCount)} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <div className="p-4 rounded-full bg-gray-100 mb-3">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No recent activities yet</p>
            <p className="text-sm text-gray-500 max-w-xs mt-1">
              Your latest actions — like logins, approvals, or submissions — will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Dialog (No change) */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="All Recent Activities"
        className="max-w-2xl"
      >
        <div className="space-y-3">
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
