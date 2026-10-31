"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar"
import { Person, PersonType } from "@/types"
import { Code2, Palette, Rocket, Sparkles, Building2, User } from "lucide-react"

export const ROLE_ICONS: Record<PersonType, React.ElementType> = {
  developer: Code2,
  designer: Palette,
  founder: Rocket,
  creator: Sparkles,
  company: Building2,
}

export function getPersonInitials(name?: string): string {
  if (!name || !name.trim()) return "P"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export type PersonAvatarSize = "sm" | "default" | "lg" | "xl" | "2xl"

interface PersonAvatarProps {
  person: Pick<Person, "name"> & Partial<Pick<Person, "type">>
  size?: PersonAvatarSize
  className?: string
}

export function PersonAvatar({
  person,
  size = "xl",
  className,
}: PersonAvatarProps) {
  const RoleIcon = person.type ? ROLE_ICONS[person.type] || User : User
  const initials = getPersonInitials(person.name)

  return (
    <Avatar size={size} className={className}>
      <AvatarFallback>{initials}</AvatarFallback>
      <AvatarBadge>
        <RoleIcon />
      </AvatarBadge>
    </Avatar>
  )
}
