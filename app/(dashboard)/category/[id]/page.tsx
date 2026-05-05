import { getResources, getCategoryById, getCategories } from "@/lib/db"
import { ResourceCard } from "@/components/resource-card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { ICON_MAP } from "@/lib/icons"
import { CategoryActions } from "./category-actions"

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: categoryId } = await params
  const [category, resources, categories] = await Promise.all([
    getCategoryById(categoryId),
    getResources(),
    getCategories()
  ])

  const categoryResources = resources.filter((r) => r.category === categoryId)

  if (!category) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground">Category not found.</p>
      </div>
    )
  }

  const Icon = ICON_MAP[category.icon] || FileText

  return (
    <div className="flex flex-1 flex-col @container/main">
      <div className="flex flex-col gap-4 px-4 py-8 md:gap-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  {category.title}
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {categoryResources.length} <span className="hidden sm:inline ml-1">Resources</span>
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              {category.description}
            </p>
          </div>
          <CategoryActions categoryId={categoryId} categories={categories} />
        </div>

        <Separator className="opacity-40" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryResources.map((resource) => (
            <ResourceCard key={resource.name} resource={resource} />
          ))}
          {categoryResources.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl font-semibold text-muted-foreground">No resources yet.</p>
              <p className="text-sm text-muted-foreground/60">We're still curating the best tools for this section.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
