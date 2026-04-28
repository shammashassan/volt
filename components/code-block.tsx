"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface CodeTab {
  label: string
  value: string
  code: string
  language?: string
}

interface CodeBlockProps {
  code?: string
  language?: string
  tabs?: CodeTab[]
  showLineNumbers?: boolean
  className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code = "",
  language = "bash",
  tabs,
  showLineNumbers = false,
  className = "",
}) => {
  const [copiedValue, setCopiedValue] = React.useState<string | null>(null)

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedValue(id)
      setTimeout(() => setCopiedValue(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const highlightSyntax = (code: string, lang: string) => {
    const lines = code.trim().split("\n")
    
    return lines.map((line, index) => {
      // Escape HTML characters first to prevent XSS and broken tags
      let highlightedLine = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
      
      if (lang === "bash" || lang === "shell") {
        highlightedLine = highlightedLine
          .replace(/^(\$|>)\s/, '<span class="text-muted-foreground">$1</span> ')
          // Highlight main commands only at the start of a word/line
          .replace(/\b(npm|yarn|pnpm|bun|npx|git|cd|ls|mkdir|rm|cp|mv)\b/g, '<span class="text-blue-400">$1</span>')
          // Highlight flags (must be preceded by a space or start of line, and not followed by a letter/number in a word)
          .replace(/(^|\s)(-{1,2}[a-zA-Z0-9-]+)/g, '$1<span class="text-purple-400">$2</span>')
          // Highlight strings
          .replace(/(&quot;|&#039;)(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
      } else if (lang === "javascript" || lang === "typescript" || lang === "jsx" || lang === "tsx") {
        highlightedLine = highlightedLine
          .replace(/\b(const|let|var|function|return|import|export|from|default|if|else|for|while|class|extends|async|await|try|catch|throw|new)\b/g, '<span class="text-purple-400">$1</span>')
          .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-blue-400">$1</span>')
          .replace(/(&quot;|&#039;|`)(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
          .replace(/\/\/(.*?)$/g, '<span class="text-muted-foreground">//$1</span>')
          .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
      }
      
      return (
        <div key={index} className="table-row">
          {showLineNumbers && (
            <span className="table-cell pr-4 text-right text-muted-foreground/50 select-none text-xs">
              {index + 1}
            </span>
          )}
          <span 
            className="table-cell"
            dangerouslySetInnerHTML={{ __html: highlightedLine || "&nbsp;" }}
          />
        </div>
      )
    })
  }

  const containerClassName = cn(
    "relative rounded-xl border border-border/50 bg-muted/20 overflow-hidden font-mono text-sm leading-relaxed transition-all",
    className
  )

  if (tabs && tabs.length > 0) {
    return (
      <div className={containerClassName}>
        <Tabs defaultValue={tabs[0].value} className="w-full">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/40 px-2 py-1">
            <TabsList className="h-9 bg-transparent border-0 gap-1 p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-7 px-3 text-[11px] uppercase tracking-wider font-bold data-[state=active]:bg-background data-[state=active]:text-primary rounded-md transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center gap-2 pr-1">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="m-0 focus-visible:outline-none">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 hover:bg-muted/60 transition-colors"
                    onClick={() => handleCopy(tab.code, tab.value)}
                  >
                    {copiedValue === tab.value ? (
                      <Check className="size-3.5 text-green-500" />
                    ) : (
                      <Copy className="size-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </TabsContent>
              ))}
            </div>
          </div>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="m-0 focus-visible:outline-none">
              <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <code className="table w-full">
                  {highlightSyntax(tab.code, tab.language || language)}
                </code>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  return (
    <div className={containerClassName}>
      <div className="absolute top-2.5 right-2.5 z-10">
        <Button
          size="icon"
          variant="ghost"
          className="size-7 hover:bg-muted/60 transition-colors"
          onClick={() => handleCopy(code, "single")}
        >
          {copiedValue === "single" ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <code className="table w-full">
          {highlightSyntax(code, language)}
        </code>
      </div>
    </div>
  )
}
