"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useAllUsers } from "@/services/hooks/user.hooks";

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
    (users as any[])?.filter((u: any) => u.status === "active") ?? [];

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
          Select a reviewer for this assessment. If no reviewer is selected, you
          will be assigned as the reviewer (self-review).
        </p>

        {usersLoading ? (
          <p className="text-sm text-gray-400 py-4">Loading users...</p>
        ) : (
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={selectedUserId ?? ""}
            onChange={(e) =>
              setSelectedUserId(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          >
            <option value="">Self-review (no reviewer)</option>
            {activeUsers.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </option>
            ))}
          </select>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[var(--color-primary)] text-white hover:bg-teal-600"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
