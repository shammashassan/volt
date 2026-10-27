"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchCommand } from "@/components/search/search-command"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { NotificationMenu } from "@/components/notifications/notification-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"

import { Category, Collection } from "@/types"
import { getCategoriesAction } from "@/lib/actions/categories"

interface SiteHeaderProps {
  initialCategories?: Category[]
  initialCollections?: Collection[]
}

function HeaderBreadcrumb({ initialCategories }: { initialCategories?: Category[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const isHome = pathname === "/"

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

  const activeCategoryParam = searchParams?.get("category") || null
  const category = Array.isArray(categories) ? categories.find(c => c.slug === activeCategoryParam) : undefined

  if (isHome) return null

  const label = category
    ? category.name
    : (pathname.includes('/categories') ? "Categories" : pathname.split('/').filter(Boolean).pop())

  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage className="text-foreground capitalize">
          {label}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </>
  )
}

export function SiteHeader({ initialCategories }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center border-b bg-background/80 backdrop-blur-md transition-all ease-linear">
      <div className="flex h-full w-(--header-height) shrink-0 items-center justify-center">
        <SidebarTrigger />
      </div>
      <Separator
        orientation="vertical"
        className="h-full"
      />
      <div className="flex h-full flex-1 items-center justify-between gap-2 px-4 lg:gap-4 lg:px-6">
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" className="flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-foreground" />}>
                <Home className="size-4" />
                Volt
              </BreadcrumbLink>
            </BreadcrumbItem>
            <React.Suspense fallback={null}>
              <HeaderBreadcrumb initialCategories={initialCategories} />
            </React.Suspense>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <SearchCommand />
          <NotificationMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
