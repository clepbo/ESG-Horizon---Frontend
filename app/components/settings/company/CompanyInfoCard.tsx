import Image from "next/image";
import { Edit } from "lucide-react";
import InfoField from "./InfoField";
import { Company, companyService } from "@/services/company.service";
import { useEffect, useState } from "react";

export default function CompanyInfoCard({
  company,
  onEdit,
}: {
  company: Company;
  onEdit: () => void;
}) {
  const [companyUsersCount, setCompanyUsersCount] = useState<number>(0);

  useEffect(() => {
    const fetchCompanyUsers = async () => {
      if (!company || !company.id) {
        return;
      }
      const company_users = await companyService.getUsers(company.id);
      setCompanyUsersCount(company_users.length);
    };
    fetchCompanyUsers();
  }, [company]);

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
        {/* <div className="relative w-12 h-12 rounded-full border border-gray-300 overflow-hidden">
                    <Image
                        src={company.company_logo_url ?? "/iconlogo.png"}
                        alt={company.name}
                        layout="fill"
                        objectFit="contain"
                        className={
                            company.company_logo_url
                                ? ""
                                : "opacity-50 blur-[2px]"
                        }
                    />
                </div> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 w-full">
          <InfoField label="Company Name" value={company.name} />
          <InfoField
            label="Industry Type"
            value={company.industry?.industry || ""}
          />
          <InfoField
            label="Email Address"
            value={company.contact_email ?? "N/A"}
          />
          <InfoField
            label="Contact Phone Number"
            value={company.contact_phone ?? "N/A"}
          />
          <InfoField label="Website Address" value={company.website ?? "N/A"} />
          <InfoField
            label="Company Registration Number"
            value={company.registration_number}
          />
          <InfoField label="Country" value={company.country ?? "n/a"} />
          <InfoField
            label="Platform Users Count"
            value={
              company.staff_strength || companyUsersCount.toString() || "n/a"
            }
          />
          <InfoField label="Company Address" value={company.address || ""} />
        </div>
      </div>
    </div>
  );
}
