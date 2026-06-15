"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ResourceForm } from "@/components/resource-form"
import { addResourceAction } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CategoryResourcesGrid } from "./category-resources-grid"
import { Resource } from "@/lib/data"
import { cn } from "@/lib/utils"

interface CategoryActionsProps {
  categoryId: string
  categories: any[]
  resources: Resource[]
  isAdmin: boolean
}

export function CategoryActions({ categoryId, categories, resources, isAdmin }: CategoryActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const router = useRouter()

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true)
    const result = await addResourceAction(formData)
    if (result.success) {
      toast.success("Resource added successfully")
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to add resource")
    }
    setIsLoading(false)
  }

  return (
    <>
      {/* Button row — sits inside the header flex */}
      {isAdmin && (
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode((v) => !v)}
            className={cn(
              "gap-2 transition-all",
              editMode && "ring-2 ring-primary/40 ring-offset-2"
            )}
          >
            <GripVertical className="size-4" />
            {editMode ? "Done Editing" : "Edit Layout"}
          </Button>

          <Button onClick={() => setIsOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add Resource
          </Button>
        </div>
      )}

      {/* 
        Full-width block: edit hint + grid.
        basis-full forces a new row inside the flex-wrap parent on the page.
      */}
      <div className="basis-full w-full flex flex-col gap-4 mt-6">
        {editMode && isAdmin && (
          <p className="text-[11px] text-muted-foreground/50 italic px-0">
            Drag cards to reorder · Click <span className="text-destructive/70">🗑</span> to delete
          </p>
        )}

        <CategoryResourcesGrid initialResources={resources} editMode={editMode && isAdmin} />
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] no-scrollbar">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              Add a new resource to this category.
            </DialogDescription>
          </DialogHeader>
          <ResourceForm
            initialData={{ category: categoryId }}
            onSubmit={onSubmit}
            isLoading={isLoading}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
