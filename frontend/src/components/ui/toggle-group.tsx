"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const ToggleGroupContext = React.createContext<{
  size?: VariantProps<typeof toggleGroupItemVariants>["size"];
  variant?: VariantProps<typeof toggleGroupVariants>["variant"];
}>({
  size: "default",
  variant: "default",
});

export const toggleGroupVariants = cva(
  "inline-flex items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground border border-input/40 dark:border-input/64 shadow-xs/5",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        outline: "border border-input bg-transparent",
      },
      size: {
        default: "h-9 sm:h-8",
        sm: "h-8 sm:h-7",
        lg: "h-10 sm:h-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const toggleGroupItemVariants = cva(
  "relative inline-flex items-center justify-center gap-1.5 rounded-md font-medium text-muted-foreground outline-none transition-all hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs dark:data-pressed:bg-card dark:data-[state=on]:bg-card [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      size: {
        default: "h-7 sm:h-6 px-2.5 sm:px-2 text-sm sm:text-xs",
        sm: "h-6 sm:h-5 px-2 text-xs",
        lg: "h-8 sm:h-7 px-3 text-sm",
        icon: "size-7 sm:size-6 p-0",
      },
    },
    defaultVariants: {
      size: "icon",
    },
  }
);

export interface ToggleGroupProps
  extends Omit<
    React.ComponentProps<typeof ToggleGroupPrimitive>,
    "value" | "defaultValue" | "onValueChange"
  >,
    VariantProps<typeof toggleGroupVariants> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
}

export function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  type = "single",
  value,
  defaultValue,
  onValueChange,
  multiple,
  children,
  ...props
}: ToggleGroupProps): React.ReactElement {
  const isMultiple = multiple ?? type === "multiple";

  const formattedValue = React.useMemo(() => {
    if (value === undefined) return undefined;
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }, [value]);

  const formattedDefaultValue = React.useMemo(() => {
    if (defaultValue === undefined) return undefined;
    if (Array.isArray(defaultValue)) return defaultValue;
    return defaultValue ? [defaultValue] : [];
  }, [defaultValue]);

  const handleValueChange = (newValues: string[]) => {
    if (isMultiple) {
      onValueChange?.(newValues);
    } else {
      onValueChange?.(newValues[0] ?? "");
    }
  };

  return (
    <ToggleGroupContext.Provider value={{ variant, size }}>
      <ToggleGroupPrimitive
        className={cn(toggleGroupVariants({ variant, size }), className)}
        multiple={isMultiple}
        value={formattedValue}
        defaultValue={formattedDefaultValue}
        onValueChange={handleValueChange}
        data-slot="toggle-group"
        {...props}
      >
        {children}
      </ToggleGroupPrimitive>
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps
  extends React.ComponentProps<typeof TogglePrimitive>,
    VariantProps<typeof toggleGroupItemVariants> {}

export function ToggleGroupItem({
  className,
  size,
  children,
  ...props
}: ToggleGroupItemProps): React.ReactElement {
  const context = React.useContext(ToggleGroupContext);
  const resolvedSize = size ?? context.size ?? "icon";

  return (
    <TogglePrimitive
      className={cn(toggleGroupItemVariants({ size: resolvedSize }), className)}
      data-slot="toggle-group-item"
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroupPrimitive, TogglePrimitive };
