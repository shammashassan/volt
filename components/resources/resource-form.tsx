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
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Sparkles, Check, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Resource, Category } from "@/types"

interface ResourceFormProps {
  initialData?: any
  onSubmit: (formData: FormData) => Promise<void>
  isLoading: boolean
  categories: any[]
}

export function ResourceForm({ initialData, onSubmit, isLoading, categories }: ResourceFormProps) {
  return (
    <form action={onSubmit} className="grid gap-6">
      <ResourceFormFields initialData={initialData} categories={categories} />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData?.id || initialData?._id ? "Update Resource" : "Add Resource"}
      </Button>
    </form>
  )
}

interface ResourceFormFieldsProps {
  initialData?: Partial<Resource>
  categories: Category[]
}

export function ResourceFormFields({ initialData, categories }: ResourceFormFieldsProps) {
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState(initialData?.name || "")
  const [link, setLink] = useState(initialData?.link || "")
  const [featured, setFeatured] = useState(!!initialData?.featured)

  const copyPrompt = () => {
    const prompt = `Research and write a concise, compelling 1-sentence description for the UI resource "${name}" (${link}). 
Focus on what makes it unique for design engineers or developers.
Format the response as a single sentence without quotes.`
    
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    toast.success("AI Prompt copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <FieldGroup className="py-2">
      <Field>
        <FieldLabel htmlFor="name">Resource Name</FieldLabel>
        <Input 
          id="name" 
          name="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aceternity UI" 
          required 
        />
      </Field>
      
      <Field>
        <FieldLabel htmlFor="link">Link URL</FieldLabel>
        <Input 
          id="link" 
          name="link" 
          type="url" 
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..." 
          required 
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Select name="category" defaultValue={initialData?.category || "none"}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Uncategorized</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id || cat._id?.toString()} value={cat.id || cat._id?.toString() || ""}>
                  {cat.title || cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        
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
      </div>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
            onClick={copyPrompt}
            disabled={!name || !link}
          >
            {copied ? <Check className="size-3" /> : <Sparkles className="size-3" />}
            Copy AI Prompt
          </Button>
        </div>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description}
          placeholder="Briefly describe why this resource is useful..."
          required
          className="min-h-[100px]"
        />
      </Field>

      <Field className="flex flex-col gap-1.5">
        <FieldLabel>Featured</FieldLabel>
        <Toggle
          id="featured-toggle"
          pressed={featured}
          onPressedChange={setFeatured}
          variant="outline"
          className="h-10 w-full justify-start px-3 gap-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
        >
          <Star className={`size-3.5 ${featured ? "fill-current" : ""}`} />
          <span>Featured Resource</span>
        </Toggle>
        <input type="hidden" name="featured" value={featured ? "on" : "off"} />
      </Field>
    </FieldGroup>
  )
}
