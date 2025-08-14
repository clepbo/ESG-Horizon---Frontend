import Sidebar from "@/app/components/layout/Sidebar";
import LayoutContent from "../(dashboard-esg)/components/LayoutContent";
import { USER_TYPES } from "../constants/userTypes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-grey-50">
      <Sidebar />
      <LayoutContent role={USER_TYPES.SUPER_ADMIN}>{children}</LayoutContent>
    </div>
  );
}
