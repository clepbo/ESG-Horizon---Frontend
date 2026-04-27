"use client";
import { useState, useEffect } from "react";
import { CircleX, Info } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import PhotoUploadButton from "./PhotoUploadButton";
import BackButton from "../../ui/reusables/BackButton";
import { User } from "@/services/user.service";
import { companyService } from "@/services/company.service";
import { departmentService, Department } from "@/services/department.service";
import { subsidiariesService, Subsidiary } from "@/services/subsidiaries.service";
import { toast } from "react-toastify";
import { formatRoleName } from "@/lib/utils";
import { useRoles } from "@/lib/roles";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || "");
  const [roleName, setRoleName] = useState(user.role?.name || "");
  const [userImage, setUserImage] = useState<string | null>(null);

  // New state for subsidiary and department
  const [subsidiaryId, setSubsidiaryId] = useState<number | undefined>(user.subsidiaryId);
  const [departmentId, setDepartmentId] = useState<number | undefined>(user.departmentId);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const { isCompanyAdmin } = useRoles();

  // Format the role name for display
  const displayRoleName = roleName ? formatRoleName(roleName) : "";

  // Fetch subsidiaries and departments on mount (only if Company Admin)
  useEffect(() => {
    if (!isCompanyAdmin) return;

    async function loadData() {
      setLoadingData(true);
      try {
        const yourCompany = await companyService.getDetails();
        if (!yourCompany) {
          console.error("No company details found");
          return;
        }

        // Fetch subsidiaries using the correct service
        const subsData = await subsidiariesService.getCompanySubsidiaries();
        setSubsidiaries(Array.isArray(subsData) ? subsData : []);

        // Fetch departments
        const deptsData = await departmentService.getAll(yourCompany.id);
        setDepartments(Array.isArray(deptsData) ? deptsData : []);
      } catch (error) {
        console.error("Failed to load subsidiaries/departments:", error);
        toast.error("Failed to load subsidiary and department data");
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [isCompanyAdmin]);

  useEffect(() => {
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setEmail(user.email || "");
    setPhoneNumber(user.phone_number || "");
    setRoleName(user.role?.name || "");
    setSubsidiaryId(user.subsidiaryId);
    setDepartmentId(user.departmentId);
    setUserImage(null);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser: User = {
        ...user,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        role: { ...user.role, name: roleName },
        profile_photo_url: userImage || user.profile_photo_url,
        subsidiaryId: subsidiaryId || user.subsidiaryId,
        departmentId: departmentId || user.departmentId,
      };

      const savedUser = await companyService.editUser(updatedUser.id, updatedUser);
      toast.success("User updated successfully");
      onSave(savedUser);
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto z-60">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-5xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

        {/* Avatar + Upload */}
        <div className="flex items-center gap-4 mb-8 relative w-max">
          <Image
            src={userImage || user.profile_photo_url || "/images/image.png"}
            alt="User Avatar"
            width={72}
            height={72}
            className="rounded-full object-cover border border-gray-200"
            unoptimized
          />
          <PhotoUploadButton
            onUpload={(file) => {
              const imageUrl = URL.createObjectURL(file);
              setUserImage(imageUrl);
            }}
          />
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="First Name" value={firstName} onChange={setFirstName} required />
          <InputField label="Last Name" value={lastName} onChange={setLastName} required />
          <InputField label="Email" value={email} onChange={setEmail} required />
          <InputField label="Phone Number" value={phoneNumber} onChange={setPhoneNumber} required />

          {/* Subsidiary Dropdown - Only for Company Admin */}
          {isCompanyAdmin ? (
            <SelectField
              label="Subsidiary"
              value={subsidiaryId?.toString() || ""}
              onChange={(value) => setSubsidiaryId(value ? Number(value) : undefined)}
              options={subsidiaries.map((sub) => ({ label: sub.name, value: sub.id.toString() }))}
              placeholder="Select Subsidiary"
              loading={loadingData}
            />
          ) : (
            <InputField
              label="Subsidiary"
              value={user.subsidiary?.name || "N/A"}
              onChange={() => {}}
              disabled
              info="Only Company Admins can edit this field"
            />
          )}

          {/* Department Dropdown - Only for Company Admin */}
          {isCompanyAdmin ? (
            <SelectField
              label="Department"
              value={departmentId?.toString() || ""}
              onChange={(value) => setDepartmentId(value ? Number(value) : undefined)}
              options={departments.map((dept) => ({ label: dept.name, value: dept.id.toString() }))}
              placeholder="Select Department"
              loading={loadingData}
            />
          ) : (
            <InputField
              label="Department"
              value={user.department?.name || "N/A"}
              onChange={() => {}}
              disabled
              info="Only Company Admins can edit this field"
            />
          )}

          <InputField
            label="Role"
            value={displayRoleName}
            onChange={() => {}}
            required
            disabled
            info="Role cannot be edited from here"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="border border-green-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-teal-600 text-white px-6 py-2 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  info,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  info?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center text-sm font-medium text-gray-800 mb-1">
          <span>{label}</span>
          {info ? (
            <div className="group relative ml-1 cursor-pointer">
              <Info className="w-4 h-4 text-gray-500" />
              <div className="absolute left-5 top-1 z-10 hidden w-max rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                {info}
              </div>
            </div>
          ) : required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : null}
        </label>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={clsx(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition",
          "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green",
          "hover:shadow-sm",
          disabled && "bg-gray-100 cursor-not-allowed text-gray-600"
        )}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  info,
  loading = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  info?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center text-sm font-medium text-gray-800 mb-1">
          <span>{label}</span>
          {info ? (
            <div className="group relative ml-1 cursor-pointer">
              <Info className="w-4 h-4 text-gray-500" />
              <div className="absolute left-5 top-1 z-10 hidden w-max rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                {info}
              </div>
            </div>
          ) : required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : null}
        </label>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className={clsx(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition",
          "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green",
          "hover:shadow-sm cursor-pointer",
          loading && "bg-gray-100 cursor-not-allowed"
        )}
      >
        <option value="">{loading ? "Loading..." : placeholder || "Select an option"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
