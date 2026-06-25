"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchCommand } from "@/components/search-command"
import { ModeToggle } from "@/components/mode-toggle"
import { HeaderBell } from "@/components/header-bell"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"

import { Category } from "@/lib/types"
import { getCategoriesAction } from "@/lib/actions/categories"

interface SiteHeaderProps {
  initialCategories?: Category[]
}

export function SiteHeader({ initialCategories }: SiteHeaderProps) {
  const pathname = usePathname()
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

  const categoryId = pathname.split("/").pop()
  const category = Array.isArray(categories) ? categories.find(c => c.id === categoryId) : undefined

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md transition-all ease-linear">
      <div className="flex w-full items-center justify-between gap-2 px-4 lg:gap-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 hidden lg:block"
          />
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-foreground">
                    <Home className="size-4" />
                    Volt
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!isHome && <BreadcrumbSeparator />}
              {!isHome && (
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">
                    {category ? category.title : (pathname.includes('/categories/') ? "Category" : pathname.split('/').filter(Boolean).pop())}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <SearchCommand />
          <HeaderBell />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
