import { useState } from "react";
import { CircleX } from "lucide-react";
import { companyService } from "@/services/company.service";
import { toast } from "react-toastify";
import { Department } from "@/services/department.service";

interface InviteUserModalProps {
    onClose: () => void;
    onInvite: () => void;
    departments: Department[];
}

export default function InviteUserModal({
    onClose,
    onInvite,
    departments,
}: InviteUserModalProps) {
    const [email, setEmail] = useState("");
    // const [department, setDepartment] = useState("Sustainability Officer");
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
        departments.length > 0 ? departments[0].id : null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ROLE_OPTIONS = [
        { value: "company_esg_subadmin", label: "Company ESG Subadmin" },
        {
            value: "company_esg_data_officer",
            label: "Company ESG Data Officer",
        },
        { value: "company_esg_viewer", label: "Company ESG Viewer" },
    ];
    const [role, setRole] = useState(ROLE_OPTIONS[0]?.value || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const yourCompany = await companyService.getDetails();
            if (!yourCompany) {
                throw new Error("Company not found");
            }

            const payload = {
                email,
                departmentId: selectedDepartment,
                roleName: role,
            };

            await companyService.invite(payload);
            toast.info("User Invitation sent successfully");
            onInvite();
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || "Failed to send invite");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex justify-center items-center px-4">
            <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-lg">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
                >
                    <CircleX size={28} />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center">
                    Invite User
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form inputs same as before, disable while loading */}
                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            disabled={loading}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example.email@company.com"
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Department *
                        </label>
                        <select
                            disabled={loading}
                            value={selectedDepartment ?? ""}
                            onChange={(e) =>
                                setSelectedDepartment(Number(e.target.value))
                            }
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            required
                        >
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Role *
                        </label>
                        <select
                            disabled={loading}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            required
                        >
                            {ROLE_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                        >
                            {loading ? "Sending..." : "Send Invite"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
