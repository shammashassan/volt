"use client"

import * as React from "react"
import { useState } from "react"
import { Person, Resource, Note, PersonType } from "@/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, FileText, Link as LinkIcon, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ResourceCard } from "@/components/resources/resource-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"

interface PersonContentProps {
  person: Person
  resources: Resource[]
  notes: Note[]
}

const TYPE_CONFIG: Record<PersonType, { label: string; variant: "secondary" | "outline" | "destructive" | "default" }> = {
  developer: { label: "Developer", variant: "default" },
  designer: { label: "Designer", variant: "secondary" },
  founder: { label: "Founder", variant: "secondary" },
  creator: { label: "Creator", variant: "outline" },
  company: { label: "Company", variant: "outline" }
}

export function PersonContent({ person, resources, notes }: PersonContentProps) {
  const router = useRouter()
  const typeConfig = TYPE_CONFIG[person.type] || { label: "Developer", variant: "default" as const }
  const [activeTab, setActiveTab] = useState("resources")

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          {/* Profile details */}
          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 self-start"
              onClick={() => router.push("/people")}
            >
              <ArrowLeft className="size-3.5" />
              Back to People
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60 leading-tight">
                  {person.name}
                </h1>
                <Badge variant={typeConfig.variant} className="shrink-0">
                  {typeConfig.label}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-2xl">
              {person.notes && (
                <p className="text-lg text-muted-foreground/80 font-medium leading-relaxed">
                  {person.notes}
                </p>
              )}

              {/* Tags */}
              {person.tags && person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 my-1">
                  {person.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Social / Profile Links */}
              {person.links && person.links.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-1">
                  {person.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-primary hover:underline gap-1 max-w-[250px] truncate"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      {new URL(link).hostname}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Tabs) */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Mobile Select dropdown */}
          <div className="md:hidden w-full mb-4">
            <Select value={activeTab} onValueChange={(val) => { if (val) setActiveTab(val) }}>
              <SelectTrigger className="w-full h-10">
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
              <TabsTrigger value="resources">
                Resources
                <Badge variant="secondary">
                  {resources.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes
                <Badge variant="secondary">
                  {notes.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources"><div className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
              {resources.length === 0 ? (
                <Empty>
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
                    <Button onClick={() => router.push("/resources")} variant="outline" size="sm">
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
            </div></TabsContent>

            <TabsContent value="notes"><div className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
              {notes.length === 0 ? (
                <Empty>
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
                    <Button onClick={() => router.push("/notes")} variant="outline" size="sm">
                      Go to Notes
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {notes.map((note) => (
                    <Card
                      key={note.id || note._id?.toString()}
                      size="sm" className="cursor-pointer"
                      onClick={() => router.push(`/notes?noteId=${note.id || note._id?.toString()}`)}
                    >
                      <CardHeader>
                        <CardTitle>
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
            </div></TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}