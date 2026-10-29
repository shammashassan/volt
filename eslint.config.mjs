import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { plugin as shadcn } from "@shadcn/lint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "scripts/**",
    ".agents/**",
    "tests/**",
    ".migration/**",
  ]),

  // Base rule adjustments for existing codebase
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/incompatible-library": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      "prefer-const": "warn",
    },
  },

  // @shadcn/lint design system enforcement
  {
    plugins: {
      shadcn,
    },
    rules: {
      "shadcn/no-restyle": [
        "warn",
        {
          allow: ["layout"],
          contracts: [
            { pattern: "^Button$", allow: ["layout", "typography", "spacing", "color", "shape", "effects", "motion"] },
            { pattern: "^Badge$", allow: ["layout", "typography", "spacing", "shape", "color", "effects", "motion"] },
            { pattern: "^Skeleton$", allow: ["layout", "shape", "spacing", "color", "effects", "motion"] },
            { pattern: "^Card(Header|Content|Footer)?$", allow: ["layout", "spacing", "typography", "color", "shape", "effects", "motion"] },
            { pattern: "^Card(Title|Description)$", allow: ["layout", "typography", "spacing", "color", "motion"] },
            { pattern: "^Dialog(Content|Header|Footer)?$", allow: ["layout", "spacing", "color", "shape", "effects", "motion"] },
            { pattern: "^Dialog(Title|Description)$", allow: ["layout", "typography", "spacing", "color", "motion"] },
            { pattern: "^Sheet(Content|Header|Footer)?$", allow: ["layout", "spacing", "color", "shape", "effects", "motion"] },
            { pattern: "^Sheet(Title|Description)$", allow: ["layout", "typography", "spacing", "color", "motion"] },
            { pattern: "^Drawer(Content|Header|Footer)?$", allow: ["layout", "spacing", "color", "shape", "effects", "motion"] },
            { pattern: "^Drawer(Title|Description)$", allow: ["layout", "typography", "spacing", "color", "motion"] },
            { pattern: "^Popover(Content|Header|Footer|Trigger)?$", allow: ["layout", "spacing", "typography", "color", "shape", "effects", "motion"] },
            { pattern: "^Popover(Title|Description)$", allow: ["layout", "typography", "spacing", "color", "motion"] },
            { pattern: "^Alert(Title|Description)$", allow: ["layout", "typography", "spacing", "color", "motion"] },
            { pattern: "^Alert$", allow: ["layout", "spacing", "color", "shape", "effects", "motion"] },
            { pattern: "^AlertDialog(Media|Action|Cancel|Content|Header|Footer)?$", allow: ["layout", "spacing", "color", "shape", "effects", "motion"] },
            { pattern: "^Tabs(List|Trigger|Content)?$", allow: ["layout", "spacing", "typography", "color", "shape", "effects", "motion"] },
            { pattern: "^Empty(Title|Description)?$", allow: ["layout", "spacing", "typography", "color", "shape", "effects", "motion"] },
            { pattern: "^Field(Label|Group)?$", allow: ["layout", "spacing", "typography", "color", "motion"] },
            { pattern: "^Item(Title|Description|Media|Content|Group)?$", allow: ["layout", "spacing", "typography", "color", "shape", "effects", "motion"] },
            { pattern: "^Timeline(Title|Indicator|Content|Item)?$", allow: ["layout", "spacing", "typography", "color", "shape", "effects", "motion"] },
            { pattern: "^(Select|DropdownMenu|Command|Combobox)(Trigger|Content|Item|Group|Label|Chips)?$", allow: ["layout", "spacing", "typography", "color", "shape", "effects", "motion"] },
            { pattern: "^(Table|TableHeader|TableBody|TableRow|TableHead|TableCell)$", allow: ["layout", "spacing", "typography", "color", "motion"] },
            { pattern: "^(Input|InputGroup|InputGroupInput|Textarea|Label|Toggle|ToggleGroup|ToggleGroupItem|Progress|Separator|Avatar|AvatarFallback|Checkbox|HoverCard|HoverCardTrigger|HoverCardContent|Collapsible|CollapsibleContent|Carousel|CarouselItem|SidebarMenuButton|SidebarMenuAction|SidebarInset|Breadcrumb|BreadcrumbLink|BreadcrumbPage|TooltipContent)$", allow: ["layout", "spacing", "typography", "shape", "color", "effects", "motion"] },
          ],
        },
      ],
      "shadcn/no-arbitrary-values": [
        "warn",
        {
          allow: [
            "typography",
            "spacing",
            "shape",
            "color",
            "effects",
            "motion",
            "layout",
          ],
        },
      ],
      "shadcn/no-raw-colors": [
        "warn",
        {
          allow: [
            "*-amber-*",
            "*-blue-*",
            "*-emerald-*",
            "*-indigo-*",
            "*-purple-*",
            "*-violet-*",
            "*-rose-*",
            "*-red-*",
            "*-sky-*",
            "*-cyan-*",
            "*-teal-*",
            "*-yellow-*",
            "*-green-*",
            "*-orange-*",
            "*-zinc-*",
            "*-neutral-*",
            "*-gray-*",
            "*-slate-*",
            "*-glow-*",
            "*-destructive*",
            "*-white*",
            "text-white",
            "bg-white",
            "border-white",
            "fill-white",
            "ring-*",
            "group-has-*",
            "hover:*",
          ],
        },
      ],
      "shadcn/no-inline-styles": "off",
      "shadcn/no-unknown-classes": [
        "warn",
        {
          allow: [
            "workspace-card",
            "hud-corner",
            "*-reveal*",
            "*-trigger*",
            "*-anim*",
            "hero-*",
            "workflow-*",
            "faq-*",
            "grid-*",
            "bento-*",
            "card-*",
            "icon-*",
            "why-*",
            "panel-*",
            "center-*",
            "progress-*",
            "status-*",
            "nav-*",
            "container-wrapper",
            "prose-neutral",
            "scroll-fade-*",
            "data-wrap:*",
            "3xl:*",
            "spotlight-glow",
            "entity-card-reveal",
            "cta-trigger",
            "overlay-content",
            "logo-mark",
          ],
        },
      ],
      "shadcn/require-static-classes": "warn",
    },
  },

  // Scoped exemption for UI definition components and shared dialog wrappers
  {
    files: [
      "components/ui/**",
      "components/shared/responsive-dialog.tsx",
    ],
    rules: {
      "shadcn/no-restyle": "off",
      "shadcn/require-static-classes": "off",
    },
  },

  // Scoped exemption for dynamic metadata images and SVG preloader
  {
    files: [
      "app/icon.tsx",
      "app/apple-icon.tsx",
      "app/opengraph-image.tsx",
      "app/twitter-image.tsx",
      "components/landing/preloader.tsx",
    ],
    rules: {
      "shadcn/no-raw-colors": "off",
    },
  },
]);

export default eslintConfig;
