"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Collection } from "@/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ICON_MAP } from "@/lib/icons"

export const collectionsColumns = (
  onEdit: (collection: Collection) => void,
  onDelete: (id: string) => void
): ColumnDef<Collection>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const iconName = row.original.icon
      const Icon = ICON_MAP[iconName || "Code"]
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border">
            {Icon ? <Icon className="size-4" /> : <MoreHorizontal className="size-4" />}
          </div>
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "slug",
    header: "Slug / ID",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
        {row.getValue("slug")}
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
      const collection = row.original
      const collectionId = collection._id?.toString() || collection.slug

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
            <DropdownMenuItem onClick={() => onEdit(collection)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(collectionId)}
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
