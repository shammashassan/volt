"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Resource } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/data-table"
import { MoreHorizontal, Pencil, Trash, ExternalLink } from "lucide-react"

const BADGE_VARIANTS = [
  "primary",
  "success",
  "warning",
  "info",
  "blue",
  "purple",
  "pink",
  "orange",
  "indigo",
  "green",
  "yellow",
  "cyan",
  "red",
  "teal",
  "violet",
  "emerald",
  "amber",
] as const

const getCategoryVariant = (category: string) => {
  if (!category) return "primary"
  const hash = category.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  const index = Math.abs(hash) % BADGE_VARIANTS.length
  return BADGE_VARIANTS[index]
}

export const columns = (
  onEdit: (resource: Resource) => void,
  onDelete: (id: string) => void
): ColumnDef<Resource>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const resource = row.original
      const title = resource.title
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{title}</span>
          {resource.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[280px]">
              {resource.description}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="URL" />,
    cell: ({ row }) => {
      const url = row.original.url
      if (!url) return <span className="text-muted-foreground text-xs">—</span>
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors max-w-[220px] truncate"
        >
          <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          <ExternalLink className="size-3 shrink-0 opacity-70" />
        </a>
      )
    },
  },
  {
    accessorKey: "categoryId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.original.categoryId
      if (!category) return null
      return (
        <Badge variant={getCategoryVariant(category) as any} className="capitalize text-xs font-semibold">
          {category}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const category = row.original.categoryId
      return value.includes(category)
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags || []
      if (!tags.length) return <span className="text-muted-foreground text-xs">—</span>
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
              #{tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const resource = row.original
      const resourceId = resource._id?.toString() || resource.id || ""

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
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Pencil className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(resourceId)}
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
