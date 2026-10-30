<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design System & Linter Rules (@shadcn/lint)

### CRITICAL RULE: `components/ui/*` IS STRICTLY READ-ONLY
- **NEVER modify, edit, or add props/variants/code to files in `components/ui/*`.**
- Treat all files inside `components/ui/` as pristine, immutable primitives.
- Do NOT add convenience props (e.g. `title`, `icon`) to `components/ui/*`.
- If custom variants, header wrappers, or specialized behavior are needed, build them as wrappers in feature folders (e.g., `components/dashboard/`, `components/shared/`), NEVER by altering `@/components/ui/*`.

After making any UI changes, run `npm run lint` and verify your changes adhere to `@shadcn/lint` rules:

1. **`shadcn/no-restyle`**:
   - Design system components (`@/components/ui/*` like `<Button>`, `<Card>`, `<Badge>`, etc.) own their internal appearance (color, shape, padding, typography).
   - Do NOT pass arbitrary colors (`bg-*`, `text-*`), padding (`p-*`), or shapes (`rounded-*`) to components via `className`.
   - Use built-in component variants (`variant="..."`, `size="..."`). Do NOT add custom variants or edit the component definition files.
   - Use `className` on components only for layout positioning (`mt-*`, `w-full`, layout margins, or parent container `gap-*`).

2. **`shadcn/no-raw-colors`**:
   - Always use defined theme tokens (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`, etc.).
   - Do not hardcode raw palette colors like `bg-pink-500` or `text-blue-600`.

3. **`shadcn/no-arbitrary-values`**:
   - Do not use arbitrary values like `p-[13px]`, `w-[500px]`, or `text-[10px]`.
   - Use scale values (`p-3`, `w-125`, `text-xs`) or CSS theme tokens.

4. **`shadcn/no-inline-styles` & `shadcn/no-unknown-classes`**:
   - Prefer Tailwind utility classes over inline `style={{ ... }}` objects.
   - Avoid typo classes or undeclared classes that produce no CSS.

