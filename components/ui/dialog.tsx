"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Drawer as DrawerPrimitive } from "vaul"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean, details?: any) => void
  defaultOpen?: boolean
  children?: React.ReactNode
  responsive?: boolean
}

const DialogResponsiveContext = React.createContext<{
  isMobile: boolean
  responsive: boolean
}>({
  isMobile: false,
  responsive: true,
})

function Dialog({
  responsive = true,
  open,
  onOpenChange,
  children,
  ...props
}: DialogProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")

  if (isMobile && responsive) {
    return (
      <DialogResponsiveContext.Provider value={{ isMobile: true, responsive: true }}>
        <DrawerPrimitive.Root
          data-slot="dialog"
          open={open}
          onOpenChange={(nextOpen) => onOpenChange?.(nextOpen, { reason: "none" } as any)}
          {...props}
        >
          {children as React.ReactNode}
        </DrawerPrimitive.Root>
      </DialogResponsiveContext.Provider>
    )
  }

  return (
    <DialogResponsiveContext.Provider value={{ isMobile: false, responsive }}>
      <DialogPrimitive.Root
        data-slot="dialog"
        open={open}
        onOpenChange={onOpenChange}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogResponsiveContext.Provider>
  )
}

function DialogTrigger({
  render,
  children,
  ...props
}: any) {
  const { isMobile, responsive } = React.useContext(DialogResponsiveContext)
  if (isMobile && responsive) {
    if (render) {
      return (
        <DrawerPrimitive.Trigger asChild {...props}>
          {render}
        </DrawerPrimitive.Trigger>
      )
    }
    return <DrawerPrimitive.Trigger asChild {...props}>{children}</DrawerPrimitive.Trigger>
  }
  return <DialogPrimitive.Trigger render={render} {...props}>{children}</DialogPrimitive.Trigger>
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  render,
  children,
  ...props
}: any) {
  const { isMobile, responsive } = React.useContext(DialogResponsiveContext)
  if (isMobile && responsive) {
    if (render) {
      return (
        <DrawerPrimitive.Close asChild {...props}>
          {render}
        </DrawerPrimitive.Close>
      )
    }
    return <DrawerPrimitive.Close asChild {...props}>{children}</DrawerPrimitive.Close>
  }
  return <DialogPrimitive.Close render={render} {...props}>{children}</DialogPrimitive.Close>
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DrawerScrollBody({
  children,
  isP0 = false,
}: {
  children: React.ReactNode
  isP0?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Guarantee scroll position starts at the very top (header & first field)
    if (ref.current) {
      ref.current.scrollTop = 0
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain",
        isP0 ? "p-0" : "px-4 pb-8 pt-1"
      )}
    >
      {children}
    </div>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  const { isMobile, responsive } = React.useContext(DialogResponsiveContext)

  if (isMobile && responsive) {
    const { style, className: passedClassName, ...rest } = props as any
    const resolvedStyle = typeof style === "function" ? undefined : style
    const isP0 = passedClassName?.includes("p-0")

    // Filter out conflicting desktop classes so drawer root stays clean and overflow-hidden
    const cleanClassName = passedClassName
      ? passedClassName
          .replace(/\boverflow-y-auto\b/g, "")
          .replace(/\boverflow-auto\b/g, "")
          .replace(/\bmax-h-[^\s]+\b/g, "")
          .replace(/\bsm:max-w-[^\s]+\b/g, "")
      : ""

    return (
      <DrawerPrimitive.Portal data-slot="dialog-portal">
        <DrawerPrimitive.Overlay
          data-slot="dialog-overlay"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DrawerPrimitive.Content
          data-slot="dialog-content"
          style={resolvedStyle}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex h-auto max-h-[88dvh] flex-col rounded-t-2xl border-t bg-popover text-sm text-popover-foreground shadow-2xl outline-none overflow-hidden",
            cleanClassName
          )}
          {...rest}
        >
          {/* Top handle pill */}
          <div className="mx-auto mt-3 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />

          {/* Inner scroll container starting at top */}
          <DrawerScrollBody isP0={isP0}>
            {children as React.ReactNode}
          </DrawerScrollBody>

          {showCloseButton && (
            <DrawerPrimitive.Close
              asChild
              data-slot="dialog-close"
            >
              <Button
                variant="ghost"
                className="absolute top-3 right-3 z-50 rounded-full"
                size="icon-sm"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerPrimitive.Close>
          )}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    )
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            }
          />
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 mb-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const { isMobile, responsive } = React.useContext(DialogResponsiveContext)
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        isMobile && responsive
          ? "mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          : "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose
          render={
            <Button variant="outline">Close</Button>
          }
        />
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  const { isMobile, responsive } = React.useContext(DialogResponsiveContext)
  if (isMobile && responsive) {
    const { style, ...rest } = props as any
    const resolvedStyle = typeof style === "function" ? undefined : style
    return (
      <DrawerPrimitive.Title
        data-slot="dialog-title"
        style={resolvedStyle}
        className={cn(
          "font-heading text-base leading-none font-medium",
          className
        )}
        {...rest}
      />
    )
  }
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  const { isMobile, responsive } = React.useContext(DialogResponsiveContext)
  if (isMobile && responsive) {
    const { style, ...rest } = props as any
    const resolvedStyle = typeof style === "function" ? undefined : style
    return (
      <DrawerPrimitive.Description
        data-slot="dialog-description"
        style={resolvedStyle}
        className={cn(
          "text-sm text-muted-foreground",
          className
        )}
        {...rest}
      />
    )
  }
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
