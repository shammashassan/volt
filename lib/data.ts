export interface Resource {
  name: string;
  link: string;
  description: string;
  category: string;
  logo?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  image?: string; // For static landing page use
  order?: number; // Display priority
}

export const categories: Category[] = [
  { id: "start", title: "Start", icon: "Rocket", description: "UI Blocks, Layout Inspiration & Design Showcases", image: "/images/categories/start.png" },
  { id: "build", title: "Build", icon: "Component", description: "Reusable UI Components & Design Systems", image: "/images/categories/build.png" },
  { id: "enhance", title: "Enhance", icon: "Zap", description: "Animations, Interactions & Effects", image: "/images/categories/enhance.png" },
  { id: "customize", title: "Customize", icon: "Wrench", description: "Visual Generators & CSS Tools", image: "/images/categories/customize.png" },
  { id: "polish", title: "Polish", icon: "Palette", description: "Icon Libraries & Visual Polish", image: "/images/categories/polish.png" },
  { id: "maps", title: "Maps", icon: "Map", description: "Map Components & Geospatial Tools", image: "/images/categories/maps.png" },
  { id: "search", title: "Search", icon: "Search", description: "Developer Search Tools & Engines", image: "/images/categories/search.png" },
  { id: "audio", title: "Audio", icon: "Volume2", description: "Audio Utilities & Sound Components", image: "/images/categories/audio.png" },
  { id: "agents", title: "AI & Agents", icon: "Bot", description: "AI SDKs, Components & Agent Skills", image: "/images/categories/agents.png" },
];


export const resources: Resource[] = []; // Initialized as empty, fetched from DB on server

