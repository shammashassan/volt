import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import shadcnLint from "@shadcn/lint";

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
    "script/**",
    ".agents/**",
    "tests/**",
    ".migration/**",
  ]),

  // Base rule adjustments for existing codebase
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "prefer-const": "warn",
    },
  },

  // @shadcn/lint design-token enforcement
  {
    plugins: {
      shadcn: shadcnLint,
    },
    rules: {
      "shadcn/no-arbitrary-values": "warn",
      "shadcn/no-raw-colors": "warn",
      "shadcn/no-restyle": "off",
    },
  },

  // Scoped exemption for UI definition components
  {
    files: ["components/ui/**"],
    rules: {
      "shadcn/no-restyle": "off",
    },
  },
]);

export default eslintConfig;
