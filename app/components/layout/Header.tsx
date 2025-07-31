"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="flex justify-start lg:justify-end items-center p-2 bg-white rounded-xl shadow-sm w-full">
      <div className="flex items-center gap-3">
        <Image
          src="/image.png"
          alt="Admin Avatar"
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">Israel Oni</span>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
            Super Admin
          </span>
        </div>
      </div>
    </header>
  );
}
