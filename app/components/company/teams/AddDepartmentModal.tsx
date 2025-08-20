"use client";

import { useState } from "react";
import { CircleX } from "lucide-react";
import BackButton from "../../ui/reusables/BackButton";
import { User } from "@/services/user.service";

export default function AddDepartmentModal({
    onClose,
    onAddDepartment,
    users,
}: {
    onClose: () => void;
    onAddDepartment: (dept: {
        name: string;
        description: string;
        lead?: Partial<User> | null;
        contact_email: string;
    }) => void;
    users: User[];
}) {
    const [departmentName, setDepartmentName] = useState("");
    const [description, setDescription] = useState("");
    const [departmentLead, setDepartmentLead] = useState<User | null>(null);
    const [contactEmail, setContactEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onAddDepartment({
            name: departmentName,
            description,
            lead: departmentLead || null, // optional, null if none selected
            contact_email: contactEmail,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex justify-center items-center px-4">
            <div className="relative w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <BackButton />
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-700 transition cursor-pointer"
                    >
                        <CircleX size={24} />
                    </button>
                </div>

                <h2 className="text-2xl font-semibold mb-6">Add Department</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Department Name{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            placeholder="Sustainability"
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Description
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional"
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Department Lead (optional)
                        </label>
                        <select
                            value={departmentLead?.id ?? ""}
                            onChange={(e) => {
                                const selectedUserId = parseInt(
                                    e.target.value,
                                    10
                                );
                                if (isNaN(selectedUserId)) {
                                    setDepartmentLead(null);
                                    return;
                                }
                                const user = users.find(
                                    (u) => Number(u.id) === Number(selectedUserId)
                                );
                                setDepartmentLead(user || null);
                            }}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">
                                Select a lead (leave blank for self)
                            </option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Contact Email{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="example.email@company.com"
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
                            Add Department
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
