"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Person, PersonType } from "@/types"
import { Button } from "@/components/ui/button"
import { User, Plus, Edit3, Trash2, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { addPersonAction, deletePersonAction, updatePersonAction } from "@/lib/actions"
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

interface PeopleContentProps {
  initialPeople: Person[]
}

const TYPE_CONFIG: Record<PersonType, { label: string; variant: "secondary" | "outline" | "destructive" | "primary" | "success" | "warning" | "info" }> = {
  developer: { label: "Developer", variant: "primary" },
  designer: { label: "Designer", variant: "secondary" },
  founder: { label: "Founder", variant: "info" },
  creator: { label: "Creator", variant: "outline" },
  company: { label: "Company", variant: "outline" }
}

export function PeopleContent({ initialPeople }: PeopleContentProps) {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [personToDelete, setPersonToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleOpenCreate = () => {
    setEditingPerson(null)
    setFormName("")
    setFormType("developer")
    setFormLinks("")
    setFormNotes("")
    setFormTags("")
    setIsOpen(true)
  }

  const handleOpenEdit = (person: Person, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingPerson(person)
    setFormName(person.name)
    setFormType(person.type)
    setFormLinks((person.links || []).join(", "))
    setFormNotes(person.notes || "")
    setFormTags((person.tags || []).join(", "))
    setIsOpen(true)
  }

  const handleOpenDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setPersonToDelete(id)
  }

  const confirmDelete = async () => {
    if (!personToDelete) return
    setIsLoading(true)
    const result = await deletePersonAction(personToDelete)
    if (result.success) {
      toast.success("Person deleted successfully")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete person")
    }
    setIsLoading(false)
    setPersonToDelete(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error("Name is required")
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
      name: formName,
      type: formType,
      links: linksArray,
      notes: formNotes,
      tags: tagsArray,
    }

    if (editingPerson) {
      const id = editingPerson._id?.toString() || editingPerson.id || ""
      const result = await updatePersonAction(id, data)
      if (result.success) {
        toast.success("Person updated successfully")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update person")
      }
    } else {
      const result = await addPersonAction(data)
      if (result.success) {
        toast.success("Person created successfully")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create person")
      }
    }
    setIsLoading(false)
  }

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return people
    const q = searchQuery.toLowerCase()
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
    )
  }, [people, searchQuery])

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  People
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {people.length} <span className="hidden sm:inline ml-1">Tracked</span>
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Track creators, developers, designers, or organizations to reference and connect them with saved assets.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto shrink-0 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Track Person
          </Button>
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Search Bar */}
          <div className="max-w-md w-full">
            <Input
              placeholder="Search by name, type, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-background/50 border-border/60"
            />
          </div>

          {/* People Grid */}
          {filteredPeople.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/60 rounded-2xl bg-card/10 backdrop-blur-xs gap-3">
              <User className="size-10 text-muted-foreground/40" />
              <h3 className="font-bold text-lg lowercase italic">no people tracked</h3>
              <p className="text-xs text-muted-foreground/80 max-w-xs leading-relaxed">
                Start tracking influential minds, team members, or agencies to associate them with saved links and notes.
              </p>
              <Button onClick={handleOpenCreate} variant="outline" size="sm" className="mt-2 text-xs font-bold">
                Track First Person
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPeople.map((person) => {
                const typeConfig = TYPE_CONFIG[person.type] || { label: "Developer", variant: "primary" as const }
                const id = person._id?.toString() || person.id || ""
                return (
                  <Card
                    key={id}
                    className="cursor-pointer group flex flex-col justify-between transition-all hover:shadow-lg hover:border-primary/20 bg-card/30 backdrop-blur-xs"
                    onClick={() => router.push(`/people/${id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="font-bold text-base lowercase italic line-clamp-1 flex-1 text-foreground group-hover:text-primary transition-colors">
                          {person.name}
                        </CardTitle>
                        <Badge variant={typeConfig.variant} className="text-[9px] uppercase tracking-wider font-bold rounded-full select-none px-2 h-5">
                          {typeConfig.label}
                        </Badge>
                      </div>
                      {person.notes && (
                        <CardDescription className="line-clamp-2 text-xs leading-relaxed mt-1.5">
                          {person.notes}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pb-3">
                      {/* Tags */}
                      {person.tags && person.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {person.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[8px] uppercase tracking-widest font-bold h-4">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {/* Clickable Links */}
                      {person.links && person.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {person.links.slice(0, 2).map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center text-[10px] font-bold text-primary hover:underline gap-1 max-w-[150px] truncate"
                            >
                              <ExternalLink className="size-3 shrink-0" />
                              {new URL(link).hostname}
                            </a>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border/20 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground/60">
                        Added {new Date(person.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleOpenEdit(person, e)}
                          title="Edit Profile"
                        >
                          <Edit3 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleOpenDelete(id, e)}
                          title="Delete Profile"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] no-scrollbar">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>{editingPerson ? "Edit Profile" : "Track Person"}</DialogTitle>
                  <DialogDescription>
                    {editingPerson ? "Modify details of this tracked profile." : "Start tracking a person or agency to reference them inside your repository."}
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-4">
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="E.g. Lee Robinson"
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="type">Profile Type</FieldLabel>
                    <Select value={formType} onValueChange={(val) => setFormType(val as PersonType)} disabled={isLoading}>
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
                    <FieldLabel htmlFor="links">
                      Profile Links <span className="text-[10px] text-muted-foreground lowercase">(comma separated URLs)</span>
                    </FieldLabel>
                    <Input
                      id="links"
                      value={formLinks}
                      onChange={(e) => setFormLinks(e.target.value)}
                      placeholder="https://github.com/..., https://twitter.com/..."
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tags">
                      Profile Tags <span className="text-[10px] text-muted-foreground lowercase">(comma separated)</span>
                    </FieldLabel>
                    <Input
                      id="tags"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="nextjs, react, vercel, photography"
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="notes">Bio / Notes</FieldLabel>
                    <Textarea
                      id="notes"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="E.g. Lead DevRel at Vercel. Writes about React server components."
                      className="min-h-[80px]"
                      disabled={isLoading}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isLoading} className="font-bold">
                    {isLoading ? "Saving..." : editingPerson ? "Save Changes" : "Track Person"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Alert */}
          <AlertDialog open={!!personToDelete} onOpenChange={(open) => !open && setPersonToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the tracked person profile. Linked resources and notes will not be deleted, but they will be disconnected from this person.
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
      </section>
    </div>
  )
}
