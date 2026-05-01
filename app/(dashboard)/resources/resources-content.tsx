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

interface ResourcesContentProps {
  initialResources: Resource[]
}

export function ResourcesContent({ initialResources }: ResourcesContentProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [isOpen, setIsOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onEdit = (resource: Resource) => {
    setEditingResource(resource)
    setIsOpen(true)
  }

  const onDelete = async (link: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    const result = await deleteResourceAction(link)
    if (result.success) {
      toast.success("Resource deleted successfully")
      router.refresh()
      setResources(resources.filter(r => r.link !== link))
    } else {
      toast.error(result.error || "Failed to delete resource")
    }
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
        // Wait a bit for server to update then reload or re-fetch
        setTimeout(() => window.location.reload(), 500)
      } else {
        toast.error(result.error || "Failed to update resource")
      }
    } else {
      const result = await addResourceAction(formData)
      if (result.success) {
        toast.success("Resource added successfully")
        setIsOpen(false)
        router.refresh()
        setTimeout(() => window.location.reload(), 500)
      } else {
        toast.error(result.error || "Failed to add resource")
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
                <Settings2 className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Manage Resources
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {resources.length} Resources
                </Badge>
              </div>
            </div>
            <Button onClick={() => {
              setEditingResource(null)
              setIsOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>
          <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
            Manage your curated collection of UI tools and libraries.
          </p>
        </div>

        <Separator className="opacity-40" />

        <DataTable
          columns={columns(onEdit, onDelete)}
          data={resources}
          searchKey="name"
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
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
