"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  colorClass?: string; // e.g., "text-red-600 hover:bg-red-100"
  roleGuard?: string[]; // Optional roles
}

interface ActionDropdownProps {
  actions: ActionItem[];
  buttonLabel?: string;
  buttonClassName?: string;
}

export default function ActionDropdown({
  actions,
  buttonLabel = "Actions",
  buttonClassName = "border-teal-600 w-[110px] justify-between",
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`${buttonClassName} rounded-sm`}>
          {buttonLabel}
          {isOpen ? (
            <ChevronUp className="ml-1 h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 shadow-md border-teal-600">
        {actions.map((action, idx) => (
          <DropdownMenuItem key={idx} onClick={action.onClick} className={action.colorClass || ""}>
            <span className="flex gap-2 items-center">
              {action.icon}
              {action.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
