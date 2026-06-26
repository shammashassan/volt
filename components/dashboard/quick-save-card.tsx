"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { PlusCircle, Loader2, Globe, Info, ExternalLink } from "lucide-react"
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
                const res = await fetch(`/api/resources/metadata?url=${encodeURIComponent(val)}`)
                if (res.ok) setMetadata(await res.json())
            } catch {
                // silent fallback
            } finally {
                setFetchingMetadata(false)
            }
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
                status: "saved", type: "website",
                favorite: false, projectIds: [], personIds: [],
            })
            if (result.success) {
                toast.success("Saved to Workspace!")
                setUrl("")
                setMetadata(null)
                router.refresh()
            } else {
                toast.error("Failed to save resource")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const domain = getDomainFromUrl(url)

    return (
        <Card className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
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
            <CardContent className="flex flex-1 flex-col gap-3 p-0">
                <Input
                    type="text"
                    value={url}
                    onChange={handleUrlChange}
                    placeholder="Paste a URL to save…"
                    disabled={loading}
                    className="h-9 w-full text-xs"
                />

                {url.trim() ? (
                    <div className="animate-in fade-in-0 slide-in-from-top-1 flex flex-col gap-2.5 duration-150">
                        {/* Compact site preview — triggers popover for full details */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-2 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    {fetchingMetadata ? (
                                        <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                                    ) : metadata?.faviconUrl ? (
                                        <img
                                            src={metadata.faviconUrl}
                                            alt=""
                                            className="size-3.5 shrink-0 rounded object-contain"
                                            onError={e => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none"
                                            }}
                                        />
                                    ) : (
                                        <Globe className="size-3.5 shrink-0 text-muted-foreground/50" />
                                    )}
                                    <span className="flex-1 truncate text-xs text-muted-foreground">
                                        {fetchingMetadata ? "Fetching details…" : metadata?.title || domain || url}
                                    </span>
                                    <ExternalLink className="size-3 shrink-0 text-muted-foreground/30" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" sideOffset={6} className="w-72 p-3">
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-start gap-2.5">
                                        {metadata?.faviconUrl ? (
                                            <img
                                                src={metadata.faviconUrl}
                                                alt=""
                                                className="mt-0.5 size-5 shrink-0 rounded object-contain"
                                                onError={e => {
                                                    (e.currentTarget as HTMLImageElement).style.display = "none"
                                                }}
                                            />
                                        ) : (
                                            <Globe className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
                                        )}
                                        <div className="flex flex-col min-w-0 gap-0.5">
                                            <p className="text-xs font-semibold text-foreground leading-snug">
                                                {metadata?.title || domain || "No title found"}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">{domain}</p>
                                        </div>
                                    </div>
                                    {metadata?.description ? (
                                        <>
                                            <Separator />
                                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                                                {metadata.description}
                                            </p>
                                        </>
                                    ) : !fetchingMetadata ? (
                                        <p className="text-[11px] text-muted-foreground/50 italic">
                                            No description found for this URL.
                                        </p>
                                    ) : null}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            onClick={handleSave}
                            disabled={loading || !url.trim()}
                            className="w-full text-xs font-semibold"
                        >
                            {loading && <Loader2 data-icon="inline-start" className="animate-spin" />}
                            {loading ? "Saving to Workspace…" : "Save to Workspace"}
                        </Button>
                    </div>
                ) : (
                    /* Empty state — fills the card when no URL is entered */
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-5">
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted/30">
                            <Globe className="size-4 text-muted-foreground/40" />
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed px-3">
                            Paste any URL above to instantly save it to your workspace.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}