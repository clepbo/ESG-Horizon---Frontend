"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Info, X } from "lucide-react";
import { useCompanySubsidiaries, useCreateSubsidiary } from "@/services/hooks/subsidiaries.hooks";
import { useCompanyUsers, useCompanyDetails, useInviteUser } from "@/services/hooks/company.hooks";
import { useCompanyDepartments, useCreateDepartment } from "@/services/hooks/department.hooks";
import { Industry } from "@/services/industries.services";
import { User } from "@/services/user.service";
import { Subsidiary } from "@/services/subsidiaries.service";
import { Department } from "@/services/department.service";
import { useIndustries } from "@/services/hooks/industries.hooks";
import { useAllUserRoles } from "@/services/hooks/user.hooks";
import { formatRoleName } from "@/lib/utils";
import { toast } from "react-toastify";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CompanySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialTab?: "subsidiary" | "department" | "user";
}

type TabType = "subsidiary" | "department" | "user";

const subsidiarySchema = z.object({
  name: z.string().min(2, "Name is required"),
  industryId: z.number().min(1, "Industry is required"),
  managerEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

const departmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  subsidiary: z.string().optional(),
  managerEmail: z.string().email().optional().or(z.literal("")),
});

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.string().min(1, "Role is required"),
  subsidiary: z.string().optional(),
  department: z.string().optional(),
});

export default function CompanySetupModal({
  isOpen,
  onClose,
  onSubmit,
  initialTab = "subsidiary",
}: CompanySetupModalProps) {
  const { data: companySubsidiaries, isLoading: isLoadingSubsidiaries } = useCompanySubsidiaries();
  // Ensure industries are loaded
  const { data: industries, isLoading: isLoadingIndustries } = useIndustries();
  const { data: companyDetails } = useCompanyDetails();
  const companyId = companyDetails?.id;
  const { data: companyUsers, isLoading: isLoadingUsers } = useCompanyUsers(String(companyId));
  const { data: departments, isLoading: isLoadingDepartments } = useCompanyDepartments(
    Number(companyId)
  );
  const { data: allUserRoles, isLoading: isLoadingUserRoles } = useAllUserRoles();
  const userRoles = allUserRoles?.filter((role: { id: number; name: string }) =>
    role.name.startsWith("company_")
  );

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [industryOptions, setIndustryOptions] = useState<{ value: number; label: string }[]>([]);

  // Mutations
  const { mutateAsync: createSubsidiary } = useCreateSubsidiary();
  const { mutateAsync: createDepartment } = useCreateDepartment();
  const { mutateAsync: inviteUser } = useInviteUser();

  // Forms
  const subForm = useForm<z.infer<typeof subsidiarySchema>>({
    resolver: zodResolver(subsidiarySchema),
    defaultValues: { name: "", industryId: 0, managerEmail: "", address: "" },
  });

  const deptForm = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", subsidiary: "", managerEmail: "" },
  });

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", role: "", subsidiary: "", department: "" },
  });

  useEffect(() => {
    if (industries) {
      setIndustryOptions(
        industries.map((i) => ({
          value: i.id,
          label: `${i.industry} (${i.sector})`,
        }))
      );
    }
  }, [industries]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubSubmit = async (data: z.infer<typeof subsidiarySchema>) => {
    try {
      await createSubsidiary({
        name: data.name,
        industryId: data.industryId,
        teamLead: data.managerEmail ? { email: data.managerEmail } : undefined,
        address: data.address,
        status: "active",
      });
      toast.success("Subsidiary created successfully");
      subForm.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create subsidiary");
    }
  };

  const handleDeptSubmit = async (data: z.infer<typeof departmentSchema>) => {
    if (!companyId) return;
    try {
      const selectedSub = companySubsidiaries?.find((s) => s.name === data.subsidiary);
      await createDepartment({
        companyId,
        payload: {
          name: data.name,
          subsidiaryId: selectedSub?.id,
          leadEmail: data.managerEmail || undefined,
        },
      });
      toast.success("Department created successfully");
      deptForm.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create department");
    }
  };

  const handleUserSubmit = async (data: z.infer<typeof userSchema>) => {
    const selectedSub = companySubsidiaries?.find((s) => s.name === data.subsidiary);
    const selectedDept = departments?.find((d) => d.name === data.department);
    const selectedRole = userRoles?.find((r: { name: string }) => r.name === data.role);

    if (!selectedRole) {
      toast.error("Please select a valid role");
      return;
    }

    try {
      await inviteUser({
        email: data.email,
        roleId: selectedRole.id,
        subsidiaryId: selectedSub?.id,
        departmentId: selectedDept?.id,
      });
      toast.success("Invitation sent successfully");
      userForm.reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to invite user");
    }
  };


  const tabs = [
    { id: "subsidiary" as TabType, label: "Add Subsidiary" },
    { id: "department" as TabType, label: "Add Department" },
    { id: "user" as TabType, label: "Add New User" },
  ];

  const allSubsidiaries = companySubsidiaries || [];
  const allDepartments = departments || [];
  const allUsers = companyUsers || [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-64 bg-transparent"></div>

      <div className="flex-1 relative">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-green-200/20 backdrop-blur-md"></div>

        <div className="absolute inset-4 bg-green-200/20 rounded-md shadow-lg flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex items-center p-6">
            <button
              onClick={onClose}
              className="flex items-center btn-xs bg-white shadow-md px-3 py-2 rounded-md transition-shadow duration-300 hover:shadow-lg text-sm hover:cursor-pointer"
            >
              <ArrowLeft size={16} className="text-gray-400" />
              <span className="ml-3">Back</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto">
            <div className="bg-white rounded-md shadow-md p-4 w-full">
              <div className="flex w-full justify-between gap-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      activeTab === tab.id
                        ? "flex-1 px-4 py-2 text-sm rounded-sm bg-green-200/50 text-teal-800 shadow-md border-0 cursor-pointer"
                        : "flex-1 px-4 py-2 text-sm rounded-sm bg-white text-black border border-teal-500 hover:bg-green-50 cursor-pointer"
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "subsidiary" && (
              <section className="flex items-center gap-2 text-gray-600 p-2 bg-blue-200 border border-blue-500 rounded-md">
                <Info className="h-3 w-3" />{" "}
                <span className="text-xs text-neutral-1000">
                  This step is only needed if your company has subsidiaries. Stand-alone companies
                  can skip and continue.
                </span>
              </section>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-md shadow-md p-6">
              <div className="space-y-4">
                {activeTab === "subsidiary" && (
                  <form onSubmit={subForm.handleSubmit(handleSubSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Subsidiary Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...subForm.register("name")}
                          placeholder="Enter subsidiary name"
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {subForm.formState.errors.name && (
                          <p className="text-red-500 text-xs mt-1">{subForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="industryId"
                          control={subForm.control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={industryOptions}
                              value={industryOptions.find(op => op.value === field.value)}
                              onChange={(val) => field.onChange(val?.value)}
                              placeholder="Select Industry"
                              className="text-sm"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  height: '38px',
                                  minHeight: '38px'
                                })
                              }}
                            />
                          )}
                        />
                        {subForm.formState.errors.industryId && (
                          <p className="text-red-500 text-xs mt-1">{subForm.formState.errors.industryId.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Subsidiary Lead/Manager Email (Optional)
                        </label>
                        <select
                          {...subForm.register("managerEmail")}
                          disabled={isLoadingUsers}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">{isLoadingUsers ? "Loading..." : "Select user"}</option>
                          {allUsers.map((user: User) => (
                            <option key={user.email} value={user.email}>
                              {user.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Address</label>
                        <input
                          {...subForm.register("address")}
                          placeholder="Enter address"
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={subForm.formState.isSubmitting}
                      className="w-full px-4 py-2 text-sm rounded-md bg-[var(--color-primary)] hover:bg-teal-600 text-white cursor-pointer mt-6"
                    >
                      {subForm.formState.isSubmitting ? "Creating..." : "Add Subsidiary"}
                    </button>
                  </form>
                )}

                {activeTab === "department" && (
                  <form onSubmit={deptForm.handleSubmit(handleDeptSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Department Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...deptForm.register("name")}
                          placeholder="Enter department name"
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {deptForm.formState.errors.name && (
                          <p className="text-red-500 text-xs mt-1">{deptForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Subsidiary </label>
                        <select
                          {...deptForm.register("subsidiary")}
                          disabled={isLoadingSubsidiaries}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {isLoadingSubsidiaries ? "Loading..." : "Select subsidiary"}
                          </option>
                          {allSubsidiaries.map((sub: Subsidiary) => (
                            <option key={sub.id} value={sub.name}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block mb-1 text-sm font-medium">
                          Department Lead/Manager Email (Optional)
                        </label>
                        <select
                          {...deptForm.register("managerEmail")}
                          disabled={isLoadingUsers}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">{isLoadingUsers ? "Loading..." : "Select user"}</option>
                          {allUsers.map((user: User) => (
                            <option key={user.email} value={user.email}>
                              {user.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={deptForm.formState.isSubmitting}
                      className="w-full px-4 py-2 text-sm rounded-md bg-[var(--color-primary)] hover:bg-teal-600 text-white cursor-pointer mt-6"
                    >
                      {deptForm.formState.isSubmitting ? "Creating..." : "Add Department"}
                    </button>
                  </form>
                )}

                {activeTab === "user" && (
                  <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...userForm.register("email")}
                          type="email"
                          placeholder="user@company.com"
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {userForm.formState.errors.email && (
                          <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...userForm.register("role")}
                          className="cursor-pointer w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {isLoadingUserRoles ? "Loading..." : "Select role"}
                          </option>
                          {userRoles.map((role: { id: number; name: string }) => (
                            <option key={role.id} value={role.name}>
                              {formatRoleName(role?.name)}
                            </option>
                          ))}
                        </select>
                        {userForm.formState.errors.role && (
                          <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.role.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Subsidiary</label>
                        <select
                          {...userForm.register("subsidiary")}
                          disabled={isLoadingSubsidiaries}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {isLoadingSubsidiaries ? "Loading..." : "Select subsidiary"}
                          </option>
                          {allSubsidiaries.map((sub: Subsidiary) => (
                            <option key={sub.id} value={sub.name}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Department</label>
                        <select
                          {...userForm.register("department")}
                          disabled={isLoadingDepartments || allDepartments.length === 0}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">
                            {isLoadingDepartments ? "Loading..." : "Select department"}
                          </option>
                          {allDepartments.map((dept: Department) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={userForm.formState.isSubmitting}
                      className="w-full px-4 py-2 text-sm rounded-md bg-[var(--color-primary)] hover:bg-teal-600 text-white cursor-pointer mt-6"
                    >
                      {userForm.formState.isSubmitting ? "Inviting..." : "Invite User"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-1">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm rounded-xs bg-green-500 hover:bg-green-600 text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
