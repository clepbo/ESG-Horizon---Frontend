"use client";

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-sm text-gray-800 shadow rounded px-4 py-2 w-fit hover:bg-gray-100 cursor-pointer"
    >
      ← Back
    </button>
  );
}
