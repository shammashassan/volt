export interface Resource {
  name: string;
  link: string;
  description: string;
  category: string;
  logo?: string;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  { id: "start", title: "Start", icon: "Rocket", description: "UI Blocks, Layout Inspiration & Design Showcases" },
  { id: "build", title: "Build", icon: "Component", description: "Reusable UI Components & Design Systems" },
  { id: "enhance", title: "Enhance", icon: "Zap", description: "Animations, Interactions & Effects" },
  { id: "customize", title: "Customize", icon: "Wrench", description: "Visual Generators & CSS Tools" },
  { id: "polish", title: "Polish", icon: "Palette", description: "Icon Libraries & Visual Polish" },
  { id: "maps", title: "Maps", icon: "Map", description: "Map Components & Geospatial Tools" },
  { id: "search", title: "Search", icon: "Search", description: "Developer Search Tools & Engines" },
  { id: "audio", title: "Audio", icon: "Volume2", description: "Audio Utilities & Sound Components" },
  { id: "agents", title: "Agents", icon: "Bot", description: "AI Agent Tools & Skill Libraries" },
];

export const resources: Resource[] = [
  // START
  { name: "Shadcn Blocks", link: "https://www.shadcnblocks.com", description: "Beautifully designed blocks built with Shadcn UI.", category: "start" },
  { name: "Tailark", link: "https://tailark.com", description: "Tailwind CSS components and templates.", category: "start" },
  { name: "LaunchUI", link: "https://www.launchuicomponents.com", description: "Landing page components for React and Tailwind.", category: "start" },
  { name: "TripleD", link: "https://ui.tripled.work", description: "Curated collection of 3D UI inspiration.", category: "start" },
  { name: "Blocks by MVP Subha", link: "https://blocks.mvp-subha.me", description: "Modern UI blocks for rapid development.", category: "start" },
  { name: "SHSF UI", link: "https://shsfui.com", description: "Open-source UI components for startups.", category: "start" },
  { name: "Skiper UI", link: "https://skiper-ui.com", description: "A library of high-quality web components.", category: "start" },
  { name: "Efferd", link: "https://efferd.com", description: "Clean and minimal layout inspiration.", category: "start" },
  { name: "Uilora", link: "https://uilora.com", description: "Premium design resources for developers.", category: "start" },
  { name: "Shadcn Space", link: "https://shadcnspace.com", description: "Community-driven Shadcn UI examples.", category: "start" },
  { name: "21st.dev", link: "https://21st.dev/home", description: "The marketplace for React components.", category: "start" },
  { name: "Awwwards", link: "https://www.awwwards.com/", description: "The best web design inspiration in the world.", category: "start" },

  // BUILD
  { name: "ShadCN UI", link: "https://ui.shadcn.com", description: "The gold standard for modern component libraries.", category: "build" },
  { name: "ShadCN Extensions", link: "https://shadcn-extension.vercel.app", description: "Extra components for Shadcn UI.", category: "build" },
  { name: "Origin UI", link: "https://originui.com", description: "A collection of high-end UI components.", category: "build" },
  { name: "Kibo UI", link: "https://kibo-ui.com", description: "Standardized component library for React.", category: "build" },
  { name: "Rigid UI", link: "https://rigidui.com", description: "Strongly typed and accessible components.", category: "build" },
  { name: "Aceternity UI", link: "https://ui.aceternity.com", description: "Copy-paste complex animations and components.", category: "build" },
  { name: "Flowbite", link: "https://flowbite.com", description: "Comprehensive library for Tailwind CSS.", category: "build" },
  { name: "9UI", link: "https://9ui.dev", description: "Futuristic UI components and blocks.", category: "build" },
  { name: "ReUI", link: "https://reui.io", description: "React components for rapid prototyping.", category: "build" },
  { name: "Smooth UI", link: "https://smoothui.dev", description: "Focused on clean typography and spacing.", category: "build" },
  { name: "Cult UI", link: "https://cult-ui.com", description: "Modern components for stylish applications.", category: "build" },
  { name: "Pixel Perfect", link: "https://www.pixel-perfect.space/", description: "Detailed design systems and kits.", category: "build" },
  { name: "Chanh Dai UI", link: "https://chanhdai.com", description: "Elegant and minimal UI components.", category: "build" },
  { name: "Scificn UI", link: "https://scificn.dev", description: "Futuristic and high-tech design patterns.", category: "build" },

  // ENHANCE
  { name: "Motion Primitives", link: "https://motion-primitives.com/docs", description: "Build beautiful animations with Framer Motion.", category: "enhance" },
  { name: "GSAP", link: "https://gsap.com", description: "The industry standard for professional web animation.", category: "enhance" },
  { name: "Anime.js", link: "https://animejs.com", description: "Lightweight Javascript animation library.", category: "enhance" },
  { name: "Animista", link: "https://animista.net", description: "CSS animations on demand.", category: "enhance" },
  { name: "React Bits", link: "https://reactbits.dev", description: "Animated components and snippets for React.", category: "enhance" },
  { name: "Kokonut UI", link: "https://kokonutui.com", description: "Smooth interactions and effects for websites.", category: "enhance" },
  { name: "MotionSites", link: "https://motionsites.ai/", description: "AI-powered motion design for websites.", category: "enhance" },

  // CUSTOMIZE
  { name: "UIverse", link: "https://uiverse.io", description: "Community-built UI elements for creators.", category: "customize" },
  { name: "PatternCraft", link: "https://patterncraft.fun", description: "Visual CSS pattern generator.", category: "customize" },
  { name: "Neumorphism Generator", link: "https://neumorphism.io", description: "Generate soft UI and neumorphic shadows.", category: "customize" },
  { name: "CSS Buttons", link: "https://cssbuttons.io", description: "A giant collection of CSS buttons.", category: "customize" },

  // POLISH
  { name: "Lucide", link: "https://lucide.dev", description: "Beautiful and consistent icon library.", category: "polish" },
  { name: "Tabler Icons", link: "https://tabler.io/icons", description: "Over 5000+ open source SVG icons.", category: "polish" },

  // MAPS
  { name: "MapCN", link: "https://www.mapcn.dev", description: "Elegant map components for React.", category: "maps" },

  // SEARCH
  { name: "Shoogle", link: "https://shoogle.dev", description: "Search engine for developers.", category: "search" },

  // AUDIO
  { name: "SoundCN", link: "https://soundcn.xyz", description: "Audio effects and soundscapes for UI.", category: "audio" },

  // AGENTS
  { name: "TypeUI", link: "https://typeui.sh", description: "Type-safe UI components for AI agents.", category: "agents" },
];
