"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Loader2, Globe } from "lucide-react"
import { toast } from "sonner"
import { addResourceAction } from "@/lib/actions"
import { useRouter } from "next/navigation"

function getDomainFromUrl(url: string): string {
    if (!url) return ""
    const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0] || ""
    return domain.split(".")[0] || ""
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
        if (!val.trim()) {
            setMetadata(null)
            return
        }
        if (val.includes(".") && val.length > 4) {
            try {
                setFetchingMetadata(true)
                const res = await fetch(`/api/resources/metadata?url=${encodeURIComponent(val)}`)
                if (res.ok) {
                    const data = await res.json()
                    setMetadata(data)
                }
            } catch {
                // silent fallback
            } finally {
                setFetchingMetadata(false)
            }
        } else {
            setMetadata(null)
        }
    }

    const handleSave = async () => {
        if (!url.trim()) return
        setLoading(true)
        const title = metadata?.title || getDomainFromUrl(url) || "Saved Resource"
        const description = metadata?.description || ""

        try {
            const result = await addResourceAction({
                title,
                url,
                description,
                categoryId: "",
                tags: [],
                whySaved: "quick save",
                notes: "",
                status: "saved",
                type: "website",
                favorite: false,
                projectIds: [],
                personIds: [],
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

    return (
        <Card className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-2 p-0 pb-4">
                <PlusCircle className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold italic lowercase text-muted-foreground/90">
                    quick save
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-between gap-3 p-0">
                <div className="flex flex-col gap-3 w-full">
                    <Input
                        type="text"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="Paste a URL to save…"
                        disabled={loading}
                        className="h-9 w-full text-xs"
                    />

                    {url.trim() ? (
                        <div className="animate-in fade-in-0 slide-in-from-top-2 flex flex-col gap-3 duration-200">
                            {/* Website Metadata Preview */}
                            {fetchingMetadata ? (
                                <div className="flex items-center justify-center rounded-lg border border-border bg-muted/40 p-4">
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : metadata ? (
                                <div className="flex gap-2.5 rounded-lg border border-border bg-muted/40 p-2.5">
                                    {metadata.faviconUrl ? (
                                        <img
                                            src={metadata.faviconUrl}
                                            alt=""
                                            className="size-5 shrink-0 rounded bg-muted object-contain p-0.5"
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement
                                                target.style.display = "none"
                                            }}
                                        />
                                    ) : (
                                        <Globe className="size-5 shrink-0 text-muted-foreground/50" />
                                    )}
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-xs font-bold text-foreground">
                                            {metadata.title}
                                        </span>
                                        <span className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                                            {metadata.description}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-2.5">
                                    <Globe className="size-5 shrink-0 text-muted-foreground/50" />
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-xs font-medium text-muted-foreground">
                                            {getDomainFromUrl(url) || url}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/60">
                                            No preview available
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <Button
                                onClick={handleSave}
                                disabled={loading || !url.trim()}
                                className="w-full text-xs font-semibold"
                            >
                                {loading ? (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                ) : null}
                                {loading ? "Saving to Workspace…" : "Save to Workspace"}
                            </Button>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    )
}