import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStats } from "@/lib/queries/dashboard";
import { cacheLife, cacheTag } from "next/cache"
import {
  ZapIcon,
  LayersIcon,
  FileTextIcon,
  UsersIcon
} from "lucide-react"

export async function DashboardStats({ userId }: { userId: string }) {
  'use cache'
  cacheLife('minutes')
  cacheTag(`dashboard-stats-${userId}`)

  const statsData = await getStats(userId)

  const stats = [
    {
      title: "Total Resources",
      value: statsData.resourcesCount.toLocaleString(),
      description: "Saved items & links",
      icon: LayersIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Collections",
      value: statsData.collectionsCount.toLocaleString(),
      description: "Organized categories",
      icon: ZapIcon,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Notes",
      value: statsData.notesCount.toLocaleString(),
      description: "Markdown & thoughts",
      icon: FileTextIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Network Contacts",
      value: statsData.peopleCount.toLocaleString(),
      description: "People & collaborators",
      icon: UsersIcon,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      {stats.map((stat) => (
        <Card key={stat.title} size="sm">
          <CardHeader>
            <CardTitle>
              {stat.title}
            </CardTitle>
            <CardAction>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardAction>
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
