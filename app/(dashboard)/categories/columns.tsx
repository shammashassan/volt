"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ICON_MAP } from "@/lib/icons"
import Link from "next/link"

export const columns = (
  onEdit: (category: Category) => void,
  onDelete: (id: string) => void
): ColumnDef<Category>[] => [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const iconName = row.original.icon
        const Icon = ICON_MAP[iconName || "Rocket"]
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border">
              {Icon ? <Icon className="size-4" /> : <MoreHorizontal className="size-4" />}
            </div>
            <span className="font-medium">{row.getValue("title")}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "id",
      header: "ID / Slug",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
          {row.getValue("id")}
        </code>
      )
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {row.getValue("order")}
        </span>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <p className="max-w-[400px] truncate text-muted-foreground text-sm">
          {row.getValue("description")}
        </p>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/categories/${category.id || ""}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(category.id || "")}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
