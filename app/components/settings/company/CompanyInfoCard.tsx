import Image from "next/image";
import { Edit } from "lucide-react";
import { Company } from "@/context/AuthContext";
import InfoField from "./InfoField";

export default function CompanyInfoCard({
  company,
  onEdit,
}: {
  company: Company;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white p-6 mb-6 shadow rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Organization Information</h2>
        <button
          onClick={onEdit}
          className="cursor-pointer flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="flex items-start gap-4">
        <Image
          src={company.logo ?? "/image.png"}
          alt={company.name}
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 w-full">
          <InfoField label="Company Name" value={company.name} />
          <InfoField label="Industry Type" value={company.industry_type} />
          <InfoField label="Email Address" value={company.contact_email} />
          <InfoField
            label="Contact Phone Number"
            value={company.contact_phone ?? "N/A"}
          />
          <InfoField label="Website Address" value={company.website ?? "N/A"} />
          <InfoField
            label="Company Registration Number"
            value={company.registration_number}
          />
          <InfoField label="Staff Strength" value={company.staff ?? "N/A"} />
          <InfoField label="Company Address" value={company.address} />
        </div>
      </div>
    </div>
  );
}
