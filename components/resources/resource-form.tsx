"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
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
import { Sparkles, Check, Star, Loader2, Folder, User, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { RESOURCE_TYPES, STATUS_OPTIONS } from "@/components/resources/resource-types"
import { ResourceStatus, ResourceType } from "@/types"

interface ResourceFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading: boolean
  categories: any[]
  projects?: any[]
  people?: any[]
  onCancel?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export function ResourceForm({
  initialData,
  onSubmit,
  isLoading,
  categories,
  projects = [],
  people = [],
  onCancel,
  onDelete,
  isDeleting,
}: ResourceFormProps) {
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState(initialData?.title || initialData?.name || "")
  const [link, setLink] = useState(initialData?.url || initialData?.link || "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || initialData?.category || "none")
  const [type, setType] = useState<ResourceType>(initialData?.type || "website")
  const [status, setStatus] = useState<ResourceStatus>(initialData?.status || "saved")
  const [favorite, setFavorite] = useState(!!(initialData?.favorite || initialData?.featured))
  const [description, setDescription] = useState(initialData?.description || "")
  const [whySaved, setWhySaved] = useState(initialData?.whySaved || "")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [tags, setTags] = useState(
    Array.isArray(initialData?.tags)
      ? initialData.tags.join(", ")
      : initialData?.tags || ""
  )
  const [projectIds, setProjectIds] = useState<string[]>(initialData?.projectIds || [])
  const [personIds, setPersonIds] = useState<string[]>(initialData?.personIds || [])
  const [order, setOrder] = useState<number>(initialData?.order ?? 0)

  const projectsAnchor = useComboboxAnchor()
  const peopleAnchor = useComboboxAnchor()

  const copyPrompt = () => {
    const prompt = `Research and write a concise, compelling 1-sentence description for the UI resource "${name}" (${link}). \nFocus on what makes it unique for design engineers or developers.\nFormat the response as a single sentence without quotes.`
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    toast.success("AI Prompt copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Resource Name is required")
      return
    }
    if (!link.trim()) {
      toast.error("Link URL is required")
      return
    }

    const tagsArray = tags
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t !== "")

    onSubmit({
      title: name,
      url: link,
      description,
      categoryId: categoryId === "none" ? "" : categoryId,
      tags: tagsArray,
      notes,
      whySaved,
      status,
      type,
      favorite,
      projectIds,
      personIds,
      order,
      // old format compatibility
      name,
      link,
      category: categoryId === "none" ? "" : categoryId,
      featured: favorite,
    })
  }

  const isEdit = !!(initialData?.id || initialData?._id)

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <FieldGroup className="py-2 flex flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="name">Resource Name</FieldLabel>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aceternity UI"
            required
            className="bg-background/40"
          />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="link">Link URL</FieldLabel>
            {link && (() => {
              const targetUrl = /^(https?:)?\/\//i.test(link) ? link : `https://${link}`
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
            id="link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            required
            className="bg-background/40"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className="bg-background/40">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id || cat._id?.toString()} value={cat.id || cat._id?.toString() || ""}>
                    {cat.title || cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="type">Type</FieldLabel>
            <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
              <SelectTrigger id="type" className="bg-background/40">
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
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select value={status} onValueChange={(v) => setStatus(v as ResourceStatus)}>
              <SelectTrigger id="status" className="bg-background/40">
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
            <FieldLabel htmlFor="favorite">Favorite</FieldLabel>
            <Toggle
              id="favorite"
              pressed={favorite}
              onPressedChange={setFavorite}
              variant="outline"
              className="justify-start px-3 gap-2"
            >
              <Star className={`size-3.5 ${favorite ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">Favorite / Star</span>
            </Toggle>
          </Field>
        </div>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
              onClick={copyPrompt}
              disabled={!name || !link}
            >
              {copied ? <Check className="size-3" /> : <Sparkles className="size-3" />}
              Copy AI Prompt
            </Button>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe why this resource is useful..."
            required
            className="min-h-[80px] bg-background/40"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="whySaved">Why Saved / Context</FieldLabel>
          <Textarea
            id="whySaved"
            placeholder="Why did you bookmark this? e.g. 'Use for landing page animation'"
            value={whySaved}
            onChange={(e) => setWhySaved(e.target.value)}
            rows={2}
            className="bg-background/40"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">Personal Notes</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Add rich details, usage code snippets, setup rules..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="bg-background/40 font-mono text-xs"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="tags">Tags (comma-separated)</FieldLabel>
          <Input
            id="tags"
            placeholder="react, tailwind, animation, ui"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="bg-background/40"
          />
        </Field>

        <div className="flex flex-col gap-4 border border-border/40 rounded-xl p-4 bg-muted/20">
          <Field>
            <FieldLabel className="flex items-center gap-1">
              <Folder className="size-3 text-primary" /> Associated Projects
            </FieldLabel>
            <Combobox
              multiple
              autoHighlight
              items={projects.map((p) => p._id?.toString() || p.id || "")}
              value={projectIds}
              onValueChange={setProjectIds}
              filter={(item, query) => {
                const proj = projects.find((p) => (p._id?.toString() || p.id) === item)
                const pName = proj ? (proj.name || "") : item
                return pName.toLowerCase().includes(query.toLowerCase())
              }}
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
              <ComboboxContent anchor={projectsAnchor} className="z-55 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
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

          <Field>
            <FieldLabel className="flex items-center gap-1">
              <User className="size-3 text-blue-500" /> Associated People
            </FieldLabel>
            <Combobox
              multiple
              autoHighlight
              items={people.map((p) => p._id?.toString() || p.id || "")}
              value={personIds}
              onValueChange={setPersonIds}
              filter={(item, query) => {
                const person = people.find((p) => (p._id?.toString() || p.id) === item)
                const pName = person ? (person.name || "") : item
                return pName.toLowerCase().includes(query.toLowerCase())
              }}
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
              <ComboboxContent anchor={peopleAnchor} className="z-55 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
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

        <Field>
          <FieldLabel htmlFor="order">Display Order</FieldLabel>
          <Input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="bg-background/40"
          />
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-2 border-t border-border/40 pt-4 mt-2">
        {onDelete && (
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting || isLoading}
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
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading || isDeleting} className="gap-2">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {isEdit ? "Save Changes" : "Create Resource"}
          </Button>
        </div>
      </div>
    </form>
  )
}
