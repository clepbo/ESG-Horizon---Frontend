import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (v: string) => void;
} | null>(null);

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, children, className }, ref) => {
    const [value, setValue] = React.useState(defaultValue);
    const contextValue = React.useMemo(() => ({ value, onValueChange: setValue }), [value]);

    const list: React.ReactNode[] = [];
    const content: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === TabsList) list.push(child);
        if (child.type === TabsContent) content.push(child);
      }
    });

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={cn("w-full", className)}>
          {React.Children.map(list, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<TabsListProps>, {
                  value,
                  onValueChange: setValue,
                })
              : child
          )}
          {content}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

interface TabsListProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function TabsList({ children, value, onValueChange }: TabsListProps) {
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const childProps = child.props as { value?: string };
        const isActive = childProps.value === value;

        return React.cloneElement(child as React.ReactElement<TabsTriggerProps>, {
          active: isActive,
          onClick: () => onValueChange?.(childProps.value || ""),
        });
      })}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  active?: boolean;
}

export function TabsTrigger({ active, onClick, children, ...props }: TabsTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value: triggerValue, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (triggerValue !== context.value) return null;

  return <div className={cn("mt-2", className)}>{children}</div>;
}
