"use client"

import * as React from "react"
import { useState } from "react"
import { Person, Resource, Note, PersonType } from "@/types"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  User,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ResourceCard } from "@/components/resources/resource-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shared/responsive-dialog"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { updatePersonAction, deletePersonAction } from "@/lib/actions"
import { toast } from "@/components/ui/toast"
import { PersonAvatar, ROLE_ICONS } from "./person-avatar"

interface PersonContentProps {
  person: Person
  resources: Resource[]
  notes: Note[]
}

const TYPE_CONFIG: Record<
  PersonType,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  developer: { label: "Developer", variant: "default" },
  designer: { label: "Designer", variant: "secondary" },
  founder: { label: "Founder", variant: "outline" },
  creator: { label: "Creator", variant: "outline" },
  company: { label: "Company", variant: "secondary" },
}

function getHostname(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`)
    return url.hostname.replace(/^www\./, "")
  } catch {
    return rawUrl
  }
}

export function PersonContent({ person, resources, notes }: PersonContentProps) {
  const router = useRouter()
  const typeConfig = TYPE_CONFIG[person.type] || { label: "Developer", variant: "default" as const }
  const RoleIcon = ROLE_ICONS[person.type] || User
  const [activeTab, setActiveTab] = useState("resources")

  // Edit / Delete states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Edit form states
  const [formName, setFormName] = useState(person.name)
  const [formType, setFormType] = useState<PersonType>(person.type)
  const [formLinks, setFormLinks] = useState((person.links || []).join(", "))
  const [formNotes, setFormNotes] = useState(person.notes || "")
  const [formTags, setFormTags] = useState((person.tags || []).join(", "))

  const id = person._id?.toString() || person.id || ""

  const handleOpenEdit = () => {
    setFormName(person.name)
    setFormType(person.type)
    setFormLinks((person.links || []).join(", "))
    setFormNotes(person.notes || "")
    setFormTags((person.tags || []).join(", "))
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
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

    try {
      await toast.promise(
        (async () => {
          const result = await updatePersonAction(id, data)
          if (!result.success) {
            throw new Error(result.error || "Failed to update person")
          }
          setIsEditDialogOpen(false)
          router.refresh()
          return result
        })(),
        {
          loading: "Updating profile...",
          success: "Profile updated successfully",
          error: (err: unknown) =>
            (err instanceof Error ? err.message : String(err)) ||
            "Failed to update profile",
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = async () => {
    setIsLoading(true)
    try {
      await toast.promise(
        (async () => {
          const result = await deletePersonAction(id)
          if (!result.success) {
            throw new Error(result.error || "Failed to delete person")
          }
          router.push("/people")
          return result
        })(),
        {
          loading: "Deleting profile...",
          success: "Profile deleted successfully",
          error: (err: unknown) =>
            (err instanceof Error ? err.message : String(err)) ||
            "Failed to delete profile",
        }
      )
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const formattedDate = person.createdAt
    ? new Date(person.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section matching app slug page layout */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 max-w-7xl">
          {/* Profile details */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 self-start"
              onClick={() => router.push("/people")}
            >
              <ArrowLeft data-icon="inline-start" />
              <span>Back to People</span>
            </Button>

            <div className="flex items-center gap-4">
              <PersonAvatar person={person} size="xl" />
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60 leading-tight">
                  {person.name}
                </h1>
                <Badge variant={typeConfig.variant} className="shrink-0">
                  <RoleIcon data-icon="inline-start" />
                  {typeConfig.label}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-2xl">
              {person.notes && (
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  {person.notes}
                </p>
              )}

              {/* Tags */}
              {person.tags && person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 my-1">
                  {person.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Social / Profile Links */}
              {person.links && person.links.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-1">
                  {person.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-primary hover:underline gap-1 max-w-[250px] truncate"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span>{getHostname(link)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons matching app design (Edit, Delete, Date) */}
          <div className="flex items-center gap-2 self-start mt-1 md:mt-0 shrink-0">
            <Button variant="outline" size="sm" onClick={handleOpenEdit}>
              <Pencil data-icon="inline-start" />
              <span>Edit</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 data-icon="inline-start" />
              <span>Delete</span>
            </Button>
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/40 border border-border/40 px-3 py-1.5 rounded-lg">
                <Calendar className="size-3.5" />
                <span>Added {formattedDate}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content (Tabs) */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Mobile Select dropdown */}
          <div className="md:hidden w-full mb-4">
            <Select value={activeTab} onValueChange={(val) => { if (val) setActiveTab(val) }}>
              <SelectTrigger className="w-full h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resources">Resources ({resources.length})</SelectItem>
                <SelectItem value="notes">Notes ({notes.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden md:grid w-full grid-cols-2 max-w-[400px] mb-4">
              <TabsTrigger value="resources">
                <span>Resources</span>
                <Badge variant="secondary">
                  {resources.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="notes">
                <span>Notes</span>
                <Badge variant="secondary">
                  {notes.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources">
              <div className="border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
                {resources.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <LinkIcon />
                      </EmptyMedia>
                      <EmptyTitle>No connected resources</EmptyTitle>
                      <EmptyDescription>
                        No resources have been tagged or connected to {person.name} yet.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {resources.map((resource) => (
                      <ResourceCard key={resource.id || resource._id?.toString()} resource={resource} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
                {notes.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileText />
                      </EmptyMedia>
                      <EmptyTitle>No connected notes</EmptyTitle>
                      <EmptyDescription>
                        No notes reference or mention {person.name} yet.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {notes.map((note) => (
                      <Card
                        key={note.id || note._id?.toString()}
                        className="cursor-pointer"
                        onClick={() => router.push(`/notes?noteId=${note.id || note._id?.toString()}`)}
                      >
                        <CardHeader>
                          <CardTitle>
                            <span className="line-clamp-1">{note.title || "Untitled Note"}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {note.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh] no-scrollbar">
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Modify details of this tracked profile.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-name">Full Name</FieldLabel>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Lee Robinson"
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-type">Profile Type</FieldLabel>
                <Select
                  value={formType}
                  onValueChange={(val) => {
                    if (val) setFormType(val as PersonType)
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="edit-type">
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
                <FieldLabel htmlFor="edit-links">Profile Links</FieldLabel>
                <Input
                  id="edit-links"
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
                <FieldLabel htmlFor="edit-tags">Tags</FieldLabel>
                <Input
                  id="edit-tags"
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
                <FieldLabel htmlFor="edit-notes">Bio / Notes</FieldLabel>
                <Textarea
                  id="edit-notes"
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
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tracked person profile. Linked resources and notes will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
