"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const CustomButtonVariants = cva(
  // ✨ Added transform, transition, and active scaling
  "flex items-center justify-center gap-2 cursor-pointer rounded-md text-sm font-medium transform transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        filled:
          "bg-primary text-white hover:bg-teal-700 hover:shadow-md hover:scale-[1.03] active:scale-[0.97]",
        outlined:
          "border border-teal-600 text-primary hover:bg-teal-50 hover:shadow-sm hover:scale-[1.03] active:scale-[0.97]",
      },
      size: {
        default: "h-10 w-[220px]",
        sm: "h-9 w-[180px]",
        lg: "h-11 w-[240px]",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof CustomButtonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant, size, loading, icon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(CustomButtonVariants({ variant, size }), className)}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";
