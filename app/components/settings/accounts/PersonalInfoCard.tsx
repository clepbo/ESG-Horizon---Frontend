"use client";

import { User } from "@/services/user.service";
import InfoField from "./InfoField";
import { formatRoleName } from "@/lib/utils";

interface PersonalInfoCardProps {
  user: User;
}

export default function PersonalInfoCard({ user }: PersonalInfoCardProps) {
  const infoFields = [
    { label: "First Name", value: user.first_name },
    { label: "Last Name", value: user.last_name },
    { label: "Email Address", value: user.email },
    { label: "Phone Number", value: user.phone_number },
    { label: "Role", value: formatRoleName(user.role?.name || "") },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
        {infoFields.map((field) => (
          <InfoField
            key={field.label}
            label={field.label}
            value={field.value ?? "N/A"}
          />
        ))}
      </div>
    </div>
  );
}
