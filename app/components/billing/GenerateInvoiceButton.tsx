"use client";

import { FilePlus2 } from "lucide-react";

export default function GenerateInvoiceButton() {
  return (
    <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
      <FilePlus2 className="w-4 h-4" />
      Generate Invoice
    </button>
  );
}
