"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Info, X, Trash2, Edit2 } from "lucide-react";
import { useCompanySubsidiaries, useCreateSubsidiary, useDeleteSubsidiary, useEditSubsidiary } from "@/services/hooks/subsidiaries.hooks";
import { useCompanyUsers, useCompanyDetails, useInviteUser, useDeleteInvitation } from "@/services/hooks/company.hooks";
import { useCompanyDepartments, useCreateDepartment, useDeleteDepartment, useUpdateDepartment } from "@/services/hooks/department.hooks";
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
  const { data: industries, isLoading: isLoadingIndustries } = useIndustries();
  const { data: companyDetails } = useCompanyDetails();
  const companyId = companyDetails?.id;
  const { data: companyUsers, isLoading: isLoadingUsers } = useCompanyUsers(String(companyId));
  const { data: departments, isLoading: isLoadingDepartments } = useCompanyDepartments(
    Number(companyId)
  );
  const { data: allUserRoles, isLoading: isLoadingUserRoles } = useAllUserRoles();

  // Mutations
  const { mutateAsync: createSubsidiary } = useCreateSubsidiary();
  const { mutateAsync: editSubsidiary } = useEditSubsidiary();
  const { mutateAsync: deleteSubsidiary } = useDeleteSubsidiary();
  const { mutateAsync: createDepartment } = useCreateDepartment();
  const { mutateAsync: updateDepartment } = useUpdateDepartment();
  const { mutateAsync: deleteDepartment } = useDeleteDepartment();
  const { mutateAsync: inviteUser } = useInviteUser();
  const { mutateAsync: deleteInvitationHook } = useDeleteInvitation();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [industryOptions, setIndustryOptions] = useState<{ value: number; label: string }[]>([]);
  const [addedSubsidiaries, setAddedSubsidiaries] = useState<{ id: number; name: string }[]>([]);
  const [addedDepartments, setAddedDepartments] = useState<{ id: number; name: string }[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<{ id: number; email: string }[]>([]);

  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);

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

  const userRoles = allUserRoles?.filter((role: { id: number; name: string }) =>
    role.name.startsWith("company_")
  );

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
      const teamLeadUser = data.managerEmail ? allUsers.find(u => u.email === data.managerEmail) : undefined;

      const payload = {
        name: data.name,
        industryId: data.industryId,
        leadId: teamLeadUser?.id,
        teamLead: data.managerEmail ? { email: data.managerEmail } : undefined,
        address: data.address,
        status: "active",
      };

      let res: any;
      if (editingSubId) {
        res = await editSubsidiary({
          id: editingSubId,
          ...payload
        });
        setAddedSubsidiaries((prev) =>
          prev.map(s => s.id === editingSubId ? { id: editingSubId, name: data.name } : s)
        );
        toast.success("Subsidiary updated successfully");
      } else {
        res = await createSubsidiary(payload);
        const newId = res?.id || res?.data?.id;
        if (newId) {
          setAddedSubsidiaries((prev) => [...prev, { id: newId, name: data.name }]);
        }
        toast.success("Subsidiary created successfully");
      }

      setEditingSubId(null);
      subForm.reset({ name: "", industryId: 0, managerEmail: "", address: "" });
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 409) {
        subForm.setError("name", {
          type: "manual",
          message: error.response?.data?.message || "A subsidiary with this name already exists."
        });
      } else {
        toast.error(`Failed to ${editingSubId ? "update" : "create"} subsidiary`);
      }
    }
  };

  const handleDeptSubmit = async (data: z.infer<typeof departmentSchema>) => {
    if (!companyId) return;
    try {
      const selectedSub = companySubsidiaries?.find((s) => s.name === data.subsidiary);
      const selectedUser = allUsers.find(u => u.email === data.managerEmail);
      const payload = {
        name: data.name,
        subsidiaryId: selectedSub?.id,
        subsidiaryName: data.subsidiary || undefined,
        leadEmail: data.managerEmail || undefined,
        leadId: selectedUser?.id,
      };

      let res: any;
      if (editingDeptId) {
        res = await updateDepartment({
          id: editingDeptId,
          payload: {
            ...payload,
            contact_email: data.managerEmail
          }
        });
        setAddedDepartments((prev) =>
          prev.map(d => d.id === editingDeptId ? { id: editingDeptId, name: data.name } : d)
        );
        toast.success("Department updated successfully");
      } else {
        res = await createDepartment({
          companyId: Number(companyId),
          payload,
        });

        const newId = res?.id || res?.data?.id;
        if (newId) {
          setAddedDepartments((prev) => [...prev, { id: newId, name: data.name }]);
        }
        toast.success("Department created successfully");
      }

      setEditingDeptId(null);
      deptForm.reset({ name: "", subsidiary: "", managerEmail: "" });
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 409) {
        deptForm.setError("name", {
          type: "manual",
          message: error.response?.data?.message || "A department with this name already exists."
        });
      } else {
        toast.error("Failed to create department");
      }
    }
  };

  const handleRemoveSubsidiary = async (id: number) => {
    try {
      await deleteSubsidiary(id);
      setAddedSubsidiaries((prev) => prev.filter((item) => item.id !== id));
      if (editingSubId === id) {
        setEditingSubId(null);
        subForm.reset({ name: "", industryId: 0, managerEmail: "", address: "" });
      }
      toast.success("Subsidiary removed");
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to remove subsidiary";
      toast.error(message);
    }
  };

  const handleEditSubsidiary = (id: number) => {
    const sub = allSubsidiaries.find(s => s.id === id);
    if (sub) {
      setEditingSubId(id);
      subForm.reset({
        name: sub.name,
        industryId: sub.industryId || 0,
        managerEmail: sub.teamLead?.email || "",
        address: sub.address || ""
      });
    }
  };

  const handleRemoveDepartment = async (id: number) => {
    try {
      await deleteDepartment(id);
      setAddedDepartments((prev) => prev.filter((item) => item.id !== id));
      if (editingDeptId === id) {
        setEditingDeptId(null);
        deptForm.reset({ name: "", subsidiary: "", managerEmail: "" });
      }
      toast.success("Department removed");
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to remove department";
      toast.error(message);
    }
  };

  const handleEditDepartment = (id: number) => {
    const dept = allDepartments.find(d => d.id === id);
    if (dept) {
      setEditingDeptId(id);
      deptForm.reset({
        name: dept.name,
        subsidiary: dept.subsidiary?.name || "",
        managerEmail: dept.lead?.email || ""
      });
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
      const res: any = await inviteUser({
        email: data.email,
        roleId: selectedRole.id,
        subsidiaryId: selectedSub?.id,
        departmentId: selectedDept?.id,
      });
      const inviteId = res?.id || res?.data?.id;
      if (inviteId) {
        setInvitedUsers((prev) => [...prev, { id: inviteId, email: data.email }]);
      }
      toast.success("Invitation sent successfully");
      userForm.reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to invite user");
    }
  };



  const handleRemoveInvitedUser = async (id: number) => {
    try {
      await deleteInvitationHook(id);
      setInvitedUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Invitation removed");
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to remove invitation";
      toast.error(message);
    }
  };


  const tabs = [
    { id: "subsidiary" as TabType, label: "Add Subsidiary" },
    { id: "department" as TabType, label: "Add Department" },
    { id: "user" as TabType, label: "Invite User" },
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

            {/* Added Items Section - MOVED TO TOP */}
            {activeTab === "subsidiary" && addedSubsidiaries.length > 0 && (
              <div className="bg-transparent rounded-md p-4 border border-gray-100 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-800">Added Subsidiaries</h4>
                <div className="flex flex-wrap gap-2">
                  {addedSubsidiaries.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-sm text-gray-700 shadow-sm"
                    >
                      <span className="font-medium">{sub.name}</span>
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          onClick={() => handleEditSubsidiary(sub.id)}
                          className={`p-0.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer ${editingSubId === sub.id ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                          type="button"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleRemoveSubsidiary(sub.id)}
                          className="p-0.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-red-500"
                          type="button"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "department" && addedDepartments.length > 0 && (
              <div className="bg-transparent rounded-md p-4 border border-gray-100 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-800">Added Departments</h4>
                <div className="flex flex-wrap gap-2">
                  {addedDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-sm text-gray-700 shadow-sm"
                    >
                      <span className="font-medium">{dept.name}</span>
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          onClick={() => handleEditDepartment(dept.id)}
                          className={`p-0.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer ${editingDeptId === dept.id ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                          type="button"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleRemoveDepartment(dept.id)}
                          className="p-0.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-red-500"
                          type="button"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "user" && invitedUsers.length > 0 && (
              <div className="bg-white rounded-md p-4 border border-gray-100 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-800">Invited Users</h4>
                <div className="flex flex-wrap gap-2">
                  {invitedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-sm text-gray-700 shadow-sm"
                    >
                      <span className="font-medium">{user.email}</span>
                      <button
                        onClick={() => handleRemoveInvitedUser(user.id)}
                        className="p-0.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-red-500"
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
                      {subForm.formState.isSubmitting ? (editingSubId ? "Updating..." : "Creating...") : (editingSubId ? "Update Subsidiary" : "Add Subsidiary")}
                    </button>
                    {editingSubId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubId(null);
                          subForm.reset({ name: "", industryId: 0, managerEmail: "", address: "" });
                        }}
                        className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer mt-2"
                      >
                        Cancel Edit
                      </button>
                    )}
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
                      {deptForm.formState.isSubmitting ? (editingDeptId ? "Updating..." : "Creating...") : (editingDeptId ? "Update Department" : "Add Department")}
                    </button>
                    {editingDeptId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDeptId(null);
                          deptForm.reset({ name: "", subsidiary: "", managerEmail: "" });
                        }}
                        className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer mt-2"
                      >
                        Cancel Edit
                      </button>
                    )}
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

            {/* Added Items List REMOVED FROM BOTTOM */}

            <div className="flex justify-end gap-3 p-1">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm rounded-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSubmit?.({
                    subsidiaries: addedSubsidiaries,
                    departments: addedDepartments,
                    users: invitedUsers
                  });
                  setAddedSubsidiaries([]);
                  setAddedDepartments([]);
                  setInvitedUsers([]);
                  onClose();
                }}
                className="px-5 py-2 text-sm rounded-xs bg-teal-500 hover:bg-teal-600 text-white cursor-pointer"
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
