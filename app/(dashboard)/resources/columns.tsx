"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Resource } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  onDelete: (link: string) => void
): ColumnDef<Resource>[] => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <a
          href={row.original.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-primary transition-colors"
        >
          {row.getValue("name")}
        </a>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        const variant = getCategoryVariant(category)
        return (
          <Badge variant={variant} appearance="outline" className="capitalize">
            {category}
          </Badge>
        )
      },
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getValue("featured") ? (
            <Badge variant="amber" appearance="outline">
              Featured
            </Badge>
          ) : (
            <Badge variant="gray" appearance="outline">
              Regular
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "link",
      header: "URL",
      cell: ({ row }) => {
        const link = row.getValue("link") as string
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-[200px] truncate text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {link}
          </a>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const resource = row.original

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
                onClick={() => onDelete(resource.link)}
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
