import React from "react";
import { HiUserGroup } from "react-icons/hi";

export default function SocialCapital() {
  return (
    <div className="flex flex-col gap-4 lg:gap-20">
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100">
            <HiUserGroup className="text-blue-600 rounded-md" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-sm"> Social Capital </h6>
            <p className="text-xs text-gray-600">
              {" "}
              Security, Human Rights, and Community Relations{" "}
            </p>
          </div>
        </div>
        <span className="">
          <h6 className="py-2 "> Security, Human Rights & Indegenious Peoples </h6>
          <hr className="text-gray-200" />
        </span>
      </div>
    </div>
  );
}
