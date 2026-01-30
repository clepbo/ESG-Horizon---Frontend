"use client";

import { useState } from "react";
import { CircleX, UserPlus } from "lucide-react";
import BackButton from "../reusables/BackButton";
import { Department } from "@/services/department.service";
import { useCompanyUsers, useInviteUser } from "@/services/hooks/company.hooks";
import { useCompanySubsidiaries } from "@/services/hooks/subsidiaries.hooks";
import { useUpdateDepartment } from "@/services/hooks/department.hooks";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import { toast } from "react-toastify";

export default function EditDepartmentModal({
  department,
  onClose,
  onUpdate,
  onDeactivate,
  onDelete,
}: {
  department: Department;
  onClose: () => void;
  onUpdate?: (updatedDept: Department) => void;
  onDeactivate?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { user: currentUser } = useAuth();
  const companyId = currentUser?.company?.id;

  const { data: users = [] } = useCompanyUsers(companyId || 0);
  const { data: subsidiaries = [] } = useCompanySubsidiaries();
  const { mutateAsync: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const { mutateAsync: _inviteUser, isPending: isInviting } = useInviteUser();

  const [formData, setFormData] = useState({
    name: department.name,
    description: department.description || "",
    leadId: department.leadId,
    contact_email: department.contact_email || department.lead?.email || "",
    subsidiaryId: department.subsidiaryId,
  });

  const [isInvitingNew, setIsInvitingNew] = useState(false);
  const [inviteData, setInviteData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.first_name || ""} ${u.last_name || ""} (${u.email})`.trim(),
    email: u.email,
  }));

  const subsidiaryOptions = [
    { value: null, label: "Main (HQ)" },
    ...subsidiaries.map((s) => ({
      value: s.id,
      label: s.name,
    })),
  ];

  const handleUpdate = async () => {
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        contact_email: formData.contact_email,
        subsidiaryId: formData.subsidiaryId || undefined,
      };

      if (isInvitingNew) {
        if (!inviteData.email || !inviteData.firstName) {
          toast.error("Please provide name and email for the new lead");
          return;
        }
        payload.leadEmail = inviteData.email;
        payload.leadName = `${inviteData.firstName} ${inviteData.lastName || ""}`.trim();
        payload.leadId = undefined;
        payload.contact_email = inviteData.email;
      } else {
        payload.leadId = formData.leadId;
      }

      const res = await updateDepartment({
        id: department.id,
        payload,
      });

      toast.success("Department updated successfully");
      onUpdate?.(res as any);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update department");
    }
  };

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

        <h2 className="text-xl font-semibold text-gray-900 mb-6 font-primary">Edit Department</h2>

        <div className="space-y-4">
          <InputField
            label="Department Name *"
            value={formData.name}
            onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
          />
          <InputField
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
          />

          <div>
            <label className="text-sm font-medium text-gray-800 mb-1 block">Subsidiary</label>
            <Select
              options={subsidiaryOptions}
              value={subsidiaryOptions.find((o) => o.value === (formData.subsidiaryId || null))}
              onChange={(val) =>
                setFormData((p) => ({ ...p, subsidiaryId: val?.value || undefined }))
              }
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#10b981" },
                }),
              }}
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-800">Department Lead *</label>
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
                  <InputField
                    label="First Name *"
                    value={inviteData.firstName}
                    onChange={(v) => setInviteData((p) => ({ ...p, firstName: v }))}
                  />
                  <InputField
                    label="Last Name"
                    value={inviteData.lastName}
                    onChange={(v) => setInviteData((p) => ({ ...p, lastName: v }))}
                  />
                </div>
                <InputField
                  label="Email *"
                  value={inviteData.email}
                  onChange={(v) => setInviteData((p) => ({ ...p, email: v }))}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  options={userOptions}
                  value={userOptions.find((o) => o.value === formData.leadId)}
                  onChange={(val) => {
                    setFormData((p) => ({
                      ...p,
                      leadId: val?.value || undefined,
                      contact_email: val?.email || p.contact_email,
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
                <InputField
                  label="Contact Email *"
                  value={formData.contact_email}
                  onChange={(v) => setFormData((p) => ({ ...p, contact_email: v }))}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating || isInviting}
            className="px-6 py-2 rounded-md text-sm bg-[var(--color-primary)] hover:bg-teal-600 text-white transition disabled:opacity-50 cursor-pointer"
          >
            {isUpdating || isInviting ? "Updating..." : "Update"}
          </button>
        </div>

        <div className="mt-8 space-y-4 pt-6 border-t border-gray-300">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <button
                onClick={() => onDeactivate?.(`${department.id}`)}
                className="w-full bg-yellow-400 text-white py-2 rounded-md text-sm font-medium hover:bg-yellow-500 transition"
              >
                Deactivate
              </button>
              <p className="text-[10px] text-gray-500 mt-1">Temporarily disable this department.</p>
            </div>
            <div className="flex-1">
              <button
                onClick={() => onDelete?.(`${department.id}`)}
                className="w-full bg-red-500 text-white py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
              >
                Delete
              </button>
              <p className="text-[10px] text-gray-500 mt-1">
                Permanently remove department. <strong>Irreversible</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
      />
    </div>
  );
}
