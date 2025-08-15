"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import Image from "next/image";
import SearchInput from "@/app/components/ui/reusables/SearchInput";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const avatarSrc =
    user?.profile_photo_url && user.profile_photo_url.trim() !== ""
      ? user.profile_photo_url
      : "/image.png";
  console.log(user);

  return (
    <header className="w-full flex items-center justify-between mb-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notifications & User Info */}
      <div className="flex items-center gap-4">
        <Bell
          className="text-gray-600 hover:text-black cursor-pointer"
          size={20}
        />

        <div className="flex items-center gap-2">
          <Image
            src={avatarSrc}
            alt={`${user?.first_name || "N/A"}`}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col justify-center items-center text-sm">
            <span className="text-gray-900 font-medium ">
              {" "}
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </span>
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-lg">
              {user?.role?.name || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
