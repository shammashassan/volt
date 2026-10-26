"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

const ResponsiveDialogContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
})

export function useResponsiveDialog() {
  return React.useContext(ResponsiveDialogContext)
}

export function ResponsiveDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useMediaQuery("(max-width: 767px)")

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile }}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  )
}

export function ResponsiveDialogTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { isMobile } = useResponsiveDialog()
  return isMobile ? (
    <DrawerTrigger className={className} {...props}>
      {children}
    </DrawerTrigger>
  ) : (
    <DialogTrigger className={className} {...props}>
      {children}
    </DialogTrigger>
  )
}

export function ResponsiveDialogClose({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { isMobile } = useResponsiveDialog()
  return isMobile ? (
    <DrawerClose className={className} {...props}>
      {children}
    </DrawerClose>
  ) : (
    <DialogClose className={className} {...props}>
      {children}
    </DialogClose>
  )
}

export function ResponsiveDialogContent({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
  showCloseButton?: boolean
}) {
  const { isMobile } = useResponsiveDialog()

  if (isMobile) {
    return (
      <DrawerContent
        className={cn(
          "px-4 pb-6 max-h-[85dvh] flex flex-col outline-none",
          className
        )}
      >
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent className={className}>
      {children}
    </DialogContent>
  )
}

export function ResponsiveDialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialog()
  return isMobile ? (
    <DrawerHeader className={cn("text-left px-0 pt-2", className)} {...props}>
      {children}
    </DrawerHeader>
  ) : (
    <DialogHeader className={className} {...props}>
      {children}
    </DialogHeader>
  )
}

export function ResponsiveDialogTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  const { isMobile } = useResponsiveDialog()
  return isMobile ? (
    <DrawerTitle className={className} {...props}>
      {children}
    </DrawerTitle>
  ) : (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  )
}

export function ResponsiveDialogDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { isMobile } = useResponsiveDialog()
  return isMobile ? (
    <DrawerDescription className={className} {...props}>
      {children}
    </DrawerDescription>
  ) : (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  )
}

export function ResponsiveDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("py-2 overflow-y-auto max-h-[60vh] no-scrollbar", className)}
      {...props}
    />
  )
}

export function ResponsiveDialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialog()
  return isMobile ? (
    <DrawerFooter className={cn("px-0 pt-3 mt-auto", className)} {...props}>
      {children}
    </DrawerFooter>
  ) : (
    <DialogFooter className={className} {...props}>
      {children}
    </DialogFooter>
  )
}

// Backwards-compatible convenience wrapper
export interface ResponsiveModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  contentClassName?: string
  showCloseButton?: boolean
}

export function ResponsiveModal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  showCloseButton = true,
}: ResponsiveModalProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <ResponsiveDialogTrigger>{trigger}</ResponsiveDialogTrigger>}
      <ResponsiveDialogContent
        showCloseButton={showCloseButton}
        className={cn(className, contentClassName)}
      >
        {(title || description) && (
          <ResponsiveDialogHeader>
            {title && <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>}
            {description && (
              <ResponsiveDialogDescription>{description}</ResponsiveDialogDescription>
            )}
          </ResponsiveDialogHeader>
        )}
        <ResponsiveDialogBody>{children}</ResponsiveDialogBody>
        {footer && <ResponsiveDialogFooter>{footer}</ResponsiveDialogFooter>}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export {
  ResponsiveDialogClose as ResponsiveModalClose,
  ResponsiveDialogFooter as ResponsiveModalFooter,
  ResponsiveDialogHeader as ResponsiveModalHeader,
  ResponsiveDialogTitle as ResponsiveModalTitle,
  ResponsiveDialogDescription as ResponsiveModalDescription,
}
