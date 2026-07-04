"use server";

import { getSessionUser, getErrorMessage } from "../auth-utils";
import { getCategories, getResources, getNotes, getProjects, getPeople } from "../db";

export interface GraphNode {
  id: string;
  label: string;
  type: "category" | "resource" | "note" | "project" | "person";
  link?: string;
  val: number; // size/weight of node
  description?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export async function getGraphDataAction() {
  try {
    const user = await getSessionUser();
    const userId = user.id;

    const [categories, resources, notes, projects, people] = await Promise.all([
      getCategories(userId),
      getResources(userId),
      getNotes(userId),
      getProjects(userId),
      getPeople(userId),
    ]);

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();

    // Helper to add nodes safely and avoid duplicates
    const addNode = (id: string, label: string, type: GraphNode["type"], link?: string, val = 1, description?: string) => {
      if (!id || nodeIds.has(id)) return;
      nodeIds.add(id);
      nodes.push({ id, label, type, link, val, description });
    };

    // Helper to add links safely, making sure both source and target exist, and avoid duplicate edges
    const linkIds = new Set<string>();
    const addLink = (source: string, target: string, type: string) => {
      if (!source || !target || source === target) return;
      const key = `${source}-${target}`;
      const reverseKey = `${target}-${source}`;
      if (linkIds.has(key) || linkIds.has(reverseKey)) return;
      
      linkIds.add(key);
      links.push({ source, target, type });
    };

    categories.forEach((cat) => {
      const id = cat.id || cat._id?.toString();
      if (id) {
        addNode(id, cat.name || cat.title || "Untitled Category", "category", `/categories/${id}`, 3, cat.description);
      }
    });

    // 2. Add Project nodes
    projects.forEach((proj) => {
      const id = proj.id || proj._id?.toString();
      if (id) {
        addNode(id, proj.name, "project", `/projects/${id}`, 4, proj.description);
      }
    });

    // 3. Add Person nodes
    people.forEach((p) => {
      const id = p.id || p._id?.toString();
      if (id) {
        addNode(id, p.name, "person", `/people/${id}`, 2.5, p.notes);
      }
    });

    notes.forEach((note) => {
      const id = note.id || note._id?.toString();
      if (id) {
        // Strip markdown-like characters for a clean preview summary
        const summary = note.content
          ? note.content.replace(/[#*`_[\]\-]/g, "").substring(0, 120) + (note.content.length > 120 ? "..." : "")
          : undefined;
        addNode(id, note.title, "note", `/notes?id=${id}`, 2, summary);

        // Note -> relatedProjects
        if (Array.isArray(note.relatedProjects)) {
          note.relatedProjects.forEach((projId) => {
            addLink(id, projId, "note-project");
          });
        }

        // Note -> relatedPeople
        if (Array.isArray(note.relatedPeople)) {
          note.relatedPeople.forEach((personId) => {
            addLink(id, personId, "note-person");
          });
        }

        // Note -> relatedResources
        if (Array.isArray(note.relatedResources)) {
          note.relatedResources.forEach((resId) => {
            addLink(id, resId, "note-resource");
          });
        }
      }
    });

    // 5. Add Resource nodes
    resources.forEach((res) => {
      const id = res.id || res._id?.toString();
      if (id) {
        addNode(id, res.title || res.name, "resource", res.url || res.link, 1.5, res.description);

        // Resource -> category
        const catId = res.categoryId || res.category;
        if (catId) {
          addLink(id, catId, "resource-category");
        }

        // Resource -> projects
        if (Array.isArray(res.projectIds)) {
          res.projectIds.forEach((projId) => {
            addLink(id, projId, "resource-project");
          });
        }

        // Resource -> people
        if (Array.isArray(res.personIds)) {
          res.personIds.forEach((personId) => {
            addLink(id, personId, "resource-person");
          });
        }
      }
    });

    // Post-filter links: ensure both source and target exist in the nodes set
    const validLinks = links.filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));

    return { success: true, data: { nodes, links: validLinks } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
