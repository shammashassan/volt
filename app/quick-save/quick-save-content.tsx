"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Category, ResourceType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { addResourceAction } from "@/lib/actions"
import { toast } from "sonner"
import {
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  Compass,
  Tags,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  AlignLeft,
} from "lucide-react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { UrlMetadata } from "@/lib/services/metadata.service"

interface QuickSaveContentProps {
  categories: Category[]
  initialUrl?: string
  initialTitle?: string
  initialMetadata?: UrlMetadata | null
}

function detectResourceType(urlStr: string): ResourceType {
  try {
    if (!urlStr) return "website"
    const cleanUrl = urlStr.trim()
    const url = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`)
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

export function QuickSaveContent({
  categories,
  initialUrl = "",
  initialTitle = "",
  initialMetadata = null,
}: QuickSaveContentProps) {
  const [url, setUrl] = useState(initialUrl)
  const [title, setTitle] = useState(initialTitle || initialMetadata?.title || "")
  const [description, setDescription] = useState(initialMetadata?.description || "")
  const [faviconUrl, setFaviconUrl] = useState(initialMetadata?.faviconUrl || "")
  const [iconFailed, setIconFailed] = useState(false)
  const [categoryId, setCategoryId] = useState("none")
  const [resourceType, setResourceType] = useState<ResourceType>(() => detectResourceType(initialUrl))
  const [tagsInput, setTagsInput] = useState("")
  const [whySaved, setWhySaved] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Track if user manually modified title or description
  const userEditedTitle = useRef(Boolean(initialTitle && initialTitle !== initialMetadata?.title))
  const userEditedDescription = useRef(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Auto-fetch metadata if initialUrl was passed without server pre-fetched metadata
  useEffect(() => {
    if (initialUrl && initialUrl.includes(".") && !initialMetadata) {
      setIsFetchingMetadata(true)
      fetch(`/api/resources/metadata?url=${encodeURIComponent(initialUrl)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: UrlMetadata | null) => {
          if (data) {
            if (!userEditedTitle.current && data.title) {
              setTitle(data.title)
            }
            if (!userEditedDescription.current && data.description) {
              setDescription(data.description)
            }
            if (data.faviconUrl) {
              setFaviconUrl(data.faviconUrl)
              setIconFailed(false)
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsFetchingMetadata(false)
        })
    }
  }, [initialUrl, initialMetadata])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUrl(val)
    setResourceType(detectResourceType(val))
    setIconFailed(false)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (val.trim() && val.includes(".") && val.trim().length > 4) {
      setIsFetchingMetadata(true)
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/resources/metadata?url=${encodeURIComponent(val.trim())}`)
          if (res.ok) {
            const data: UrlMetadata = await res.json()
            if (!userEditedTitle.current && data.title) {
              setTitle(data.title)
            }
            if (!userEditedDescription.current && data.description) {
              setDescription(data.description)
            }
            if (data.faviconUrl) {
              setFaviconUrl(data.faviconUrl)
              setIconFailed(false)
            }
          }
        } catch {
          // silent fallback
        } finally {
          setIsFetchingMetadata(false)
        }
      }, 350)
    } else {
      setIsFetchingMetadata(false)
      setFaviconUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast.error("URL is required")
      return
    }

    const finalTitle = title.trim() || initialMetadata?.title || url.trim()

    setIsLoading(true)

    // Parse tags separated by spaces or commas
    const tagsArray = tagsInput
      .split(/[ ,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== "")

    const result = await addResourceAction({
      title: finalTitle,
      url: url.trim(),
      description: description.trim() || whySaved.trim() || "",
      categoryId: categoryId === "none" || !categoryId ? undefined : categoryId,
      tags: tagsArray,
      whySaved: whySaved.trim() || undefined,
      notes: notes.trim() || undefined,
      type: resourceType,
      favorite: false,
      projectIds: [],
      personIds: [],
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
            setDescription("")
            setFaviconUrl("")
            userEditedTitle.current = false
            userEditedDescription.current = false
            setCategoryId("none")
            setTagsInput("")
            setWhySaved("")
            setNotes("")
          }}
          size="sm"
          variant="outline"
          className="mt-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Save Another Link
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 animate-in fade-in-0 duration-300">
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
          <InputGroup>
            <InputGroupAddon align="inline-start">
              {faviconUrl && !iconFailed ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="size-4 shrink-0 rounded object-contain"
                  onError={() => setIconFailed(true)}
                />
              ) : (
                <Globe className="size-4 text-muted-foreground/60" />
              )}
            </InputGroupAddon>
            <InputGroupInput
              id="url"
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              disabled={isLoading}
              required
            />
            {isFetchingMetadata && (
              <InputGroupAddon align="inline-end">
                <Loader2 className="size-3.5 animate-spin text-primary" />
              </InputGroupAddon>
            )}
          </InputGroup>
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
            onChange={(e) => {
              setTitle(e.target.value)
              userEditedTitle.current = true
            }}
            placeholder={isFetchingMetadata ? "Fetching title…" : "Resource Title"}
            disabled={isLoading}
            required
          />
        </Field>

        {/* Description Input */}
        <Field>
          <FieldLabel htmlFor="description">
            <AlignLeft className="size-3.5" /> Description
          </FieldLabel>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              userEditedDescription.current = true
            }}
            placeholder={isFetchingMetadata ? "Fetching description…" : "Resource description (auto-populated)"}
            disabled={isLoading}
            className="min-h-[56px] text-xs resize-y"
          />
        </Field>

        {/* Category & Type row */}
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug || cat._id?.toString()} value={cat.slug || cat._id?.toString() || ""}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="type">Resource Type</FieldLabel>
            <Select
              value={resourceType}
              onValueChange={(val) => setResourceType(val as ResourceType)}
              disabled={isLoading}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Collapsible details for tags, whySaved, notes */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails} className="w-full">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-center gap-1 text-xs tracking-wider cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="size-3.5" />
                  Hide Extra Details
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  Add Tags, Notes & Why Saved
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            {/* Tags Input */}
            <Field>
              <FieldLabel htmlFor="tags">
                <Tags className="size-3.5" /> Tags{" "}
                <span className="text-[9px] text-muted-foreground/60 lowercase font-normal">
                  (space or comma separated)
                </span>
              </FieldLabel>
              <Input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. design system utility react"
                disabled={isLoading}
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
                className="min-h-[50px] text-xs resize-y"
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
                className="min-h-[50px] text-xs resize-y"
              />
            </Field>
          </CollapsibleContent>
        </Collapsible>
      </FieldGroup>

      <Button type="submit" disabled={isLoading} className="cursor-pointer">
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

