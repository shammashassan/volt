"use client"

import * as React from "react"
import { useState } from "react"
import { Category, ResourceType, ResourceStatus } from "@/lib/types"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { addResourceAction } from "@/lib/actions"
import { toast } from "sonner"
import { CheckCircle2, Loader2, Link as LinkIcon, Compass, Tags, HelpCircle, FileText } from "lucide-react"

interface QuickSaveContentProps {
  categories: Category[]
  initialUrl?: string
  initialTitle?: string
}

function detectResourceType(urlStr: string): ResourceType {
  try {
    if (!urlStr) return "website"
    const cleanUrl = urlStr.trim()
    const url = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`)
    const host = url.hostname.toLowerCase()
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube"
    if (host.includes("github.com")) return "github"
    if (host.includes("reddit.com")) return "reddit"
    if (host.includes("linkedin.com")) return "linkedin"
    if (host.includes("facebook.com")) return "facebook"
    if (host.includes("instagram.com")) return "instagram"
    return "website"
  } catch {
    return "website"
  }
}

export function QuickSaveContent({ categories, initialUrl = "", initialTitle = "" }: QuickSaveContentProps) {
  const [url, setUrl] = useState(initialUrl)
  const [title, setTitle] = useState(initialTitle)
  const [categoryId, setCategoryId] = useState("none")
  const [resourceType, setResourceType] = useState<ResourceType>(() => detectResourceType(initialUrl))
  const [tagsInput, setTagsInput] = useState("")
  const [whySaved, setWhySaved] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast.error("URL is required")
      return
    }
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    setIsLoading(true)

    // Parse tags separated by spaces or commas
    const tagsArray = tagsInput
      .split(/[ ,]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t !== "")

    const result = await addResourceAction({
      title,
      url,
      description: whySaved, // Fallback as description or keep empty
      categoryId: categoryId === "none" || !categoryId ? undefined : categoryId,
      tags: tagsArray,
      whySaved,
      notes,
      status: "saved" as ResourceStatus,
      type: resourceType,
      favorite: false,
      projectIds: [],
      personIds: []
    })

    setIsLoading(false)

    if (result.success) {
      setIsSuccess(true)
      toast.success("Resource saved successfully!")
    } else {
      toast.error(result.error || "Failed to save resource")
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-4 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="size-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground lowercase italic">saved to volt!</h2>
          <p className="text-sm text-muted-foreground/80 max-w-xs leading-relaxed">
            You can now close this browser popup or tab.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsSuccess(false)
            setUrl("")
            setTitle("")
            setCategoryId("none")
            setTagsInput("")
            setWhySaved("")
            setNotes("")
          }}
          size="sm"
          variant="outline"
          className="mt-2 text-xs font-bold uppercase tracking-wider"
        >
          Save Another Link
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 animate-in fade-in-0 duration-300">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-black tracking-tight text-foreground bg-clip-text bg-linear-to-r from-foreground to-foreground/60 lowercase italic">
          quick save
        </h2>
        <p className="text-xs text-muted-foreground/80 font-medium">
          Instantly capture links and knowledge into your second brain.
        </p>
      </div>

      <FieldGroup>
        {/* URL Input */}
        <Field>
          <FieldLabel htmlFor="url">
            <LinkIcon className="size-3.5" /> URL
          </FieldLabel>
          <Input
            id="url"
            type="text"
            value={url}
            onChange={(e) => {
              const val = e.target.value
              setUrl(val)
              setResourceType(detectResourceType(val))
            }}
            placeholder="https://example.com"
            disabled={isLoading}
            required
            className="h-10 bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </Field>

        {/* Title Input */}
        <Field>
          <FieldLabel htmlFor="title">
            <Compass className="size-3.5" /> Title
          </FieldLabel>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page Title"
            disabled={isLoading}
            required
            className="h-10 bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </Field>

        {/* Category & Type row */}
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger id="category" className="bg-background/50 border-border/60">
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
            <FieldLabel htmlFor="type">Resource Type</FieldLabel>
            <Select value={resourceType} onValueChange={(val) => setResourceType(val as ResourceType)} disabled={isLoading}>
              <SelectTrigger id="type" className="bg-background/50 border-border/60">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Tags Input */}
        <Field>
          <FieldLabel htmlFor="tags">
            <Tags className="size-3.5" /> Tags <span className="text-[9px] text-muted-foreground/60 lowercase font-normal">(space or comma separated)</span>
          </FieldLabel>
          <Input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. design system utility react"
            disabled={isLoading}
            className="h-10 bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </Field>

        {/* Why Saved */}
        <Field>
          <FieldLabel htmlFor="whySaved">
            <HelpCircle className="size-3.5" /> Why are you saving this?
          </FieldLabel>
          <Textarea
            id="whySaved"
            value={whySaved}
            onChange={(e) => setWhySaved(e.target.value)}
            placeholder="Quick summary of what caught your eye..."
            disabled={isLoading}
            className="min-h-[60px] bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary text-xs"
          />
        </Field>

        {/* Notes */}
        <Field>
          <FieldLabel htmlFor="notes">
            <FileText className="size-3.5" /> Personal Notes
          </FieldLabel>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional thoughts or details..."
            disabled={isLoading}
            className="min-h-[60px] bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary text-xs"
          />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 text-sm font-bold uppercase tracking-widest mt-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Resource"
        )}
      </Button>
    </form>
  )
}
