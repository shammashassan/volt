"use client"

import * as React from "react"
import { useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Resource } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Settings2, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ResourceForm } from "@/components/resource-form"
import { addResourceAction, deleteResourceAction, updateResourceAction } from "@/lib/actions"
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

interface ResourcesContentProps {
  initialResources: Resource[]
  categories: any[]
}

export function ResourcesContent({ initialResources: resources, categories }: ResourcesContentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onEdit = (resource: Resource) => {
    setEditingResource(resource)
    setIsOpen(true)
  }

  const onDelete = (link: string) => {
    setResourceToDelete(link)
  }

  const confirmDelete = async () => {
    if (!resourceToDelete) return
    setIsLoading(true)
    const result = await deleteResourceAction(resourceToDelete)
    if (result.success) {
      toast.success("Resource deleted successfully")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete resource")
    }
    setIsLoading(false)
    setResourceToDelete(null)
  }

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true)

    if (editingResource) {
      const data = {
        name: formData.get("name"),
        link: formData.get("link"),
        description: formData.get("description"),
        category: formData.get("category"),
        featured: formData.get("featured") === "on"
      }
      const result = await updateResourceAction(editingResource.link, data)
      if (result.success) {
        toast.success("Resource updated successfully")
        setIsOpen(false)
        setEditingResource(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update resource")
      }
    } else {
      const result = await addResourceAction(formData)
      if (result.success) {
        toast.success("Resource added successfully")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add resource")
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col @container/main">
      <div className="flex flex-col gap-4 px-4 py-8 md:gap-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings2 className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Manage Resources
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {resources.length} <span className="hidden sm:inline ml-1">Resources</span>
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Manage your curated collection of UI tools and libraries.
            </p>
          </div>
          <Button onClick={() => {
            setEditingResource(null)
            setIsOpen(true)
          }} className="w-full sm:w-auto shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </div>

        <Separator className="opacity-40" />

        <DataTable
          columns={columns(onEdit, onDelete)}
          data={resources}
          searchKey="name"
          categoryOptions={categories.map(c => ({ label: c.title, value: c.id }))}
        />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
              <DialogDescription>
                {editingResource ? "Update the details of this resource." : "Add a new resource to your second brain."}
              </DialogDescription>
            </DialogHeader>
            <ResourceForm
              initialData={editingResource}
              onSubmit={onSubmit}
              isLoading={isLoading}
              categories={categories}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && setResourceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the resource
                from your database.
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
