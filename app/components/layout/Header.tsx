"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  const avatarSrc =
    user?.profile_photo_url && user.profile_photo_url.trim() !== ""
      ? user.profile_photo_url
      : "/image.png";

  return (
    <header className="flex justify-start lg:justify-end items-center p-2 bg-white rounded-xl shadow-sm w-full">
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt={`${user?.first_name || "N/A"}`}
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">
            {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
          </span>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
            {user?.role?.name || "N/A"}
          </span>
        </div>
      </div>
    </header>
  );
}
