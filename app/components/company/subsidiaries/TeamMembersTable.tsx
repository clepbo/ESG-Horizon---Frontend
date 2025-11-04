"use client";

import Image from "next/image";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, FilterOption } from "@/app/components/ui/reusables/DataTable";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { User } from "@/services/user.service";

interface TeamMembersTableProps {
  initialUsers?: User[];
}

const columnHelper = createColumnHelper<User>();

export function TeamMembersTable({ initialUsers }: TeamMembersTableProps) {
  const users = initialUsers;

  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: "name",
      header: "User",
      cell: (info) => {
        const userName = info.getValue() as string;
        const userPhotoUrl = info.row.original.profile_photo_url;

        return (
          <div className="flex items-center">
            <Image
              src={userPhotoUrl || "/image.png"}
              alt={userName}
              width={40}
              height={40}
              className="rounded-full mr-3"
            />
            <div>
              <p className="font-medium text-gray-800">{userName}</p>
              <p className="text-sm text-gray-500">{info.row.original.email}</p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("department.name", {
      header: "Department",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("role.name", {
      header: "Role",

      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        // FIX: Assert the status value to its correct literal union type
        const status = info.getValue() as
          | "approved"
          | "pending"
          | "suspended"
          | "active"
          | "disabled";

        const getStatusBadgeVariant = (s: typeof status) => {
          switch (s) {
            case "active":
            case "approved":
              return "default";
            case "pending":
              return "secondary";
            case "suspended":
            case "disabled":
              return "destructive";
            default:
              return "outline";
          }
        };
        return (
          <Badge
            variant={getStatusBadgeVariant(status)}
            className={`capitalize ${
              status === "pending"
                ? "bg-yellow-500 text-white"
                : status === "suspended" || status === "disabled"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
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
      cell: () => (
        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            variant="outline"
            className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
            // onClick={() => handleEditClick(info.row.original)}
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
            // onClick={() => handleEditClick(info.row.original)}
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      ),
    }),
  ];

  const filterOptions: FilterOption[] = [
    {
      label: "Role",
      columnId: "role.name", // FIX: Filtering by role.name
      options: ["Super Administrator", "Platform Sub-Administrator", "Platform Data Officer"],
    },
    {
      label: "Status",
      columnId: "status",
      options: ["pending", "active", "approved", "suspended", "disabled"], // Added all possible status types
    },
  ];

  return (
    <DataTable
      data={users ?? []}
      columns={columns}
      filterOptions={filterOptions}
      searchPlaceholder="Search by name"
    />
  );
}
