"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Resource } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"

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
      header: "Title",
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-primary transition-colors"
        >
          {row.getValue("title")}
        </a>
      ),
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("categoryId") as string
        const variant = getCategoryVariant(category)
        return (
          <Badge variant={variant} appearance="outline" className="capitalize">
            {category || "Uncategorized"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "favorite",
      header: "Favorite",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getValue("favorite") ? (
            <Badge variant="secondary">
              Favorite
            </Badge>
          ) : (
            <Badge variant="outline">
              Regular
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => {
        const url = row.getValue("url") as string
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-[200px] truncate text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {url}
          </a>
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
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(resourceId)}
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
