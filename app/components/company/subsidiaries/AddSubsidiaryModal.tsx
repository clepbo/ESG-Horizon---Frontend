"use client";

import { useState } from "react";
import { CircleX } from "lucide-react";
import {
  subsidiariesService,
  Subsidiary,
} from "@/services/subsidiaries.service";
import { toast } from "react-toastify";

export default function AddSubsidiaryModal({
  onClose,
  onAddSubsidiary,
}: {
  onClose: () => void;
  onAddSubsidiary: (sub: Subsidiary) => void;
}) {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      id: Date.now(),
      name,
      sector,
      industry,
      address,
      status: "active",
    };
    const res = subsidiariesService.createSubsidiaries(data);
    onAddSubsidiary(data);
    toast.success(`Subsidiary "${name}" added successfully`);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="relative w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto max-w-lg">
        <div className="flex justify-end mb-6">
          {/* <BackButton /> */}
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 transition cursor-pointer"
          >
            <CircleX size={24} />
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Add Subsidiary</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Subsidiary Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subsidiary Name"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Sector</label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="e.g. Extractives"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Oil & Gas"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {/* Address */}
          <div>
            <label className="block mb-1 text-sm font-medium">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main Street, Lagos"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 cursor-pointer"
            >
              Add Subsidiary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
