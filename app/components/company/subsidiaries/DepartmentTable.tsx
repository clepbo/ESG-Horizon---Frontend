"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/app/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { DataTable, FilterOption } from "@/app/components/ui/reusables/DataTable";
import EditDepartmentModal from "@/app/components/ui/modals/EditDepartment";
import { Department } from "@/services/department.service";
import { useRouter } from "next/navigation";
import { Badge } from "@/app/components/ui/badge";

type DepartmentStatus = "active" | "inactive" | "archived" | "draft";

interface DepartmentTableProps {
  departments: Department[];
  onUpdate?: () => void;
}

const columnHelper = createColumnHelper<Department>();

export function DepartmentsTable({ departments, onUpdate }: DepartmentTableProps) {
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const handleEditClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsEditOpen(true);
  };

  const getDepartmentStatusBadgeVariant = (s: DepartmentStatus) => {
    switch (s) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "archived":
        return "destructive";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Department Name",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor("lead", {
      header: "Department Lead",
      cell: (info) => {
        const lead = info.getValue();
        const contactEmail = info.row.original.contact_email;

        const fullName = `${lead?.first_name || ""} ${lead?.last_name || ""}`.trim();

        if (!fullName && !contactEmail) {
          return "-";
        }

        return (
          <div>
            <p className="font-medium text-gray-800">{fullName || "N/A"}</p>
            <p className="text-sm text-gray-500">{contactEmail || "N/A"}</p>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "teamMember",
      header: "Team Member",
      cell: () => "-",
    }),

    columnHelper.accessor("status" as keyof Department, {
      header: "Status",
      cell: (info) => {
        const status = (info.getValue() || "draft") as DepartmentStatus;

        return (
          <Badge
            variant={getDepartmentStatusBadgeVariant(status)}
            className={`capitalize ${status === "active"
              ? "bg-green-500 text-white"
              : status === "inactive"
                ? "bg-yellow-500 text-white"
                : status === "archived"
                  ? "bg-red-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
          >
            {status}
          </Badge>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Quick Actions",
      cell: (info) => (
        <div className="flex space-x-2">
          <Button
            size="icon"
            variant="outline"
            className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => router.push(`/settings-esg/departments/${info.row.original.id}`)}
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleEditClick(info.row.original)}
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      ),
    }),
  ];

  const allDepartmentStatuses: DepartmentStatus[] = ["active", "inactive", "archived", "draft"];

  const departmentFilterOptions: FilterOption[] = [
    {
      label: "Status",
      columnId: "status",
      options: allDepartmentStatuses,
    },
  ];

  return (
    <>
      <DataTable
        data={departments}
        columns={columns}
        filterOptions={departmentFilterOptions}
        searchPlaceholder="Search departments"
      />
      {isEditOpen && selectedDepartment && (
        <EditDepartmentModal
          department={selectedDepartment}
          onClose={() => setIsEditOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
