" use client";

import { useState } from "react";
import { CircleX } from "lucide-react";

export default function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Sustainability Officer");
  const [role, setRole] = useState("Admin");

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-mdbackdrop-blur-sm flex justify-center items-center px-4">
      {/* Modal Card */}
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
        >
          <CircleX size={28} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-6 text-center">Invite User</h2>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example.email@company.com"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Department *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            >
              <option value="Sustainability Officer">
                Sustainability Officer
              </option>
              <option value="HR">HR</option>
              <option value="Engineering">Engineering</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
