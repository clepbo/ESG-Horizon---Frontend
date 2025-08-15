"use client";
import { ArrowLeft } from "lucide-react";
import React, { JSX } from "react";
export default function BackButton(): JSX.Element {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-sm flex gap-1 text-gray-800 shadow rounded px-4 py-2 w-fit bg-white hover:bg-gray-100 cursor-pointer"
    >
      <ArrowLeft size={18} /> <span className="text-sm">Back</span>
    </button>
  );
}
