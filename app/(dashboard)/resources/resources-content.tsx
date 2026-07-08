"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { ResourceCard } from "@/components/resources/resource-card"
import { ResourceForm } from "@/components/resources/resource-form"

// ---------------------------------------------------------------------------
// Progressive rendering — only mount cards that are near / in the viewport.
// With 100+ resources, mounting all cards at once hammers the network with
// screenshot requests and creates a massive initial DOM. This hook renders
// BATCH_SIZE cards immediately and appends the next batch as the user scrolls
// to the sentinel element at the bottom of the list.
// ---------------------------------------------------------------------------
const BATCH_SIZE = 24

function useVirtualizedItems<T>(items: T[]) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Reset to first page whenever the list changes (filter / search)
  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [items])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, items.length))
  }, [items.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "400px" } // start loading 400 px before sentinel enters view
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    remaining: items.length - visibleCount,
    sentinelRef,
  }
}

import { Resource, Category, Project, Person, ResourceStatus, ResourceType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
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
  trackResourceViewAction
} from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Plus,
  Star,
  ExternalLink,
  Trash2,
  Save,
  Loader2,
  Folder,
  User,
  Layers,
} from "lucide-react"

import { RESOURCE_TYPES, STATUS_OPTIONS } from "@/components/resources/resource-types"
import { useQueryStates } from "nuqs"
import { resourceFilterParsers, getResourcesPageTitle } from "@/lib/resource-filters"

// ---------------------------------------------------------------------------
// ResourceGrid — renders filteredResources progressively using useVirtualizedItems
// ---------------------------------------------------------------------------
interface ResourceGridProps {
  filteredResources: (Resource & { name: string; link: string })[]
  handleCardClick: (resource: Resource) => void
  handleCardDelete: (resource: Resource, e: React.MouseEvent) => void
}

function ResourceGrid({ filteredResources, handleCardClick, handleCardDelete }: ResourceGridProps) {
  const { visibleItems, hasMore, remaining, sentinelRef } = useVirtualizedItems(filteredResources)

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
        {visibleItems.map((res, index) => (
          <ResourceCard
            key={res._id?.toString() || res.id}
            resource={res}
            priority={index < 6}
            onEdit={handleCardClick}
            onDelete={handleCardDelete}
          />
        ))}
      </div>

      {/* Sentinel + loading indicator — watched by IntersectionObserver */}
      {hasMore && (
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
  const projectsAnchor = useComboboxAnchor()
  const peopleAnchor = useComboboxAnchor()

  // Scopes and states
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [filters, setFilters] = useQueryStates(
    resourceFilterParsers,
    { history: 'replace', shallow: true }
  )

  const filterType = filters.type
  const filterStatus = filters.status
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

  // Sheet states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false) // toggle for adding new
  // Delete confirmation state: stores the resource to be deleted
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  // Refresh local resources when props change
  React.useEffect(() => {
    setResources(initialResources)
  }, [initialResources])

  // Map filters and map properties for rendering
  const filteredResources = useMemo(() => {
    return resources
      .filter((res) => {
        const title = (res.title || res.name || "").toLowerCase()
        const desc = (res.description || "").toLowerCase()
        const tagsString = (res.tags || []).join(" ").toLowerCase()
        const matchesSearch =
          title.includes(searchQuery.toLowerCase()) ||
          desc.includes(searchQuery.toLowerCase()) ||
          tagsString.includes(searchQuery.toLowerCase())

        const resType = res.type || "website"
        const resStatus = res.status || "saved"
        const resFav = !!(res.favorite || res.featured)

        const matchesType = !filterType || resType === filterType
        const matchesStatus = !filterStatus || resStatus === filterStatus
        const matchesFav = !filterFavorite || resFav

        const rawCatId = res.categoryId || res.category || "none"
        const matchedCat = categories.find(
          (c) => (c._id?.toString() || c.id) === rawCatId || c.id === rawCatId || c._id?.toString() === rawCatId
        )
        const resolvedCatId = matchedCat ? (matchedCat.id || matchedCat._id?.toString() || "none") : "none"

        const filterCategory = filters.category
        const matchesCategory = !filterCategory || resolvedCatId === filterCategory

        return matchesSearch && matchesType && matchesStatus && matchesFav && matchesCategory
      })
      .map((res) => ({
        ...res,
        name: res.title || res.name || "",
        link: res.url || res.link || "",
      }))
  }, [resources, searchQuery, filterType, filterStatus, filterFavorite, filters.category, categories])

  const pageTitle = getResourcesPageTitle({
    type: filterType,
    status: filterStatus,
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

  // Delete resource from card hover action — opens the AlertDialog
  const handleCardDelete = React.useCallback((resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget(resource)
  }, [])



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
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto shrink-0 gap-2 font-bold">
            <Plus className="size-4" />
            Add Resource
          </Button>
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
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Type Filter */}
            <Select value={filterType || "all"} onValueChange={(val) => setFilters({ type: val === "all" ? null : (val as ResourceType) })}>
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

            {/* Status Filter */}
            <Select value={filterStatus || "all"} onValueChange={(val) => setFilters({ status: val === "all" ? null : (val as ResourceStatus) })}>
              <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filters.category || "all"} onValueChange={(val) => setFilters({ category: val === "all" ? null : val })}>
              <SelectTrigger className="w-[160px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((cat) => {
                  const catId = cat.id || cat._id?.toString() || ""
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
            >
              <Star className={`size-3.5 ${filterFavorite ? "fill-current" : ""}`} />
              <span>Starred</span>
            </Toggle>
          </div>
        </div>
      </section>

      {/* Grid Display — progressively rendered in batches of BATCH_SIZE */}
      <ResourceGrid
        filteredResources={filteredResources}
        handleCardClick={handleCardClick}
        handleCardDelete={handleCardDelete}
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
              {isCreating ? "Add new resource" : selectedResource?.title || selectedResource?.name || "Resource details"}
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
                &ldquo;{deleteTarget?.title || deleteTarget?.name}&rdquo;
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
    </div>
  )
}