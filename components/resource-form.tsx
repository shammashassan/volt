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
import { categories } from "@/lib/data"
import { Loader2 } from "lucide-react"

interface ResourceFormProps {
  initialData?: any
  onSubmit: (formData: FormData) => Promise<void>
  isLoading: boolean
}

export function ResourceForm({ initialData, onSubmit, isLoading }: ResourceFormProps) {
  return (
    <form action={onSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Resource Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={initialData?.name} 
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
          defaultValue={initialData?.link} 
          placeholder="https://..." 
          required 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={initialData?.category || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
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
        <Label htmlFor="description">Description</Label>
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
