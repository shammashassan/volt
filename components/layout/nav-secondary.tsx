"use client"

import * as React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  label,
  size = "default",
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
  label?: string
  size?: "default" | "sm" | "lg"
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { isMobile, setOpenMobile } = useSidebar()
  const handleLinkClick = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                size={size}
                isActive={item.isActive}
                className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden"
                render={
                  <Link href={item.url} onClick={handleLinkClick}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
