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
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Copy, Check } from "lucide-react"
import { ICON_LABELS, ICON_MAP } from "@/lib/icons"
import { toast } from "sonner"

interface CategoryFormProps {
  initialData?: any
  onSubmit: (formData: FormData) => Promise<void>
  isLoading: boolean
}

export function CategoryForm({ initialData, onSubmit, isLoading }: CategoryFormProps) {
  const [copied, setCopied] = useState(false)
  const [title, setTitle] = useState(initialData?.title || "")

  const copyPrompt = () => {
    const prompt = `Write a short, professional description for a UI resource category titled "${title}". 
The description should be concise (max 15 words) and highlight the value for design engineers. 
Examples: 
- UI Blocks, Layout Inspiration & Design Showcases
- Reusable UI Components & Design Systems
- Animations, Interactions & Effects`

    navigator.clipboard.writeText(prompt)
    setCopied(true)
    toast.success("AI Prompt copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <form action={onSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="id">Category ID (URL Slug)</Label>
        <Input
          id="id"
          name="id"
          defaultValue={initialData?.id}
          placeholder="e.g. build-blocks"
          required
          disabled={!!initialData}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Build Blocks"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            name="order"
            type="number"
            defaultValue={initialData?.order || 0}
            placeholder="0"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="icon">Icon</Label>
          <Select name="icon" defaultValue={initialData?.icon || "Rocket"}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {ICON_LABELS.map((item) => {
                const Icon = ICON_MAP[item.value]
                return (
                  <SelectItem key={item.value} value={item.value}>
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="size-4" />}
                      <span>{item.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground italic -mt-4">Lower numbers show first (e.g., 1 appears before 2).</p>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
            onClick={copyPrompt}
            disabled={!title}
          >
            {copied ? <Check className="size-3" /> : <Sparkles className="size-3" />}
            Copy AI Prompt
          </Button>
        </div>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description}
          placeholder="Briefly describe this category..."
          required
          className="min-h-[80px]"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Category" : "Add Category"}
      </Button>
    </form>
  )
}
