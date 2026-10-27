"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as "user" | "admin"

    const promise = authClient.admin.createUser({
      email,
      name,
      password,
      role,
    }).then(({ error }) => {
      if (error) {
        throw new Error(error.message || "Failed to create user")
      }
      onSuccess()
      onOpenChange(false)
    })

    try {
      await toast.promise(promise, {
        loading: "Creating user...",
        success: "User created successfully",
        error: (err: any) => err?.message || "Failed to create user",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] no-scrollbar">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account directly in the workspace.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" name="name" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select name="role" defaultValue="user">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
