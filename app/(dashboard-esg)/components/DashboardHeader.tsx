import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/app/(dashboard-esg)/components/ui/input";
import { Button } from "@/app/(dashboard-esg)/components/ui/button";
import { SidebarTrigger } from "@/app/(dashboard-esg)/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/(dashboard-esg)/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between font-poppins">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-80 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-background border-border"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-esg-red rounded-full"></span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/api/placeholder/32/32" />
            <AvatarFallback className="bg-esg-green text-white text-sm">
              IO
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Israel Oni</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
