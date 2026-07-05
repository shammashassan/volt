"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Link2, Star, Check, AlertCircle, X } from "lucide-react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { addResourceAction } from "@/lib/actions/resources";
import { Category, ResourceStatus, ResourceType } from "@/lib/types";

interface ShareClientProps {
  categories: Category[];
}

export function ShareClient({ categories }: ShareClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [status, setStatus] = useState<"editing" | "saving" | "success" | "error">("editing");
  const [errorMsg, setErrorMsg] = useState("");
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

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

  const extractedTitle = titleParam || (extractedUrl ? new URL(extractedUrl).hostname : "");
  const extractedDesc = textParam && textParam !== extractedUrl ? textParam : "";

  // Form Fields
  const [title, setTitle] = useState(extractedTitle);
  const [url, setUrl] = useState(extractedUrl);
  const [description, setDescription] = useState(extractedDesc);
  const [type, setType] = useState<ResourceType>("website");
  const [categoryId, setCategoryId] = useState("none");
  const [resourceStatus, setResourceStatus] = useState<ResourceStatus>("saved");
  const [favorite, setFavorite] = useState(false);

  // Submit quick capture
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("A valid URL link is required to save.");
      return;
    }

    setStatus("saving");

    const resourcePayload = {
      title: title || (url ? new URL(url).hostname : "Shared Link"),
      url,
      description: description || undefined,
      categoryId: categoryId === "none" ? undefined : categoryId,
      tags: [],
      status: resourceStatus,
      type,
      favorite,
      projectIds: [],
      personIds: [],
    };

    // Check online status to support offline saving
    const isOnline = typeof window !== "undefined" ? navigator.onLine : true;

    if (!isOnline) {
      try {
        // Save to offline queue in localStorage
        const stored = localStorage.getItem("volt_offline_resources") || "[]";
        const queue = JSON.parse(stored);
        queue.push(resourcePayload);
        localStorage.setItem("volt_offline_resources", JSON.stringify(queue));

        setIsOfflineSaved(true);
        setStatus("success");
        toast.info("Offline Mode: Link saved locally! Will sync when reconnected.");

        setTimeout(() => {
          router.push("/resources");
        }, 1800);
      } catch (err: unknown) {
        setStatus("error");
        const errMsg = err instanceof Error ? err.message : "Failed to save offline resource.";
        setErrorMsg(errMsg);
      }
      return;
    }

    // Online saving
    try {
      const res = await addResourceAction(resourcePayload);
      if (res.success) {
        setIsOfflineSaved(false);
        setStatus("success");
        toast.success("Resource saved to Volt successfully!");
        
        setTimeout(() => {
          router.push("/resources");
        }, 1800);
      } else {
        setStatus("error");
        setErrorMsg(res.error || "Failed to save the link.");
      }
    } catch (err: unknown) {
      setStatus("error");
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred while saving.";
      setErrorMsg(errMsg);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl border-border/40 bg-card/30 backdrop-blur-md relative overflow-hidden">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

      <CardHeader className="text-center pb-4 border-b">
        <CardTitle className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
          <Link2 className="size-6 text-primary" />
          <span>Quick Capture</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Volt PWA Mobile Share Target Gateway
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[220px] flex flex-col justify-center pt-5">
        <AnimatePresence mode="wait">
          {/* 1. SAVING LOADER */}
          {status === "saving" && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-12 gap-4 text-center"
            >
              <div className="relative flex items-center justify-center">
                <Loader2 className="size-10 animate-spin text-primary" />
                <div className="absolute size-4 bg-primary/10 rounded-full animate-ping" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">Saving resource...</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Adding link to your second brain.
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
              className="flex flex-col items-center justify-center py-10 gap-4 text-center"
            >
              <div className="size-12 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Save Failed</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-2.5 mt-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                  Go to Dashboard
                </Button>
                <Button size="sm" onClick={() => setStatus("editing")}>
                  Edit & Retry
                </Button>
              </div>
            </motion.div>
          )}

          {/* 3. SUCCESS CHECKMARK */}
          {status === "success" && (
            <motion.div
              key="success-splash"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-4 text-center"
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="size-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-1"
              >
                <motion.svg
                  className="size-8"
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
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">
                  {isOfflineSaved ? "Saved Locally!" : "Link Saved!"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isOfflineSaved 
                    ? "Saved offline. Sync will complete automatically when reconnected."
                    : "Resource successfully saved to your personal knowledge base."
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* 4. EDIT / CAPTURE FORM */}
          {status === "editing" && (
            <motion.form
              key="edit-form"
              onSubmit={handleSave}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FieldGroup>
                {/* Title */}
                <Field>
                  <FieldLabel htmlFor="title">Title *</FieldLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Next.js Best Practices"
                    className="h-9 text-xs bg-background/50 border-input"
                    required
                  />
                </Field>

                {/* URL */}
                <Field>
                  <FieldLabel htmlFor="url">URL Link *</FieldLabel>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-9 text-xs bg-background/50 border-input"
                    required
                  />
                </Field>

                {/* Description */}
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe why this resource is useful…"
                    className="min-h-[70px] text-xs bg-background/50 border-input resize-none"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* Category Dropdown */}
                  <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category" className="h-9 text-xs w-full bg-background/50">
                        <SelectValue placeholder="Uncategorized" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-md">
                        <SelectGroup>
                          <SelectItem value="none" className="text-xs">Uncategorized</SelectItem>
                          {categories.map((cat) => {
                            const cid = cat.id || String(cat._id);
                            return (
                              <SelectItem key={cid} value={cid} className="text-xs">
                                {cat.name}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Type Dropdown */}
                  <Field>
                    <FieldLabel htmlFor="type">Type</FieldLabel>
                    <Select value={type} onValueChange={(val) => setType(val as ResourceType)}>
                      <SelectTrigger id="type" className="h-9 text-xs w-full bg-background/50">
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

                <div className="grid grid-cols-2 gap-3.5 items-end">
                  {/* Status Dropdown */}
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select value={resourceStatus} onValueChange={(val) => setResourceStatus(val as ResourceStatus)}>
                      <SelectTrigger id="status" className="h-9 text-xs w-full bg-background/50">
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

                  {/* Favorite Switch */}
                  <div className="flex items-center justify-between p-2 h-9 rounded-lg border bg-background/25 border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Star className={`size-3.5 ${favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      <Label htmlFor="favorite" className="text-[11px] font-medium cursor-pointer">
                        Favorite
                      </Label>
                    </div>
                    <Switch id="favorite" checked={favorite} onCheckedChange={setFavorite} />
                  </div>
                </div>
              </FieldGroup>

              {/* Form Buttons */}
              <div className="flex gap-2.5 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs cursor-pointer gap-1.5"
                  onClick={() => router.push("/resources")}
                >
                  <X className="size-3.5" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="flex-1 text-xs cursor-pointer gap-1.5"
                >
                  <Check className="size-3.5" />
                  <span>Save Link</span>
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
