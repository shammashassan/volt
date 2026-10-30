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
