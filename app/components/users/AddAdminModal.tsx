"use client";

import { CircleX } from "lucide-react";
import BackButton from "../BackButton";

export default function AddAdminModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Invite User
        </h2>

        <form className="space-y-6">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-800">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="example.email@teasooconsulting.com"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-esg-green"
            />

            <label className="text-sm font-medium text-gray-800">
              Department <span className="text-red-500">*</span>
            </label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
              <option>Sustainability Officer</option>
            </select>

            <label className="text-sm font-medium text-gray-800">
              Role <span className="text-red-500">*</span>
            </label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
              <option>Admin</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-green-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
