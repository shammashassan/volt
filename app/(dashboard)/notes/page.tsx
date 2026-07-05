import { Suspense } from "react"
import { getNotes } from "@/lib/queries/notes";
import { getResources } from "@/lib/queries/resources";
import { getProjects } from "@/lib/queries/projects";
import { getPeople } from "@/lib/queries/people";
import { NotesContent } from "./notes-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Note, Resource, Project, Person } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

function NotesSkeleton() {
  return (
    <div className="h-[calc(100dvh-var(--header-height))] border-t border-border overflow-hidden flex">
      {/* Sidebar / List Panel Skeleton */}
      <div className="w-[28%] border-r border-border flex flex-col h-full bg-muted/10 shrink-0 hidden md:flex">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="size-9 rounded-md" />
        </div>
        {/* Search */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Tag filters */}
        <div className="px-4 py-3 border-b border-border shrink-0 flex gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        {/* Note list */}
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 border border-transparent bg-muted/5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-[60%] rounded" />
                <Skeleton className="h-2 w-2 rounded-full bg-muted" />
              </div>
              <Skeleton className="h-3 w-[85%] rounded" />
              <Skeleton className="h-3 w-[50%] rounded" />
              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main / Detail Panel Skeleton */}
      <div className="flex-1 flex flex-col h-full bg-background">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 rounded-md md:hidden" />
            <Skeleton className="h-5 w-32 md:hidden" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Skeleton className="h-9 w-16 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>
        {/* Document body */}
        <div className="flex-1 p-8 md:p-12 max-w-2xl mx-auto w-full flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-10 w-[70%] rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md shrink-0 hidden sm:block" />
          </div>
          {/* Tag row */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-px w-full bg-border" />
          {/* Content paragraphs */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-[95%] rounded" />
            <Skeleton className="h-4 w-[90%] rounded" />
            <Skeleton className="h-4 w-[40%] rounded" />
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-[97%] rounded" />
            <Skeleton className="h-4 w-[85%] rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

async function NotesContentWrapper() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id

  const [notes, resources, projects, people] = await Promise.all([
    getNotes(userId),
    getResources(userId),
    getProjects(userId),
    getPeople(userId)
  ])

  return (
    <NotesContent
      initialNotes={notes as unknown as Note[]}
      resources={resources as unknown as Resource[]}
      projects={projects as unknown as Project[]}
      people={people as unknown as Person[]}
    />
  )
}

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesSkeleton />}>
      <NotesContentWrapper />
    </Suspense>
  )
}
