import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  indicatorColor?: string;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, indicatorColor, ...props }, ref) => {
    const isTailwindClass = indicatorColor?.startsWith("bg-") || indicatorColor?.startsWith("bg[");

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-teal-200", className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all",
            isTailwindClass ? indicatorColor : ""
          )}
          style={{
            transform: `translateX(-${100 - Math.min(value || 0, 100)}%)`,
            backgroundColor: !indicatorColor
              ? "#119b95"
              : !isTailwindClass
                ? indicatorColor
                : undefined,
          }}
        />
      </ProgressPrimitive.Root>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
