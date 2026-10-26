"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { highlightCode } from "@/lib/highlighter"

// Context for compound composition
interface CodeBlockContextValue {
  code: string
  language: string
  showLineNumbers: boolean
}

const CodeBlockContext = React.createContext<CodeBlockContextValue>({
  code: "",
  language: "bash",
  showLineNumbers: false,
})

export const useCodeBlockContext = () => React.useContext(CodeBlockContext)

// -----------------------------------------------------------------------------
// 1. Root Container: CodeBlock
// -----------------------------------------------------------------------------
export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string
  language?: string
  showLineNumbers?: boolean
  children?: React.ReactNode
}

export function CodeBlock({
  code = "",
  language = "bash",
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const safeCode = code ?? ""
  const contextValue = React.useMemo(
    () => ({ code: safeCode, language, showLineNumbers }),
    [safeCode, language, showLineNumbers]
  )

  return (
    <CodeBlockContext.Provider value={contextValue}>
      <div
        data-slot="code-block"
        data-language={language}
        className={cn(
          "group/code-block relative w-full overflow-hidden rounded-xl border border-border/50 bg-muted/20 font-mono text-sm leading-relaxed transition-all",
          "dark:[&_.shiki]:!bg-transparent dark:[&_.shiki_span]:![color:var(--shiki-dark)] [&_.shiki]:!bg-transparent",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <CodeBlockActions floating>
              <CodeBlockCopyButton />
            </CodeBlockActions>
            <CodeBlockContent
              code={safeCode}
              language={language}
              showLineNumbers={showLineNumbers}
            />
          </>
        )}
      </div>
    </CodeBlockContext.Provider>
  )
}

// -----------------------------------------------------------------------------
// 2. Header: CodeBlockHeader
// -----------------------------------------------------------------------------
export type CodeBlockHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function CodeBlockHeader({
  className,
  children,
  ...props
}: CodeBlockHeaderProps) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex items-center justify-between border-b border-border/40 bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// -----------------------------------------------------------------------------
// 3. Title: CodeBlockTitle
// -----------------------------------------------------------------------------
export type CodeBlockTitleProps = React.HTMLAttributes<HTMLDivElement>

export function CodeBlockTitle({
  className,
  children,
  ...props
}: CodeBlockTitleProps) {
  return (
    <div
      data-slot="code-block-title"
      className={cn("flex items-center gap-2 font-mono text-xs font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// -----------------------------------------------------------------------------
// 4. Actions: CodeBlockActions
// -----------------------------------------------------------------------------
export interface CodeBlockActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  floating?: boolean
}

export function CodeBlockActions({
  className,
  floating = false,
  children,
  ...props
}: CodeBlockActionsProps) {
  return (
    <div
      data-slot="code-block-actions"
      className={cn(
        floating
          ? "absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5"
          : "flex items-center gap-1.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// -----------------------------------------------------------------------------
// 5. Copy Button: CodeBlockCopyButton
// -----------------------------------------------------------------------------
export interface CodeBlockCopyButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onError"> {
  value?: string
  timeout?: number
  onCopy?: () => void
  onError?: (error: Error) => void
}

export function CodeBlockCopyButton({
  value,
  timeout = 2000,
  onCopy,
  onError,
  className,
  size = "icon-sm",
  variant = "ghost",
  children,
  ...props
}: CodeBlockCopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const context = useCodeBlockContext()
  const textToCopy = value ?? context.code ?? ""

  const handleCopy = React.useCallback(async () => {
    if (!textToCopy && !value) return

    try {
      let succeeded = false

      // Primary clipboard API
      if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy)
          succeeded = true
        } catch {
          // Fall through to textarea fallback
        }
      }

      // Legacy fallback for non-secure origins or restricted iframe environments
      if (!succeeded && typeof document !== "undefined") {
        try {
          const textArea = document.createElement("textarea")
          textArea.value = textToCopy
          textArea.style.position = "fixed"
          textArea.style.left = "-9999px"
          textArea.style.top = "0"
          textArea.setAttribute("readonly", "")
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          succeeded = document.execCommand("copy")
          document.body.removeChild(textArea)
        } catch (fallbackErr) {
          console.warn("Clipboard copy fallback failed:", fallbackErr)
        }
      }

      if (succeeded) {
        setCopied(true)
        onCopy?.()
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
        }, timeout)
      } else {
        throw new Error("Clipboard copy failed")
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      onError?.(errorObj)
      console.error("Failed to copy code to clipboard:", err)
    }
  }, [textToCopy, value, timeout, onCopy, onError])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(
        "size-7 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className
      )}
      onClick={handleCopy}
      aria-label={copied ? "Copied code" : "Copy code"}
      {...props}
    >
      {children ?? (
        copied ? (
          <Check className="size-3.5 text-primary animate-in zoom-in-50 duration-200" />
        ) : (
          <Copy className="size-3.5 text-muted-foreground transition-colors" />
        )
      )}
    </Button>
  )
}

// -----------------------------------------------------------------------------
// 6. Content: CodeBlockContent
// -----------------------------------------------------------------------------
export interface CodeBlockContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  code?: string
  language?: string
  showLineNumbers?: boolean
  lineNumbers?: boolean
  children?: React.ReactNode
}

export function CodeBlockContent({
  code,
  language,
  showLineNumbers,
  lineNumbers,
  className,
  children,
  ...props
}: CodeBlockContentProps) {
  const context = useCodeBlockContext()
  const rawCode = code ?? context.code ?? ""
  const lang = language ?? context.language ?? "bash"
  const hasLineNumbers = showLineNumbers ?? lineNumbers ?? context.showLineNumbers ?? false

  const [highlightedHtml, setHighlightedHtml] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    if (rawCode) {
      highlightCode(rawCode, lang)
        .then((html) => {
          if (isMounted) setHighlightedHtml(html)
        })
        .catch(() => {
          if (isMounted) setHighlightedHtml(null)
        })
    } else {
      setHighlightedHtml(null)
    }
    return () => {
      isMounted = false
    }
  }, [rawCode, lang])

  // Verbatim line splitting without trim() to preserve indentation and tabs
  const lines = React.useMemo(() => rawCode.split("\n"), [rawCode])

  return (
    <div
      data-slot="code-block-content"
      data-language={lang}
      className={cn(
        "relative overflow-x-auto p-4 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent text-foreground",
        className
      )}
      {...props}
    >
      {children ? (
        children
      ) : highlightedHtml && !hasLineNumbers ? (
        <div
          className="font-mono text-sm leading-relaxed [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="font-mono text-sm leading-relaxed">
          <code className="grid w-full font-mono text-sm">
            {lines.map((line, index) => (
              <CodeBlockLine
                key={index}
                lineNumber={index + 1}
                showLineNumbers={hasLineNumbers}
              >
                {line || "\u00A0"}
              </CodeBlockLine>
            ))}
          </code>
        </pre>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// 7. Line: CodeBlockLine
// -----------------------------------------------------------------------------
export interface CodeBlockLineProps extends React.HTMLAttributes<HTMLDivElement> {
  lineNumber?: number
  showLineNumbers?: boolean
  variant?: "default" | "highlighted" | "added" | "deleted"
  children?: React.ReactNode
}

export function CodeBlockLine({
  lineNumber,
  showLineNumbers = false,
  variant = "default",
  className,
  children,
  ...props
}: CodeBlockLineProps) {
  const variantStyles = {
    default: "",
    highlighted: "bg-primary/10 -mx-4 px-4 border-l-2 border-primary",
    added: "bg-primary/15 -mx-4 px-4 border-l-2 border-primary",
    deleted: "bg-destructive/15 -mx-4 px-4 border-l-2 border-destructive text-destructive",
  }

  return (
    <div
      data-slot="code-block-line"
      className={cn("flex items-start font-mono leading-relaxed", variantStyles[variant], className)}
      {...props}
    >
      {showLineNumbers && (
        <span
          data-slot="code-block-line-number"
          className="select-none w-8 mr-4 shrink-0 inline-block text-right text-muted-foreground/40 font-mono text-xs"
        >
          {lineNumber}
        </span>
      )}
      <span className="flex-1 whitespace-pre">{children}</span>
    </div>
  )
}

// -----------------------------------------------------------------------------
// 8. Footer: CodeBlockFooter
// -----------------------------------------------------------------------------
export type CodeBlockFooterProps = React.HTMLAttributes<HTMLDivElement>

export function CodeBlockFooter({
  className,
  children,
  ...props
}: CodeBlockFooterProps) {
  return (
    <div
      data-slot="code-block-footer"
      className={cn(
        "flex items-center justify-between border-t border-border/60 bg-muted/30 px-3.5 py-1.5 text-xs text-muted-foreground select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
