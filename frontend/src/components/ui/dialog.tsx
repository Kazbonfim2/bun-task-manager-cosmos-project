"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { XIcon } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const DialogCreateHandle: typeof DialogPrimitive.createHandle =
  DialogPrimitive.createHandle;

export const Dialog: typeof DialogPrimitive.Root = DialogPrimitive.Root;

export const DialogPortal: typeof DialogPrimitive.Portal =
  DialogPrimitive.Portal;

export function DialogTrigger(
  props: DialogPrimitive.Trigger.Props,
): React.ReactElement {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogClose(
  props: DialogPrimitive.Close.Props,
): React.ReactElement {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      data-slot="dialog-backdrop"
      {...props}
    />
  );
}

export function DialogViewport({
  className,
  variant = "sheet",
  ...props
}: DialogPrimitive.Viewport.Props & {
  variant?: "sheet" | "centered" | "fullscreen";
}): React.ReactElement {
  return (
    <DialogPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-50 flex justify-center p-0",
        variant === "sheet" && "items-end sm:items-center sm:p-4",
        variant === "centered" && "items-center p-4",
        variant === "fullscreen" && "items-stretch sm:items-center sm:p-4",
        className,
      )}
      data-slot="dialog-viewport"
      {...props}
    />
  );
}

export function DialogHandle({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "sm:hidden flex items-center justify-center pt-2.5 pb-1 shrink-0 select-none",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="h-1.5 w-10 rounded-full bg-muted-foreground/25" />
    </div>
  );
}

export function DialogPopup({
  className,
  children,
  showCloseButton = true,
  variant = "sheet",
  showHandle = true,
  bottomStickOnMobile,
  closeProps,
  portalProps,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  variant?: "sheet" | "centered" | "fullscreen";
  showHandle?: boolean;
  bottomStickOnMobile?: boolean;
  closeProps?: DialogPrimitive.Close.Props;
  portalProps?: DialogPrimitive.Portal.Props;
}): React.ReactElement {
  const activeVariant: "sheet" | "centered" | "fullscreen" =
    bottomStickOnMobile === false ? "centered" : variant;

  return (
    <DialogPortal {...portalProps}>
      <DialogBackdrop />
      <DialogViewport variant={activeVariant}>
        <DialogPrimitive.Popup
          className={cn(
            "relative flex flex-col w-full bg-popover text-popover-foreground shadow-2xl outline-hidden transition-all duration-200 ease-out overflow-hidden",

            // Desktop comum: Modal centralizado elegante
            "sm:max-w-lg sm:rounded-2xl sm:border sm:max-h-[88vh] sm:origin-center sm:scale-100",
            "sm:data-starting-style:scale-95 sm:data-starting-style:opacity-0 sm:data-ending-style:scale-95 sm:data-ending-style:opacity-0",

            // Mobile Variant: Sheet (Bottom Sheet padrão moderno)
            activeVariant === "sheet" && [
              "max-sm:max-h-[88dvh] max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-t max-sm:border-x-0 max-sm:border-b-0",
              "max-sm:origin-bottom",
              "max-sm:data-starting-style:translate-y-full max-sm:data-ending-style:translate-y-full",
            ],

            // Mobile Variant: Centered (para alertas e confirmações)
            activeVariant === "centered" && [
              "max-sm:max-w-[calc(100vw-2rem)] max-sm:rounded-2xl max-sm:border max-sm:max-h-[85dvh] max-sm:my-auto",
              "max-sm:data-starting-style:scale-95 max-sm:data-starting-style:opacity-0 sm:max-w-md",
            ],

            // Mobile Variant: Fullscreen (para telas muito complexas)
            activeVariant === "fullscreen" && [
              "max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none max-sm:border-0",
            ],

            className,
          )}
          data-slot="dialog-popup"
          {...props}
        >
          {activeVariant === "sheet" && showHandle && <DialogHandle />}

          {children}

          {showCloseButton && (
            <DialogPrimitive.Close
              aria-label="Fechar"
              className="absolute end-3 top-3 z-10"
              render={<Button size="icon-sm" variant="ghost" className="rounded-full" />}
              {...closeProps}
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogViewport>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  const defaultProps = {
    className: cn(
      "flex flex-col gap-1 p-4 sm:p-6 shrink-0 in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pb-2 sm:in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pb-3",
      className,
    ),
    "data-slot": "dialog-header",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export function DialogFooter({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  variant?: "default" | "bare";
}): React.ReactElement {
  const defaultProps = {
    className: cn(
      "shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 py-3 sm:px-6 sm:py-4 sm:rounded-b-[calc(var(--radius-2xl)-1px)] max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]",
      variant === "default" && "border-t bg-muted/60 dark:bg-muted/40",
      variant === "bare" &&
        "in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pt-2 pt-3 pb-4 sm:pb-6",
      className,
    ),
    "data-slot": "dialog-footer",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props): React.ReactElement {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-semibold text-lg sm:text-xl leading-tight tracking-tight",
        className,
      )}
      data-slot="dialog-title"
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props): React.ReactElement {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-xs sm:text-sm", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export function DialogPanel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  const defaultProps = {
    className: cn(
      "flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-header])]:pt-1 in-[[data-slot=dialog-popup]:has([data-slot=dialog-footer]:not(.border-t))]:pb-1",
      className,
    ),
    "data-slot": "dialog-panel",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export {
  DialogPrimitive,
  DialogBackdrop as DialogOverlay,
  DialogPopup as DialogContent,
};
