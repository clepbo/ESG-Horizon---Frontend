"use client";

import UserAvatar from "@/app/components/UserAvatar";

export default function Header() {
  return (
    <header className="flex items-center p-2 bg-white rounded shadow-sm">
      <div className="ml-auto flex items-center gap-1.5">
        <UserAvatar src="/image.png" alt="Admin" />
        <div className="leading-none flex gap-1">
          <h2 className="font-semibold text-sm text-gray-800">Israel Oni</h2>
          <span className="text-xs text-white bg-info-600 border  px-2 py-0.5 rounded-xl">
            Super Admin
          </span>
        </div>
      </div>
    </header>
  );
}
