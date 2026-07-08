"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { PlusCircle, Loader2, Globe, Info, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { addResourceAction } from "@/lib/actions"
import { useRouter } from "next/navigation"

function getDomainFromUrl(url: string): string {
    if (!url) return ""
    try {
        const u = new URL(url.startsWith("http") ? url : `https://${url}`)
        return u.hostname.replace(/^www\./, "")
    } catch {
        return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0] || ""
    }
}

export function QuickSaveCard() {
    const router = useRouter()
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetchingMetadata, setFetchingMetadata] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [metadata, setMetadata] = useState<{
        title: string
        description: string
        faviconUrl: string
    } | null>(null)

    const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setUrl(val)
        setMetadata(null)
        if (val.trim() && val.includes(".") && val.length > 4) {
            try {
                setFetchingMetadata(true)
                setShowPreview(true)
                const res = await fetch(`/api/resources/metadata?url=${encodeURIComponent(val)}`)
                if (res.ok) setMetadata(await res.json())
            } catch {
                // silent fallback
            } finally {
                setFetchingMetadata(false)
            }
        } else {
            setShowPreview(false)
        }
    }

    const handleSave = async () => {
        if (!url.trim()) return
        setLoading(true)
        const title = metadata?.title || getDomainFromUrl(url) || "Saved Resource"
        const description = metadata?.description || ""
        try {
            const result = await addResourceAction({
                title, url, description,
                categoryId: "", tags: [],
                whySaved: "quick save", notes: "",
                type: "website",
                favorite: false, projectIds: [], personIds: [],
            })
            if (result.success) {
                toast.success("Saved to Workspace!")
                setUrl("")
                setMetadata(null)
                setShowPreview(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to save resource")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const domain = getDomainFromUrl(url)

    return (
        <Card className="flex flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
            {/* Header */}
            <CardHeader className="flex flex-row items-center gap-0 p-0 pb-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="flex size-5 items-center justify-center rounded bg-muted/60">
                        <PlusCircle className="size-3 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        quick save
                    </span>
                </div>

                {/* Tips — (i) hover card */}
                <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                        <button
                            type="button"
                            className="flex size-5 items-center justify-center rounded-full text-muted-foreground/30 transition-colors hover:text-muted-foreground/70"
                        >
                            <Info className="size-3.5" />
                            <span className="sr-only">Tips</span>
                        </button>
                    </HoverCardTrigger>
                    <HoverCardContent align="end" sideOffset={6} className="w-56 p-3">
                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                Quick Save Tips
                            </p>
                            <Separator />
                            <ul className="flex flex-col gap-1.5 list-none">
                                <li className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                                    <span className="mt-0.5 text-primary/60">·</span>
                                    Paste any URL — title and description are fetched automatically.
                                </li>
                                <li className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                                    <span className="mt-0.5 text-primary/60">·</span>
                                    Works with docs, articles, repos, tools, and more.
                                </li>
                                <li className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                                    <span className="mt-0.5 text-primary/60">·</span>
                                    Resources land in your inbox until categorized.
                                </li>
                            </ul>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            </CardHeader>

            {/* Body */}
            <CardContent className="flex flex-1 flex-col justify-center p-0">
                <Popover open={showPreview} onOpenChange={setShowPreview}>
                    <PopoverAnchor asChild>
                        <form
                            onSubmit={e => {
                                e.preventDefault()
                                handleSave()
                            }}
                            className="w-full"
                        >
                            <InputGroup>
                                <InputGroupAddon align="inline-start">
                                    <Globe />
                                </InputGroupAddon>
                                <InputGroupInput
                                    type="text"
                                    value={url}
                                    onChange={handleUrlChange}
                                    placeholder="Paste a URL to save…"
                                    disabled={loading}
                                />
                                {url.trim() && (
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                            onClick={() => setShowPreview(prev => !prev)}
                                            variant="ghost"
                                            size="icon-xs"
                                            title="Toggle preview details"
                                        >
                                            {fetchingMetadata ? (
                                                <Loader2 className="size-3.5 animate-spin text-primary" />
                                            ) : (
                                                <Info className={`size-3.5 transition-colors ${showPreview ? "text-primary" : ""}`} />
                                            )}
                                        </InputGroupButton>
                                        <InputGroupButton
                                            type="submit"
                                            disabled={loading}
                                            size="icon-xs"
                                            title="Save to Workspace"
                                        >
                                            {loading ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <ChevronRight className="size-3.5" />
                                            )}
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                        </form>
                    </PopoverAnchor>

                    <PopoverContent
                        align="start"
                        side="top"
                        sideOffset={6}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="w-(--radix-popover-trigger-width)"
                    >
                        {fetchingMetadata ? (
                            <div className="flex items-center gap-2 py-1">
                                <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Fetching details…</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    {metadata?.faviconUrl ? (
                                        <img
                                            src={metadata.faviconUrl}
                                            alt=""
                                            className="size-4 shrink-0 rounded object-contain"
                                            onError={e => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none"
                                            }}
                                        />
                                    ) : (
                                        <Globe className="size-4 shrink-0 text-muted-foreground/40" />
                                    )}
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-foreground truncate leading-snug">
                                            {metadata?.title || domain || url}
                                        </span>
                                        {domain && (
                                            <span className="text-[10px] text-muted-foreground/60 truncate">
                                                {domain}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {metadata?.description && (
                                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed line-clamp-3 pl-6 border-l border-border/40 ml-2">
                                        {metadata.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                <p className="text-[10px] text-muted-foreground/35 text-center mt-3">
                    press enter or click the chevron to save
                </p>
            </CardContent>
        </Card>
    )
}