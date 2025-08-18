"use client";

import { Download } from "lucide-react";

export default function ExportAllButton() {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
      >
        <Download size={16} />
        Export
      </button>
    </div>
  );
}
