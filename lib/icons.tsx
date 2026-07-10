import {
  Rocket,
  Component,
  Zap,
  Wrench,
  Palette,
  Search,
  Volume2,
  Bot,
  BookOpen,
  LayoutGrid,
  SquareTerminal,
  Library,
  Users,
  Command,
  Layout,
  Code,
  Layers,
  Map,
  Globe,
  Settings,
  Cpu,
  Sparkles,
  MousePointer2,
  Share2,
  Database,
  Shield,
  CreditCard,
  Bell,
  HelpCircle,
  FolderOpen,
  Shapes,
  Film,
  Play,
  Heart,
  FolderGit2,
  Video,
  ShoppingBag,
  Bookmark,
  FileText,
  Terminal,
  Calendar,
  Hash,
  Image,
  Music,
  Code2,
  BarChart3,
  Camera,
  Brush,
  PenTool,
  type LucideIcon
} from "lucide-react"
import * as React from "react"

const Github = ((props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)) as unknown as LucideIcon


export const ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  Component,
  Zap,
  Wrench,
  Palette,
  Search,
  Volume2,
  Bot,
  BookOpen,
  LayoutGrid,
  SquareTerminal,
  Library,
  Users,
  Command,
  Layout,
  Code,
  Layers,
  Map,
  Globe,
  Settings,
  Cpu,
  Sparkles,
  MousePointer2,
  Share2,
  Database,
  Shield,
  CreditCard,
  Bell,
  HelpCircle,
  FolderOpen,
  Shapes,
  Film,
  Play,
  Heart,
  FolderGit2,
  Video,
  ShoppingBag,
  Bookmark,
  FileText,
  Terminal,
  Calendar,
  Hash,
  Image,
  Music,
  Code2,
  Github,
  BarChart3,
  Camera,
  Brush,
  PenTool,
}

export const ICON_LABELS = Object.keys(ICON_MAP).sort().map(key => ({
  value: key,
  label: key.replace(/([A-Z])/g, ' $1').trim()
}))
