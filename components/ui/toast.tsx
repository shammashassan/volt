"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import type {
  ToastObject,
  ToastManagerAddOptions,
  ToastManagerUpdateOptions,
  ToastManagerEvent,
} from "@base-ui/react/toast"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// -----------------------------------------------------------------------------
// 1. Core Manager Initialization
// -----------------------------------------------------------------------------
const baseToast = ToastPrimitive.createToastManager()

// -----------------------------------------------------------------------------
// 2. Types & Interfaces
// -----------------------------------------------------------------------------
export type ToastOptions = Partial<ToastObject<any>> & {
  id?: string
  description?: React.ReactNode
}

export interface ToastPromiseOptions<T = any> {
  loading: React.ReactNode | ToastManagerUpdateOptions<any>
  success:
    | React.ReactNode
    | ToastManagerUpdateOptions<any>
    | ((data: T) => React.ReactNode | ToastManagerUpdateOptions<any>)
  error:
    | React.ReactNode
    | ToastManagerUpdateOptions<any>
    | ((err: any) => React.ReactNode | ToastManagerUpdateOptions<any>)
  description?: React.ReactNode
}

export interface ToastFn {
  (message: React.ReactNode, options?: ToastOptions): string
  success: (message: React.ReactNode, options?: ToastOptions) => string
  error: (message: React.ReactNode, options?: ToastOptions) => string
  info: (message: React.ReactNode, options?: ToastOptions) => string
  warning: (message: React.ReactNode, options?: ToastOptions) => string
  loading: (message: React.ReactNode, options?: ToastOptions) => string
  promise: <T>(
    promiseOrFn: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>
  ) => Promise<T>
  dismiss: (id?: string) => void
  close: (id?: string) => void
  update: <T extends object = any>(
    id: string,
    options:
      | ToastManagerUpdateOptions<T>
      | ((prevToast: ToastObject<T>) => ToastManagerUpdateOptions<T>)
  ) => void
  add: <T extends object = any>(options: ToastManagerAddOptions<T>) => string
  ' subscribe': (listener: (data: ToastManagerEvent) => void) => () => void
}

// -----------------------------------------------------------------------------
// 3. Argument & Option Resolution Helpers
// -----------------------------------------------------------------------------
function parseToastArgs(
  message: React.ReactNode,
  options?: ToastOptions
): ToastManagerAddOptions<any> {
  if (options?.description) {
    return {
      title: message,
      ...options,
    }
  }
  return {
    description: message,
    ...options,
  }
}

function resolvePromiseValue<Value>(
  opt:
    | React.ReactNode
    | ToastManagerUpdateOptions<any>
    | ((arg: Value) => React.ReactNode | ToastManagerUpdateOptions<any>),
  arg?: Value
): ToastManagerUpdateOptions<any> {
  const val = typeof opt === "function" ? (opt as any)(arg) : opt
  if (
    typeof val === "string" ||
    typeof val === "number" ||
    React.isValidElement(val)
  ) {
    return { description: val }
  }
  return val || {}
}

// -----------------------------------------------------------------------------
// 4. Augmented Toast Callable Object
// -----------------------------------------------------------------------------
function toastCallable(message: React.ReactNode, options?: ToastOptions): string {
  return baseToast.add(parseToastArgs(message, options))
}

export const toast: ToastFn = Object.assign(toastCallable, baseToast, {
  success: (message: React.ReactNode, options?: ToastOptions): string =>
    baseToast.add({
      ...parseToastArgs(message, options),
      type: "success",
    }),

  error: (message: React.ReactNode, options?: ToastOptions): string =>
    baseToast.add({
      ...parseToastArgs(message, options),
      type: "error",
    }),

  info: (message: React.ReactNode, options?: ToastOptions): string =>
    baseToast.add({
      ...parseToastArgs(message, options),
      type: "info",
    }),

  warning: (message: React.ReactNode, options?: ToastOptions): string =>
    baseToast.add({
      ...parseToastArgs(message, options),
      type: "warning",
    }),

  loading: (message: React.ReactNode, options?: ToastOptions): string =>
    baseToast.add({
      ...parseToastArgs(message, options),
      type: "loading",
      timeout: options?.timeout ?? 0,
    }),

  promise: <T,>(
    promiseOrFn: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>
  ): Promise<T> => {
    const promise = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn

    return baseToast.promise<T>(promise, {
      loading: resolvePromiseValue(options?.loading),
      success: (result: T) => {
        const resolved = resolvePromiseValue(options?.success, result)
        if (options?.description && !resolved.description) {
          resolved.description = options.description
        }
        return resolved
      },
      error: (err: any) => {
        const resolved = resolvePromiseValue(options?.error, err)
        if (options?.description && !resolved.description) {
          resolved.description = options.description
        }
        return resolved
      },
    })
  },

  dismiss: (id?: string): void => {
    baseToast.close(id)
  },

  close: (id?: string): void => {
    baseToast.close(id)
  },

  update: <T extends object = any>(
    id: string,
    options:
      | ToastManagerUpdateOptions<T>
      | ((prevToast: ToastObject<T>) => ToastManagerUpdateOptions<T>)
  ): void => {
    baseToast.update(id, options)
  },
})

// -----------------------------------------------------------------------------
// 5. Primitive Wrappers & UI Layout (Base Nova Style)
// -----------------------------------------------------------------------------
function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className
      )}
      {...props}
    >
      {children ?? <XIcon className="size-4" aria-hidden="true" />}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = <CircleCheckIcon className="size-4 text-green-500" aria-hidden="true" />
  }

  if (type === "info") {
    icon = <InfoIcon className="size-4 text-blue-500" aria-hidden="true" />
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon className="size-4 text-yellow-500" aria-hidden="true" />
  }

  if (type === "error") {
    icon = <OctagonXIcon className="size-4 text-destructive" aria-hidden="true" />
  }

  if (type === "loading") {
    icon = (
      <Loader2Icon
        className="size-4 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    )
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

// -----------------------------------------------------------------------------
// 6. Exports
// -----------------------------------------------------------------------------
const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastList,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
}
