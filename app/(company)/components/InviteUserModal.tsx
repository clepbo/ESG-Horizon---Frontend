"use client";

import { useEffect, useState } from "react";
import { CircleX } from "lucide-react";
import { companyService } from "@/services/company.service";
import { subsidiariesService, Subsidiary } from "@/services/subsidiaries.service";
import { toast } from "react-toastify";
import { CreateDepartment, Department, departmentService } from "@/services/department.service";
import { getCurrentUser } from "@/lib/utils";
import { User } from "@/services/user.service";

interface InviteUserModalProps {
  onClose: () => void;
  onInvite: () => void;
  departments: Department[];
}

export default function InviteUserModal({ onClose, onInvite, departments }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    departments.length > 0 ? departments[0].id : null
  );
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<number | null>(null);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deptInput, setDeptInput] = useState("");
  const [deptList, setDeptList] = useState<Department[]>(departments);
  const [addingDept, setAddingDept] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const ROLE_OPTIONS = [
    { value: "company_esg_subadmin", label: "Company SubAdmin" },
    { value: "company_esg_data_officer", label: "Company Data Officer" },
    { value: "company_esg_viewer", label: "Company Viewer" },
  ];
  const [role, setRole] = useState(ROLE_OPTIONS[0]?.value || "");

  useEffect(() => {
    const loadSubsidiaries = async () => {
      try {
        const data = await subsidiariesService.getCompanySubsidiaries();
        setSubsidiaries(data || []);
      } catch (err) {
        console.error("Failed to load subsidiaries", err);
      }
    };
    loadSubsidiaries();
    getCurrentUser().then(setCurrentUser);
  }, []);
  console.log("User", currentUser);

  const isFormValid = email.trim() !== "" && selectedDepartment !== null && role.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const yourCompany = await companyService.getDetails();
      if (!yourCompany) throw new Error("Company not found");

      if (!selectedDepartment) {
        toast.error("Please select or add a department before inviting");
        setLoading(false);
        return;
      }

      const payload = {
        email,
        departmentId: selectedDepartment,
        roleName: role,
        subsidiaryId: selectedSubsidiary ?? yourCompany.id, //  fallback
      };

      const response = await companyService.invite(payload);
      toast.success(response.message || "User Invitation sent successfully");
      onInvite();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send invitation";
      setError(message);
      toast.error(message);
    }
  };

  const handleAddDepartment = async () => {
    if (!deptInput.trim()) return;
    setAddingDept(true);
    try {
      const yourCompany = await companyService.getDetails();
      if (!yourCompany) throw new Error("Company not found");

      const createPayload: CreateDepartment = {
        name: deptInput,
        description: "",
        contact_email: email || currentUser?.email || "",
        leadId: currentUser?.id ? Number(currentUser.id) : undefined,
      };

      const newDept = await departmentService.create(yourCompany.id, createPayload);

      setDeptList((prev) => [...prev, newDept]);
      setSelectedDepartment(newDept.id);
      setDeptInput(newDept.name);
      toast.success("Department added successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add department");
    } finally {
      setAddingDept(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex justify-center items-center px-4">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] max-w-lg">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={28} />
        </button>

        <h2 className="text-xl font-semibold mb-6 text-center">Invite User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium">Email *</label>
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

          {/* Subsidiary (optional) */}
          <div>
            <label className="block mb-1 text-sm font-medium">Subsidiary (optional)</label>
            <select
              disabled={loading}
              value={selectedSubsidiary ?? ""}
              onChange={(e) =>
                setSelectedSubsidiary(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Use Parent Company</option>
              {subsidiaries.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}

          <div>
            <label className="block mb-1 text-sm font-medium">Department *</label>
            <input
              type="text"
              value={deptInput}
              onChange={(e) => setDeptInput(e.target.value)}
              placeholder="Start typing to add/select department"
              disabled={loading}
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {deptInput &&
              // show only if input doesn't exactly match the selected dept
              (!selectedDepartment ||
                deptInput.toLowerCase() !==
                  deptList.find((d) => d.id === selectedDepartment)?.name.toLowerCase()) && (
                <div className="mt-2 rounded-md max-h-40 overflow-y-auto bg-white shadow">
                  {deptList
                    .filter((d) => d.name.toLowerCase().includes(deptInput.toLowerCase()))
                    .map((dept) => (
                      <div
                        key={dept.id}
                        onClick={() => {
                          setSelectedDepartment(dept.id);
                          setDeptInput(dept.name); // fill input with name
                        }}
                        className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${
                          selectedDepartment === dept.id ? "bg-green-200" : ""
                        }`}
                      >
                        {dept.name}
                      </div>
                    ))}

                  {/* Option to add new department */}
                  {deptInput &&
                    !deptList.some((d) => d.name.toLowerCase() === deptInput.toLowerCase()) && (
                      <div
                        onClick={handleAddDepartment}
                        className="px-3 py-2 cursor-pointer text-green-600 hover:bg-green-50"
                      >
                        + Add “{deptInput}”
                      </div>
                    )}
                </div>
              )}
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium">Role *</label>
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

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isFormValid || loading || addingDept}
              className="px-4 py-2 text-sm rounded-md bg-[var(--color-primary)] transform hover:scale-[1.02] text-white  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
