"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}>({
  variant: "default",
  size: "default",
});

export const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground border border-input/40 dark:border-input/64 shadow-xs/5 gap-0.5",
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

export const tabsTabVariants = cva(
  "relative inline-flex items-center justify-center gap-1.5 rounded-md font-medium text-muted-foreground outline-none transition-all hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-selected:bg-background data-selected:text-foreground data-selected:shadow-xs dark:data-[state=active]:bg-card dark:data-selected:bg-card [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      size: {
        default: "h-7 sm:h-6 px-3 sm:px-2.5 text-sm sm:text-xs",
        sm: "h-6 sm:h-5 px-2 text-xs",
        lg: "h-8 sm:h-7 px-3.5 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export function Tabs({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: TabsProps): React.ReactElement {
  return (
    <TabsContext.Provider value={{ variant, size }}>
      <TabsPrimitive.Root className={cn("flex flex-col gap-4", className)} data-slot="tabs" {...props}>
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  );
}

export interface TabsListProps
  extends React.ComponentProps<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

export function TabsList({
  className,
  variant,
  size,
  children,
  ...props
}: TabsListProps): React.ReactElement {
  const context = React.useContext(TabsContext);
  const resolvedVariant = variant ?? context.variant ?? "default";
  const resolvedSize = size ?? context.size ?? "default";

  return (
    <TabsPrimitive.List
      className={cn(tabsListVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      data-slot="tabs-list"
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export interface TabsTabProps
  extends React.ComponentProps<typeof TabsPrimitive.Tab>,
    VariantProps<typeof tabsTabVariants> {}

export function TabsTab({
  className,
  size,
  children,
  ...props
}: TabsTabProps): React.ReactElement {
  const context = React.useContext(TabsContext);
  const resolvedSize = size ?? context.size ?? "default";

  return (
    <TabsPrimitive.Tab
      className={cn(tabsTabVariants({ size: resolvedSize }), className)}
      data-slot="tabs-tab"
      {...props}
    >
      {children}
    </TabsPrimitive.Tab>
  );
}

export interface TabsPanelProps extends React.ComponentProps<typeof TabsPrimitive.Panel> {}

export function TabsPanel({
  className,
  children,
  ...props
}: TabsPanelProps): React.ReactElement {
  return (
    <TabsPrimitive.Panel
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      data-slot="tabs-panel"
      {...props}
    >
      {children}
    </TabsPrimitive.Panel>
  );
}

export interface TabsIndicatorProps extends React.ComponentProps<typeof TabsPrimitive.Indicator> {}

export function TabsIndicator({ className, ...props }: TabsIndicatorProps): React.ReactElement {
  return (
    <TabsPrimitive.Indicator
      className={cn("bg-background shadow-xs dark:bg-card", className)}
      data-slot="tabs-indicator"
      {...props}
    />
  );
}

export { TabsTab as TabsTrigger, TabsPanel as TabsContent };
