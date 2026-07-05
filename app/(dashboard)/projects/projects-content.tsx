"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Project, ProjectStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Folder, Plus, Edit3, Trash2, ArrowRight, Link as LinkIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { addProjectAction, deleteProjectAction, updateProjectAction } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProjectsContentProps {
  initialProjects: Project[]
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; variant: "secondary" | "outline" | "destructive" | "primary" | "success" | "warning" | "info" }> = {
  active: { label: "Active", variant: "primary" },
  completed: { label: "Completed", variant: "secondary" },
  paused: { label: "Paused", variant: "outline" }
}

export function ProjectsContent({ initialProjects }: ProjectsContentProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all")
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formUrl, setFormUrl] = useState("")
  const [formStatus, setFormStatus] = useState<ProjectStatus>("active")

  const router = useRouter()

  React.useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const handleOpenCreate = () => {
    setEditingProject(null)
    setFormName("")
    setFormDescription("")
    setFormUrl("")
    setFormStatus("active")
    setIsOpen(true)
  }

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingProject(project)
    setFormName(project.name)
    setFormDescription(project.description || "")
    setFormUrl(project.url || "")
    setFormStatus(project.status)
    setIsOpen(true)
  }

  const handleOpenDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setProjectToDelete(id)
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return
    setIsLoading(true)
    const result = await deleteProjectAction(projectToDelete)
    if (result.success) {
      toast.success("Project deleted successfully")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete project")
    }
    setIsLoading(false)
    setProjectToDelete(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error("Project name is required")
      return
    }

    setIsLoading(true)
    const data = {
      name: formName,
      description: formDescription,
      url: formUrl,
      status: formStatus,
    }

    if (editingProject) {
      const id = editingProject._id?.toString() || editingProject.id || ""
      const result = await updateProjectAction(id, data)
      if (result.success) {
        toast.success("Project updated successfully")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update project")
      }
    } else {
      const result = await addProjectAction(data)
      if (result.success) {
        toast.success("Project created successfully")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create project")
      }
    }
    setIsLoading(false)
  }

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects
    return projects.filter((p) => p.status === filter)
  }, [projects, filter])

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Folder className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Projects
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {projects.length} <span className="hidden sm:inline ml-1">Total</span>
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Manage your milestones and align saved learning tracks or assets under specific projects.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto shrink-0 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Mobile filter using Select */}
          <div className="sm:hidden w-full">
            <Select value={filter} onValueChange={(val) => setFilter(val as "all" | ProjectStatus)}>
              <SelectTrigger className="w-full h-10 font-medium">
                <SelectValue placeholder="Filter Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({projects.length})</SelectItem>
                <SelectItem value="active">Active ({projects.filter((p) => p.status === "active").length})</SelectItem>
                <SelectItem value="completed">Completed ({projects.filter((p) => p.status === "completed").length})</SelectItem>
                <SelectItem value="paused">Paused ({projects.filter((p) => p.status === "paused").length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop filters using TabsList */}
          <Tabs value={filter} onValueChange={(val) => setFilter(val as "all" | ProjectStatus)} className="hidden sm:block w-full">
            <TabsList className="grid grid-cols-4 max-w-[480px]">
              {(["all", "active", "completed", "paused"] as const).map((status) => {
                const count = status === "all" ? projects.length : projects.filter((p) => p.status === status).length
                return (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    {status} <span className="ml-1 opacity-60 font-medium">({count})</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          {/* Project Grid */}
          {filteredProjects.length === 0 ? (
            <Empty className="py-20 border border-dashed rounded-2xl bg-card/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Folder />
                </EmptyMedia>
                <EmptyTitle>No projects found</EmptyTitle>
                <EmptyDescription>
                  Create a new project workspace.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={handleOpenCreate} variant="outline" size="sm" className="font-bold">
                  Create First Project
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const status = STATUS_CONFIG[project.status] || { label: "Active", variant: "primary" as const }
                const id = project._id?.toString() || project.id || ""
                return (
                  <Card 
                    key={id} 
                    className="cursor-pointer group flex flex-col justify-between transition-all hover:shadow-lg hover:border-primary/20 bg-card/30 backdrop-blur-xs"
                    onClick={() => router.push(`/projects/${id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="font-bold text-base lowercase italic line-clamp-1 flex-1 text-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <Badge variant={status.variant} className="text-[9px] uppercase tracking-wider font-bold rounded-full select-none px-2 h-5">
                          {status.label}
                        </Badge>
                      </div>
                      {project.description && (
                        <CardDescription className="line-clamp-2 text-xs leading-relaxed mt-1.5">
                          {project.description}
                        </CardDescription>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-primary/70 hover:text-primary transition-colors truncate max-w-full"
                        >
                          <LinkIcon className="size-2.5 shrink-0" />
                          <span className="truncate">{project.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                    </CardHeader>
                    <CardFooter className="pt-3 border-t border-border/20 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground/60">
                        Added {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleOpenEdit(project, e)}
                          title="Edit Project"
                        >
                          <Edit3 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleOpenDelete(id, e)}
                          title="Delete Project"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                        <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-1" />
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh] no-scrollbar">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
                  <DialogDescription>
                    {editingProject ? "Modify the project details." : "Create a new project workspace to collect resources and notes."}
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-4">
                  <Field>
                    <FieldLabel htmlFor="name">Project Name</FieldLabel>
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="E.g. Portfolio Redesign"
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Summarize target outcomes or stack used..."
                      className="min-h-[80px]"
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="url">Live URL <span className="text-muted-foreground/50 font-normal">(optional)</span></FieldLabel>
                    <Input
                      id="url"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://my-project.vercel.app"
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select value={formStatus} onValueChange={(val) => setFormStatus(val as ProjectStatus)} disabled={isLoading}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isLoading} className="font-bold">
                    {isLoading ? "Saving..." : editingProject ? "Save Changes" : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Alert */}
          <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                  <Trash2 />
                </AlertDialogMedia>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project workspace. Linked resources and notes will not be deleted, but they will be disconnected from this project.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    confirmDelete()
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  )
}
