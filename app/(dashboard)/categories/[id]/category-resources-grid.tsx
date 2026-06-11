"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { Resource } from "@/lib/data"
import { ResourceCard } from "@/components/resource-card"
import { GripVertical, Trash2, Loader2 } from "lucide-react"
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
import { updateResourceOrdersAction, deleteResourceAction } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// ——————————————————————————————————————————
// Sortable card wrapper (used in edit mode)
// ——————————————————————————————————————————
function SortableResourceCard({
  resource,
  onDelete,
  isDeletingLink,
  priority = false,
}: {
  resource: Resource
  onDelete: (link: string) => void
  isDeletingLink: string | null
  priority?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource.link })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {/* Drag handle — matches resource-card overlay button style */}
      <button
        type="button"
        className="absolute top-2 left-2 z-10 flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-lg bg-background/80 hover:bg-background border border-border/40 backdrop-blur-xs text-muted-foreground hover:text-foreground shadow-xs transition-all sm:opacity-0 sm:group-hover/sortable:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-3.5" />
      </button>

      {/* Delete button — matches resource-card overlay delete style */}
      <button
        type="button"
        onClick={() => onDelete(resource.link)}
        disabled={isDeletingLink === resource.link}
        className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/80 hover:bg-destructive border border-destructive/20 backdrop-blur-xs text-destructive-foreground shadow-xs transition-all sm:opacity-0 sm:group-hover/sortable:opacity-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        aria-label={`Delete ${resource.name}`}
      >
        {isDeletingLink === resource.link ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
      </button>

      {/* Non-interactive card in edit mode */}
      <div className={cn("pointer-events-none select-none", isDragging && "ring-2 ring-primary ring-offset-2 rounded-xl")}>
        <ResourceCard resource={resource} priority={priority} />
      </div>
    </div>
  )
}

// ——————————————————————————————————————————
// Main grid component
// ——————————————————————————————————————————
interface CategoryResourcesGridProps {
  initialResources: Resource[]
  editMode: boolean
}

export function CategoryResourcesGrid({ initialResources, editMode }: CategoryResourcesGridProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeletingLink, setIsDeletingLink] = useState<string | null>(null)
  const router = useRouter()

  // Synchronize state with props when Server Component re-renders
  React.useEffect(() => {
    setResources(initialResources)
  }, [initialResources])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = resources.findIndex((r) => r.link === active.id)
      const newIndex = resources.findIndex((r) => r.link === over.id)
      const reordered = arrayMove(resources, oldIndex, newIndex)

      // Optimistic update
      setResources(reordered)
      setIsSaving(true)

      const updates = reordered.map((r, i) => ({ link: r.link, order: i }))
      const result = await updateResourceOrdersAction(updates)

      if (result.success) {
        toast.success("Order saved")
      } else {
        toast.error("Failed to save order")
        setResources(resources) // rollback
      }
      setIsSaving(false)
    },
    [resources]
  )

  const handleDelete = useCallback((link: string) => {
    setDeleteTarget(link)
  }, [])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeletingLink(deleteTarget)
    setDeleteTarget(null)

    const result = await deleteResourceAction(deleteTarget)
    if (result.success) {
      setResources((prev) => prev.filter((r) => r.link !== deleteTarget))
      toast.success("Resource deleted")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete resource")
    }
    setIsDeletingLink(null)
  }

  const activeResource = resources.find((r) => r.link === activeId)

  if (resources.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold text-muted-foreground">No resources yet.</p>
        <p className="text-sm text-muted-foreground/60">We're still curating the best tools for this section.</p>
      </div>
    )
  }

  if (!editMode) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource, index) => (
          <ResourceCard key={resource.link} resource={resource} priority={index < 6} />
        ))}
      </div>
    )
  }

  return (
    <>
      {isSaving && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 animate-pulse">
          <Loader2 className="size-3 animate-spin" />
          Saving order…
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={resources.map((r) => r.link)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <SortableResourceCard
                key={resource.link}
                resource={resource}
                onDelete={handleDelete}
                isDeletingLink={isDeletingLink}
                priority={index < 6}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeResource && (
            <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
              <ResourceCard resource={activeResource} priority={true} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The resource will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => { e.preventDefault(); confirmDelete() }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
