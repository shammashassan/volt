"use client"

import * as React from "react"
import { useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Category } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Layers, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryForm } from "@/components/category-form"
import { addCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CategoriesContentProps {
  initialCategories: Category[]
}

export function CategoriesContent({ initialCategories: categories }: CategoriesContentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onEdit = (category: Category) => {
    setEditingCategory(category)
    setIsOpen(true)
  }

  const onDelete = (id: string) => {
    setCategoryToDelete(id)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    setIsLoading(true)
    const result = await deleteCategoryAction(categoryToDelete)
    if (result.success) {
      toast.success("Category deleted successfully")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete category")
    }
    setIsLoading(false)
    setCategoryToDelete(null)
  }

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true)

    if (editingCategory) {
      const data = {
        title: formData.get("title"),
        description: formData.get("description"),
        icon: formData.get("icon"),
        order: parseInt(formData.get("order") as string) || 0,
      }
      const result = await updateCategoryAction(editingCategory.id, data)
      if (result.success) {
        toast.success("Category updated successfully")
        setIsOpen(false)
        setEditingCategory(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update category")
      }
    } else {
      const result = await addCategoryAction(formData)
      if (result.success) {
        toast.success("Category added successfully")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add category")
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col @container/main">
      <div className="flex flex-col gap-4 px-4 py-8 md:gap-8 md:px-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Manage Categories
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {categories.length} <span className="hidden sm:inline ml-1">Categories</span>
                </Badge>
              </div>
            </div>
            <Button onClick={() => {
              setEditingCategory(null)
              setIsOpen(true)
            }}>
              <Plus className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Category</span>
            </Button>
          </div>
          <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
            Define the taxonomy for your UI repository.
          </p>
        </div>

        <Separator className="opacity-40" />

        <DataTable
          columns={columns(onEdit, onDelete)}
          data={categories}
          searchKey="title"
        />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update the details of this category." : "Create a new category for your resources."}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              initialData={editingCategory}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You won't be able to delete a category if it still contains resources.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  confirmDelete()
                }}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
