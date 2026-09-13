"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Loader2,
  Link2,
  Star,
  Check,
  AlertCircle,
  Globe,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group";
import { addResourceAction, updateResourceAction, getResourceAction } from "@/lib/actions/resources";
import { Category, ResourceType, Resource } from "@/types";
import { UrlMetadata } from "@/lib/services/metadata.service";

interface ShareClientProps {
  categories: Category[];
  initialUrl?: string;
  initialTitle?: string;
  initialMetadata?: UrlMetadata | null;
}

function detectResourceType(urlStr: string): ResourceType {
  try {
    if (!urlStr) return "website";
    const cleanUrl = urlStr.trim();
    const url = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
    const host = url.hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("github.com")) return "github";
    if (host.includes("reddit.com")) return "reddit";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("facebook.com")) return "facebook";
    if (host.includes("instagram.com")) return "instagram";
    return "website";
  } catch {
    return "website";
  }
}

export function ShareClient({
  categories,
  initialUrl = "",
  initialTitle = "",
  initialMetadata = null,
}: ShareClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasTriggeredSave = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Parse OS shared params (fallback if not provided as props)
  const titleParam = initialTitle || searchParams.get("title") || "";
  const textParam = searchParams.get("text") || "";
  const urlParam = searchParams.get("url") || "";

  // Extract valid URL from parameters
  let sharedUrl = initialUrl;
  if (!sharedUrl) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matchUrl = urlParam.match(urlRegex) || textParam.match(urlRegex);
    if (matchUrl) {
      sharedUrl = matchUrl[0];
    }
  }

  // Lifecycle status
  const [status, setStatus] = useState<"idle" | "fetching" | "saving" | "success" | "error">(() => {
    return sharedUrl ? "saving" : "idle";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isDuplicateLink, setIsDuplicateLink] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form Fields
  const [title, setTitle] = useState(initialMetadata?.title || titleParam || "");
  const [url, setUrl] = useState(sharedUrl || "");
  const [description, setDescription] = useState(initialMetadata?.description || "");
  const [faviconUrl, setFaviconUrl] = useState(initialMetadata?.faviconUrl || "");
  const [iconFailed, setIconFailed] = useState(false);
  const [categoryId, setCategoryId] = useState("none");
  const [resourceType, setResourceType] = useState<ResourceType>(() => detectResourceType(sharedUrl));
  const [favorite, setFavorite] = useState(false);

  // Quick save manual input state (idle mode)
  const [manualUrl, setManualUrl] = useState("");
  const [isFetchingManualMeta, setIsFetchingManualMeta] = useState(false);
  const [manualMeta, setManualMeta] = useState<UrlMetadata | null>(null);

  // Execute save for a given URL and metadata
  const executeSave = useCallback(
    async (targetUrl: string, metaToUse?: UrlMetadata | null) => {
      setStatus("saving");
      try {
        let resolvedMeta = metaToUse;
        if (!resolvedMeta) {
          setStatus("fetching");
          try {
            const res = await fetch(`/api/resources/metadata?url=${encodeURIComponent(targetUrl)}`);
            if (res.ok) {
              resolvedMeta = await res.json();
            }
          } catch {
            // fallback to domain
          }
        }

        setStatus("saving");

        let fallbackHostname = "";
        try {
          fallbackHostname = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`).hostname;
        } catch {
          fallbackHostname = "Shared Link";
        }

        const finalTitle = resolvedMeta?.title || titleParam || fallbackHostname;
        const finalDesc = resolvedMeta?.description || (textParam && textParam !== targetUrl ? textParam : "");
        const detectedType = detectResourceType(targetUrl);

        setTitle(finalTitle);
        setUrl(targetUrl);
        setDescription(finalDesc);
        setResourceType(detectedType);
        if (resolvedMeta?.faviconUrl) {
          setFaviconUrl(resolvedMeta.faviconUrl);
        }

        const res = await addResourceAction({
          title: finalTitle,
          url: targetUrl,
          description: finalDesc,
          categoryId: "", // Default to Inbox
          tags: [],
          type: detectedType,
          favorite: false,
          projectIds: [],
          personIds: [],
        });

        if (res.success && res.id) {
          setResourceId(res.id);
          setStatus("success");
          toast.success("Link saved to Inbox!");
        } else if ((res as { isDuplicate?: boolean }).isDuplicate && res.id) {
          const dupId = res.id;
          setResourceId(dupId);
          setIsDuplicateLink(true);

          // Fetch existing resource
          const getResult = await getResourceAction(dupId);
          if (getResult.success && getResult.data) {
            const item = getResult.data as Resource;
            setTitle(item.title || "");
            setUrl(item.url || "");
            setDescription(item.description || "");
            setCategoryId(item.categoryId || "none");
            setResourceType((item.type as ResourceType) || "website");
            setFavorite(!!item.favorite);
          }
          setStatus("success");
          toast.warning("This URL is already in your library!");
        } else {
          setStatus("error");
          setErrorMsg(res.error || "Failed to auto-save the link.");
        }
      } catch (err: unknown) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred during quick save.");
      }
    },
    [titleParam, textParam]
  );

  // Auto-save on mount if sharedUrl is present
  useEffect(() => {
    if (hasTriggeredSave.current) return;
    if (!sharedUrl) {
      setStatus("idle");
      return;
    }

    hasTriggeredSave.current = true;
    executeSave(sharedUrl, initialMetadata);
  }, [sharedUrl, initialMetadata, executeSave]);

  // Handle manual input in idle mode (debounced metadata fetch)
  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualUrl(val);
    setManualMeta(null);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.trim() && val.includes(".") && val.trim().length > 4) {
      setIsFetchingManualMeta(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/resources/metadata?url=${encodeURIComponent(val.trim())}`);
          if (res.ok) {
            const data: UrlMetadata = await res.json();
            setManualMeta(data);
          }
        } catch {
          // silent fallback
        } finally {
          setIsFetchingManualMeta(false);
        }
      }, 350);
    } else {
      setIsFetchingManualMeta(false);
    }
  };

  const handleManualSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUrl = manualUrl.trim();
    if (!targetUrl) {
      toast.error("Please enter a URL to save");
      return;
    }
    await executeSave(targetUrl, manualMeta);
  };

  // Submit quick edit updates in success view
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId) return;

    setIsUpdating(true);
    try {
      const updateData = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        categoryId: categoryId === "none" ? "" : categoryId,
        type: resourceType,
        favorite,
      };

      const res = await updateResourceAction(resourceId, updateData);
      if (res.success) {
        toast.success("Resource categorized successfully!");
        router.push("/resources");
      } else {
        toast.error(res.error || "Failed to update resource.");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An error occurred while updating the resource.";
      toast.error(errMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl border-border/40 bg-card/30 backdrop-blur-md relative overflow-hidden">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
          <Link2 className="size-6 text-primary" />
          <span>Quick Capture</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Volt PWA Mobile Quick Save Gateway
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[220px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* 1. IDLE STATE — Quick Save Input Panel */}
          {status === "idle" && (
            <motion.div
              key="idle-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-2"
            >
              <form onSubmit={handleManualSave} className="space-y-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="manual-url" className="text-xs font-semibold text-muted-foreground">
                      Paste or Type URL
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        {manualMeta?.faviconUrl ? (
                          <img
                            src={manualMeta.faviconUrl}
                            alt=""
                            className="size-4 shrink-0 rounded object-contain"
                          />
                        ) : (
                          <Globe className="size-4 text-muted-foreground/60" />
                        )}
                      </InputGroupAddon>
                      <InputGroupInput
                        id="manual-url"
                        type="text"
                        value={manualUrl}
                        onChange={handleManualUrlChange}
                        placeholder="https://example.com"
                        autoFocus
                      />
                      <InputGroupAddon align="inline-end">
                        {isFetchingManualMeta && (
                          <Loader2 className="size-3.5 animate-spin text-primary" />
                        )}
                        <InputGroupButton
                          type="submit"
                          disabled={!manualUrl.trim()}
                          size="icon-xs"
                          title="Save to Workspace"
                        >
                          <ChevronRight className="size-3.5" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </FieldGroup>

                {/* Live Preview of Metadata */}
                {manualMeta && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      {manualMeta.faviconUrl && (
                        <img
                          src={manualMeta.faviconUrl}
                          alt=""
                          className="size-4 shrink-0 rounded object-contain"
                        />
                      )}
                      <span className="text-xs font-semibold text-foreground truncate">
                        {manualMeta.title}
                      </span>
                    </div>
                    {manualMeta.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-6 border-l border-border/40 ml-2">
                        {manualMeta.description}
                      </p>
                    )}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={!manualUrl.trim()}
                  className="w-full cursor-pointer mt-2"
                >
                  <PlusCircle className="size-4 mr-2" />
                  Save to Workspace
                </Button>
              </form>
            </motion.div>
          )}

          {/* 2. SAVING / FETCHING LOADER */}
          {(status === "fetching" || status === "saving") && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-10 gap-4 text-center"
            >
              <div className="relative flex items-center justify-center">
                <Loader2 className="size-10 animate-spin text-primary" />
                <div className="absolute size-4 bg-primary/10 rounded-full animate-ping" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">
                  {status === "fetching" ? "Fetching title & description…" : "Saving resource to Workspace…"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Automatically capturing metadata into your second brain inbox.
                </p>
              </div>
            </motion.div>
          )}

          {/* 3. ERROR STATE */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8 gap-4 text-center"
            >
              <div className="size-12 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Unable to Save Link</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-2.5 mt-2">
                <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
                  Enter URL Manually
                </Button>
                <Button size="sm" onClick={() => router.push("/")}>
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          )}

          {/* 4. SUCCESS + QUICK EDIT PANEL */}
          {status === "success" && (
            <motion.div
              key="success-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Success Checkmark Animation */}
              <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="size-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2.5"
                >
                  <motion.svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                    />
                  </motion.svg>
                </motion.div>
                <h3 className="font-bold text-base text-foreground">
                  {isDuplicateLink ? "Resource Already Saved" : "Link Saved Successfully!"}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {isDuplicateLink
                    ? "This link is already in your library. You can update its details or category below."
                    : "Saved to your Inbox with title & description. Organize it below or close this window."}
                </p>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleUpdate} className="pt-2 border-t">
                {isDuplicateLink && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-left text-xs mb-4">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-bold">Duplicate Detected:</span> This URL already exists in your library. You can update its details or category below.
                    </div>
                  </div>
                )}
                <FieldGroup>
                  {/* Title */}
                  <Field>
                    <FieldLabel htmlFor="title" className="text-xs font-semibold text-muted-foreground">
                      Title
                    </FieldLabel>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter resource title..."
                      className="h-8 text-xs bg-background/50 border-input"
                      required
                    />
                  </Field>

                  {/* URL */}
                  <Field>
                    <FieldLabel htmlFor="url" className="text-xs font-semibold text-muted-foreground">
                      URL Link
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        {faviconUrl && !iconFailed ? (
                          <img
                            src={faviconUrl}
                            alt=""
                            className="size-3.5 shrink-0 rounded object-contain"
                            onError={() => setIconFailed(true)}
                          />
                        ) : (
                          <Globe className="size-3.5 text-muted-foreground/60" />
                        )}
                      </InputGroupAddon>
                      <InputGroupInput
                        id="url"
                        value={url}
                        onChange={(e) => {
                          const newUrl = e.target.value;
                          setUrl(newUrl);
                          setResourceType(detectResourceType(newUrl));
                        }}
                        placeholder="https://example.com"
                        className="h-8 text-xs bg-background/50 border-input"
                        required
                      />
                    </InputGroup>
                  </Field>

                  {/* Description */}
                  <Field>
                    <FieldLabel htmlFor="description" className="text-xs font-semibold text-muted-foreground">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter resource description..."
                      className="min-h-[56px] text-xs bg-background/50 border-input resize-y"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Category Dropdown */}
                    <Field>
                      <FieldLabel htmlFor="category" className="text-xs font-semibold text-muted-foreground">
                        Category
                      </FieldLabel>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger id="category" className="h-8 text-xs w-full bg-background/50">
                          <SelectValue placeholder="Uncategorized" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">
                          <SelectGroup>
                            <SelectItem value="none" className="text-xs">
                              Uncategorized
                            </SelectItem>
                            {categories.map((cat) => (
                              <SelectItem
                                key={cat.slug || String(cat._id)}
                                value={cat.slug || String(cat._id)}
                                className="text-xs"
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    {/* Type Dropdown */}
                    <Field>
                      <FieldLabel htmlFor="type" className="text-xs font-semibold text-muted-foreground">
                        Type
                      </FieldLabel>
                      <Select value={resourceType} onValueChange={(val) => setResourceType(val as ResourceType)}>
                        <SelectTrigger id="type" className="h-8 text-xs w-full bg-background/50">
                          <SelectValue placeholder="Website" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">
                          <SelectGroup>
                            <SelectItem value="website" className="text-xs">
                              Website
                            </SelectItem>
                            <SelectItem value="youtube" className="text-xs">
                              YouTube
                            </SelectItem>
                            <SelectItem value="github" className="text-xs">
                              GitHub
                            </SelectItem>
                            <SelectItem value="linkedin" className="text-xs">
                              LinkedIn
                            </SelectItem>
                            <SelectItem value="instagram" className="text-xs">
                              Instagram
                            </SelectItem>
                            <SelectItem value="facebook" className="text-xs">
                              Facebook
                            </SelectItem>
                            <SelectItem value="reddit" className="text-xs">
                              Reddit
                            </SelectItem>
                            <SelectItem value="article" className="text-xs">
                              Article
                            </SelectItem>
                            <SelectItem value="tool" className="text-xs">
                              Tool
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* Status & Favorite */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Favorite Switch Toggle */}
                    <div className="flex items-center justify-between p-2 rounded-lg border bg-background/25 border-border/40 h-8 self-end col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-2">
                        <Star className={`size-4 ${favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                        <Label htmlFor="favorite" className="text-xs font-medium cursor-pointer">
                          Favorite
                        </Label>
                      </div>
                      <Switch id="favorite" checked={favorite} onCheckedChange={setFavorite} />
                    </div>
                  </div>
                </FieldGroup>

                {/* Form Buttons */}
                <div className="flex gap-2.5 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs cursor-pointer"
                    onClick={() => router.push("/resources")}
                  >
                    Keep in Inbox
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1 text-xs cursor-pointer gap-1.5"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    <span>Save & Organize</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

