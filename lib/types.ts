import { ObjectId } from "mongodb";

export type ResourceStatus = "saved" | "reviewing" | "using" | "archived";
export type ProjectStatus = "active" | "completed" | "paused";
export type ResourceType =
  | "website"
  | "youtube"
  | "github"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "reddit"
  | "article"
  | "tool";

export type PersonType = "developer" | "designer" | "founder" | "creator" | "company";

export interface Category {
  _id?: ObjectId | string;
  id?: string; // Standardized string ID for frontend components
  name: string;
  title?: string; // For backwards compatibility
  description?: string;
  color?: string; // Hex or HSL color representation
  icon?: string; // Lucide icon identifier
  order?: number; // Sorting order
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  _id?: ObjectId | string;
  id?: string; // Standardized string ID for frontend components
  title: string;
  name: string; // For backwards compatibility
  url: string;
  link: string; // For backwards compatibility
  description: string; // For backwards compatibility
  categoryId?: string; // References Category._id (or custom ID)
  category: string; // For backwards compatibility
  tags: string[];
  notes?: string;
  whySaved?: string;
  status: ResourceStatus;
  type: ResourceType;
  favorite: boolean;
  featured?: boolean; // For backwards compatibility
  logo?: string; // For backwards compatibility
  order?: number; // For backwards compatibility
  userId: string;
  projectIds: string[]; // References Project._id
  personIds: string[]; // References Person._id
  useCount: number; // For tracking "Most Used"
  createdAt: Date;
  updatedAt: Date;
  recentlyViewedAt?: Date;
  recentlyUsedAt?: Date;
  summary?: string;
  aiTags?: string[];
}

export interface Note {
  _id?: ObjectId | string;
  id?: string; // Standardized string ID for frontend components
  title: string;
  content: string;
  tags: string[];
  userId: string;
  pinned: boolean;
  relatedResources: string[]; // References Resource._id
  relatedProjects: string[]; // References Project._id
  relatedPeople: string[]; // References Person._id
  fontSize?: string;
  formatting?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  _id?: ObjectId | string;
  id?: string; // Standardized string ID for frontend components
  name: string;
  description?: string;
  url?: string;
  status: ProjectStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  _id?: ObjectId | string;
  id?: string; // Standardized string ID for frontend components
  name: string;
  type: PersonType;
  links: string[]; // Profile / Website URLs
  notes?: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
