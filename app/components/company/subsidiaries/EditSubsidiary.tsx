"use client";

import { useEffect, useState } from "react";
import BackButton from "../../ui/reusables/BackButton";
import { subsidiariesService, Subsidiary } from "@/services/subsidiaries.service";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger } from "../../ui/select";
import { SelectValue as ShadcnSelectValue } from "@radix-ui/react-select";
import { Button } from "../../ui/button";
import { industriesService, Industry } from "@/services/industries.services";
import { useCompanyUsers, useInviteUser } from "@/services/hooks/company.hooks";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import { toast } from "react-toastify";
import { CircleX, UserPlus } from "lucide-react";

export default function EditSubsidiaryModal({
  subsidiary,
  onClose,
  onUpdate,
}: {
  subsidiary: Subsidiary;
  onClose: () => void;
  onUpdate?: (updated: Subsidiary) => void;
}) {
  const { user: currentUser } = useAuth();
  const companyId = currentUser?.company?.id;

  const [formData, setFormData] = useState<Subsidiary>(subsidiary);
  const [allIndustries, setAllIndustries] = useState<Industry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const { data: users = [] } = useCompanyUsers(companyId || 0);
  const { mutateAsync: _inviteUser, isPending: isInviting } = useInviteUser();

  const [isInvitingNew, setIsInvitingNew] = useState(false);
  const [inviteData, setInviteData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const industries = await industriesService.getIndustries();
        setAllIndustries(industries);
      } catch (err) {
        console.error(err);
        setError("Failed to load industries. Please try again later.");
      }
    };
    fetchIndustries();
  }, []);

  const handleChange = (field: keyof Subsidiary, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const finalPayload: any = {
        ...formData,
        industryId: formData.industry?.id,
      };

      if (isInvitingNew) {
        if (!inviteData.email || !inviteData.firstName) {
          toast.error("Please provide name and email for the new lead");
          setSaving(false);
          return;
        }

        // Pass invitation details directly to subsidiary update
        finalPayload.teamLead_email = inviteData.email;
        finalPayload.teamLead_name = `${inviteData.firstName} ${inviteData.lastName || ""}`.trim();
        // Clear any existing leadId/teamLeadId when inviting new
        finalPayload.leadId = undefined;
        finalPayload.teamLeadId = undefined;
      } else {
        const leadId = formData.teamLeadId || formData.leadId;
        finalPayload.teamLeadId = leadId;
        finalPayload.leadId = leadId;
      }

      const res = await subsidiariesService.editSubsidiaries(finalPayload);
      onUpdate?.(res as any);
      toast.success("Subsidiary updated successfully");
      onClose();
    } catch (err) {
      console.error("Failed to update subsidiary:", err);
      setError("Failed to update subsidiary. Please try again.");
      setSaving(false);
    }
  };

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.first_name || ""} ${u.last_name || ""} (${u.email})`.trim(),
  }));

  const sectors = Array.from(new Set(allIndustries.map((i) => i.sector)));
  const industriesInSelectedSector = allIndustries.filter(
    (i) => i.sector === formData.industry?.sector
  );

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-lg">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6 font-primary">Edit Subsidiary</h2>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <Label>Subsidiary Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Subsidiary Name"
            />
          </div>

          <div>
            <Label>Sector *</Label>
            <ShadcnSelect
              value={formData.industry?.sector || ""}
              onValueChange={(v) =>
                setFormData((prev) => {
                  const newIndustry = allIndustries.find((ind) => ind.sector === v);
                  return { ...prev, industry: newIndustry };
                })
              }
            >
              <SelectTrigger>
                <ShadcnSelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector || ""}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </ShadcnSelect>
          </div>

          <div>
            <Label>Industry *</Label>
            <ShadcnSelect
              value={formData.industry?.industry || ""}
              onValueChange={(v) =>
                setFormData((prev) => {
                  const selectedIndustry = allIndustries.find((ind) => ind.industry === v);
                  return { ...prev, industry: selectedIndustry };
                })
              }
            >
              <SelectTrigger>
                <ShadcnSelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industriesInSelectedSector.map((industry) => (
                  <SelectItem key={industry.id} value={industry.industry || ""}>
                    {industry.industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </ShadcnSelect>
          </div>

          <div>
            <Label>Address *</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <Label>Subsidiary Lead</Label>
              <button
                type="button"
                onClick={() => setIsInvitingNew(!isInvitingNew)}
                className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
              >
                {isInvitingNew ? (
                  "Select existing user"
                ) : (
                  <>
                    <UserPlus size={14} /> Invite new lead
                  </>
                )}
              </button>
            </div>

            {isInvitingNew ? (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">First Name *</Label>
                    <Input
                      value={inviteData.firstName}
                      onChange={(e) => setInviteData((p) => ({ ...p, firstName: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Last Name</Label>
                    <Input
                      value={inviteData.lastName}
                      onChange={(e) => setInviteData((p) => ({ ...p, lastName: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input
                    value={inviteData.email}
                    onChange={(e) => setInviteData((p) => ({ ...p, email: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ) : (
              <Select
                options={userOptions}
                value={userOptions.find(
                  (o) => o.value === (formData.teamLeadId || formData.leadId)
                )}
                onChange={(val) => {
                  setFormData((p) => ({
                    ...p,
                    teamLeadId: val?.value || undefined,
                    leadId: val?.value || undefined,
                  }));
                }}
                placeholder="Search and select lead..."
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#d1d5db",
                    "&:hover": { borderColor: "#10b981" },
                  }),
                }}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[var(--color-primary)] hover:bg-teal-600 text-white cursor-pointer"
            disabled={saving || isInviting}
          >
            {saving || isInviting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
