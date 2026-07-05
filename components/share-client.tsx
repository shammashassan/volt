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
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { addResourceAction, updateResourceAction } from "@/lib/actions/resources";
import { Category, ResourceType, ResourceStatus } from "@/lib/types";

interface ShareClientProps {
  categories: Category[];
}

export function ShareClient({ categories }: ShareClientProps) {
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
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [resourceType, setResourceType] = useState<ResourceType>("website");
  const [resourceStatus, setResourceStatus] = useState<ResourceStatus>("saved");
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
    setDescription(extractedDesc);

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
        description,
        categoryId: categoryId === "none" ? "" : categoryId,
        type: resourceType,
        status: resourceStatus,
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
              <form onSubmit={handleUpdate} className="pt-2 border-t">
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
                    <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="h-8 text-xs bg-background/50 border-input"
                      required
                    />
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
                      className="min-h-[64px] text-xs bg-background/50 border-input resize-y"
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
                            <SelectItem value="none" className="text-xs">Uncategorized</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id || String(cat._id)} value={cat.id || String(cat._id)} className="text-xs">
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
                            <SelectItem value="website" className="text-xs">Website</SelectItem>
                            <SelectItem value="youtube" className="text-xs">YouTube</SelectItem>
                            <SelectItem value="github" className="text-xs">GitHub</SelectItem>
                            <SelectItem value="linkedin" className="text-xs">LinkedIn</SelectItem>
                            <SelectItem value="instagram" className="text-xs">Instagram</SelectItem>
                            <SelectItem value="facebook" className="text-xs">Facebook</SelectItem>
                            <SelectItem value="reddit" className="text-xs">Reddit</SelectItem>
                            <SelectItem value="article" className="text-xs">Article</SelectItem>
                            <SelectItem value="tool" className="text-xs">Tool</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* Status & Favorite */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Status Dropdown */}
                    <Field>
                      <FieldLabel htmlFor="status" className="text-xs font-semibold text-muted-foreground">
                        Status
                      </FieldLabel>
                      <Select value={resourceStatus} onValueChange={(val) => setResourceStatus(val as ResourceStatus)}>
                        <SelectTrigger id="status" className="h-8 text-xs w-full bg-background/50">
                          <SelectValue placeholder="Saved" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">
                          <SelectGroup>
                            <SelectItem value="saved" className="text-xs">Saved</SelectItem>
                            <SelectItem value="reviewing" className="text-xs">Reviewing</SelectItem>
                            <SelectItem value="using" className="text-xs">Using</SelectItem>
                            <SelectItem value="archived" className="text-xs">Archived</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    {/* Favorite Switch Toggle */}
                    <div className="flex items-center justify-between p-2 rounded-lg border bg-background/25 border-border/40 h-8 self-end">
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
