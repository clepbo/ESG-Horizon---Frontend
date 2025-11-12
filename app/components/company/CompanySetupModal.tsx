"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Info, X } from "lucide-react";
import { useCompanySubsidiaries } from "@/services/hooks/subsidiaries.hooks";
import { useCompanyUsers, useCompanyDetails, useBulkCreate } from "@/services/hooks/company.hooks";
import { useCompanyDepartments } from "@/services/hooks/department.hooks";
import { Industry } from "@/services/industries.services";
import { User } from "@/services/user.service";
import { Subsidiary } from "@/services/subsidiaries.service";
import { Department } from "@/services/department.service";
import { useIndustries } from "@/services/hooks/industries.hooks";
import { useAllUserRoles } from "@/services/hooks/user.hooks";
import { formatRoleName } from "@/lib/utils";

interface CompanySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialTab?: "subsidiary" | "department" | "user";
}

type TabType = "subsidiary" | "department" | "user";

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
  const userRoles = allUserRoles?.filter((role: { id: number; name: string }) =>
    role.name.startsWith("company_")
  );

  const [loadingIsDone, setLoadingIsDone] = useState(false);

  const { mutateAsync: bulkCreateMutation } = useBulkCreate();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [formData, setFormData] = useState({
    // Subsidiary fields
    subsidiaryId: 0,
    subsidiaryName: "",
    industryId: 0,
    managerEmail: "",
    address: "",
    // Department fields
    departmentId: 0,
    departmentName: "",
    subsidiary: "",
    departmentManagerEmail: "",
    // User fields
    userId: 0,
    email: "",
    role: "",
    userSubsidiary: "",
    department: "",
  });

  const [editingItem, setEditingItem] = useState<Subsidiary | Department | User | null>(null);

  const [newSubsidiaries, setNewSubsidiaries] = useState<Subsidiary[]>([]);
  const [newDepartments, setNewDepartments] = useState<Department[]>([]);
  const [newUsers, setNewUsers] = useState<User[]>([]);

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

  useEffect(() => {
    if (!editingItem) {
      setFormData({
        subsidiaryId: 0,
        subsidiaryName: "",
        industryId: 0,
        managerEmail: "",
        address: "",
        departmentId: 0,
        departmentName: "",
        subsidiary: "",
        departmentManagerEmail: "",
        userId: 0,
        email: "",
        role: "",
        userSubsidiary: "",
        department: "",
      });
    }
  }, [editingItem]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdate = () => {
    if (editingItem) {
      if (activeTab === "subsidiary") {
        const updatedSub: Subsidiary = {
          id: formData.subsidiaryId,
          name: formData.subsidiaryName,
          industryId: formData.industryId,
          teamLead: {
            email: formData.managerEmail,
          },
          address: formData.address,
          status: "active",
        };
        setNewSubsidiaries((prev) =>
          prev.map((sub) => (sub.id === updatedSub.id ? updatedSub : sub))
        );
      } else if (activeTab === "department") {
        const updatedDept: Department = {
          id: formData.departmentId,
          name: formData.departmentName,
          subsidiaryId:
            companySubsidiaries?.find((sub) => sub.name === formData.subsidiary)?.id || 0,
          lead: {
            id: 0,
            email: formData.departmentManagerEmail,
            first_name: "",
            last_name: "",
          },
        };
        setNewDepartments((prev) =>
          prev.map((dept) => (dept.id === updatedDept.id ? updatedDept : dept))
        );
      } else if (activeTab === "user") {
        const updatedUser: User = {
          id: formData.userId,
          email: formData.email,
          role: { id: 0, name: formData.role },
          subsidiaryId:
            companySubsidiaries?.find((sub) => sub.name === formData.userSubsidiary)?.id || 0,
          department: { id: 0, name: formData.department },
          first_name: "",
          last_name: "",
          status: "pending",
        };
        setNewUsers((prev) =>
          prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
      }
    } else {
      if (activeTab === "subsidiary") {
        const newSub: Subsidiary = {
          id: Date.now(),
          name: formData.subsidiaryName,
          industryId: formData.industryId,
          teamLead: {
            email: formData.managerEmail,
          },
          address: formData.address,
          status: "active",
        };
        setNewSubsidiaries((prev) => [...prev, newSub]);
      } else if (activeTab === "department") {
        const newDept: Department = {
          id: Date.now(),
          name: formData.departmentName,
          subsidiaryId:
            companySubsidiaries?.find((sub) => sub.name === formData.subsidiary)?.id || 0,
          lead: {
            id: 0,
            email: formData.departmentManagerEmail,
            first_name: "",
            last_name: "",
          },
        };
        setNewDepartments((prev) => [...prev, newDept]);
      } else if (activeTab === "user") {
        const newUser: User = {
          id: Date.now(),
          email: formData.email,
          role: { id: 0, name: formData.role },
          subsidiaryId:
            companySubsidiaries?.find((sub) => sub.name === formData.userSubsidiary)?.id || 0,
          department: { id: 0, name: formData.department },
          first_name: "",
          last_name: "",
          status: "pending",
        };
        setNewUsers((prev) => [...prev, newUser]);
      }
    }

    setEditingItem(null);

    setFormData({
      subsidiaryName: "",
      industryId: 0,
      managerEmail: "",
      address: "",
      departmentName: "",
      subsidiary: "",
      departmentManagerEmail: "",
      email: "",
      role: "",
      userSubsidiary: "",
      department: "",
      subsidiaryId: 0,
      departmentId: 0,
      userId: 0,
    });
  };

  const handleEdit = <T extends Subsidiary | Department | User>(item: T, type: TabType) => {
    setActiveTab(type);
    setEditingItem(item);

    if (type === "subsidiary") {
      const subsidiaryData = item as Subsidiary;
      setFormData({
        ...formData,
        subsidiaryId: subsidiaryData.id,
        subsidiaryName: subsidiaryData.name,
        industryId: subsidiaryData.industryId || 0,
        managerEmail: subsidiaryData.teamLead?.email || "",
        address: subsidiaryData.address || "",
      });
    } else if (type === "department") {
      const departmentData = item as Department;
      const selectedSubsidiary = companySubsidiaries?.find(
        (sub) => sub.id === departmentData.subsidiaryId
      );
      setFormData({
        ...formData,
        departmentId: departmentData.id,
        departmentName: departmentData.name,
        subsidiary: selectedSubsidiary?.name || "",
        departmentManagerEmail: departmentData.lead?.email || "",
      });
    } else if (type === "user") {
      const userData = item as User;
      const selectedSubsidiary = companySubsidiaries?.find(
        (sub) => sub.id === userData.subsidiaryId
      );
      setFormData({
        ...formData,
        userId: userData.id,
        email: userData.email || "",
        role: userData.role?.name || "",
        userSubsidiary: selectedSubsidiary?.name || "",
        department: userData.department?.name || "",
      });
    }
  };

  const handleDelete = (id: number, type: TabType) => {
    if (type === "subsidiary") {
      setNewSubsidiaries((prev) => prev.filter((sub) => sub.id !== id));
    } else if (type === "department") {
      setNewDepartments((prev) => prev.filter((dept) => dept.id !== id));
    } else if (type === "user") {
      setNewUsers((prev) => prev.filter((user) => user.id !== id));
    }
  };

  const handleClose = () => {
    setLoadingIsDone(false);
    setNewSubsidiaries([]);
    setNewDepartments([]);
    setNewUsers([]);
    onClose();
  };

  const handleFinalSubmit = async () => {
    setLoadingIsDone(true);
    const usersPayload = newUsers
      .filter((item) => item.id > 9999999999)
      .map((item) => ({
        email: item.email,
        roleName: item?.role?.name,
        subsidiaryName: allSubsidiaries.find((sub) => sub.id === item.subsidiaryId)?.name,
        departmentName: item?.department?.name,
      }));

    const payload = {
      subsidiaries: newSubsidiaries
        .filter((item) => item.id > 9999999999)
        .map((item) => ({
          ...item,
          industryId: typeof item.industry === "object" ? item.industry?.id : item.industryId || 0,
        })),
      departments: newDepartments
        .filter((item) => item.id > 9999999999)
        .map((item) => ({
          name: item.name,
          subsidiaryName: allSubsidiaries.find((sub) => sub.id === item.subsidiaryId)?.name,
          leadId: item.lead?.id,
          leadEmail: item.lead?.email,
        })),
      users: usersPayload,
    };

    try {
      const response = await bulkCreateMutation(payload);
      onSubmit(response);
      setLoadingIsDone(false);
      setNewSubsidiaries([]);
      setNewDepartments([]);
      setNewUsers([]);
    } catch (error) {
      console.error("Bulk submission failed:", error);
      setLoadingIsDone(false);
    }
  };

  const renderList = <T extends Subsidiary | Department | User>(
    items: T[],
    title: string,
    renderValue: (item: T) => string,
    type: TabType
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="bg-transparent rounded-md p-2 w-full">
        <h3 className="font-semibold text-sm mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center bg-gray-50 text-xs px-4 py-2 rounded-sm shadow-sm justify-between w-auto"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-800">{renderValue(item)}</span>
                <button
                  onClick={() => handleEdit(item, type)}
                  className="text-gray-500 hover:text-green-600 transition  hover:cursor-pointer"
                >
                  <Edit size={14} />
                </button>
              </div>
              <button
                onClick={() => handleDelete(item.id, type)}
                className="ml-4 text-red-500 border border-red-500 rounded-full w-4 h-4 flex items-center justify-center transition hover:cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "subsidiary" as TabType, label: "Add Subsidiary" },
    { id: "department" as TabType, label: "Add Department" },
    { id: "user" as TabType, label: "Add New User" },
  ];

  const allSubsidiaries = [...(companySubsidiaries || []), ...newSubsidiaries];
  const allDepartments = [...(departments || []), ...newDepartments];
  const allUsers = [...(companyUsers || []), ...newUsers];
  const allIndustries = industries || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-64 bg-transparent"></div>

      <div className="flex-1 relative">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-green-200/20 backdrop-blur-md"
          // onClick={onClose}
        ></div>

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

            <div className="flex space-x-4 mb-6">
              {activeTab === "subsidiary" && (
                <>
                  {renderList(
                    newSubsidiaries,
                    "Adding Subsidiaries",
                    (item) => item.name,
                    "subsidiary"
                  )}
                </>
              )}

              {activeTab === "department" && (
                <>
                  {renderList(
                    newDepartments,
                    "Adding Departments",
                    (item) => item.name,
                    "department"
                  )}
                </>
              )}

              {activeTab === "user" && (
                <>{renderList(newUsers, "Inviting Users", (item) => item.email, "user")}</>
              )}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-md shadow-md p-6">
              <div className="space-y-4">
                {activeTab === "subsidiary" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Subsidiary Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.subsidiaryName}
                        onChange={(e) => handleInputChange("subsidiaryName", e.target.value)}
                        placeholder="Enter subsidiary name"
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.industryId}
                        onChange={(e) => handleInputChange("industryId", Number(e.target.value))}
                        disabled={isLoadingIndustries}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">
                          {isLoadingIndustries ? "Loading..." : "Select industry"}
                        </option>
                        {allIndustries.map((industry: Industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.industry} ({industry.sector})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Subsidiary Lead/Manager Email (Optional)
                      </label>
                      <select
                        value={formData.managerEmail}
                        onChange={(e) => handleInputChange("managerEmail", e.target.value)}
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
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter address"
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "department" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.departmentName}
                        onChange={(e) => handleInputChange("departmentName", e.target.value)}
                        placeholder="Enter department name"
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Subsidiary </label>
                      <select
                        value={formData.subsidiary}
                        onChange={(e) => handleInputChange("subsidiary", e.target.value)}
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
                        value={formData.departmentManagerEmail}
                        onChange={(e) =>
                          handleInputChange("departmentManagerEmail", e.target.value)
                        }
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
                )}

                {activeTab === "user" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="user@company.com"
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange("role", e.target.value)}
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
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Subsidiary</label>
                      <select
                        value={formData.userSubsidiary}
                        onChange={(e) => handleInputChange("userSubsidiary", e.target.value)}
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
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
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
                )}

                {/* Submit Button */}
                <button
                  onClick={handleAddOrUpdate}
                  className="w-full px-4 py-2 text-sm rounded-md bg-[var(--color-primary)]  hover:bg-teal-600 text-white  cursor-pointer mt-6"
                >
                  {editingItem ? "Update " : "Add "}
                  {activeTab === "subsidiary"
                    ? "Subsidiary"
                    : activeTab === "department"
                      ? "Department"
                      : "User"}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-1">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-sm rounded-xs border border-green-500 text-black hover:bg-gray-50 bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 text-sm rounded-xs bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                disabled={loadingIsDone}
              >
                {loadingIsDone ? "Finalizing..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
