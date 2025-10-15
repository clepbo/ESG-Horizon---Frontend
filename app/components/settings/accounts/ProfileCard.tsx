"use client";

import Image from "next/image";
import { Edit } from "lucide-react";
import { User } from "@/services/user.service";
import { formatRoleName } from "@/lib/utils";

interface ProfileCardProps {
  user: User;
  onEdit: () => void;
}

export default function ProfileCard({ user, onEdit }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={user.profile_photo_url || "/image.png"}
          alt={`${user.first_name} ${user.last_name}`}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold">
            {user.first_name} {user.last_name}
          </h2>
          <span className="text-sm bg-blue-500 text-white px-3 py-0.5 rounded-full">
            {formatRoleName(user?.role?.name || "N/A")}
          </span>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 cursor-pointer"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
    </div>
  );
}
