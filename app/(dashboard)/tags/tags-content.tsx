"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Resource, Note, Person, PersonType } from "@/types"
import { Button } from "@/components/ui/button"
import { Tag, FileText, Link as LinkIcon, User, Layers, X, Filter, ArrowUp, ArrowDown, Flame, CaseSensitive, Calendar } from "lucide-react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { ResourceCard } from "@/components/resources/resource-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"

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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"popular" | "alpha" | "date">("popular")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [activeTab, setActiveTab] = useState("resources")
  const router = useRouter()
  const anchor = useComboboxAnchor()

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

    return Object.entries(counts).map(([name, stats]) => ({ name, ...stats }))
  }, [resources, notes, people])

  // Sort tags list in the combobox by total count descending (most popular tags first)
  const tagNames = useMemo(() => {
    return [...tagStats]
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
      .map((t) => t.name)
  }, [tagStats])

  // Filtered and sorted entities based on selected tags (OR match: matches any of selected tags)
  const filteredEntities = useMemo(() => {
    if (selectedTags.length === 0) return { resources: [], notes: [], people: [] }

    const rawResources = resources.filter((r) => (r.tags || []).some((t) => selectedTags.includes(t)))
    const rawNotes = notes.filter((n) => (n.tags || []).some((t) => selectedTags.includes(t)))
    const rawPeople = people.filter((p) => (p.tags || []).some((t) => selectedTags.includes(t)))

    // 1. Sort resources
    const sortedResources = [...rawResources].sort((a, b) => {
      let comparison = 0
      if (sortBy === "alpha") {
        const titleA = a.title || ""
        const titleB = b.title || ""
        comparison = titleA.localeCompare(titleB)
      } else if (sortBy === "date") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        comparison = dateA - dateB
      } else {
        // "popular" -> useCount
        const countA = a.useCount || 0
        const countB = b.useCount || 0
        comparison = countA - countB
        if (comparison === 0) {
          const titleA = a.title || ""
          const titleB = b.title || ""
          comparison = titleB.localeCompare(titleA)
        }
      }
      return sortOrder === "desc" ? -comparison : comparison
    })

    // 2. Sort notes
    const sortedNotes = [...rawNotes].sort((a, b) => {
      let comparison = 0
      if (sortBy === "alpha") {
        const titleA = a.title || ""
        const titleB = b.title || ""
        comparison = titleA.localeCompare(titleB)
      } else if (sortBy === "date") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        comparison = dateA - dateB
      } else {
        // "popular" -> pinned first, then date
        const pinA = a.pinned ? 1 : 0
        const pinB = b.pinned ? 1 : 0
        comparison = pinA - pinB
        if (comparison === 0) {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          comparison = dateA - dateB
        }
      }
      return sortOrder === "desc" ? -comparison : comparison
    })

    // 3. Sort people
    const sortedPeople = [...rawPeople].sort((a, b) => {
      let comparison = 0
      if (sortBy === "alpha") {
        const nameA = a.name || ""
        const nameB = b.name || ""
        comparison = nameA.localeCompare(nameB)
      } else if (sortBy === "date") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        comparison = dateA - dateB
      } else {
        // "popular" -> fallback to date
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        comparison = dateA - dateB
      }
      return sortOrder === "desc" ? -comparison : comparison
    })

    return {
      resources: sortedResources,
      notes: sortedNotes,
      people: sortedPeople,
    }
  }, [selectedTags, resources, notes, people, sortBy, sortOrder])

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

      {/* Controls & Dropdown Selection */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 md:flex-row md:items-center max-w-7xl">
          {/* Combobox */}
          <div className="flex-1 min-w-0">
            <Combobox
              multiple
              autoHighlight
              items={tagNames}
              value={selectedTags}
              onValueChange={setSelectedTags}
            >
              <ComboboxChips ref={anchor} className="w-full bg-background/50 border-border/60">
                <ComboboxValue>
                  {(values) => (
                    <React.Fragment>
                      {values.map((value: string) => (
                        <ComboboxChip key={value}>{value}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput placeholder="Filter by tags..." />
                    </React.Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor} className="w-(--anchor-width)">
                <ComboboxEmpty>No tags found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => {
                    const stats = tagStats.find((t) => t.name === item)
                    return (
                      <ComboboxItem key={item} value={item}>
                        <Tag className="text-muted-foreground" />
                        <span>{item}</span>
                        {stats && (
                          <Badge variant="secondary" className="ml-auto">
                            {stats.total}
                          </Badge>
                        )}
                      </ComboboxItem>
                    )
                  }}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* Sort Dropdown & Toggle */}
          <div className="flex gap-2 items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter />
                  <span>
                    Sort: {sortBy === "popular" ? "Popularity" : sortBy === "alpha" ? "Alphabetical" : "Date"}
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
          {/* Selected Tag Results View */}
          {selectedTags.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex flex-wrap items-center gap-2">
                  <Layers />
                  <span>Results for tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTags([])}
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
                          No resources link to these tags.
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
                          No notes link to these tags.
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
                          No profiles link to these tags.
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
          ) : (
            <Empty className="py-24">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Tag />
                </EmptyMedia>
                <EmptyTitle>No tags selected</EmptyTitle>
                <EmptyDescription>
                  Select one or more tags from the dropdown list to explore linked resources, notes, and profiles.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </section>
    </div>
  )
}
