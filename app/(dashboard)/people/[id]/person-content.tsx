"use client"

import * as React from "react"
import { useState } from "react"
import { Person, Resource, Note, PersonType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, FileText, Link as LinkIcon, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ResourceCard } from "@/components/resource-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"

interface PersonContentProps {
  person: Person
  resources: Resource[]
  notes: Note[]
}

const TYPE_CONFIG: Record<PersonType, { label: string; variant: "secondary" | "outline" | "destructive" | "primary" | "success" | "warning" | "info" }> = {
  developer: { label: "Developer", variant: "primary" },
  designer: { label: "Designer", variant: "secondary" },
  founder: { label: "Founder", variant: "info" },
  creator: { label: "Creator", variant: "outline" },
  company: { label: "Company", variant: "outline" }
}

export function PersonContent({ person, resources, notes }: PersonContentProps) {
  const router = useRouter()
  const typeConfig = TYPE_CONFIG[person.type] || { label: "Developer", variant: "primary" as const }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          {/* Profile details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-xl border border-border/40 bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-colors"
                onClick={() => router.push("/people")}
                title="Back to People"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  {person.name}
                </h1>
                <Badge variant={typeConfig.variant} className="text-[10px] uppercase tracking-wider font-bold rounded-full select-none px-2.5 h-6">
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
                    <Badge key={tag} variant="secondary" className="text-[9px] uppercase tracking-widest font-bold h-5 px-2">
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
          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
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