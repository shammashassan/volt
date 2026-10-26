"use client"

import * as React from "react"
import { Project, Resource, Note, ProjectStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Folder, FileText, Link as LinkIcon, Calendar, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ResourceCard } from "@/components/resources/resource-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"

interface ProjectContentProps {
  project: Project
  resources: Resource[]
  notes: Note[]
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; variant: "secondary" | "outline" | "destructive" | "primary" | "success" | "warning" | "info" }> = {
  active: { label: "Active", variant: "primary" },
  completed: { label: "Completed", variant: "secondary" },
  paused: { label: "Paused", variant: "outline" }
}

export function ProjectContent({ project, resources, notes }: ProjectContentProps) {
  const router = useRouter()
  const status = STATUS_CONFIG[project.status] || { label: "Active", variant: "primary" as const }
  const [activeTab, setActiveTab] = React.useState("resources")

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 max-w-7xl">
          {/* Project details */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5 text-xs font-medium transition-colors rounded-lg px-2 self-start"
              onClick={() => router.push("/projects")}
            >
              <ArrowLeft className="size-3.5" />
              Back to Projects
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Folder className="size-6" />
              </div>
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60 leading-tight">
                  {project.name}
                </h1>
                <Badge variant={status.variant} className="text-[10px] uppercase tracking-wider font-bold rounded-full select-none px-2.5 h-6 shrink-0">
                  {status.label}
                </Badge>
              </div>
            </div>

            {project.description && (
              <p className="text-lg text-muted-foreground/80 font-medium leading-relaxed max-w-2xl">
                {project.description}
              </p>
            )}
          </div>

          {/* Actions: Visit Live + Created Date */}
          <div className="flex items-center gap-2 self-end md:self-start mt-1 md:mt-0 shrink-0">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Visit Live
              </a>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/40 border border-border/40 px-3 py-1.5 rounded-lg">
              <Calendar className="size-4" />
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Tabs) */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Mobile Select dropdown */}
          <div className="md:hidden w-full mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-10 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resources">Resources ({resources.length})</SelectItem>
                <SelectItem value="notes">Notes ({notes.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden md:grid w-full grid-cols-2 max-w-[400px] mb-4">
              <TabsTrigger value="resources" className="gap-2">
                Resources
                <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
                  {resources.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                Notes
                <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
                  {notes.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden outline-none">
              {resources.length === 0 ? (
                <Empty className="py-20 border-0 bg-transparent rounded-none">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <LinkIcon />
                    </EmptyMedia>
                    <EmptyTitle>No associated resources</EmptyTitle>
                    <EmptyDescription>
                      Link resources from the resources library.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={() => router.push("/resources")} variant="outline" size="sm" className="font-bold">
                      Browse Resources
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id || resource._id?.toString()} resource={resource} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden outline-none">
              {notes.length === 0 ? (
                <Empty className="py-20 border-0 bg-transparent rounded-none">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText />
                    </EmptyMedia>
                    <EmptyTitle>No associated notes</EmptyTitle>
                    <EmptyDescription>
                      Link notes from the notes workspace.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={() => router.push("/notes")} variant="outline" size="sm" className="font-bold">
                      Go to Notes
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {notes.map((note) => (
                    <Card
                      key={note.id || note._id?.toString()}
                      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/20 bg-card/30 backdrop-blur-xs"
                      onClick={() => router.push(`/notes?noteId=${note.id || note._id?.toString()}`)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="font-bold text-sm line-clamp-1 text-foreground">
                          {note.title || "Untitled Note"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground/80 line-clamp-3 leading-relaxed">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}