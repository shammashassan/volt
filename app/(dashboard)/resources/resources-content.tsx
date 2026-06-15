"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { ResourceCard } from "@/components/resource-card"
import { Resource, Category, Project, Person, ResourceStatus, ResourceType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"
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
  Globe,
  FileText,
  Bookmark,
  Wrench,
} from "lucide-react"

// Inline brand icons replacement for compatibility with newer lucide-react package versions
const Youtube = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
)

const Github = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const Linkedin = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Instagram = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Facebook = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

interface ResourcesContentProps {
  initialResources: Resource[]
  categories: Category[]
  projects: Project[]
  people: Person[]
}

const RESOURCE_TYPES: { value: ResourceType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "website", label: "Website", icon: Globe },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "github", label: "GitHub", icon: Github },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "reddit", label: "Reddit", icon: Bookmark },
  { value: "article", label: "Article", icon: FileText },
  { value: "tool", label: "Tool", icon: Wrench },
]

const STATUS_OPTIONS: { value: ResourceStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "reviewing", label: "Reviewing" },
  { value: "using", label: "Using" },
  { value: "archived", label: "Archived" },
]

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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterFavorite, setFilterFavorite] = useState(false)

  // Sheet states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false) // toggle for adding new
  // Delete confirmation state: stores the resource to be deleted
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  // Form states (controlled)
  const [formTitle, setFormTitle] = useState("")
  const [formUrl, setFormUrl] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCategoryId, setFormCategoryId] = useState("none")
  const [formTags, setFormTags] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formWhySaved, setFormWhySaved] = useState("")
  const [formStatus, setFormStatus] = useState<ResourceStatus>("saved")
  const [formType, setFormType] = useState<ResourceType>("website")
  const [formFavorite, setFormFavorite] = useState(false)
  const [formProjectIds, setFormProjectIds] = useState<string[]>([])
  const [formPersonIds, setFormPersonIds] = useState<string[]>([])

  // Refresh local resources when props change
  React.useEffect(() => {
    setResources(initialResources)
  }, [initialResources])

  // Map filters
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
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

      const matchesType = filterType === "all" || resType === filterType
      const matchesStatus = filterStatus === "all" || resStatus === filterStatus
      const matchesFav = !filterFavorite || resFav

      return matchesSearch && matchesType && matchesStatus && matchesFav
    })
  }, [resources, searchQuery, filterType, filterStatus, filterFavorite])

  // Open sheet for edit
  const handleCardClick = async (resource: Resource) => {
    setSelectedResource(resource)
    setIsCreating(false)

    // Set form fields
    setFormTitle(resource.title || resource.name || "")
    setFormUrl(resource.url || resource.link || "")
    setFormDescription(resource.description || "")
    {
      const rawCatId = resource.categoryId || resource.category || "none"
      // Resolve to whichever value matches a SelectItem (cat._id or cat.id),
      // since older resources may store the legacy slug-style category id
      // while categories now expose a Mongo _id as well.
      const matchedCat = categories.find(
        (c) => (c._id?.toString() || c.id) === rawCatId || c.id === rawCatId || c._id?.toString() === rawCatId
      )
      setFormCategoryId(matchedCat ? (matchedCat.id || matchedCat._id?.toString() || "none") : (rawCatId || "none"))
    }
    setFormTags((resource.tags || []).join(", "))
    setFormNotes(resource.notes || "")
    setFormWhySaved(resource.whySaved || "")
    setFormStatus(resource.status || "saved")
    setFormType(resource.type || "website")
    setFormFavorite(!!(resource.favorite || resource.featured))
    setFormProjectIds(resource.projectIds || [])
    setFormPersonIds(resource.personIds || [])

    setIsDialogOpen(true)

    // Track view asynchronously
    const resId = resource._id?.toString() || resource.id
    if (resId) {
      trackResourceViewAction(resId).catch((err) => console.error(err))
    }
  }

  // Open sheet for create
  const handleOpenCreate = () => {
    setSelectedResource(null)
    setIsCreating(true)

    // Reset form fields
    setFormTitle("")
    setFormUrl("")
    setFormDescription("")
    setFormCategoryId("none")
    setFormTags("")
    setFormNotes("")
    setFormWhySaved("")
    setFormStatus("saved")
    setFormType("website")
    setFormFavorite(false)
    setFormProjectIds([])
    setFormPersonIds([])

    setIsDialogOpen(true)
  }

  // Save changes (Update or Create)
  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("Title is required")
      return
    }
    if (!formUrl.trim()) {
      toast.error("URL is required")
      return
    }

    setIsSaving(true)
    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "")

    const data: Record<string, unknown> = {
      title: formTitle,
      url: formUrl,
      description: formDescription,
      categoryId: formCategoryId === "none" ? undefined : formCategoryId,
      tags: tagsArray,
      notes: formNotes,
      whySaved: formWhySaved,
      status: formStatus,
      type: formType,
      favorite: formFavorite,
      projectIds: formProjectIds,
      personIds: formPersonIds,
      // old format compatibility
      name: formTitle,
      link: formUrl,
      category: formCategoryId === "none" ? undefined : formCategoryId,
      featured: formFavorite,
    }

    if (isCreating) {
      const result = await addResourceAction(data as unknown as Parameters<typeof addResourceAction>[0])
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
  const handleCardDelete = (resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget(resource)
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
                  Resources Library
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search title, description, tags..."
              className="pl-9 h-10 border-border/60 bg-background/50 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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

            {/* Favorites Toggle */}
            <Toggle
              pressed={filterFavorite}
              onPressedChange={setFilterFavorite}
              variant="outline"
            >
              <Star className={`size-3.5 ${filterFavorite ? "fill-current" : ""}`} />
              <span>Starred</span>
            </Toggle>
          </div>
        </div>
      </section>

      {/* Grid Display */}
      <section className="px-4 lg:px-6">
        {filteredResources.length === 0 ? (
          <Empty className="max-w-7xl py-24 border border-dashed rounded-3xl bg-card/10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Filter />
              </EmptyMedia>
              <EmptyTitle>No resources found</EmptyTitle>
              <EmptyDescription>
                Try resetting your filters.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
            {filteredResources.map((res, index) => (
              <ResourceCard
                key={res._id?.toString() || res.id}
                resource={{
                  ...res,
                  // enforce mapped properties for ResourceCard rendering
                  name: res.title || res.name || "",
                  link: res.url || res.link || "",
                }}
                priority={index < 6}
                onEdit={() => handleCardClick(res)}
                onDelete={(e) => handleCardDelete(res, e)}
              />
            ))}
          </div>
        )}
      </section>

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
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <DialogHeader>
              <DialogTitle>
                {isCreating ? "Add new resource" : formTitle || "Resource details"}
              </DialogTitle>
              <DialogDescription>
                {isCreating ? "Create a new entry in your knowledge graph." : "Edit parameters and link connections below."}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="flex-1 flex flex-col gap-5 py-2">
              {/* Title */}
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input
                  placeholder="React Component Library"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-background/40"
                />
              </Field>

              {/* URL */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>URL</FieldLabel>
                  {formUrl && (() => {
                    const targetUrl = /^(https?:)?\/\//i.test(formUrl) ? formUrl : `https://${formUrl}`
                    return (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        Open Link <ExternalLink className="size-2.5" />
                      </a>
                    )
                  })()}
                </div>
                <Input
                  placeholder="https://example.com"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="bg-background/40"
                />
              </Field>

              {/* Category, Type, Status & Favorite Row */}
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                    <SelectTrigger className="bg-background/40">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Uncategorized</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id || cat._id?.toString()} value={cat.id || cat._id?.toString() || ""}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={formType} onValueChange={(v) => setFormType(v as ResourceType)}>
                    <SelectTrigger className="bg-background/40">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ResourceStatus)}>
                    <SelectTrigger className="bg-background/40">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="flex flex-col justify-end">
                  <FieldLabel>Favorite</FieldLabel>
                  <Toggle
                    id="form-fav"
                    pressed={formFavorite}
                    onPressedChange={setFormFavorite}
                    variant="outline"
                    className="justify-start px-3 gap-2"
                  >
                    <Star className={`size-3.5 ${formFavorite ? "fill-current" : ""}`} />
                    <span className="text-xs font-medium">Favorite / Star</span>
                  </Toggle>
                </Field>
              </div>

              {/* Description */}
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  placeholder="A brief summary of the resource..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="bg-background/40"
                />
              </Field>

              {/* Why Saved */}
              <Field>
                <FieldLabel>Why Saved / Context</FieldLabel>
                <Textarea
                  placeholder="Why did you bookmark this? e.g. 'Use for landing page animation'"
                  value={formWhySaved}
                  onChange={(e) => setFormWhySaved(e.target.value)}
                  rows={2}
                  className="bg-background/40 animate-pulse-slow"
                />
              </Field>

              {/* Editable Notes */}
              <Field>
                <FieldLabel>Personal Notes</FieldLabel>
                <Textarea
                  placeholder="Add rich details, usage code snippets, setup rules..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={4}
                  className="bg-background/40 font-mono text-xs"
                />
              </Field>

              {/* Tags */}
              <Field>
                <FieldLabel>Tags (comma-separated)</FieldLabel>
                <Input
                  placeholder="react, tailwind, animation, ui"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="bg-background/40"
                />
              </Field>

              {/* Bidirectional Relationships Box */}
              <div className="flex flex-col gap-4 border border-border/40 rounded-xl p-4 bg-muted/20">
                {/* Link Projects */}
                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <Folder className="size-3 text-primary" /> Associated Projects
                  </FieldLabel>
                  <Combobox
                    multiple
                    autoHighlight
                    items={projects.map((p) => p._id?.toString() || p.id || "")}
                    value={formProjectIds}
                    onValueChange={setFormProjectIds}
                  >
                    <ComboboxChips ref={projectsAnchor} className="w-full">
                      <ComboboxValue>
                        {(values: string[]) => (
                          <React.Fragment>
                            {values.map((val) => {
                              const proj = projects.find((p) => (p._id?.toString() || p.id) === val)
                              return (
                                <ComboboxChip key={val}>
                                  {proj ? proj.name : val}
                                </ComboboxChip>
                              )
                            })}
                            <ComboboxChipsInput placeholder="Link projects..." />
                          </React.Fragment>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={projectsAnchor} className="z-50 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
                      <ComboboxEmpty>No projects found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: string) => {
                          const proj = projects.find((p) => (p._id?.toString() || p.id) === item)
                          return (
                            <ComboboxItem key={item} value={item}>
                              {proj ? proj.name : item}
                            </ComboboxItem>
                          )
                        }}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>

                {/* Link People */}
                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <User className="size-3 text-blue-500" /> Associated People
                  </FieldLabel>
                  <Combobox
                    multiple
                    autoHighlight
                    items={people.map((p) => p._id?.toString() || p.id || "")}
                    value={formPersonIds}
                    onValueChange={setFormPersonIds}
                  >
                    <ComboboxChips ref={peopleAnchor} className="w-full">
                      <ComboboxValue>
                        {(values: string[]) => (
                          <React.Fragment>
                            {values.map((val) => {
                              const person = people.find((p) => (p._id?.toString() || p.id) === val)
                              return (
                                <ComboboxChip key={val}>
                                  {person ? person.name : val}
                                </ComboboxChip>
                              )
                            })}
                            <ComboboxChipsInput placeholder="Link people..." />
                          </React.Fragment>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={peopleAnchor} className="z-50 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
                      <ComboboxEmpty>No people found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: string) => {
                          const person = people.find((p) => (p._id?.toString() || p.id) === item)
                          return (
                            <ComboboxItem key={item} value={item}>
                              {person ? person.name : item}
                            </ComboboxItem>
                          )
                        }}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              </div>
            </FieldGroup>

            <DialogFooter>
              {!isCreating && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  type="button"
                  className="gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </Button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || isDeleting} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isCreating ? "Create" : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
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