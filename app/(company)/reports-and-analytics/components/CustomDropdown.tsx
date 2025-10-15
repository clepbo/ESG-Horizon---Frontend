"use client";

import * as React from "react";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

interface CustomDropdownProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}: CustomDropdownProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const selected = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center justify-between gap-2 px-2 rounded-lg ${className}`}
        >
          {selected ? selected.label : placeholder}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange?.(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
