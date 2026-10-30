"use client"

import * as React from "react"
import { type Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-xs font-medium text-foreground", className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2"
            >
              <span>{title}</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDown data-icon="inline-end" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp data-icon="inline-end" />
              ) : (
                <ChevronsUpDown data-icon="inline-end" className="text-muted-foreground/70" />
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-36">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp />
              <span>Ascending</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown />
              <span>Descending</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                  <EyeOff />
                  <span>Hide Column</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
