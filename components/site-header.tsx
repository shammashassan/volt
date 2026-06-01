"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchCommand } from "@/components/search-command"
import { ModeToggle } from "@/components/mode-toggle"
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

export function SiteHeader() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<any[]>([])
  const isHome = pathname === "/"

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

  const categoryId = pathname.split("/").pop()
  const category = categories.find(c => c.id === categoryId)

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
                    {category ? category.title : (pathname.includes('/category/') ? "Category" : pathname.split('/').filter(Boolean).pop())}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <SearchCommand />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
