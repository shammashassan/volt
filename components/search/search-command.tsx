"use client"

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import {
  SearchIcon,
  ExternalLinkIcon,
  FileTextIcon,
  PlusIcon,
  LayoutDashboardIcon,
  StarIcon,
  FolderIcon,
  UserIcon,
  BriefcaseIcon,
  SettingsIcon,
  FilmIcon,
  SquareTerminal,
  CalendarIcon,
  Network
} from "lucide-react"
import { ICON_MAP } from "@/lib/icons"

import { trackResourceViewAction } from "@/lib/actions"
import { searchAction } from "@/lib/actions/search"
import { Category, Resource, Note, Project, Person } from "@/types"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Badge } from "@/components/ui/badge"
import { RESOURCE_TYPES } from "@/components/resources/resource-types"

const typeItems = RESOURCE_TYPES.map(t => ({
  path: `/resources?type=${t.value}`,
  label: `${t.label} Resources`,
  icon: t.icon,
}))

export function SearchCommand() {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [results, setResults] = React.useState<{
    resources: Resource[];
    notes: Note[];
    projects: Project[];
    people: Person[];
    categories: Category[];
  }>({
    resources: [],
    notes: [],
    projects: [],
    people: [],
    categories: []
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isMac = mounted && typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)


  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    const handleOpenSearch = () => setOpen(true)
    window.addEventListener("open-global-search", handleOpenSearch)
    return () => window.removeEventListener("open-global-search", handleOpenSearch)
  }, [])

  React.useEffect(() => {
    if (!open) return

    if (searchQuery.trim() === "") {
      setResults({
        resources: [],
        notes: [],
        projects: [],
        people: [],
        categories: []
      })
      setIsLoading(false)
      return
    }

    const delayDebounceFn = setTimeout(() => {
      async function performSearch() {
        setIsLoading(true)
        console.log("[SearchCommand] Searching database for query:", searchQuery)
        try {
          const result = await searchAction(searchQuery)
          console.log("[SearchCommand] Search action result:", result)
          if (result.success && result.data) {
            const data = result.data
            setResults({
              resources: data.resources || [],
              notes: data.notes || [],
              projects: data.projects || [],
              people: data.people || [],
              categories: data.categories || []
            })
          }
        } catch (error) {
          console.error("[SearchCommand] Search failed:", error)
        } finally {
          setIsLoading(false)
        }
      }

      performSearch()
    }, 250) // 250ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, open])

  const onSelectResource = async (resource: Resource) => {
    setOpen(false)
    const rawUrl = resource.url || ""
    const targetUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
    window.open(targetUrl, "_blank")
    try {
      const resourceId = resource._id?.toString() || resource.id
      if (resourceId) {
        await trackResourceViewAction(resourceId)
      }
    } catch (err) {
      console.error("Failed to track resource view:", err)
    }
  }

  const onSelectEntity = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  const handleQuickCreate = (type: "resource" | "note" | "category" | "project" | "person") => {
    setOpen(false)
    if (type === "resource") router.push("/resources?new=true")
    else if (type === "note") router.push("/notes?new=true")
    else if (type === "category") router.push("/categories?new=category")
    else if (type === "project") router.push("/projects?new=true")
    else if (type === "person") router.push("/people?new=true")


  }

  const hasResults =
    results.resources.length > 0 ||
    results.notes.length > 0 ||
    results.projects.length > 0 ||
    results.people.length > 0 ||
    results.categories.length > 0;

  const quickCreateItems = [
    { type: "resource" as const, label: "Create Resource" },
    { type: "note" as const, label: "Create Note" },
    { type: "category" as const, label: "Create Category" },
    { type: "project" as const, label: "Create Project" },
    { type: "person" as const, label: "Create Person" }
  ];

  const quickActionItems = [
    { path: "/dashboard", label: "Go to Dashboard", icon: LayoutDashboardIcon },
    { path: "/resources", label: "Open Resources", icon: StarIcon },
    { path: "/categories", label: "Open Categories", icon: FolderIcon },
    { path: "/graph", label: "Open Graph", icon: Network },
    { path: "/projects", label: "Open Projects", icon: BriefcaseIcon },
    { path: "/notes", label: "Open Notes", icon: FileTextIcon },
    { path: "/reminders", label: "Open Reminders", icon: CalendarIcon },
    { path: "/people", label: "Open People", icon: UserIcon },
    { path: "/media-watchlist", label: "Open Watchlist", icon: FilmIcon },
    { path: "/commands", label: "Open Commands", icon: SquareTerminal },
    { path: "/settings", label: "Open Settings", icon: SettingsIcon },
  ];

  const filteredQuickCreate = searchQuery.trim() === ""
    ? quickCreateItems
    : quickCreateItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredQuickActions = searchQuery.trim() === ""
    ? quickActionItems
    : quickActionItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredTypes = searchQuery.trim() === ""
    ? typeItems
    : typeItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const hasAnyMatches =
    filteredQuickCreate.length > 0 ||
    filteredQuickActions.length > 0 ||
    filteredTypes.length > 0 ||
    hasResults;

  return (
    <>
      {/* Mobile search trigger */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="sm:hidden"
        aria-label="Search anything"
      >
        <SearchIcon aria-hidden="true" />
      </Button>

      {/* Desktop search trigger */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex sm:w-64 md:w-80 justify-between"
      >
        <span className="flex items-center gap-2">
          <SearchIcon data-icon="inline-start" className="text-muted-foreground" aria-hidden="true" />
          <span className="font-normal text-muted-foreground">
            Search anything…
          </span>
        </span>
        <KbdGroup>
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="size-full" shouldFilter={false}>
          <CommandInput
            placeholder="Type to search resources, notes, projects, people…"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {/* Quick Create Actions */}
            {filteredQuickCreate.length > 0 && (
              <CommandGroup heading="Quick Create">
                {filteredQuickCreate.map(item => (
                  <CommandItem key={item.type} onSelect={() => handleQuickCreate(item.type)}>
                    <PlusIcon className="text-primary" aria-hidden="true" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredQuickCreate.length > 0 && filteredQuickActions.length > 0 && <CommandSeparator />}

            {/* Quick Actions / Navigation */}
            {filteredQuickActions.length > 0 && (
              <CommandGroup heading="Quick Actions">
                {filteredQuickActions.map(item => {
                  const Icon = item.icon;
                  return (
                    <CommandItem key={item.path} onSelect={() => onSelectEntity(item.path)}>
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {filteredQuickActions.length > 0 && filteredTypes.length > 0 && <CommandSeparator />}

            {/* Resource Types */}
            {filteredTypes.length > 0 && (
              <CommandGroup heading="Resource Types">
                {filteredTypes.map(item => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.path}
                      onSelect={() => onSelectEntity(item.path)}
                    >
                      <Icon className="text-muted-foreground" aria-hidden="true" />
                      <span>{item.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {searchQuery.trim() !== "" && hasResults && <CommandSeparator />}

            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching…
              </div>
            )}

            {!isLoading && !hasAnyMatches && searchQuery.trim() !== "" && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}

            {/* Categories */}
            {searchQuery.trim() !== "" && results.categories.length > 0 && (
              <CommandGroup heading="Categories">
                {results.categories.map((category) => {
                  const Icon = (category.icon && ICON_MAP[category.icon as keyof typeof ICON_MAP]) || FolderIcon
                  const catId = category._id?.toString() || category.slug
                  return (
                    <CommandItem
                      key={catId}
                      onSelect={() => onSelectEntity(`/resources?category=${category.slug || catId}`)}
                    >
                      <Icon className="text-muted-foreground/85" aria-hidden="true" />
                      <span className="font-medium text-foreground">{category.name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {/* Resources */}
            {searchQuery.trim() !== "" && results.resources.length > 0 && (
              <CommandGroup heading="Resources">
                {results.resources.map((resource) => {
                  const resId = resource._id?.toString() || resource.id
                  return (
                    <CommandItem
                      key={resId}
                      onSelect={() => onSelectResource(resource)}
                      className="justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLinkIcon className="text-muted-foreground/60" aria-hidden="true" />
                        <span className="font-medium text-foreground">{resource.title}</span>
                      </div>
                      <Badge variant="secondary">
                        {resource.type || "website"}
                      </Badge>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {/* Notes */}
            {searchQuery.trim() !== "" && results.notes.length > 0 && (
              <CommandGroup heading="Notes">
                {results.notes.map((note) => {
                  const noteId = note._id?.toString() || note.id
                  return (
                    <CommandItem
                      key={noteId}
                      onSelect={() => onSelectEntity(`/notes`)} // Notes layout splits in Phase 5
                    >
                      <FileTextIcon className="text-muted-foreground/70" aria-hidden="true" />
                      <span className="font-medium text-foreground">{note.title}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {/* Projects */}
            {searchQuery.trim() !== "" && results.projects.length > 0 && (
              <CommandGroup heading="Projects">
                {results.projects.map((project) => {
                  const projId = project._id?.toString() || project.id
                  return (
                    <CommandItem
                      key={projId}
                      onSelect={() => onSelectEntity(`/projects/${projId}`)}
                    >
                      <BriefcaseIcon className="text-muted-foreground/70" aria-hidden="true" />
                      <span className="font-medium text-foreground">{project.name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {/* People */}
            {searchQuery.trim() !== "" && results.people.length > 0 && (
              <CommandGroup heading="People">
                {results.people.map((person) => {
                  const personId = person._id?.toString() || person.id
                  return (
                    <CommandItem
                      key={personId}
                      onSelect={() => onSelectEntity(`/people/${personId}`)}
                    >
                      <UserIcon className="text-muted-foreground/75" aria-hidden="true" />
                      <span className="font-medium text-foreground">{person.name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
