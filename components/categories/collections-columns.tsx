"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Collection } from "@/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table"
import { ICON_MAP } from "@/lib/icons"

export const collectionsColumns = (
  onEdit: (collection: Collection) => void,
  onDelete: (id: string) => void
): ColumnDef<Collection>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const iconName = row.original.icon
      const Icon = ICON_MAP[iconName || "Code"]
      return (
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border">
            {Icon ? <Icon className="size-4" /> : <MoreHorizontal className="size-4" />}
          </div>
          <span className="font-medium text-foreground">{row.getValue("name")}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "slug",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Slug / ID" />,
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
        {row.getValue("slug")}
      </code>
    )
  },
  {
    accessorKey: "order",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
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
      <p className="max-w-[300px] truncate text-muted-foreground text-sm">
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
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(collection)}>
                <Edit className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(collectionId)}
              >
                <Trash className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
