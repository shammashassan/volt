"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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

interface CategoryActionsProps {
  categoryId: string
  categories: any[]
}

export function CategoryActions({ categoryId, categories }: CategoryActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
      <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto shrink-0">
        <Plus className="mr-2 h-4 w-4" />
        Add Resource
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
