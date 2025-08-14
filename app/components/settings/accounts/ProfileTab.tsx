"use client";

import { User } from "@/context/AuthContext";
import ProfileCard from "./ProfileCard";
import PersonalInfoCard from "./PersonalInfoCard";

interface ProfileTabProps {
  user: User;
  onEdit: () => void;
}

export default function ProfileTab({ user, onEdit }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <ProfileCard user={user} onEdit={onEdit} />
        <PersonalInfoCard user={user} />
      </div>
    </div>
  );
}
