"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  Command,
  SquareTerminal,
  UsersIcon,
  LibraryIcon,
  LayoutGrid,
  Layers
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ICON_MAP } from "@/lib/icons"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()
  const [categories, setCategories] = useState<any[]>([])

  const user = session?.user as any
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const navMainItems = [
    {
      title: "Explore",
      url: "/explore",
      icon: LayoutGrid,
      isActive: pathname === "/explore",
    },
    {
      title: "CLI Commands",
      url: "/commands",
      icon: SquareTerminal,
      isActive: pathname === "/commands",
    },
  ]

  if (isAdmin) {
    navMainItems.push(
      {
        title: "Manage Categories",
        url: "/categories",
        icon: Layers,
        isActive: pathname === "/categories",
      },
      {
        title: "Manage Resources",
        url: "/resources",
        icon: LibraryIcon,
        isActive: pathname === "/resources",
      },
      {
        title: "Manage Users",
        url: "/users",
        icon: UsersIcon,
        isActive: pathname === "/users",
      }
    )
  }

  const categoryItems = categories.map(category => ({
    title: category.title,
    url: `/category/${category.id}`,
    icon: ICON_MAP[category.icon] || BookOpen,
    isActive: pathname === `/category/${category.id}`,
  }))

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">UI Dev</span>
                  <span className="truncate text-xs">Second Brain</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} label="Platform" />
        <NavMain items={categoryItems} label="Categories" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
