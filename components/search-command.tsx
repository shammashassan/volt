"use client"

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { categories, resources } from "@/lib/data"
import { 
  SearchIcon, 
  RocketIcon, 
  ComponentIcon, 
  ZapIcon, 
  WrenchIcon, 
  PaletteIcon, 
  MapIcon, 
  Volume2Icon, 
  BotIcon,
  ExternalLinkIcon,
  FileTextIcon
} from "lucide-react"

const ICON_MAP: Record<string, any> = {
  Rocket: RocketIcon,
  Component: ComponentIcon,
  Zap: ZapIcon,
  Wrench: WrenchIcon,
  Palette: PaletteIcon,
  Map: MapIcon,
  Search: SearchIcon,
  Volume2: Volume2Icon,
  Bot: BotIcon,
}

export function SearchCommand() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

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

  const onSelect = (url: string) => {
    setOpen(false)
    if (url.startsWith("http")) {
      window.open(url, "_blank")
    } else {
      router.push(url)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-64 items-center gap-2 rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground transition-all hover:bg-muted"
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 text-left font-medium">Search labels, tools...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a category or resource to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Categories">
            {categories.map((category) => {
              const Icon = ICON_MAP[category.icon] || FileTextIcon
              return (
                <CommandItem
                  key={category.id}
                  onSelect={() => onSelect(`/category/${category.id}`)}
                  className="flex items-center gap-2"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{category.title}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Resources">
            {resources.map((resource) => {
              const category = categories.find(c => c.id === resource.category)
              const Icon = category ? (ICON_MAP[category.icon] || ExternalLinkIcon) : ExternalLinkIcon
              return (
                <CommandItem
                  key={resource.name}
                  onSelect={() => onSelect(resource.link)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground/60" />
                    <span className="font-medium text-foreground">{resource.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">
                      {category?.title || resource.category}
                    </span>
                    <ExternalLinkIcon className="size-3 text-muted-foreground/20" />
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
