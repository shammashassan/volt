"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Resource, Note, Person, PersonType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Tag, FileText, Link as LinkIcon, User, Layers, Search, Folder, X, Filter, ArrowUp, ArrowDown, Flame, CaseSensitive, Calendar } from "lucide-react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { ResourceCard } from "@/components/resource-card"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TagsContentProps {
  resources: Resource[]
  notes: Note[]
  people: Person[]
}

const TYPE_CONFIG: Record<PersonType, { label: string; variant: "secondary" | "outline" | "destructive" | "primary" | "success" | "warning" | "info" }> = {
  developer: { label: "Developer", variant: "primary" },
  designer: { label: "Designer", variant: "secondary" },
  founder: { label: "Founder", variant: "info" },
  creator: { label: "Creator", variant: "outline" },
  company: { label: "Company", variant: "outline" }
}

export function TagsContent({ resources, notes, people }: TagsContentProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "alpha" | "date">("popular")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState("resources")
  const router = useRouter()

  // Calculate tag counts and track the latest entity date for sorting
  const tagStats = useMemo(() => {
    const counts: Record<string, { total: number; resources: number; notes: number; people: number; latestDate: number }> = {}

    resources.forEach((r) => {
      ; (r.tags || []).forEach((tag) => {
        if (!tag.trim()) return
        if (!counts[tag]) counts[tag] = { total: 0, resources: 0, notes: 0, people: 0, latestDate: 0 }
        counts[tag].resources++
        counts[tag].total++
        const rDate = r.createdAt ? new Date(r.createdAt).getTime() : 0
        if (rDate > counts[tag].latestDate) counts[tag].latestDate = rDate
      })
    })

    notes.forEach((n) => {
      ; (n.tags || []).forEach((tag) => {
        if (!tag.trim()) return
        if (!counts[tag]) counts[tag] = { total: 0, resources: 0, notes: 0, people: 0, latestDate: 0 }
        counts[tag].notes++
        counts[tag].total++
        const nDate = n.createdAt ? new Date(n.createdAt).getTime() : 0
        if (nDate > counts[tag].latestDate) counts[tag].latestDate = nDate
      })
    })

    people.forEach((p) => {
      ; (p.tags || []).forEach((tag) => {
        if (!tag.trim()) return
        if (!counts[tag]) counts[tag] = { total: 0, resources: 0, notes: 0, people: 0, latestDate: 0 }
        counts[tag].people++
        counts[tag].total++
        const pDate = p.createdAt ? new Date(p.createdAt).getTime() : 0
        if (pDate > counts[tag].latestDate) counts[tag].latestDate = pDate
      })
    })

    // Convert to array
    return Object.entries(counts).map(([name, stats]) => ({ name, ...stats }))
  }, [resources, notes, people])

  // Filter and sort tags based on user selection
  const processedTags = useMemo(() => {
    let result = [...tagStats]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(query))
    }

    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === "alpha") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "date") {
        comparison = a.latestDate - b.latestDate
      } else {
        comparison = a.total - b.total
      }
      return sortOrder === "desc" ? -comparison : comparison
    })

    return result
  }, [tagStats, searchQuery, sortBy, sortOrder])

  // Filtered entities based on selected tag
  const filteredEntities = useMemo(() => {
    if (!selectedTag) return { resources: [], notes: [], people: [] }
    return {
      resources: resources.filter((r) => (r.tags || []).includes(selectedTag)),
      notes: notes.filter((n) => (n.tags || []).includes(selectedTag)),
      people: people.filter((p) => (p.tags || []).includes(selectedTag)),
    }
  }, [selectedTag, resources, notes, people])

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Tag className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Tags Explorer
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {tagStats.length} <span className="hidden sm:inline ml-1">Unique Tags</span>
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Browse and filter through topics organically linked across resources, notes, and profiles.
            </p>
          </div>
        </div>
      </section>

      {/* Controls: Search and Sort */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          <InputGroup className="flex-1 max-w-none lg:max-w-xs bg-background/50">
            <InputGroupAddon align="inline-start">
              <Search className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <div className="flex gap-2 justify-end w-full lg:w-auto items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter data-icon="inline-start" />
                  <span>
                    Sort: {sortBy === "popular" ? "Popularity" : sortBy === "alpha" ? "Alphabetical" : "Date Created"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSortBy("popular")}>
                    <Flame />
                    <span>Most Popular</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("alpha")}>
                    <CaseSensitive />
                    <span>Alphabetical</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("date")}>
                    <Calendar />
                    <span>Date Created</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? (
                      <ArrowUp />
                    ) : (
                      <ArrowDown />
                    )}
                    <span className="sr-only">Toggle Sort Order</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Sort Order: {sortOrder === "asc" ? "Ascending" : "Descending"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Tag Cloud / Grid */}
          {processedTags.length === 0 ? (
            <Empty className="py-20 border border-dashed rounded-2xl bg-card/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Tag />
                </EmptyMedia>
                <EmptyTitle>No tags found</EmptyTitle>
                <EmptyDescription>
                  {searchQuery ? "Try refining your search query." : "Add tags to resources, notes, or people."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {processedTags.map((tag) => {
                const isSelected = selectedTag === tag.name
                return (
                  <Card
                    key={tag.name}
                    size="sm"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedTag(isSelected ? null : tag.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedTag(isSelected ? null : tag.name)
                      }
                    }}
                    className={cn(
                      "cursor-pointer select-none transition-all hover:bg-muted/50",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary/50"
                    )}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Tag className={cn("size-3.5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground/60")} />
                        <CardTitle className="font-bold text-xs truncate">{tag.name}</CardTitle>
                      </div>
                      <CardAction>
                        <Badge
                          variant={isSelected ? "primary" : "secondary"}
                          className="text-[9px] px-1.5 h-4.5 rounded-full font-bold select-none shrink-0"
                        >
                          {tag.total}
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="pt-0 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                      {tag.resources > 0 && (
                        <span className="flex items-center gap-0.5" title="Resources">
                          <LinkIcon className="size-3 text-blue-500" />
                          {tag.resources}
                        </span>
                      )}
                      {tag.notes > 0 && (
                        <span className="flex items-center gap-0.5" title="Notes">
                          <FileText className="size-3 text-amber-500" />
                          {tag.notes}
                        </span>
                      )}
                      {tag.people > 0 && (
                        <span className="flex items-center gap-0.5" title="People">
                          <User className="size-3 text-emerald-500" />
                          {tag.people}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Filtered Content View */}
          {selectedTag && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Layers className="size-5 text-primary" />
                  Results for tag: <span className="text-primary font-black">#{selectedTag}</span>
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTag(null)}
                        className="shrink-0"
                      >
                        <X />
                        <span className="sr-only">Clear Selection</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Clear Selection</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Mobile Select dropdown */}
              <div className="md:hidden w-full mb-4">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full h-10 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resources">Resources ({filteredEntities.resources.length})</SelectItem>
                    <SelectItem value="notes">Notes ({filteredEntities.notes.length})</SelectItem>
                    <SelectItem value="people">People ({filteredEntities.people.length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden md:grid w-full grid-cols-3 max-w-[500px] mb-4">
                  <TabsTrigger value="resources" className="gap-2">
                    Resources
                    <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
                      {filteredEntities.resources.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="gap-2">
                    Notes
                    <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
                      {filteredEntities.notes.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="people" className="gap-2">
                    People
                    <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
                      {filteredEntities.people.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden outline-none">
                  {filteredEntities.resources.length === 0 ? (
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
                    </Empty>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {filteredEntities.resources.map((resource) => (
                        <ResourceCard key={resource.id || resource._id?.toString()} resource={resource} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden outline-none">
                  {filteredEntities.notes.length === 0 ? (
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
                    </Empty>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {filteredEntities.notes.map((note) => (
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

                <TabsContent value="people" className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden outline-none">
                  {filteredEntities.people.length === 0 ? (
                    <Empty className="py-20 border-0 bg-transparent rounded-none">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <User />
                        </EmptyMedia>
                        <EmptyTitle>No associated people</EmptyTitle>
                        <EmptyDescription>
                          Link people from the developer network.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {filteredEntities.people.map((person) => {
                        const typeConfig = TYPE_CONFIG[person.type] || { label: "Developer", variant: "primary" as const }
                        const id = person._id?.toString() || person.id || ""
                        return (
                          <Card
                            key={id}
                            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/20 bg-card/30 backdrop-blur-xs"
                            onClick={() => router.push(`/people/${id}`)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-3">
                                <CardTitle className="font-bold text-sm line-clamp-1 text-foreground">
                                  {person.name}
                                </CardTitle>
                                <Badge variant={typeConfig.variant} className="text-[8px] uppercase tracking-wider font-bold rounded-full select-none h-4 px-1.5">
                                  {typeConfig.label}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {person.notes && (
                                <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                                  {person.notes}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
