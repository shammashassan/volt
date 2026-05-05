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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Check } from "lucide-react"
import { toast } from "sonner"

interface ResourceFormProps {
  initialData?: any
  onSubmit: (formData: FormData) => Promise<void>
  isLoading: boolean
  categories: any[]
}

export function ResourceForm({ initialData, onSubmit, isLoading, categories }: ResourceFormProps) {
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState(initialData?.name || "")
  const [link, setLink] = useState(initialData?.link || "")

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
    <form action={onSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Resource Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aceternity UI" 
          required 
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="link">Link URL</Label>
        <Input 
          id="link" 
          name="link" 
          type="url" 
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..." 
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={initialData?.category || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
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
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="featured" name="featured" defaultChecked={initialData?.featured} />
        <Label htmlFor="featured">Featured Resource</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Update Resource" : "Add Resource"}
      </Button>
    </form>
  )
}
