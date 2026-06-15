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
  Layers,
  FolderOpen,
  Tag,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
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
import { usePathname, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { getCategoriesAction } from "@/lib/actions/categories"
import { Category } from "@/lib/types"
import { RESOURCE_TYPES } from "@/lib/resource-types"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialCategories?: Category[]
}

export function AppSidebar({ initialCategories, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTypeParam = searchParams?.get("type") || null

  const typeSubItems = RESOURCE_TYPES.map(type => ({
    title: type.label,
    url: `/resources?type=${type.value}`,
    isActive: pathname === "/resources" && activeTypeParam === type.value,
  }))

  const { data: session } = authClient.useSession()
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const user = session?.user as { role?: string } | undefined
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (initialCategories) {
      setCategories(initialCategories)
      return
    }
    async function fetchCategories() {
      try {
        const result = await getCategoriesAction()
        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [initialCategories])

  const categorySubItems = (Array.isArray(categories) ? categories : []).map(category => ({
    title: category.name || category.title || "Untitled Category",
    url: `/categories/${category.id}`,
    isActive: pathname === `/categories/${category.id}`,
  }))

  const platformItems = [
    {
      title: "Dashboard",
      url: "/explore",
      icon: LayoutGrid,
      isActive: pathname === "/explore",
    },
    {
      title: "Resources",
      url: "/resources",
      icon: LibraryIcon,
      isActive: pathname === "/resources" && activeTypeParam === null,
    },
    {
      title: "CLI Commands",
      url: "/commands",
      icon: SquareTerminal,
      isActive: pathname === "/commands",
    },
    {
      title: "Workspace",
      url: "/projects",
      icon: FolderOpen,
      isActive: ["/projects", "/notes"].includes(pathname),
      items: [
        { title: "Projects", url: "/projects", isActive: pathname === "/projects" },
        { title: "Notes", url: "/notes", isActive: pathname === "/notes" },
      ],
    },
    {
      title: "Organize",
      url: "/categories",
      icon: Layers,
      isActive: ["/categories", "/tags", "/people"].includes(pathname),
      items: [
        { title: "Categories", url: "/categories", isActive: pathname === "/categories" },
        { title: "Tags", url: "/tags", isActive: pathname === "/tags" },
        { title: "People", url: "/people", isActive: pathname === "/people" },
      ],
    },
    {
      title: "Types",
      url: "/resources",
      icon: Tag,
      isActive: pathname === "/resources" && activeTypeParam !== null,
      items: typeSubItems,
    },
    // Categories collapsible — only rendered when there are DB categories
    ...(categorySubItems.length > 0
      ? [{
        title: "Categories",
        url: "/categories",
        icon: BookOpen,
        isActive: categorySubItems.some(c => c.isActive),
        items: categorySubItems,
      }]
      : []),
  ]

  const adminItems = isAdmin
    ? [{ title: "Manage Users", url: "/users", icon: UsersIcon }]
    : []

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
                  <span className="truncate font-medium">Volt</span>
                  <span className="truncate text-xs">v2.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={platformItems} label="Platform" />

        {isMounted && adminItems.length > 0 && (
          <NavSecondary items={adminItems} label="Admin" className="mt-auto" />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}