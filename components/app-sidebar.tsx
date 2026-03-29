"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Zap,
  Rocket,
  Component,
  Wrench,
  Palette,
  Search,
  Volume2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
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
import { categories } from "@/lib/data"
import { usePathname } from "next/navigation"
import { LayoutGrid } from "lucide-react"

const ICON_MAP: Record<string, any> = {
  Rocket: Rocket,
  Component: Component,
  Zap: Zap,
  Wrench: Wrench,
  Palette: Palette,
  Map: Map,
  Search: Search,
  Volume2: Volume2,
  Bot: Bot,
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "/category/build",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "/category/start",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "/category/maps",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  
  // Map our Second Brain categories to the NavMain format
  const navMainItems = [
    {
      title: "Explore",
      url: "/explore",
      icon: LayoutGrid,
      isActive: pathname === "/explore",
    },
    ...categories.map(category => ({
      title: category.title,
      url: `/category/${category.id}`,
      icon: ICON_MAP[category.icon] || BookOpen,
      isActive: pathname === `/category/${category.id}`,
    }))
  ]

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
        <NavMain items={navMainItems} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
