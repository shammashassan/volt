"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/combobox";
import {
  addResourceAction,
  addNoteAction,
  addCategoryAction,
  addProjectAction,
  addPersonAction
} from "@/lib/actions";
import { getCategoriesAction } from "@/lib/actions/categories";
import { searchAction } from "@/lib/actions/search";
import { Category, Resource, Project, Person, ResourceType, ProjectStatus, PersonType } from "@/types";

type CaptureType = "resource" | "note" | "category" | "project" | "person" | null;

interface QuickCaptureContextType {
  openCapture: (type: CaptureType) => void;
  closeCapture: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextType | undefined>(undefined);

export function useQuickCapture() {
  const context = useContext(QuickCaptureContext);
  if (!context) {
    throw new Error("useQuickCapture must be used within a QuickCaptureProvider");
  }
  return context;
}

export function QuickCaptureProvider({ children }: { children: React.ReactNode }) {
  const [activeType, setActiveType] = useState<CaptureType>(null);
  
  // Relations data
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const openCapture = (type: CaptureType) => {
    setActiveType(type);
  };

  const closeCapture = () => {
    setActiveType(null);
  };

  // Load relation data dynamically when any drawer opens
  useEffect(() => {
    if (activeType) {
      const loadRelations = async () => {
        try {
          const [catResult, searchResult] = await Promise.all([
            getCategoriesAction(),
            searchAction("")
          ]);

          if (catResult.success && Array.isArray(catResult.data)) {
            setCategories(catResult.data);
          }
          if (searchResult.success && searchResult.data) {
            setResources(searchResult.data.resources || []);
            setProjects(searchResult.data.projects || []);
            setPeople(searchResult.data.people || []);
          }
        } catch (error) {
          console.error("Failed to load relation data:", error);
        }
      };

      loadRelations();
    }
  }, [activeType]);

  return (
    <QuickCaptureContext.Provider value={{ openCapture, closeCapture }}>
      {children}
      <QuickCaptureDrawers
        activeType={activeType}
        closeCapture={closeCapture}
        categories={categories}
        resources={resources}
        projects={projects}
        people={people}
      />
    </QuickCaptureContext.Provider>
  );
}

interface DrawersProps {
  activeType: CaptureType;
  closeCapture: () => void;
  categories: Category[];
  resources: Resource[];
  projects: Project[];
  people: Person[];
}

function QuickCaptureDrawers({
  activeType,
  closeCapture,
  categories,
  resources,
  projects,
  people
}: DrawersProps) {
  const router = useRouter();
  const { openCapture } = useQuickCapture();
  const [submitting, setSubmitting] = useState(false);
 
  // Combobox Anchors
  const resProjectsAnchor = useComboboxAnchor();
  const resPeopleAnchor = useComboboxAnchor();
 
  const noteResourcesAnchor = useComboboxAnchor();
  const noteProjectsAnchor = useComboboxAnchor();
  const notePeopleAnchor = useComboboxAnchor();

  // Form States
  // 1. Resource
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState("website");
  const [resCategoryId, setResCategoryId] = useState("none");
  const [resTags, setResTags] = useState("");
  const [resWhySaved, setResWhySaved] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [resDescription, setResDescription] = useState("");
  const [resProjectIds, setResProjectIds] = useState<string[]>([]);
  const [resPersonIds, setResPersonIds] = useState<string[]>([]);

  // 2. Note
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [noteTags, setNoteTags] = useState("");
  const [noteRelatedResources, setNoteRelatedResources] = useState<string[]>([]);
  const [noteRelatedProjects, setNoteRelatedProjects] = useState<string[]>([]);
  const [noteRelatedPeople, setNoteRelatedPeople] = useState<string[]>([]);

  // 3. Category
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catColor, setCatColor] = useState("#3b82f6");
  const [catIcon, setCatIcon] = useState("Rocket");

  // 4. Project
  const [projName, setProjName] = useState("");
  const [projDescription, setProjDescription] = useState("");
  const [projUrl, setProjUrl] = useState("");
  const [projStatus, setProjStatus] = useState("active");

  // 5. Person
  const [personName, setPersonName] = useState("");
  const [personType, setPersonType] = useState("developer");
  const [personLinks, setPersonLinks] = useState("");
  const [personNotes, setPersonNotes] = useState("");
  const [personTags, setPersonTags] = useState("");

  const resetForms = () => {
    setResTitle("");
    setResUrl("");
    setResType("website");
    setResCategoryId("none");
    setResTags("");
    setResWhySaved("");
    setResNotes("");
    setResDescription("");
    setResProjectIds([]);
    setResPersonIds([]);

    setNoteTitle("");
    setNoteContent("");
    setNotePinned(false);
    setNoteTags("");
    setNoteRelatedResources([]);
    setNoteRelatedProjects([]);
    setNoteRelatedPeople([]);

    setCatName("");
    setCatDescription("");
    setCatColor("#3b82f6");
    setCatIcon("Rocket");

    setProjName("");
    setProjDescription("");
    setProjUrl("");
    setProjStatus("active");

    setPersonName("");
    setPersonType("developer");
    setPersonLinks("");
    setPersonNotes("");
    setPersonTags("");
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resUrl) {
      toast.error("Title and URL are required");
      return;
    }
    setSubmitting(true);
    const result = await addResourceAction({
      title: resTitle,
      url: resUrl,
      description: resDescription || undefined,
      type: resType as ResourceType,
      categoryId: resCategoryId === "none" || !resCategoryId ? undefined : resCategoryId,
      tags: resTags.split(",").map(t => t.trim()).filter(Boolean),
      whySaved: resWhySaved || undefined,
      notes: resNotes || undefined,
      favorite: false,
      status: "saved",
      projectIds: resProjectIds,
      personIds: resPersonIds
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Resource created successfully");
      closeCapture();
      resetForms();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create resource");
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) {
      toast.error("Title and Content are required");
      return;
    }
    setSubmitting(true);
    const result = await addNoteAction({
      title: noteTitle,
      content: noteContent,
      pinned: notePinned,
      tags: noteTags.split(",").map(t => t.trim()).filter(Boolean),
      relatedResources: noteRelatedResources,
      relatedProjects: noteRelatedProjects,
      relatedPeople: noteRelatedPeople
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Note created successfully");
      closeCapture();
      resetForms();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create note");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) {
      toast.error("Category Name is required");
      return;
    }
    setSubmitting(true);
    const result = await addCategoryAction({
      name: catName,
      description: catDescription || undefined,
      color: catColor || undefined,
      icon: catIcon || undefined
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Category created successfully");
      closeCapture();
      resetForms();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create category");
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) {
      toast.error("Project Name is required");
      return;
    }
    setSubmitting(true);
    const result = await addProjectAction({
      name: projName,
      description: projDescription || undefined,
      url: projUrl || undefined,
      status: projStatus as ProjectStatus
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Project created successfully");
      closeCapture();
      resetForms();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create project");
    }
  };

  const handlePersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName) {
      toast.error("Person Name is required");
      return;
    }
    setSubmitting(true);
    const result = await addPersonAction({
      name: personName,
      type: personType as PersonType,
      links: personLinks.split(",").map(l => l.trim()).filter(Boolean),
      notes: personNotes || undefined,
      tags: personTags.split(",").map(t => t.trim()).filter(Boolean)
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Person created successfully");
      closeCapture();
      resetForms();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create person");
    }
  };

  const toggleSelection = (id: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(x => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  return (
    <>
      {/* 1. RESOURCE DRAWER */}
      <Sheet open={activeType === "resource"} onOpenChange={openCapture.bind(null, null)}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
          <form onSubmit={handleResourceSubmit} className="flex flex-col h-full min-h-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Quick Capture Resource</SheetTitle>
              <SheetDescription>Save links, tools, and visual inspirations instantly.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="res-title">Title *</FieldLabel>
                    <Input id="res-title" name="title" autoComplete="off" placeholder="e.g. Next.js Best Practices" value={resTitle} onChange={e => setResTitle(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="res-url">URL *</FieldLabel>
                    <Input id="res-url" name="url" autoComplete="off" placeholder="https://…" value={resUrl} onChange={e => setResUrl(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="res-desc">Description</FieldLabel>
                    <Textarea id="res-desc" name="description" autoComplete="off" placeholder="Briefly describe why this resource is useful…" className="min-h-[80px]" value={resDescription} onChange={e => setResDescription(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="res-type">Type</FieldLabel>
                    <Select value={resType} onValueChange={setResType}>
                      <SelectTrigger id="res-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="reddit">Reddit</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="res-category">Category</FieldLabel>
                    <Select value={resCategoryId} onValueChange={setResCategoryId}>
                      <SelectTrigger id="res-category">
                        <SelectValue placeholder="Select a Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Uncategorized</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id || c._id?.toString()} value={c.id || c._id?.toString() || ""}>
                            {c.name || c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="res-tags">Tags (comma separated)</FieldLabel>
                    <Input id="res-tags" name="tags" autoComplete="off" placeholder="react, animation, tailwind" value={resTags} onChange={e => setResTags(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="res-why">Why Saved?</FieldLabel>
                    <Input id="res-why" name="why-saved" autoComplete="off" placeholder="e.g. Great for interactive headers" value={resWhySaved} onChange={e => setResWhySaved(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="res-notes">Notes</FieldLabel>
                    <Textarea id="res-notes" name="notes" autoComplete="off" placeholder="Write any quick thoughts…" className="min-h-[80px]" value={resNotes} onChange={e => setResNotes(e.target.value)} />
                  </Field>

                  {/* Related Projects */}
                  <Field>
                    <FieldLabel>Link to Projects</FieldLabel>
                    <Combobox
                      multiple
                      autoHighlight
                      items={projects.map((p) => p._id?.toString() || p.id || "")}
                      value={resProjectIds}
                      onValueChange={setResProjectIds}
                      filter={(item, query) => {
                        const proj = projects.find((p) => (p._id?.toString() || p.id) === item)
                        const name = proj ? (proj.name || "") : item
                        return name.toLowerCase().includes(query.toLowerCase())
                      }}
                    >
                      <ComboboxChips ref={resProjectsAnchor} className="w-full">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const proj = projects.find((p) => (p._id?.toString() || p.id) === val)
                                return (
                                  <ComboboxChip key={val}>
                                    {proj ? proj.name : val}
                                  </ComboboxChip>
                                )
                              })}
                              <ComboboxChipsInput placeholder="Link projects…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={resProjectsAnchor} className="z-50 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
                        <ComboboxEmpty>No projects found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const proj = projects.find((p) => (p._id?.toString() || p.id) === item)
                            return (
                              <ComboboxItem key={item} value={item}>
                                {proj ? proj.name : item}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  {/* Related People */}
                  <Field>
                    <FieldLabel>Link to People</FieldLabel>
                    <Combobox
                      multiple
                      autoHighlight
                      items={people.map((p) => p._id?.toString() || p.id || "")}
                      value={resPersonIds}
                      onValueChange={setResPersonIds}
                      filter={(item, query) => {
                        const person = people.find((p) => (p._id?.toString() || p.id) === item)
                        const name = person ? (person.name || "") : item
                        return name.toLowerCase().includes(query.toLowerCase())
                      }}
                    >
                      <ComboboxChips ref={resPeopleAnchor} className="w-full">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const person = people.find((p) => (p._id?.toString() || p.id) === val)
                                return (
                                  <ComboboxChip key={val}>
                                    {person ? person.name : val}
                                  </ComboboxChip>
                                )
                              })}
                              <ComboboxChipsInput placeholder="Link people…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={resPeopleAnchor} className="z-50 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
                        <ComboboxEmpty>No people found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const person = people.find((p) => (p._id?.toString() || p.id) === item)
                            return (
                              <ComboboxItem key={item} value={item}>
                                {person ? person.name : item}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                </FieldGroup>
              </div>
            </ScrollArea>
            <SheetFooter className="px-6 py-4 border-t bg-muted/20 flex flex-row justify-end gap-3 mt-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Resource"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 2. NOTE DRAWER */}
      <Sheet open={activeType === "note"} onOpenChange={openCapture.bind(null, null)}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
          <form onSubmit={handleNoteSubmit} className="flex flex-col h-full min-h-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Quick Capture Note</SheetTitle>
              <SheetDescription>Jot down ideas, markdown references, and snippets.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="note-title">Title *</FieldLabel>
                    <Input id="note-title" name="title" autoComplete="off" placeholder="e.g. GSAP ScrollTrigger Snippet" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="note-content">Content *</FieldLabel>
                    <Textarea id="note-content" name="content" autoComplete="off" placeholder="Write markdown content or details…" className="min-h-[150px] font-mono text-sm" value={noteContent} onChange={e => setNoteContent(e.target.value)} required />
                  </Field>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="note-pinned" checked={notePinned} onCheckedChange={(checked) => setNotePinned(checked === true)} />
                    <Label htmlFor="note-pinned" className="text-sm font-medium leading-none cursor-pointer">Pin to Dashboard</Label>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="note-tags">Tags (comma separated)</FieldLabel>
                    <Input id="note-tags" name="tags" autoComplete="off" placeholder="tips, setup, hooks" value={noteTags} onChange={e => setNoteTags(e.target.value)} />
                  </Field>

                  {/* Related Resources */}
                  <Field>
                    <FieldLabel>Link to Resources</FieldLabel>
                    <Combobox
                      multiple
                      autoHighlight
                      items={resources.map((r) => r._id?.toString() || r.id || "")}
                      value={noteRelatedResources}
                      onValueChange={setNoteRelatedResources}
                      filter={(item, query) => {
                        const r = resources.find((res) => (res._id?.toString() || res.id) === item)
                        const name = r ? (r.title || r.name || "") : item
                        return name.toLowerCase().includes(query.toLowerCase())
                      }}
                    >
                      <ComboboxChips ref={noteResourcesAnchor} className="w-full">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const r = resources.find((res) => (res._id?.toString() || res.id) === val)
                                return (
                                  <ComboboxChip key={val}>
                                    {r ? (r.title || r.name) : val}
                                  </ComboboxChip>
                                )
                              })}
                              <ComboboxChipsInput placeholder="Link resources…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={noteResourcesAnchor} className="z-50 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
                        <ComboboxEmpty>No resources found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const r = resources.find((res) => (res._id?.toString() || res.id) === item)
                            return (
                              <ComboboxItem key={item} value={item}>
                                {r ? (r.title || r.name) : item}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  {/* Related Projects */}
                  <Field>
                    <FieldLabel>Link to Projects</FieldLabel>
                    <Combobox
                      multiple
                      autoHighlight
                      items={projects.map((p) => p._id?.toString() || p.id || "")}
                      value={noteRelatedProjects}
                      onValueChange={setNoteRelatedProjects}
                      filter={(item, query) => {
                        const proj = projects.find((p) => (p._id?.toString() || p.id) === item)
                        const name = proj ? (proj.name || "") : item
                        return name.toLowerCase().includes(query.toLowerCase())
                      }}
                    >
                      <ComboboxChips ref={noteProjectsAnchor} className="w-full">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const proj = projects.find((p) => (p._id?.toString() || p.id) === val)
                                return (
                                  <ComboboxChip key={val}>
                                    {proj ? proj.name : val}
                                  </ComboboxChip>
                                )
                              })}
                              <ComboboxChipsInput placeholder="Link projects…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={noteProjectsAnchor} className="z-50 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
                        <ComboboxEmpty>No projects found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const proj = projects.find((p) => (p._id?.toString() || p.id) === item)
                            return (
                              <ComboboxItem key={item} value={item}>
                                {proj ? proj.name : item}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  {/* Related People */}
                  <Field>
                    <FieldLabel>Link to People</FieldLabel>
                    <Combobox
                      multiple
                      autoHighlight
                      items={people.map((p) => p._id?.toString() || p.id || "")}
                      value={noteRelatedPeople}
                      onValueChange={setNoteRelatedPeople}
                      filter={(item, query) => {
                        const person = people.find((p) => (p._id?.toString() || p.id) === item)
                        const name = person ? (person.name || "") : item
                        return name.toLowerCase().includes(query.toLowerCase())
                      }}
                    >
                      <ComboboxChips ref={notePeopleAnchor} className="w-full">
                        <ComboboxValue>
                          {(values: string[]) => (
                            <React.Fragment>
                              {values.map((val) => {
                                const person = people.find((p) => (p._id?.toString() || p.id) === val)
                                return (
                                  <ComboboxChip key={val}>
                                    {person ? person.name : val}
                                  </ComboboxChip>
                                )
                              })}
                              <ComboboxChipsInput placeholder="Link people…" />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={notePeopleAnchor} className="z-50 bg-popover border border-border rounded-lg shadow-md max-h-[300px]">
                        <ComboboxEmpty>No people found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => {
                            const person = people.find((p) => (p._id?.toString() || p.id) === item)
                            return (
                              <ComboboxItem key={item} value={item}>
                                {person ? person.name : item}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                </FieldGroup>
              </div>
            </ScrollArea>
            <SheetFooter className="px-6 py-4 border-t bg-muted/20 flex flex-row justify-end gap-3 mt-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Note"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 3. CATEGORY DRAWER */}
      <Sheet open={activeType === "category"} onOpenChange={openCapture.bind(null, null)}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
          <form onSubmit={handleCategorySubmit} className="flex flex-col h-full min-h-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Quick Capture Category</SheetTitle>
              <SheetDescription>Create a new category container for taxonomical scoping.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="cat-name">Category Name *</FieldLabel>
                    <Input id="cat-name" name="name" autoComplete="off" placeholder="e.g. Polish" value={catName} onChange={e => setCatName(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cat-description">Description</FieldLabel>
                    <Textarea id="cat-description" name="description" autoComplete="off" placeholder="A brief description of this section…" value={catDescription} onChange={e => setCatDescription(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cat-color">Color Hex</FieldLabel>
                    <div className="flex gap-2 items-center">
                      <Input id="cat-color" type="color" className="w-12 h-10 p-1 cursor-pointer" value={catColor} onChange={e => setCatColor(e.target.value)} />
                      <Input type="text" value={catColor} onChange={e => setCatColor(e.target.value)} placeholder="#000000" className="flex-1" />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cat-icon">Lucide Icon Name</FieldLabel>
                    <Select value={catIcon} onValueChange={setCatIcon}>
                      <SelectTrigger id="cat-icon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rocket">Rocket (Start)</SelectItem>
                        <SelectItem value="Component">Component (Build)</SelectItem>
                        <SelectItem value="Zap">Zap (Enhance)</SelectItem>
                        <SelectItem value="Wrench">Wrench (Customize)</SelectItem>
                        <SelectItem value="Palette">Palette (Polish)</SelectItem>
                        <SelectItem value="Map">Map (Maps)</SelectItem>
                        <SelectItem value="Search">Search (Search)</SelectItem>
                        <SelectItem value="Volume2">Volume2 (Audio)</SelectItem>
                        <SelectItem value="Bot">Bot (AI & Agents)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </div>
            </ScrollArea>
            <SheetFooter className="px-6 py-4 border-t bg-muted/20 flex flex-row justify-end gap-3 mt-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Category"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 4. PROJECT DRAWER */}
      <Sheet open={activeType === "project"} onOpenChange={openCapture.bind(null, null)}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
          <form onSubmit={handleProjectSubmit} className="flex flex-col h-full min-h-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Quick Capture Project</SheetTitle>
              <SheetDescription>Start a new project tracking space.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="proj-name">Project Name *</FieldLabel>
                    <Input id="proj-name" name="name" autoComplete="off" placeholder="e.g. Portfolio Redesign" value={projName} onChange={e => setProjName(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proj-desc">Description</FieldLabel>
                    <Textarea id="proj-desc" name="description" autoComplete="off" placeholder="Scope, milestones, or project goals…" className="min-h-[100px]" value={projDescription} onChange={e => setProjDescription(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proj-url">Project URL</FieldLabel>
                    <Input id="proj-url" name="url" autoComplete="off" type="url" placeholder="https://…" value={projUrl} onChange={e => setProjUrl(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proj-status">Status</FieldLabel>
                    <Select value={projStatus} onValueChange={setProjStatus}>
                      <SelectTrigger id="proj-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </div>
            </ScrollArea>
            <SheetFooter className="px-6 py-4 border-t bg-muted/20 flex flex-row justify-end gap-3 mt-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Project"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 5. PERSON DRAWER */}
      <Sheet open={activeType === "person"} onOpenChange={openCapture.bind(null, null)}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
          <form onSubmit={handlePersonSubmit} className="flex flex-col h-full min-h-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Quick Capture Person</SheetTitle>
              <SheetDescription>Save creators, developers, designers, or visual brands.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="person-name">Full Name / Brand *</FieldLabel>
                    <Input id="person-name" name="name" autoComplete="off" placeholder="e.g. Sarah Connor" value={personName} onChange={e => setPersonName(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="person-role">Type</FieldLabel>
                    <Select value={personType} onValueChange={setPersonType}>
                      <SelectTrigger id="person-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="person-links">Profile URLs (comma separated)</FieldLabel>
                    <Input id="person-links" name="links" autoComplete="off" placeholder="https://github.com/…, https://twitter.com/…" value={personLinks} onChange={e => setPersonLinks(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="person-notes">Notes</FieldLabel>
                    <Textarea id="person-notes" name="notes" autoComplete="off" placeholder="Contact details, bios, or design specialties…" value={personNotes} onChange={e => setPersonNotes(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="person-tags">Tags (comma separated)</FieldLabel>
                    <Input id="person-tags" name="tags" autoComplete="off" placeholder="freelancer, interactive, 3d" value={personTags} onChange={e => setPersonTags(e.target.value)} />
                  </Field>
                </FieldGroup>
              </div>
            </ScrollArea>
            <SheetFooter className="px-6 py-4 border-t bg-muted/20 flex flex-row justify-end gap-3 mt-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Person"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
