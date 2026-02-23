import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

// React 19 types are incompatible with Radix UI v2's deeply nested generics,
// causing ComponentPropsWithoutRef<typeof Primitive.X> to lose HTML props
// (children, className, etc). We cast primitives to `any` internally and
// type the wrapper's public API with explicit div/span props instead.

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    inset?: boolean;
    disabled?: boolean;
    textValue?: string;
  }
>(({ className, inset, children, ...props }, ref) => {
  const Comp = DropdownMenuPrimitive.SubTrigger as any;
  return (
    <Comp
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </Comp>
  );
});
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    forceMount?: true;
    sideOffset?: number;
    alignOffset?: number;
    loop?: boolean;
  }
>(({ className, ...props }, ref) => {
  const Comp = DropdownMenuPrimitive.SubContent as any;
  return (
    <Comp
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    sideOffset?: number;
    alignOffset?: number;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    forceMount?: true;
    loop?: boolean;
  }
>(({ className, sideOffset = 4, ...props }, ref) => {
  const ContentComp = DropdownMenuPrimitive.Content as any;
  return (
    <DropdownMenuPrimitive.Portal>
      <ContentComp
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    inset?: boolean;
    disabled?: boolean;
    textValue?: string;
    onSelect?: (event: Event) => void;
  }
>(({ className, inset, children, ...props }, ref) => {
  const Comp = DropdownMenuPrimitive.Item as any;
  return (
    <Comp
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

type CheckedState = boolean | "indeterminate";

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    checked?: CheckedState;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    textValue?: string;
    onSelect?: (event: Event) => void;
  }
>(({ className, children, checked, ...props }, ref) => {
  const Comp = DropdownMenuPrimitive.CheckboxItem as any;
  return (
    <Comp
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </Comp>
  );
});
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    value: string;
    disabled?: boolean;
    textValue?: string;
    onSelect?: (event: Event) => void;
  }
>(({ className, children, ...props }, ref) => {
  const Comp = DropdownMenuPrimitive.RadioItem as any;
  return (
    <Comp
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </Comp>
  );
});
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const Comp = DropdownMenuPrimitive.Label as any;
  return (
    <Comp
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
      {...props}
    />
  );
});
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const Comp = DropdownMenuPrimitive.Separator as any;
  return <Comp ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
});
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
