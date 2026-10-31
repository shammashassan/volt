"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Person, PersonType } from "@/types"
import { Button } from "@/components/ui/button"
import {
  User,
  Users,
  Plus,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shared/responsive-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty"
import { addPersonAction, deletePersonAction, updatePersonAction } from "@/lib/actions"
import { toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { useQueryState, parseAsBoolean } from "nuqs"
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
import { PersonAvatar } from "./person-avatar"

interface PeopleContentProps {
  initialPeople: Person[]
}

type RoleFilter = "all" | PersonType
type SortOption = "name-asc" | "name-desc" | "date-newest" | "date-oldest"

export function PeopleContent({ initialPeople }: PeopleContentProps) {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [sortOption, setSortOption] = useState<SortOption>("name-asc")

  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [personToDelete, setPersonToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newPersonParam, setNewPersonParam] = useQueryState("new", parseAsBoolean)

  // Form states
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<PersonType>("developer")
  const [formLinks, setFormLinks] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formTags, setFormTags] = useState("")

  const router = useRouter()

  React.useEffect(() => {
    setPeople(initialPeople)
  }, [initialPeople])

  React.useEffect(() => {
    if (newPersonParam) {
      setEditingPerson(null)
      setFormName("")
      setFormType("developer")
      setFormLinks("")
      setFormNotes("")
      setFormTags("")
      setIsOpen(true)
    }
  }, [newPersonParam])

  const handleOpenCreate = () => {
    setEditingPerson(null)
    setFormName("")
    setFormType("developer")
    setFormLinks("")
    setFormNotes("")
    setFormTags("")
    setIsOpen(true)
  }

  const handleOpenEdit = (person: Person, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setEditingPerson(person)
    setFormName(person.name)
    setFormType(person.type)
    setFormLinks((person.links || []).join(", "))
    setFormNotes(person.notes || "")
    setFormTags((person.tags || []).join(", "))
    setIsOpen(true)
  }

  const handleOpenDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setPersonToDelete(id)
  }

  const confirmDelete = async () => {
    if (!personToDelete) return
    const id = personToDelete
    setIsLoading(true)

    try {
      await toast.promise(
        (async () => {
          const result = await deletePersonAction(id)
          if (!result.success) {
            throw new Error(result.error || "Failed to delete person")
          }
          router.refresh()
          return result
        })(),
        {
          loading: "Deleting person...",
          success: "Person deleted successfully",
          error: (err: unknown) =>
            (err instanceof Error ? err.message : String(err)) ||
            "Failed to delete person",
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsLoading(false)
      setPersonToDelete(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.add({
        title: "Name is required",
        type: "error",
      })
      return
    }

    setIsLoading(true)
    const linksArray = formLinks
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l !== "")

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "")

    const data = {
      name: formName.trim(),
      type: formType,
      links: linksArray,
      notes: formNotes.trim(),
      tags: tagsArray,
    }
    const isEditing = Boolean(editingPerson)
    const id = editingPerson
      ? editingPerson._id?.toString() || editingPerson.id || ""
      : ""

    try {
      await toast.promise(
        (async () => {
          if (isEditing) {
            const result = await updatePersonAction(id, data)
            if (!result.success) {
              throw new Error(result.error || "Failed to update person")
            }
            setIsOpen(false)
            router.refresh()
            return result
          } else {
            const result = await addPersonAction(data)
            if (!result.success) {
              throw new Error(result.error || "Failed to create person")
            }
            setIsOpen(false)
            router.refresh()
            return result
          }
        })(),
        {
          loading: isEditing ? "Updating person..." : "Creating person...",
          success: isEditing
            ? "Person updated successfully"
            : "Person created successfully",
          error: (err: unknown) =>
            (err instanceof Error ? err.message : String(err)) ||
            (isEditing ? "Failed to update person" : "Failed to create person"),
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsLoading(false)
    }
  }

  // Count distribution across types
  const roleCounts = useMemo(() => {
    const counts = {
      all: people.length,
      developer: 0,
      designer: 0,
      founder: 0,
      creator: 0,
      company: 0,
    }
    people.forEach((p) => {
      if (counts[p.type] !== undefined) {
        counts[p.type]++
      }
    })
    return counts
  }, [people])

  // Filter and sort people
  const filteredPeople = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    const filtered = people.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))

      const matchesRole = roleFilter === "all" || p.type === roleFilter

      return matchesSearch && matchesRole
    })

    return [...filtered].sort((a, b) => {
      if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name)
      }
      if (sortOption === "name-desc") {
        return b.name.localeCompare(a.name)
      }
      if (sortOption === "date-newest") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA
      }
      if (sortOption === "date-oldest") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeA - timeB
      }
      return 0
    })
  }, [people, searchQuery, roleFilter, sortOption])

  const clearFilters = () => {
    setSearchQuery("")
    setRoleFilter("all")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  People
                </h1>
                <Badge variant="secondary">
                  {people.length} <span className="hidden sm:inline ml-1">Tracked</span>
                </Badge>
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-2xl font-medium">
              Manage mentors, creators, developers, and organizations connected to your workspace.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus data-icon="inline-start" />
            <span>Track Person</span>
          </Button>
        </div>
      </section>

      {/* Controls & Filter Toolbar */}
      <section className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input with InputGroup */}
            <InputGroup className="w-full sm:max-w-md">
              <InputGroupAddon align="inline-start">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search by name, role, tags, bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setSearchQuery("")}
                  >
                    <X />
                    <span className="sr-only">Clear search</span>
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <ArrowUpDown data-icon="inline-start" />
                      <span className="hidden md:inline">Sort:</span>
                      <span className="capitalize">
                        {sortOption === "name-asc"
                          ? "A to Z"
                          : sortOption === "name-desc"
                            ? "Z to A"
                            : sortOption === "date-newest"
                              ? "Newest"
                              : "Oldest"}
                      </span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setSortOption("name-asc")}>
                      <span>Name (A to Z)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-desc")}>
                      <span>Name (Z to A)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("date-newest")}>
                      <span>Date (Newest)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("date-oldest")}>
                      <span>Date (Oldest)</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Role Filter Tabs using components/ui/tabs.tsx */}
          {/* Mobile Select dropdown */}
          <div className="sm:hidden w-full">
            <Select
              value={roleFilter}
              onValueChange={(val) => setRoleFilter(val as RoleFilter)}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({roleCounts.all})</SelectItem>
                <SelectItem value="developer">
                  Developers ({roleCounts.developer})
                </SelectItem>
                <SelectItem value="designer">
                  Designers ({roleCounts.designer})
                </SelectItem>
                <SelectItem value="founder">
                  Founders ({roleCounts.founder})
                </SelectItem>
                <SelectItem value="creator">
                  Creators ({roleCounts.creator})
                </SelectItem>
                <SelectItem value="company">
                  Companies ({roleCounts.company})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop tabs using Tabs from components/ui/tabs.tsx */}
          <Tabs
            value={roleFilter}
            onValueChange={(val) => setRoleFilter(val as RoleFilter)}
            className="hidden sm:block w-full"
          >
            <div className="overflow-x-auto pb-1 no-scrollbar">
              <TabsList className="inline-flex">
                <TabsTrigger value="all">
                  All <span className="ml-1 opacity-60 font-medium">({roleCounts.all})</span>
                </TabsTrigger>
                <TabsTrigger value="developer">
                  Developers <span className="ml-1 opacity-60 font-medium">({roleCounts.developer})</span>
                </TabsTrigger>
                <TabsTrigger value="designer">
                  Designers <span className="ml-1 opacity-60 font-medium">({roleCounts.designer})</span>
                </TabsTrigger>
                <TabsTrigger value="founder">
                  Founders <span className="ml-1 opacity-60 font-medium">({roleCounts.founder})</span>
                </TabsTrigger>
                <TabsTrigger value="creator">
                  Creators <span className="ml-1 opacity-60 font-medium">({roleCounts.creator})</span>
                </TabsTrigger>
                <TabsTrigger value="company">
                  Companies <span className="ml-1 opacity-60 font-medium">({roleCounts.company})</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Main Content section: Single view of only the avatar with text/label (no background card or card outline) */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {filteredPeople.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <User />
                </EmptyMedia>
                <EmptyTitle>
                  {people.length === 0
                    ? "No people tracked yet"
                    : "No profiles match your filters"}
                </EmptyTitle>
                <EmptyDescription>
                  {people.length === 0
                    ? "Start tracking influential minds, colleagues, or teams to associate them with saved links and notes."
                    : "Try adjusting your search query or role filter to find who you are looking for."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex items-center justify-center gap-2">
                  {people.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <SlidersHorizontal data-icon="inline-start" />
                      <span>Reset Filters</span>
                    </Button>
                  )}
                  <Button size="sm" onClick={handleOpenCreate}>
                    <Plus data-icon="inline-start" />
                    <span>Track First Person</span>
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            /* Single view: Only Avatar with label/text (no background card, no outline) + Edit/Delete actions */
            <div className="flex flex-wrap items-start gap-8">
                {filteredPeople.map((person) => {
                  const id = person._id?.toString() || person.id || ""

                  return (
                    <div
                      key={id}
                      className="group relative flex flex-col items-center w-32 pt-2 pb-2 gap-2"
                    >
                      {/* Edit & Delete Action Menu on hover/focus - top right corner, no avatar overlap */}
                      <div className="absolute top-0 right-1 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="secondary"
                                size="icon-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal />
                                <span className="sr-only">Actions for {person.name}</span>
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => router.push(`/people/${id}`)}>
                                <User />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleOpenEdit(person, e)}>
                                <Pencil />
                                <span>Edit Profile</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => handleOpenDelete(id, e)}
                              >
                                <Trash2 />
                                <span>Delete Profile</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Avatar */}
                      <button
                        type="button"
                        onClick={() => router.push(`/people/${id}`)}
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      >
                        <PersonAvatar person={person} size="xl" />
                        <span className="sr-only">{person.name}</span>
                      </button>

                      {/* Name / label text without background card or outline */}
                      <button
                        type="button"
                        onClick={() => router.push(`/people/${id}`)}
                        className="text-xs font-medium text-center text-foreground hover:text-primary transition-colors truncate w-full cursor-pointer"
                        title={person.name}
                      >
                        {person.name}
                      </button>
                    </div>
                  )
                })}
              </div>
          )}

          {/* Create & Edit Modal with Live Avatar Preview */}
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open && newPersonParam) void setNewPersonParam(null)
            }}
          >
            <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh] no-scrollbar">
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <DialogHeader>
                  <DialogTitle>
                    {editingPerson ? "Edit Profile" : "Track Person"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPerson
                      ? "Modify details of this tracked profile."
                      : "Start tracking a person or company to connect them with saved links and notes."}
                  </DialogDescription>
                </DialogHeader>

                {/* Live Avatar Preview with Increased Size and Icon Subcomponent */}
                <div className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-muted/30 p-3">
                  <PersonAvatar
                    person={{ name: formName || "Full Name", type: formType }}
                    size="xl"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {formName || "Full Name"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 capitalize">
                      <Sparkles className="size-3 text-primary shrink-0" />
                      <span>{formType}</span>
                    </span>
                  </div>
                </div>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Lee Robinson"
                      disabled={isLoading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="type">Profile Type</FieldLabel>
                    <Select
                      value={formType}
                      onValueChange={(val) => {
                        if (val) setFormType(val as PersonType)
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="links">Profile Links</FieldLabel>
                    <Input
                      id="links"
                      value={formLinks}
                      onChange={(e) => setFormLinks(e.target.value)}
                      placeholder="https://github.com/..., https://x.com/..."
                      disabled={isLoading}
                    />
                    <FieldDescription>
                      Comma separated URLs (e.g. GitHub, X, personal portfolio).
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tags">Tags</FieldLabel>
                    <Input
                      id="tags"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="nextjs, react, ui, performance"
                      disabled={isLoading}
                    />
                    <FieldDescription>
                      Comma separated keywords for taxonomy.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="notes">Bio / Notes</FieldLabel>
                    <Textarea
                      id="notes"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. VP of Product at Vercel. Writes about developer experience."
                      className="min-h-[80px]"
                      disabled={isLoading}
                    />
                  </Field>
                </FieldGroup>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading
                      ? "Saving..."
                      : editingPerson
                        ? "Save Changes"
                        : "Track Person"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Alert */}
          <AlertDialog
            open={!!personToDelete}
            onOpenChange={(open) => !open && setPersonToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the tracked person profile. Linked resources and notes will remain intact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    void confirmDelete()
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
