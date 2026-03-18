"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useAllUsers } from "@/services/hooks/user.hooks";

const REVIEWER_ROLES = [
  "super_admin",
  "platform_subadmin",
  "company_esg_admin",
  "company_esg_subadmin",
];

interface ReviewerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reviewerId?: number) => void;
  loading?: boolean;
}

export default function ReviewerSelectionModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: ReviewerSelectionModalProps) {
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined,
  );

  if (!open) return null;

  const activeUsers =
    (users as any[])?.filter(
      (u: any) =>
        u.status === "active" && REVIEWER_ROLES.includes(u.role?.name),
    ) ?? [];

  const handleSubmit = () => {
    onSubmit(selectedUserId);
    setSelectedUserId(undefined);
  };

  const handleClose = () => {
    setSelectedUserId(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Submit for Review
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Select an administrator to review this assessment. Only users
          with approval permissions are shown.
        </p>

        {usersLoading ? (
          <p className="text-sm text-gray-400 py-4">Loading users...</p>
        ) : activeUsers.length === 0 ? (
          <p className="text-sm text-amber-600 py-4">
            No eligible reviewers found. Only administrators can review
            assessments.
          </p>
        ) : (
          <Select
            value={selectedUserId?.toString() ?? ""}
            onValueChange={(val) => setSelectedUserId(Number(val))}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select a reviewer" />
            </SelectTrigger>
            <SelectContent className="z-[70]">
              {activeUsers.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.first_name} {user.last_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedUserId}
            className="bg-[var(--color-primary)] text-white hover:bg-teal-600"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
