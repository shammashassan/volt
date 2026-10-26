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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Sparkles, Check } from "lucide-react"
import { ICON_LABELS, ICON_MAP } from "@/lib/icons"
import { toast } from "@/components/ui/toast"
import { Category, Collection } from "@/types"

interface CategoryFormFieldsProps {
  initialData?: Partial<Category>
  collections: Collection[]
}

export function CategoryFormFields({ initialData, collections }: CategoryFormFieldsProps) {
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState(initialData?.name || "")

  const copyPrompt = () => {
    const prompt = `Write a short, professional description for a UI resource category titled "${name}". 
The description should be concise (max 15 words) and highlight the value for design engineers. 
Examples: 
- UI Blocks, Layout Inspiration & Design Showcases
- Reusable UI Components & Design Systems
- Animations, Interactions & Effects`

    const promise = navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })

    toast.promise(promise, {
      loading: "Copying AI Prompt...",
      success: "AI Prompt copied to clipboard!",
      error: "Failed to copy to clipboard",
    })
  }

  return (
    <FieldGroup className="py-2">
      <Field>
        <FieldLabel htmlFor="slug">Category ID (URL Slug)</FieldLabel>
        <Input
          id="slug"
          name="slug"
          defaultValue={initialData?.slug}
          placeholder="e.g. ui-library"
          required
          disabled={!!initialData}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. UI Libraries"
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="collectionId">Parent Collection</FieldLabel>
        <Select name="collectionId" defaultValue={initialData?.collectionId || (collections[0]?.slug || "")}>
          <SelectTrigger id="collectionId" className="w-full">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((coll) => (
              <SelectItem key={coll.slug} value={coll.slug}>
                {coll.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="order">Display Order</FieldLabel>
          <Input
            id="order"
            name="order"
            type="number"
            defaultValue={initialData?.order || 0}
            placeholder="0"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="icon">Icon</FieldLabel>
          <Select name="icon" defaultValue={initialData?.icon || "Rocket"}>
            <SelectTrigger id="icon" className="w-full">
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
        </Field>
      </div>
      <p className="text-[10px] text-muted-foreground italic -mt-2">Lower numbers show first (e.g., 1 appears before 2).</p>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
            onClick={copyPrompt}
            disabled={!name}
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
      </Field>
    </FieldGroup>
  )
}
