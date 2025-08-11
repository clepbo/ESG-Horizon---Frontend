"use client";

import { useState } from "react";
import { CircleX } from "lucide-react";
import BackButton from "../BackButton";

export type Department = {
  id: string;
  name: string;
  description: string;
  lead: string;
  email: string;
};

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
  const [formData, setFormData] = useState<Department>(department);

  const handleChange = (field: keyof Department, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    onUpdate?.(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-lg">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Edit Department
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <InputField
            label="Department Name *"
            value={formData.name}
            onChange={(v) => handleChange("name", v)}
          />
          <InputField
            label="Description"
            value={formData.description}
            onChange={(v) => handleChange("description", v)}
          />
          <InputField
            label="Department Lead *"
            value={formData.lead}
            onChange={(v) => handleChange("lead", v)}
          />
          <InputField
            label="Email *"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onDeactivate?.(department.id)}
            className="flex-1 bg-yellow-400 text-white py-2 rounded-md text-sm font-medium hover:bg-yellow-500"
          >
            Deactivate
          </button>
          <button
            onClick={() => onDelete?.(department.id)}
            className="flex-1 bg-red-500 text-white py-2 rounded-md text-sm font-medium hover:bg-red-600"
          >
            Delete
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600 cursor-pointer"
          >
            Update
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
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
