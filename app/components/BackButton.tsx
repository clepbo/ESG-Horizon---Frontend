"use client";

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-sm text-gray-800  rounded px-4 py-2 w-fit hover:bg-gray-100 border border-gray-200 shadow cursor-pointer"
    >
      ← Back
    </button>
  );
}
