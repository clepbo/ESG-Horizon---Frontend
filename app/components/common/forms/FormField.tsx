"use client";

import React from "react";

export function InputField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string | null | undefined;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800 mb-1">
                {label}
            </label>
            <input
                id="input"
                type="text"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>
    );
}

export function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string | null | undefined; // ✅ change from string[] to string
    options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800 mb-1">
                {label}
            </label>
            <select
                id="select"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}
