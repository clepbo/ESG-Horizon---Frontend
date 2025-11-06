"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onSubmit: () => void;
}

export function SubmitConfirmationDialog({
  isOpen,
  onClose,
  onSave,
  onSubmit,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Do you want to save or submit?</DialogTitle>
          <DialogDescription>
            When you submit, you can no longer edit this form. Are you sure you want to submit or
            save?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="outline"
            onClick={onSave}
            className="border-[var(--color-primary)] text-primary-700 hover:bg-green-50 hover:text-green-800"
          >
            Save
          </Button>

          <Button
            variant="default"
            onClick={onSubmit}
            className="bg-[var(--color-primary)] hover:bg-green-700 text-white"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
