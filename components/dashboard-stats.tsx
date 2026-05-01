import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { categories } from "@/lib/data"
import { getResources } from "@/lib/db"
import {
  ZapIcon,
  LayersIcon,
  CpuIcon,
  ActivityIcon
} from "lucide-react"

export async function DashboardStats() {
  const resources = await getResources()
  const totalResources = resources.length
  const totalCategories = categories.length

  const stats = [
    {
      title: "Total Resources",
      value: totalResources.toString(),
      description: "Curated UI library items",
      icon: LayersIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Categories",
      value: totalCategories.toString(),
      description: "Organized tool sections",
      icon: ZapIcon,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "System Status",
      value: "Online",
      description: "Ready for discovery",
      icon: ActivityIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Latest Add",
      value: resources[0]?.name || "None",
      description: "Most recently synced",
      icon: CpuIcon,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/40 bg-card/40 backdrop-blur-sm transition-[border-color,box-shadow,background-color] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground/80 lowercase italic">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">{stat.value}</div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
