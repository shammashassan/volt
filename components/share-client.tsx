"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Link2, Star, Check, AlertCircle } from "lucide-react";
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
import { addResourceAction, updateResourceAction } from "@/lib/actions/resources";
import { Category, Project } from "@/lib/types";

interface ShareClientProps {
  categories: Category[];
  projects: Project[];
}

export function ShareClient({ categories, projects }: ShareClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasTriggeredSave = useRef(false);

  // States
  const [status, setStatus] = useState<"parsing" | "saving" | "success" | "error">("parsing");
  const [errorMsg, setErrorMsg] = useState("");
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [projectId, setProjectId] = useState("none");
  const [favorite, setFavorite] = useState(false);

  // Parse OS shared params
  const titleParam = searchParams.get("title") || "";
  const textParam = searchParams.get("text") || "";
  const urlParam = searchParams.get("url") || "";

  // Extract valid URL from parameters
  let extractedUrl = "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matchUrl = urlParam.match(urlRegex) || textParam.match(urlRegex);
  if (matchUrl) {
    extractedUrl = matchUrl[0];
  }

  const extractedTitle = titleParam || (extractedUrl ? new URL(extractedUrl).hostname : "Shared Link");
  const extractedDesc = textParam && textParam !== extractedUrl ? textParam : "";

  // Run auto-save immediately on load
  useEffect(() => {
    if (hasTriggeredSave.current) return;
    if (!extractedUrl) {
      setStatus("error");
      setErrorMsg("No valid URL was found in the shared content. Make sure you share a valid webpage link.");
      return;
    }

    hasTriggeredSave.current = true;
    setStatus("saving");

    setTitle(extractedTitle);
    setUrl(extractedUrl);

    addResourceAction({
      title: extractedTitle,
      url: extractedUrl,
      description: extractedDesc,
      categoryId: "", // default to Inbox/Uncategorized
      tags: [],
      status: "saved",
      type: "website",
      favorite: false,
      projectIds: [],
      personIds: [],
    })
      .then((res) => {
        if (res.success && res.id) {
          setResourceId(res.id);
          setStatus("success");
          toast.success("Link saved to Inbox!");
        } else {
          setStatus("error");
          setErrorMsg(res.error || "Failed to auto-save the link.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message || "An unexpected error occurred during quick save.");
      });
  }, [extractedUrl, extractedTitle, extractedDesc]);

  // Submit quick edit updates
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId) return;

    setIsUpdating(true);
    try {
      const updateData = {
        title,
        url,
        categoryId: categoryId === "none" ? "" : categoryId,
        projectIds: projectId === "none" ? [] : [projectId],
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
          Volt PWA Mobile Share Target Gateway
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[220px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* 1. SAVING/PARSING LOADER */}
          {(status === "parsing" || status === "saving") && (
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
                <h3 className="font-semibold text-sm text-foreground">Saving shared link...</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Adding resource to your second brain&apos;s uncategorized inbox.
                </p>
              </div>
            </motion.div>
          )}

          {/* 2. ERROR STATE */}
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
                <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                  Go to Dashboard
                </Button>
                <Button size="sm" onClick={() => router.refresh()}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {/* 3. SUCCESS + QUICK EDIT PANEL */}
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
                <h3 className="font-bold text-base text-foreground">Link Saved successfully!</h3>
                <p className="text-[11px] text-muted-foreground">
                  Saved to your Inbox. Categorize it below or close this window.
                </p>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleUpdate} className="space-y-4 pt-1 border-t">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter resource title..."
                    className="h-8 text-xs bg-background/50 border-input"
                    required
                  />
                </div>

                {/* URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="url" className="text-xs font-semibold text-muted-foreground">
                    URL Link
                  </Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-8 text-xs bg-background/50 border-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category Dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-semibold text-muted-foreground">
                      Category
                    </Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category" className="h-8 text-xs w-full bg-background/50">
                        <SelectValue placeholder="Inbox" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-md">
                        <SelectGroup>
                          <SelectItem value="none" className="text-xs">Inbox (Uncategorized)</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id || String(cat._id)} value={cat.id || String(cat._id)} className="text-xs">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project Dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="project" className="text-xs font-semibold text-muted-foreground">
                      Link to Project
                    </Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger id="project" className="h-8 text-xs w-full bg-background/50">
                        <SelectValue placeholder="None (Optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-md">
                        <SelectGroup>
                          <SelectItem value="none" className="text-xs">None (Optional)</SelectItem>
                          {projects.map((proj) => {
                            const pid = proj.id || String(proj._id);
                            return (
                              <SelectItem key={pid} value={pid} className="text-xs">
                                {proj.name}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Favorite Toggle */}
                <div className="flex items-center justify-between p-2 rounded-lg border bg-background/25 border-border/40">
                  <div className="flex items-center gap-2">
                    <Star className={`size-4 ${favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    <Label htmlFor="favorite" className="text-xs font-medium cursor-pointer">
                      Add to Favorites
                    </Label>
                  </div>
                  <Switch id="favorite" checked={favorite} onCheckedChange={setFavorite} />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2.5 pt-2">
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
