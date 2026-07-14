"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { ResourceCard } from "@/components/resources/resource-card"
import { ResourceForm } from "@/components/resources/resource-form"
import { motion, AnimatePresence } from "motion/react"

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Progressive rendering hook
const BATCH_SIZE = 24

function useVirtualizedItems<T>(items: T[]) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [items])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, items.length))
  }, [items.length])

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (node) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              loadMore()
            }
          },
          { rootMargin: "400px" }
        )
        observer.observe(node)
        observerRef.current = observer
      }
    },
    [loadMore]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    remaining: items.length - visibleCount,
    sentinelRef,
  }
}

import { Resource, Category, Project, Person, ResourceType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  addResourceAction,
  updateResourceAction,
  deleteResourceAction,
  trackResourceViewAction,
  updateResourceOrdersAction
} from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Plus,
  Star,
  Trash2,
  Layers,
  ArrowUpDown,
  Check,
  GripVertical,
} from "lucide-react"

import { RESOURCE_TYPES } from "@/components/resources/resource-types"
import { useQueryStates } from "nuqs"
import { resourceFilterParsers, getResourcesPageTitle } from "@/lib/resource-filters"

// Sortable Card Wrapper Component
interface SortableCardProps {
  resource: Resource
  priority: boolean
  onEdit: (resource: Resource) => void
  onDelete: (resource: Resource, e: React.MouseEvent) => void
  isDraggingEnabled: boolean
}

function SortableCard({ resource, priority, onEdit, onDelete, isDraggingEnabled }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: resource._id?.toString() || resource.id || "",
    disabled: !isDraggingEnabled,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group transition-shadow"
    >
      <ResourceCard
        resource={resource}
        priority={priority}
        onEdit={onEdit}
        onDelete={onDelete}
        disableRedirect={isDraggingEnabled}
      />
      {isDraggingEnabled && (
        <>
          {/* Visual indicator (dashed border overlay) */}
          <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded-2xl pointer-events-none bg-primary/2 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 bg-background/90 text-primary border border-border px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-opacity flex items-center gap-1.5">
              <GripVertical className="size-3.5" />
              Drag handle to reorder
            </div>
          </div>

          {/* Dedicated Drag Handle Button */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-background/95 hover:bg-background border border-border/60 text-muted-foreground hover:text-foreground active:text-primary transition-all shadow-md cursor-grab active:cursor-grabbing z-50 touch-none"
            title="Drag to Reorder"
            aria-label="Drag to Reorder"
          >
            <GripVertical className="size-4" />
          </button>
        </>
      )}
    </div>
  )
}

interface ResourceGridProps {
  filteredResources: Resource[]
  handleCardClick: (resource: Resource) => void
  handleCardDelete: (resource: Resource, e: React.MouseEvent) => void
  isReorderActive: boolean
  onDragEnd: (event: DragEndEvent) => void
}

function ResourceGrid({
  filteredResources,
  handleCardClick,
  handleCardDelete,
  isReorderActive,
  onDragEnd,
}: ResourceGridProps) {
  const { visibleItems, hasMore, remaining, sentinelRef } = useVirtualizedItems(filteredResources)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Require dragging at least 8px to differentiate from click
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8, // Differentiate dragging from tap on mobile
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (filteredResources.length === 0) {
    return (
      <section className="px-4 lg:px-6">
        <Empty className="max-w-7xl py-24 border border-dashed rounded-3xl bg-card/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Filter />
            </EmptyMedia>
            <EmptyTitle>No resources found</EmptyTitle>
            <EmptyDescription>Try resetting your filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    )
  }

  return (
    <section className="px-4 lg:px-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={visibleItems.map((r) => r._id?.toString() || r.id || "")}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
            {visibleItems.map((res, index) => (
              <SortableCard
                key={res._id?.toString() || res.id}
                resource={res}
                priority={index < 6}
                onEdit={handleCardClick}
                onDelete={handleCardDelete}
                isDraggingEnabled={isReorderActive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Sentinel + loading indicator */}
      {hasMore && !isReorderActive && (
        <div ref={sentinelRef} className="max-w-7xl mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: Math.min(3, remaining) }).map((_, i) => (
              <div key={i} className="border border-border/40 bg-card/60 rounded-xl overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="px-4 py-3 flex flex-col gap-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground/50 mt-4">
            {remaining} more resource{remaining !== 1 ? "s" : ""}…
          </p>
        </div>
      )}
    </section>
  )
}

interface ResourcesContentProps {
  initialResources: Resource[]
  categories: Category[]
  projects: Project[]
  people: Person[]
}

export function ResourcesContent({
  initialResources,
  categories,
  projects,
  people,
}: ResourcesContentProps) {
  const router = useRouter()

  // Scopes and states
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [isReorderActive, setIsReorderActive] = useState(false)
  const [filters, setFilters] = useQueryStates(
    resourceFilterParsers,
    { history: 'replace', shallow: true }
  )

  const filterType = filters.type
  const filterFavorite = filters.favorite
  const searchQuery = filters.q || ""

  // Local input state to prevent typing lag
  const [searchValue, setSearchValue] = useState(searchQuery)

  // Debouncing search updates to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({ q: searchValue || null })
    }, 300)
    return () => clearTimeout(handler)
  }, [searchValue, setFilters])

  // Sync local search input value if URL changes externally
  useEffect(() => {
    setSearchValue(filters.q || '')
  }, [filters.q])

  // Reset reorder mode if category filter is cleared
  useEffect(() => {
    if (!filters.category) {
      setIsReorderActive(false)
    }
  }, [filters.category])

  // Sheet states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  // Refresh local resources when props change
  React.useEffect(() => {
    setResources(initialResources)
  }, [initialResources])

  // Map filters and map properties for rendering
  const filteredResources = useMemo(() => {
    const filtered = resources.filter((res) => {
      const title = (res.title || "").toLowerCase()
      const desc = (res.description || "").toLowerCase()
      const tagsString = (res.tags || []).join(" ").toLowerCase()
      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase()) ||
        tagsString.includes(searchQuery.toLowerCase())

      const resType = res.type || "website"
      const resFav = !!res.favorite

      const matchesType = !filterType || resType === filterType
      const matchesFav = !filterFavorite || resFav

      const resolvedCatId = res.categoryId || "none"
      const filterCategory = filters.category
      const matchesCategory = !filterCategory || resolvedCatId === filterCategory

      return matchesSearch && matchesType && matchesFav && matchesCategory
    })

    // Sort order:
    // If inside a specific category filter, sort by manual 'order' ASC, then by 'createdAt' DESC
    if (filters.category) {
      filtered.sort((a, b) => {
        const orderDiff = (a.order ?? 0) - (b.order ?? 0)
        if (orderDiff !== 0) return orderDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    } else {
      // If in library overview, sort by 'createdAt' DESC
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [resources, searchQuery, filterType, filterFavorite, filters.category])

  const pageTitle = getResourcesPageTitle({
    type: filterType,
    favorite: filterFavorite ?? undefined,
    category: filters.category,
    q: searchQuery
  }, categories)

  // Open sheet for edit
  const handleCardClick = React.useCallback(async (resource: Resource) => {
    setSelectedResource(resource)
    setIsCreating(false)
    setIsDialogOpen(true)

    // Track view asynchronously
    const resId = resource._id?.toString() || resource.id
    if (resId) {
      trackResourceViewAction(resId).catch((err) => console.error(err))
    }
  }, [])

  // Open sheet for create
  const handleOpenCreate = () => {
    setSelectedResource(null)
    setIsCreating(true)
    setIsDialogOpen(true)
  }

  // Save changes (Update or Create)
  const handleSave = async (data: any) => {
    setIsSaving(true)
    if (isCreating) {
      const result = await addResourceAction(data)
      if (result.success) {
        toast.success("Resource created successfully")
        setIsDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create resource")
      }
    } else {
      const resId = selectedResource?._id?.toString() || selectedResource?.id
      if (!resId) {
        toast.error("No resource selected")
        setIsSaving(false)
        return
      }
      const result = await updateResourceAction(resId, data)
      if (result.success) {
        toast.success("Resource updated successfully")
        setIsDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update resource")
      }
    }
    setIsSaving(false)
  }

  // Delete resource — opens the AlertDialog
  const handleDelete = () => {
    if (!selectedResource) return
    setDeleteTarget(selectedResource)
  }

  // Confirmed delete (called by AlertDialog action button)
  const confirmDeleteResource = async () => {
    if (!deleteTarget) return
    const resId = deleteTarget._id?.toString() || deleteTarget.id
    if (!resId) return

    setIsDeleting(true)
    const result = await deleteResourceAction(resId)
    if (result.success) {
      toast.success("Resource deleted successfully")
      setDeleteTarget(null)
      setIsDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete resource")
    }
    setIsDeleting(false)
  }

  // Delete resource from card hover action
  const handleCardDelete = React.useCallback((resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget(resource)
  }, [])

  // Drag to reorder handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = filteredResources.findIndex((r) => (r._id?.toString() || r.id) === active.id)
    const newIndex = filteredResources.findIndex((r) => (r._id?.toString() || r.id) === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reorderedFiltered = arrayMove(filteredResources, oldIndex, newIndex)

    // Calculate sequential order indices
    const updates = reorderedFiltered.map((r, index) => ({
      id: r._id?.toString() || r.id || "",
      order: index,
    }))

    // Optimistic UI Update
    setResources((prev) => {
      const updated = [...prev]
      updates.forEach((u) => {
        const idx = updated.findIndex((r) => (r._id?.toString() || r.id) === u.id)
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], order: u.order }
        }
      })
      return updated
    })

    const result = await updateResourceOrdersAction(updates)
    if (result.success) {
      toast.success("Resource order updated")
    } else {
      toast.error(result.error || "Failed to update resource order")
      router.refresh()
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  {pageTitle}
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {filteredResources.length} Items
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Curate, search, filter, and link resources to your active projects and developer network.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {filters.category && (
              <Toggle
                pressed={isReorderActive}
                onPressedChange={setIsReorderActive}
                variant="outline"
              >
                {isReorderActive ? <Check /> : <ArrowUpDown />}
                <span>{isReorderActive ? "Done Ordering" : "Reorder Mode"}</span>
              </Toggle>
            )}
            <Button onClick={handleOpenCreate}>
              <Plus />
              Add Resource
            </Button>
          </div>
        </div>
      </section>

      {/* Filter and search bar */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          {/* Search */}
          <div className="relative flex-1">
            <Input
              placeholder="Search title, description, tags..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={isReorderActive}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Type Filter */}
            <Select
              value={filterType || "all"}
              onValueChange={(val) => setFilters({ type: val === "all" ? null : (val as ResourceType) })}
              disabled={isReorderActive}
            >
              <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filters.category || "all"}
              onValueChange={(val) => setFilters({ category: val === "all" ? null : val })}
              disabled={isReorderActive}
            >
              <SelectTrigger className="w-[160px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((cat) => {
                  const catId = cat.slug
                  return (
                    <SelectItem key={catId} value={catId}>
                      {cat.name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Favorites Toggle */}
            <Toggle
              pressed={filterFavorite || false}
              onPressedChange={(pressed) => setFilters({ favorite: pressed || null })}
              variant="outline"
              disabled={isReorderActive}
            >
              <Star className={`size-3.5 ${filterFavorite ? "fill-current" : ""}`} />
              <span>Starred</span>
            </Toggle>
          </div>
        </div>
      </section>

      {/* Grid Display */}
      <ResourceGrid
        filteredResources={filteredResources}
        handleCardClick={handleCardClick}
        handleCardDelete={handleCardDelete}
        isReorderActive={isReorderActive}
        onDragEnd={handleDragEnd}
      />

      {/* Drawer / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] no-scrollbar"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement
            if (target?.closest && target.closest('[data-slot^="combobox-"]')) {
              e.preventDefault()
            }
          }}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement
            if (target?.closest && target.closest('[data-slot^="combobox-"]')) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Add new resource" : selectedResource?.title || "Resource details"}
            </DialogTitle>
            <DialogDescription>
              {isCreating ? "Create a new entry in your knowledge graph." : "Edit parameters and link connections below."}
            </DialogDescription>
          </DialogHeader>

          <ResourceForm
            key={selectedResource?._id?.toString() || selectedResource?.id || "new"}
            initialData={selectedResource}
            categories={categories}
            projects={projects}
            people={people}
            onSubmit={handleSave}
            isLoading={isSaving}
            onCancel={() => setIsDialogOpen(false)}
            onDelete={selectedResource ? handleDelete : undefined}
            isDeleting={isDeleting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>{" "}
              from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => { e.preventDefault(); confirmDeleteResource() }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {isReorderActive && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-4 px-4 py-2.5 bg-card/90 backdrop-blur-md border border-primary/20 shadow-xl rounded-full"
          >
            <div className="flex items-center gap-2 pl-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <p className="text-xs font-semibold text-foreground/90 whitespace-nowrap">
                Reordering Active
              </p>
            </div>
            <div className="h-4 w-px bg-border" />
            <Button
              size="sm"
              onClick={() => setIsReorderActive(false)}
              className="h-8 rounded-full px-4 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Check className="size-3.5 mr-1" />
              Done Ordering
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}