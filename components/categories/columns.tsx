"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Category } from "@/types"
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

export const columns = (
  onEdit: (category: Category) => void,
  onDelete: (id: string) => void
): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const iconName = row.original.icon
      const Icon = ICON_MAP[iconName || "Rocket"]
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
    accessorKey: "collectionId",
    header: "Collection",
    cell: ({ row }) => (
      <span className="capitalize text-xs font-semibold text-primary/80">
        {row.getValue("collectionId")}
      </span>
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
      const category = row.original
      const categoryId = category._id?.toString() || category.slug

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(categoryId)}
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
