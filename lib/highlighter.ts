import { createHighlighterCore, type HighlighterCore, type ThemedToken } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

export type BundledLanguage =
  | "shellscript"
  | "bash"
  | "shell"
  | "sh"
  | "zsh"
  | "javascript"
  | "js"
  | "typescript"
  | "ts"
  | "tsx"
  | "jsx"
  | "json"
  | "text"
  | "plaintext"
  | "txt"

export interface HighlightOptions {
  lang?: string
  themes?: {
    light: string
    dark: string
  }
  defaultColor?: "light" | "dark" | false
}

const DEFAULT_THEMES = {
  light: "github-light",
  dark: "github-dark",
} as const

/**
 * Normalizes language aliases to supported grammar identifiers.
 * Unrecognized languages safely default to "text" (plaintext) to prevent crashes.
 */
export function normalizeLanguage(lang?: string | null): string {
  if (!lang) return "text"
  const lower = lang.toLowerCase().trim()
  switch (lower) {
    case "bash":
    case "shell":
    case "sh":
    case "zsh":
    case "shellscript":
      return "shellscript"
    case "js":
    case "javascript":
      return "javascript"
    case "ts":
    case "typescript":
      return "typescript"
    case "tsx":
      return "tsx"
    case "jsx":
      return "jsx"
    case "json":
      return "json"
    case "text":
    case "plaintext":
    case "txt":
    default:
      return "text"
  }
}

/**
 * Escapes raw strings for safe HTML rendering to prevent XSS.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Parses style string or style object into React.CSSProperties.
 */
export function parseHtmlStyle(
  style?: string | Record<string, string>
): React.CSSProperties | undefined {
  if (!style) return undefined
  if (typeof style === "object") return style as React.CSSProperties
  const styles: Record<string, string> = {}
  style.split(";").forEach((pair) => {
    const colonIndex = pair.indexOf(":")
    if (colonIndex > 0) {
      const key = pair.slice(0, colonIndex).trim()
      const val = pair.slice(colonIndex + 1).trim()
      if (key && val) {
        styles[key] = val
      }
    }
  })
  return Object.keys(styles).length > 0 ? (styles as React.CSSProperties) : undefined
}

/**
 * Fallback token generator for immediate synchronous layout rendering.
 */
export function getFallbackTokens(code?: string | null): ThemedToken[][] {
  const safeCode = typeof code === "string" ? code.replace(/\r\n/g, "\n") : ""
  if (!safeCode) return [[]]
  return safeCode.split("\n").map((line) => [
    {
      content: line || " ",
      offset: 0,
    } as ThemedToken,
  ])
}

let highlighterPromise: Promise<HighlighterCore> | null = null

/**
 * Returns a cached singleton HighlighterCore instance using the pure JavaScript regex engine
 * to avoid any WebAssembly (.wasm) dependencies.
 */
export async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        () => import("shiki/themes/github-light.mjs"),
        () => import("shiki/themes/github-dark.mjs"),
      ],
      langs: [
        () => import("shiki/langs/shellscript.mjs"),
        () => import("shiki/langs/javascript.mjs"),
        () => import("shiki/langs/typescript.mjs"),
        () => import("shiki/langs/tsx.mjs"),
        () => import("shiki/langs/jsx.mjs"),
        () => import("shiki/langs/json.mjs"),
      ],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
  }
  return highlighterPromise
}

/**
 * Highlights code to an HTML string using dual themes.
 * Gracefully handles empty code, null, or undefined without throwing errors.
 */
export async function highlightCode(
  code: string | null | undefined,
  lang: string = "bash",
  options?: Partial<HighlightOptions>
): Promise<string> {
  const safeCode = typeof code === "string" ? code.replace(/\r\n/g, "\n") : ""
  if (!safeCode) return ""

  const normalizedLang = normalizeLanguage(lang)
  const highlighter = await getHighlighter()

  return highlighter.codeToHtml(safeCode, {
    lang: normalizedLang,
    themes: options?.themes || DEFAULT_THEMES,
    defaultColor: options?.defaultColor ?? "light",
  })
}

/**
 * Tokenizes code into themed syntax tokens for custom React rendering.
 */
export async function codeToTokens(
  code: string | null | undefined,
  lang: string = "bash",
  options?: Partial<HighlightOptions>
): Promise<ThemedToken[][]> {
  const safeCode = typeof code === "string" ? code.replace(/\r\n/g, "\n") : ""
  if (!safeCode) return [[]]

  const normalizedLang = normalizeLanguage(lang)
  const highlighter = await getHighlighter()

  const result = highlighter.codeToTokens(safeCode, {
    lang: normalizedLang,
    themes: options?.themes || DEFAULT_THEMES,
    defaultColor: options?.defaultColor ?? "light",
  })

  return result.tokens
}

export const highlightTokens = codeToTokens
