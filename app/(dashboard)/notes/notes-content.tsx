"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { Note, Resource, Project, Person } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { addNoteAction, updateNoteAction, deleteNoteAction } from "@/lib/actions"
import {
  Pin,
  Search,
  Plus,
  Trash2,
  Save,
  FileText,
  Tag,
  Link as LinkIcon,
  Folder,
  User,
  Eye,
  PenBox,
  ArrowLeft,
  CalendarDays,
  BookOpen,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NotesContentProps {
  initialNotes: Note[]
  resources: Resource[]
  projects: Project[]
  people: Person[]
}

export function NotesContent({
  initialNotes,
  resources,
  projects,
  people,
}: NotesContentProps) {
  const router = useRouter()
  const resourcesAnchor = useComboboxAnchor()
  const projectsAnchor = useComboboxAnchor()
  const peopleAnchor = useComboboxAnchor()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  // Mobile-only: tracks which "screen" is active — list or detail
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  // null = not yet measured (pre-hydration). Only one layout tree mounts
  // once this resolves, preventing both panels from rendering simultaneously.
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Lock page scroll while the notes view is mounted so the viewport-locked
  // layout doesn't bleed through the parent layout's min-h-screen container.
  // Also reset any scroll position carried over from the previous page.
  useEffect(() => {
    const prev = document.body.style.overflow
    window.scrollTo(0, 0)
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  const [formTitle, setFormTitle] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formTags, setFormTags] = useState("")
  const [formPinned, setFormPinned] = useState(false)
  const [formRelatedResources, setFormRelatedResources] = useState<string[]>([])
  const [formRelatedProjects, setFormRelatedProjects] = useState<string[]>([])
  const [formRelatedPeople, setFormRelatedPeople] = useState<string[]>([])

  React.useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    notes.forEach((note) => {
      ; (note.tags || []).forEach((t: string) => {
        if (t.trim()) tagsSet.add(t.trim())
      })
    })
    return Array.from(tagsSet).sort()
  }, [notes])

  const filteredNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      const matchesSearch =
        (note.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content || "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTag = !selectedTag || (note.tags || []).includes(selectedTag)
      return matchesSearch && matchesTag
    })
    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [notes, searchQuery, selectedTag])

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setIsCreating(false)
    setIsEditing(false)
    setEditorMode("write")
    setFormTitle(note.title || "")
    setFormContent(note.content || "")
    setFormTags((note.tags || []).join(", "))
    setFormPinned(!!note.pinned)
    setFormRelatedResources(note.relatedResources || [])
    setFormRelatedProjects(note.relatedProjects || [])
    setFormRelatedPeople(note.relatedPeople || [])
    setMobileDetailOpen(true)
  }

  const handleOpenCreate = () => {
    setSelectedNote(null)
    setIsCreating(true)
    setIsEditing(true)
    setEditorMode("write")
    setFormTitle("")
    setFormContent("")
    setFormTags("")
    setFormPinned(false)
    setFormRelatedResources([])
    setFormRelatedProjects([])
    setFormRelatedPeople([])
    setMobileDetailOpen(true)
  }

  // Go back to list on mobile; cancel edit/create on desktop
  const handleBack = () => {
    if (isCreating) {
      setIsCreating(false)
      setIsEditing(false)
    } else if (isEditing) {
      setIsEditing(false)
    } else {
      setSelectedNote(null)
    }
    setMobileDetailOpen(false)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("Note title is required")
      return
    }
    setIsSaving(true)
    const tagsArray = formTags.split(",").map((t) => t.trim()).filter((t) => t !== "")
    const data = {
      title: formTitle,
      content: formContent,
      tags: tagsArray,
      pinned: formPinned,
      relatedResources: formRelatedResources,
      relatedProjects: formRelatedProjects,
      relatedPeople: formRelatedPeople,
    }

    if (isCreating) {
      const result = await addNoteAction(data)
      if (result.success) {
        toast.success("Note created")
        setIsCreating(false)
        setIsEditing(false)
        setMobileDetailOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create note")
      }
    } else {
      if (!selectedNote) return
      const noteId = selectedNote._id?.toString() || selectedNote.id
      if (!noteId) return
      const result = await updateNoteAction(noteId, data)
      if (result.success) {
        toast.success("Note saved")
        setIsEditing(false)
        setSelectedNote({ ...selectedNote, ...data })
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update note")
      }
    }
    setIsSaving(false)
  }

  const handleDelete = async (noteId: string) => {
    setIsDeleting(true)
    const result = await deleteNoteAction(noteId)
    if (result.success) {
      toast.success("Note deleted")
      if (
        selectedNote &&
        (selectedNote._id?.toString() === noteId || selectedNote.id === noteId)
      ) {
        setSelectedNote(null)
        setIsEditing(false)
        setIsCreating(false)
        setMobileDetailOpen(false)
      }
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete note")
    }
    setIsDeleting(false)
  }

  // Lightweight markdown renderer
  const renderMarkdown = (content: string) => {
    if (!content)
      return <p className="italic text-muted-foreground text-sm">No content yet.</p>
    const lines = content.split("\n")
    return (
      <div className="flex flex-col gap-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith("# "))
            return (
              <h1 key={idx} className="text-2xl sm:text-3xl font-bold tracking-tight mt-6 first:mt-0 text-foreground">
                {line.slice(2)}
              </h1>
            )
          if (line.startsWith("## "))
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-semibold mt-5 text-foreground">
                {line.slice(3)}
              </h2>
            )
          if (line.startsWith("### "))
            return (
              <h3 key={idx} className="text-base font-semibold mt-4 text-foreground">
                {line.slice(4)}
              </h3>
            )
          if (line.startsWith("- ") || line.startsWith("* "))
            return (
              <li key={idx} className="ml-5 list-disc text-foreground/80 text-sm leading-7">
                {line.slice(2)}
              </li>
            )
          if (line.trim() === "")
            return <div key={idx} className="h-3" />
          return (
            <p key={idx} className="text-foreground/80 text-sm leading-7">
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  const showEditor = isEditing || isCreating

  // ─────────────────────────────────────────────
  // Shared render helpers (used in both mobile & desktop layouts)
  // ─────────────────────────────────────────────

  /** Left panel: note list */
  const renderListPanel = () => (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <BookOpen className="size-4 sm:size-5 text-primary" />
          <span className="text-sm sm:text-base font-semibold">Notes</span>
          <Badge variant="secondary" className="text-xs tabular-nums h-5 px-2">
            {filteredNotes.length}
          </Badge>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="size-9" onClick={handleOpenCreate}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New note</TooltipContent>
        </Tooltip>
      </div>

      {/* Search */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border shrink-0">
        <InputGroup>
          <InputGroupInput
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-sm"
          />
          <InputGroupAddon align="inline-end">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Tag filters — horizontally scrollable */}
      {allTags.length > 0 && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border shrink-0">
          <ScrollArea>
            <div className="flex gap-1.5 sm:gap-2 pb-2">
              <Badge
                variant={selectedTag === null ? "primary" : "outline"}
                className="cursor-pointer select-none rounded-full text-xs font-medium h-6 px-3 shrink-0"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "primary" : "outline"}
                  className="cursor-pointer select-none rounded-full text-xs font-medium h-6 px-3 shrink-0"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Note list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-1 p-2 sm:p-3">
          {filteredNotes.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No notes</EmptyTitle>
                <EmptyDescription>
                  {searchQuery ? "Try a different search." : "Create your first note."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            filteredNotes.map((note) => {
              const noteId = note._id?.toString() || note.id
              const isSelected =
                selectedNote &&
                ((selectedNote._id?.toString() === note._id?.toString()) ||
                  (selectedNote.id === note.id))

              return (
                <div
                  key={noteId}
                  onClick={() => handleSelectNote(note)}
                  className={cn(
                    "group relative rounded-xl px-3 sm:px-4 py-3 cursor-pointer transition-all duration-100 active:scale-[0.99]",
                    isSelected
                      ? "bg-accent border border-border"
                      : "hover:bg-accent/50 border border-transparent"
                  )}
                >
                  {/* Pinned dot */}
                  {note.pinned && (
                    <div className="absolute top-3 right-3 size-2 rounded-full bg-amber-400" />
                  )}

                  <div className="flex items-start justify-between gap-2 mb-1 pr-3">
                    <p className={cn(
                      "text-sm font-semibold truncate leading-snug",
                      isSelected ? "text-foreground" : "text-foreground/90"
                    )}>
                      {note.title || "Untitled Note"}
                    </p>
                    {/* Mobile: show chevron hint */}
                    <ChevronRight className="size-3.5 text-muted-foreground/40 mt-0.5 shrink-0 sm:hidden" />
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">
                    {note.content?.replace(/[#*-]/g, "").trim() || "Empty…"}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {(note.tags || []).slice(0, 2).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs px-2 h-5 rounded-full font-medium"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {(note.tags || []).length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 h-5 rounded-full">
                          +{(note.tags || []).length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Desktop hover actions */}
                      <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg"
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (!noteId) return
                                const result = await updateNoteAction(noteId, { pinned: !note.pinned })
                                if (result.success) {
                                  toast.success(note.pinned ? "Unpinned" : "Pinned")
                                  router.refresh()
                                }
                              }}
                            >
                              <Pin className={cn("size-3.5", note.pinned && "fill-amber-400 text-amber-400")} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{note.pinned ? "Unpin" : "Pin"}</TooltipContent>
                        </Tooltip>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (noteId) setNoteToDelete(noteId)
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <span className="text-xs text-muted-foreground/60 shrink-0">
                        {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Controlled delete dialog — rendered outside the card to avoid event propagation issues */}
      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => { if (!open) setNoteToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This note will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => { if (noteToDelete) await handleDelete(noteToDelete) }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  /** Right panel: editor or viewer */
  const renderDetailPanel = () => {
    if (!selectedNote && !isCreating) {
      // Empty state — only visible on desktop (mobile never shows this panel without a selection)
      return (
        <div className="flex flex-col items-center justify-center flex-1 h-full">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>Select a note</EmptyTitle>
              <EmptyDescription>
                Choose a note from the sidebar, or create a new one.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleOpenCreate} className="gap-2">
                <Plus data-icon="inline-start" />
                New note
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )
    }

    if (showEditor) {
      // ── EDIT MODE ──
      return (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border bg-background shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {/* Back button: mobile returns to list, desktop cancels */}
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0"
                onClick={handleBack}
              >
                <ArrowLeft />
              </Button>
              <span className="text-sm font-semibold truncate">
                {isCreating ? "New Note" : "Edit Note"}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Write/Preview toggle — icon-only on mobile */}
              <ToggleGroup
                type="single"
                variant="outline"
                value={editorMode}
                onValueChange={(v) => { if (v) setEditorMode(v as "write" | "preview") }}
              >
                <ToggleGroupItem value="write">
                  <PenBox />
                  <span className="hidden sm:inline">Write</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="preview">
                  <Eye />
                  <span className="hidden sm:inline">Preview</span>
                </ToggleGroupItem>
              </ToggleGroup>

              <Separator orientation="vertical" className="hidden sm:block" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Spinner className="size-4" /> : <Save data-icon="inline-start" />}
                {isCreating ? "Create" : "Save"}
              </Button>
            </div>
          </div>

          {/* Editor fields */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 max-w-3xl mx-auto">
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Note title…"
                className="w-full text-xl sm:text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
              />

              <Separator />

              {editorMode === "preview" ? (
                <div className="min-h-[200px] sm:min-h-[300px]">
                  {renderMarkdown(formContent)}
                </div>
              ) : (
                <Textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder={"# Heading\n\nStart writing your note…"}
                  rows={14}
                />
              )}

              <Separator />

              {/* Tags */}
              <div className="flex items-center gap-2">
                <Tag className="size-3.5 text-muted-foreground shrink-0" />
                <input
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Add tags, separated by commas…"
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground/80 min-w-0"
                />
              </div>

              <Separator />

              {/* Connections — single column on mobile, 3-col on md+ */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Connections
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="size-3 text-blue-500" /> Resources
                    </FieldLabel>
                    <Combobox
                      multiple autoHighlight
                      items={resources.map((r) => r._id?.toString() || r.id || "")}
                      value={formRelatedResources}
                      onValueChange={setFormRelatedResources}
                    >
                      <ComboboxChips ref={resourcesAnchor} className="w-full min-h-9">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const res = resources.find((r) => (r._id?.toString() || r.id) === val)
                                return <ComboboxChip key={val}>{res ? (res.title || res.name) : val}</ComboboxChip>
                              })}
                              <ComboboxChipsInput placeholder="Link resources…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={resourcesAnchor}>
                        <ComboboxEmpty>No resources.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const res = resources.find((r) => (r._id?.toString() || r.id) === item)
                            return <ComboboxItem key={item} value={item}>{res ? (res.title || res.name) : item}</ComboboxItem>
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Folder className="size-3 text-amber-500" /> Projects
                    </FieldLabel>
                    <Combobox
                      multiple autoHighlight
                      items={projects.map((p) => p._id?.toString() || p.id || "")}
                      value={formRelatedProjects}
                      onValueChange={setFormRelatedProjects}
                    >
                      <ComboboxChips ref={projectsAnchor} className="w-full min-h-9">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const proj = projects.find((p) => (p._id?.toString() || p.id) === val)
                                return <ComboboxChip key={val}>{proj ? proj.name : val}</ComboboxChip>
                              })}
                              <ComboboxChipsInput placeholder="Link projects…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={projectsAnchor}>
                        <ComboboxEmpty>No projects.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const proj = projects.find((p) => (p._id?.toString() || p.id) === item)
                            return <ComboboxItem key={item} value={item}>{proj ? proj.name : item}</ComboboxItem>
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="size-3 text-emerald-500" /> People
                    </FieldLabel>
                    <Combobox
                      multiple autoHighlight
                      items={people.map((p) => p._id?.toString() || p.id || "")}
                      value={formRelatedPeople}
                      onValueChange={setFormRelatedPeople}
                    >
                      <ComboboxChips ref={peopleAnchor} className="w-full min-h-9">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const person = people.find((p) => (p._id?.toString() || p.id) === val)
                                return <ComboboxChip key={val}>{person ? person.name : val}</ComboboxChip>
                              })}
                              <ComboboxChipsInput placeholder="Link people…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={peopleAnchor}>
                        <ComboboxEmpty>No people.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const person = people.find((p) => (p._id?.toString() || p.id) === item)
                            return <ComboboxItem key={item} value={item}>{person ? person.name : item}</ComboboxItem>
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )
    }

    // ── VIEW MODE ──
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border bg-background shrink-0">
          {/* Back: visible on mobile & tablet; hidden on large desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 lg:hidden shrink-0"
            onClick={handleBack}
          >
            <ArrowLeft />
          </Button>

          {/* Note title in toolbar — visible on mobile & tablet */}
          <p className="text-sm font-semibold truncate flex-1 lg:hidden">
            {selectedNote?.title || "Untitled Note"}
          </p>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <PenBox data-icon="inline-start" />
              <span className="hidden sm:inline">Edit</span>
            </Button>

            {/* Pin toggle — mobile friendly */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={async () => {
                    const noteId = selectedNote?._id?.toString() || selectedNote?.id
                    if (!noteId) return
                    const result = await updateNoteAction(noteId, { pinned: !selectedNote?.pinned })
                    if (result.success) {
                      toast.success(selectedNote?.pinned ? "Unpinned" : "Pinned")
                      router.refresh()
                    }
                  }}
                >
                  <Pin className={cn("size-4", selectedNote?.pinned && "fill-amber-400 text-amber-400")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{selectedNote?.pinned ? "Unpin" : "Pin"}</TooltipContent>
            </Tooltip>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2 />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. &ldquo;{selectedNote?.title || "Untitled Note"}&rdquo; will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={async () => {
                      const noteId = selectedNote?._id?.toString() || selectedNote?.id
                      if (noteId) await handleDelete(noteId)
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Document body */}
        <ScrollArea className="flex-1 min-h-0">
          <article className="max-w-2xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full">
            {/* Title & Date — hidden on mobile since it's in toolbar */}
            <div className="hidden sm:flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground flex-1 leading-tight">
                {selectedNote?.title || "Untitled Note"}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2 shrink-0 select-none">
                <CalendarDays className="size-4" />
                {selectedNote && new Date(selectedNote.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </div>
            </div>

            {/* Mobile: full title in article */}
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight mb-2 sm:hidden">
              {selectedNote?.title || "Untitled Note"}
            </h1>

            {/* Meta row */}
            <div className="flex flex-col gap-2 mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:hidden">
                <CalendarDays className="size-3.5" />
                {selectedNote && new Date(selectedNote.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </div>
              {selectedNote?.tags && selectedNote.tags.length > 0 && (
                <ScrollArea>
                  <div className="flex gap-1.5 pb-1.5">
                    {selectedNote.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-full text-xs h-5 sm:h-6 px-2.5 sm:px-3 font-medium shrink-0 flex items-center gap-1.5"
                      >
                        <Tag className="size-3 text-muted-foreground shrink-0" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </div>

            <Separator className="mb-6 sm:mb-8" />

            {/* Content */}
            <div className="prose-neutral">
              {renderMarkdown(formContent)}
            </div>

            {/* Connections */}
            {(formRelatedResources.length > 0 || formRelatedProjects.length > 0 || formRelatedPeople.length > 0) && (
              <>
                <Separator className="mt-10 sm:mt-12 mb-6 sm:mb-8" />
                <div className="flex flex-col gap-5 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="size-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Connections
                    </span>
                  </div>

                  {formRelatedResources.length > 0 && (
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileText className="size-4 text-blue-500" /> Resources
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {resources
                          .filter((r) => formRelatedResources.includes(r._id?.toString() || r.id || ""))
                          .map((res) => (
                            <a
                              key={res._id?.toString() || res.id}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 rounded-xl border border-border px-3 sm:px-4 py-3 hover:border-primary/40 hover:bg-accent/50 active:bg-accent transition-all"
                            >
                              <div className="size-8 sm:size-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                <FileText className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                  {res.title || res.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{res.url}</p>
                              </div>
                              <ExternalLink className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {formRelatedProjects.length > 0 && (
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Folder className="size-4 text-amber-500" /> Projects
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {projects
                          .filter((p) => formRelatedProjects.includes(p._id?.toString() || p.id || ""))
                          .map((proj) => (
                            <button
                              key={proj._id?.toString() || proj.id}
                              onClick={() => router.push(`/project/${proj._id?.toString() || proj.id}`)}
                              className="group flex items-center gap-3 rounded-xl border border-border px-3 sm:px-4 py-3 hover:border-primary/40 hover:bg-accent/50 active:bg-accent transition-all text-left"
                            >
                              <div className="size-8 sm:size-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                <Folder className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                  {proj.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{proj.status}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {formRelatedPeople.length > 0 && (
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="size-4 text-emerald-500" /> People
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {people
                          .filter((p) => formRelatedPeople.includes(p._id?.toString() || p.id || ""))
                          .map((person) => (
                            <button
                              key={person._id?.toString() || person.id}
                              onClick={() => router.push(`/person/${person._id?.toString() || person.id}`)}
                              className="group flex items-center gap-3 rounded-xl border border-border px-3 sm:px-4 py-3 hover:border-primary/40 hover:bg-accent/50 active:bg-accent transition-all text-left"
                            >
                              <div className="size-8 sm:size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                <User className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                  {person.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{person.type}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </article>
        </ScrollArea>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // Root layout
  // ─────────────────────────────────────────────

  // Don't render either layout until the breakpoint is known.
  // This prevents both trees from mounting simultaneously during hydration.
  if (isMobile === null) return null

  return (
    <TooltipProvider delayDuration={300}>
      {isMobile ? (
        // ── MOBILE layout (< 768 px) — single-column slide stack ──
        <div className="h-[calc(100dvh-var(--header-height))] border-t border-border overflow-hidden relative">
          {/* List screen */}
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-300 ease-in-out will-change-transform",
              mobileDetailOpen ? "-translate-x-full" : "translate-x-0"
            )}
          >
            {renderListPanel()}
          </div>

          {/* Detail screen */}
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-300 ease-in-out will-change-transform bg-background",
              mobileDetailOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            {renderDetailPanel()}
          </div>
        </div>
      ) : (
        // ── DESKTOP/TABLET layout (≥ 768 px) — resizable side-by-side ──
        <div className="h-[calc(100dvh-var(--header-height))] border-t border-border overflow-hidden">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full"
          >
            <ResizablePanel
              defaultSize="28%"
              minSize="18%"
              maxSize="50%"
              className="flex flex-col overflow-hidden"
            >
              {renderListPanel()}
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              defaultSize="72%"
              minSize="40%"
              className="flex flex-col overflow-hidden"
            >
              {renderDetailPanel()}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </TooltipProvider>
  )
}