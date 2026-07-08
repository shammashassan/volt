import { ObjectId } from "mongodb";

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

export interface Collection {
  _id?: ObjectId | string;
  slug: string;        // Immutable slug identifier (e.g., "dev-design")
  name: string;        // Presentation name (e.g., "Dev & Design")
  description?: string;
  icon?: string;       // Lucide icon identifier
  order: number;       // Manual sorting order
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id?: ObjectId | string;
  slug: string;        // Immutable slug identifier (e.g., "ui-library")
  name: string;        // Presentation name (e.g., "UI Libraries")
  description?: string;
  icon?: string;
  order: number;
  collectionId: string; // References Collection.slug
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  _id?: ObjectId | string;
  id?: string;
  title: string;
  url: string;
  description: string;
  categoryId: string;   // References Category.slug
  tags: string[];
  notes?: string;
  whySaved?: string;
  type: ResourceType;
  favorite: boolean;
  order: number;        // Manual order within Category
  userId: string;
  projectIds: string[]; // References Project._id
  personIds: string[];  // References Person._id
  useCount: number;     // For tracking "Most Used"
  createdAt: Date;
  updatedAt: Date;
  recentlyViewedAt?: Date;
  recentlyUsedAt?: Date;
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
