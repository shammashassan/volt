"use client"

import * as React from "react"
import { useState } from "react"
import { columns } from "./columns"
import { collectionsColumns } from "./collections-columns"
import { DataTable } from "./data-table"
import { Category, Collection } from "@/types"
import { Button } from "@/components/ui/button"
import { Layers, Plus, FolderHeart, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { CategoryFormFields } from "@/components/categories/category-form"
import { CollectionFormFields } from "@/components/collections/collection-form"
import {
  addCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  addCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
} from "@/lib/actions"
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
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CategoriesContentProps {
  initialCategories: Category[]
  initialCollections: Collection[]
}

export function CategoriesContent({
  initialCategories: categories,
  initialCollections: collections,
}: CategoriesContentProps) {
  // Category Dialog/State
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Collection Dialog/State
  const [isCollectionOpen, setIsCollectionOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("categories")
  const router = useRouter()

  // Category handlers
  const onEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsCategoryOpen(true)
  }

  const onDeleteCategory = (id: string) => {
    setCategoryToDelete(id)
  }

  const confirmDeleteCategory = async () => {
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

  const onCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingCategory) {
      const data: Record<string, any> = {
        name: formData.get("name"),
        description: formData.get("description"),
        icon: formData.get("icon"),
        order: parseInt(formData.get("order") as string) || 0,
        collectionId: formData.get("collectionId"),
      }
      const slug = formData.get("slug")
      if (slug) {
        data.slug = slug
      }
      const categoryId = editingCategory._id?.toString() || editingCategory.slug
      const result = await updateCategoryAction(categoryId, data)
      if (result.success) {
        toast.success("Category updated successfully")
        setIsCategoryOpen(false)
        setEditingCategory(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update category")
      }
    } else {
      const result = await addCategoryAction(formData)
      if (result.success) {
        toast.success("Category added successfully")
        setIsCategoryOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add category")
      }
    }
    setIsLoading(false)
  }

  // Collection handlers
  const onEditCollection = (collection: Collection) => {
    setEditingCollection(collection)
    setIsCollectionOpen(true)
  }

  const onDeleteCollection = (id: string) => {
    setCollectionToDelete(id)
  }

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return
    setIsLoading(true)
    const result = await deleteCollectionAction(collectionToDelete)
    if (result.success) {
      toast.success("Collection deleted successfully")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete collection")
    }
    setIsLoading(false)
    setCollectionToDelete(null)
  }

  const onCollectionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingCollection) {
      const data: Record<string, any> = {
        name: formData.get("name"),
        description: formData.get("description"),
        icon: formData.get("icon"),
        order: parseInt(formData.get("order") as string) || 0,
      }
      const slug = formData.get("slug")
      if (slug) {
        data.slug = slug
      }
      const collectionId = editingCollection._id?.toString() || editingCollection.slug
      const result = await updateCollectionAction(collectionId, data)
      if (result.success) {
        toast.success("Collection updated successfully")
        setIsCollectionOpen(false)
        setEditingCollection(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update collection")
      }
    } else {
      const result = await addCollectionAction(formData)
      if (result.success) {
        toast.success("Collection added successfully")
        setIsCollectionOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add collection")
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Taxonomy Manager
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Manage your collections and the category taxonomy under them.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {activeTab === "categories" ? (
              <Button
                onClick={() => {
                  setEditingCategory(null)
                  setIsCategoryOpen(true)
                }}
              >
                <Plus />
                Add Category
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditingCollection(null)
                  setIsCollectionOpen(true)
                }}
              >
                <Plus />
                Add Collection
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Tabbed section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="categories">
                <Layers />
                Categories
                <Badge variant="secondary" size="sm">
                  {categories.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="collections">
                <FolderHeart />
                Collections
                <Badge variant="secondary" size="sm">
                  {collections.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <DataTable
                columns={columns(onEditCategory, onDeleteCategory)}
                data={categories}
                searchKey="name"
              />
            </TabsContent>

            <TabsContent value="collections">
              <DataTable
                columns={collectionsColumns(onEditCollection, onDeleteCollection)}
                data={collections}
                searchKey="name"
              />
            </TabsContent>
          </Tabs>

          {/* Category Dialog */}
          <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] no-scrollbar">
              <form onSubmit={onCategorySubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                  <DialogDescription>
                    {editingCategory ? "Update the details of this category." : "Create a new category under a collection."}
                  </DialogDescription>
                </DialogHeader>
                <CategoryFormFields
                  initialData={editingCategory || undefined}
                  collections={collections}
                />
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCategoryOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Collection Dialog */}
          <Dialog open={isCollectionOpen} onOpenChange={setIsCollectionOpen}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] no-scrollbar">
              <form onSubmit={onCollectionSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCollection ? "Edit Collection" : "Add Collection"}</DialogTitle>
                  <DialogDescription>
                    {editingCollection ? "Update the details of this collection." : "Create a new collection space."}
                  </DialogDescription>
                </DialogHeader>
                <CollectionFormFields
                  initialData={editingCollection || undefined}
                />
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCollectionOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {editingCollection ? "Update Collection" : "Add Collection"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Category AlertDialog */}
          <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                  <Trash2 />
                </AlertDialogMedia>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. You won&apos;t be able to delete a category if it still contains resources.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    confirmDeleteCategory()
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Collection AlertDialog */}
          <AlertDialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                  <Trash2 />
                </AlertDialogMedia>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. You won&apos;t be able to delete a collection if it still contains categories.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    confirmDeleteCollection()
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  )
}
