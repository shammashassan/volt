"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  UsersIcon,
  LibraryIcon,
  LayoutGrid,
  Layers,
  FolderOpen,
  Tag,
  Film,
  Network,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { getCategoriesAction } from "@/lib/actions/categories"
import { getCollectionsAction } from "@/lib/actions/collections"
import { Category, Collection } from "@/types"
import { RESOURCE_TYPES } from "@/components/resources/resource-types"
import { ICON_MAP } from "@/lib/icons"
import { LogoMark } from "../brand/logo-mark"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialCategories?: Category[]
  initialCollections?: Collection[]
}

function SidebarNavFallback() {
  const overviewItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
      isActive: false,
    },
    {
      title: "Resources",
      url: "/resources",
      icon: LibraryIcon,
      isActive: false,
    },
    {
      title: "Knowledge Graph",
      url: "/graph",
      icon: Network,
      isActive: false,
    },
    {
      title: "CLI Commands",
      url: "/commands",
      icon: SquareTerminal,
      isActive: false,
    },
  ]

  const workspaceItems = [
    {
      title: "Workspace",
      url: "/projects",
      icon: FolderOpen,
      isActive: false,
      items: [
        { title: "Projects", url: "/projects", isActive: false },
        { title: "Notes", url: "/notes", isActive: false },
        { title: "Reminders", url: "/reminders", isActive: false },
      ],
    },
    {
      title: "Media Watchlist",
      url: "/media-watchlist",
      icon: Film,
      isActive: false,
    },
    {
      title: "Organize",
      url: "/categories",
      icon: Layers,
      isActive: false,
      items: [
        { title: "Taxonomy", url: "/categories", isActive: false },
        { title: "Tags", url: "/tags", isActive: false },
        { title: "People", url: "/people", isActive: false },
      ],
    },
  ]

  const typesItems = [
    {
      title: "Resource Types",
      url: "/resources",
      icon: Tag,
      isActive: false,
      items: RESOURCE_TYPES.map(type => ({
        title: type.label,
        url: `/resources?type=${type.value}`,
        isActive: false,
      })),
    },
  ]

  return (
    <>
      <NavMain items={overviewItems} label="Overview" />
      <NavMain items={workspaceItems} label="Workspace" />
      <NavMain items={typesItems} label="Types" />
    </>
  )
}

function SidebarNavContent({
  initialCategories,
  initialCollections,
}: {
  initialCategories?: Category[]
  initialCollections?: Collection[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTypeParam = searchParams?.get("type") || null
  const activeCategoryParam = searchParams?.get("category") || null

  const typeSubItems = RESOURCE_TYPES.map(type => ({
    title: type.label,
    url: `/resources?type=${type.value}`,
    isActive: pathname === "/resources" && activeTypeParam === type.value,
  }))

  const { data: session } = authClient.useSession()
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [collections, setCollections] = useState<Collection[]>(initialCollections || [])
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
          setCategories(result.data as unknown as Category[])
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

  useEffect(() => {
    if (initialCollections) {
      setCollections(initialCollections)
      return
    }
    async function fetchCollections() {
      try {
        const result = await getCollectionsAction()
        if (result.success && Array.isArray(result.data)) {
          setCollections(result.data as unknown as Collection[])
        } else {
          setCollections([])
        }
      } catch (error) {
        console.error("Failed to fetch collections:", error)
        setCollections([])
      }
    }
    fetchCollections()
  }, [initialCollections])

  // Map dynamic collections & categories into sidebar items
  const sortedCollections = [...collections].sort((a, b) => a.order - b.order)
  const collectionItems = sortedCollections.map(coll => {
    const collCategories = categories
      .filter(cat => cat.collectionId === coll.slug)
      .sort((a, b) => a.order - b.order)

    const Icon = ICON_MAP[coll.icon || ""] || BookOpen

    const items = collCategories.map(cat => ({
      title: cat.name,
      url: `/resources?category=${cat.slug}`,
      isActive: pathname === "/resources" && activeCategoryParam === cat.slug,
    }))

    return {
      title: coll.name,
      url: `/resources?collection=${coll.slug}`,
      icon: Icon,
      isActive: items.some(item => item.isActive),
      items: items.length > 0 ? items : undefined,
    }
  }).filter(item => item.items !== undefined)

  const overviewItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Resources",
      url: "/resources",
      icon: LibraryIcon,
      isActive: pathname === "/resources" && activeTypeParam === null && activeCategoryParam === null && !searchParams?.has("collection"),
    },
    {
      title: "Knowledge Graph",
      url: "/graph",
      icon: Network,
      isActive: pathname === "/graph",
    },
    {
      title: "CLI Commands",
      url: "/commands",
      icon: SquareTerminal,
      isActive: pathname === "/commands"
    },
  ]

  const workspaceItems = [
    {
      title: "Workspace",
      url: "/projects",
      icon: FolderOpen,
      isActive: ["/projects", "/notes", "/reminders"].includes(pathname),
      items: [
        { title: "Projects", url: "/projects", isActive: pathname === "/projects" },
        { title: "Notes", url: "/notes", isActive: pathname === "/notes" },
        { title: "Reminders", url: "/reminders", isActive: pathname === "/reminders" },
      ],
    },
    {
      title: "Media Watchlist",
      url: "/media-watchlist",
      icon: Film,
      isActive: pathname === "/media-watchlist",
    },
    {
      title: "Organize",
      url: "/categories",
      icon: Layers,
      isActive: ["/categories", "/tags", "/people"].includes(pathname),
      items: [
        { title: "Taxonomy", url: "/categories", isActive: pathname === "/categories" },
        { title: "Tags", url: "/tags", isActive: pathname === "/tags" },
        { title: "People", url: "/people", isActive: pathname === "/people" },
      ],
    },
  ]

  const typesItems = [
    {
      title: "Resource Types",
      url: "/resources",
      icon: Tag,
      isActive: pathname === "/resources" && activeTypeParam !== null,
      items: typeSubItems,
    },
  ]

  const adminItems = isAdmin
    ? [{ title: "Manage Users", url: "/users", icon: UsersIcon, isActive: pathname === "/users" }]
    : []

  return (
    <>
      <NavMain items={overviewItems} label="Overview" />
      <NavMain items={workspaceItems} label="Workspace" />
      {collectionItems.length > 0 && (
        <NavMain items={collectionItems} label="Collections" />
      )}
      <NavMain items={typesItems} label="Types" />

      {isMounted && adminItems.length > 0 && (
        <NavSecondary items={adminItems} label="Admin" className="mt-auto" />
      )}
    </>
  )
}

export function AppSidebar({ initialCategories, initialCollections, ...props }: AppSidebarProps) {
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
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LogoMark className="size-5!" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">UI Volt</span>
                <span className="truncate text-xs">v2.3.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <React.Suspense fallback={<SidebarNavFallback />}>
          <SidebarNavContent
            initialCategories={initialCategories}
            initialCollections={initialCollections}
          />
        </React.Suspense>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
