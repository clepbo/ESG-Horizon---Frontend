"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { formatRoleName } from "@/lib/utils";

export default function Header() {
  const { user } = useAuth();

  const avatarSrc =
    user?.profile_photo_url && user.profile_photo_url.trim() !== ""
      ? user.profile_photo_url
      : "/image.png";

  const isFallbackImage = !user?.profile_photo_url || user.profile_photo_url.trim() === "";

  return (
    <header className="flex justify-start lg:justify-end items-center p-2 bg-white rounded-xl shadow-sm w-full">
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt={`${user?.first_name || "N/A"}`}
          width={36}
          height={36}
          className={`rounded-full object-cover ${isFallbackImage ? "opacity-50 blur-[1px]" : ""}`}
        />
        <div className="flex flex-col justify-center items-start text-sm">
          <span className="text-gray-900 font-medium ">
            {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
          </span>
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-lg">
            {formatRoleName(user?.role?.name || "N/A")}
          </span>
        </div>
      </div>
    </header>
  );
}
