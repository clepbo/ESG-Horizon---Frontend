import { Edit } from "lucide-react";
import { Subsidiary } from "@/services/subsidiaries.service";
import InfoField from "../../settings/company/InfoField";
import { useState } from "react";
import EditSubsidiaryModal from "./EditSubsidiary";

interface MainContentCardProps {
  subsidiary: Subsidiary;
  teamMemberCount: number;
  onEdit?: (subsidiary: Subsidiary) => void;
}

const MainContentCard = ({ subsidiary, teamMemberCount, onEdit }: MainContentCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<Subsidiary | null>(null);
  const handleEditClick = (subsidiary: Subsidiary) => {
    setSelectedSubsidiary(subsidiary);
    setIsEditOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">{subsidiary.name}</h1>
        <button
          onClick={() => handleEditClick(subsidiary)}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        <InfoField label="Subsidiary Name" value={subsidiary.name} />
        <InfoField label="Industry" value={subsidiary.industry?.name || "N/A"} />
        <InfoField
          label="Subsidiary Lead"
          value={
            subsidiary.teamLead?.first_name
              ? `${subsidiary.teamLead.first_name} ${subsidiary.teamLead.last_name} (${subsidiary.teamLead.email || ""})`
              : subsidiary.teamLead?.email || "N/A"
          }
        />
        <InfoField label="Address" value={subsidiary.address || "N/A"} />
        <InfoField label="Team Member" value={teamMemberCount.toString()} />
        <div>
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              subsidiary.status === "active"
                ? "bg-green-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {subsidiary.status}
          </span>
        </div>
      </div>
      {/* edit modal */}
      {isEditOpen && selectedSubsidiary && (
        <EditSubsidiaryModal
          subsidiary={selectedSubsidiary}
          onClose={() => setIsEditOpen(false)}
          onUpdate={(updated) => {
            onEdit?.(updated);
            setIsEditOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default MainContentCard;
