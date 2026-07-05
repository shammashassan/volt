"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { 
  ArrowRightIcon,
  FileTextIcon
} from "lucide-react"
import { ICON_MAP } from "@/lib/icons"

import { Category } from "@/types"
import { getCategoriesAction } from "@/lib/actions/categories"

interface CategoryWithCount extends Category {
  resourceCount?: number
}

interface CategoryExplorerProps {
  initialCategories?: CategoryWithCount[]
}

export function CategoryExplorer({ initialCategories }: CategoryExplorerProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories || [])

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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
      {(Array.isArray(categories) ? categories : []).map((category) => {
        const Icon = (category.icon && ICON_MAP[category.icon as keyof typeof ICON_MAP]) || FileTextIcon
        const resourceCount = category.resourceCount || 0
        
        return (
          <Link key={category.id} href={`/categories/${category.id}`} className="group block">
            <Card className="h-full border-border/40 bg-card/40 backdrop-blur-sm transition-[border-color,background-color,shadow] duration-300 group-hover:border-primary/30 group-hover:bg-card group-hover:shadow-2xl group-hover:shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {Icon && <Icon className="size-5" />}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40 transition-colors group-hover:text-primary">
                  {resourceCount} Resources
                  <ArrowRightIcon className="size-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl font-black tracking-tight mb-2 lowercase italic group-hover:text-primary transition-colors">
                  {category.title}
                </CardTitle>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
