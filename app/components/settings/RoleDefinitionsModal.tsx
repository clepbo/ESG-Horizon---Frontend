"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import RoleDefinitions from "./RoleDefinitions";
import Dialog from "../ui/dialog";

interface Props {
  customTrigger?: React.ReactNode;
}

export default function RoleDefinitionsModal({ customTrigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {customTrigger ? (
        <div onClick={() => setOpen(true)} className="inline-block">
          {customTrigger}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="
            group flex items-center gap-2 px-4 py-2
            text-sm font-medium text-teal-700
            border border-teal-200 rounded-lg
            bg-white shadow-sm transition-all duration-200
            hover:bg-teal-600 hover:text-white hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
            mt-6
            cursor-pointer
          "
        >
          <Info
            size={16}
            className="transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110"
          />
          View Role Definitions
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen} title="Role Definitions">
        <RoleDefinitions />
      </Dialog>
    </>
  );
}
