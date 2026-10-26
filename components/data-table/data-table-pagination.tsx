"use client"

import * as React from "react"
import { type Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(1, table.getPageCount())

  const items = pageSizeOptions.map((size) => ({
    label: String(size),
    value: String(size),
  }))

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border/40 bg-muted/10 text-xs text-muted-foreground">
      {/* Row count summary */}
      <div className="flex items-center gap-1.5 font-mono">
        {selectedCount > 0 ? (
          <span>
            <strong className="text-foreground">{selectedCount}</strong> of{" "}
            <strong className="text-foreground">{totalCount}</strong> row(s) selected
          </span>
        ) : (
          <span>
            Showing{" "}
            <strong className="text-foreground">
              {totalCount === 0 ? 0 : pageIndex * table.getState().pagination.pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-foreground">
              {Math.min((pageIndex + 1) * table.getState().pagination.pageSize, totalCount)}
            </strong>{" "}
            of <strong className="text-foreground">{totalCount}</strong> entries
          </span>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="font-medium whitespace-nowrap">Rows per page</span>
          <Select
            items={items}
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(val) => {
              if (val) table.setPageSize(Number(val))
            }}
          >
            <SelectTrigger size="sm" className="h-7 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="flex items-center justify-center font-mono font-medium whitespace-nowrap">
          Page {pageIndex + 1} of {pageCount}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
