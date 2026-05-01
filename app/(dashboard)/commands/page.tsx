"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Terminal, Box, Zap, Layers, Sparkles, ShieldCheck, SquareTerminal } from "lucide-react"

const commandGroups = [
  {
    title: "Project Starters",
    icon: <Terminal className="size-5 text-blue-500" />,
    description: "Initialize your next big project with these standard commands.",
    commands: [
      {
        name: "Next.js",
        description: "Create a new Next.js app with App Router, Tailwind, and TypeScript.",
        tabs: [
          { label: "New Dir", value: "new", code: "npx create-next-app@latest", language: "bash" },
          { label: "Current Dir", value: "current", code: "npx create-next-app@latest ./", language: "bash" }
        ]
      },
      {
        name: "Vite",
        description: "Start a lean Vite project with various templates.",
        code: "npm create vite@latest",
        language: "bash"
      },
    ]
  },
  {
    title: "Authentication",
    icon: <ShieldCheck className="size-5 text-green-500" />,
    description: "Setup secure authentication in seconds.",
    commands: [
      {
        name: "Better Auth",
        description: "Initialize Better Auth in your project.",
        code: "npx auth init",
        language: "bash"
      }
    ]
  },
  {
    title: "UI & Components",
    icon: <Layers className="size-5 text-purple-500" />,
    description: "Install and manage your component libraries.",
    commands: [
      {
        name: "Shadcn UI",
        description: "Initialize and add components from the shadcn registry.",
        tabs: [
          { label: "Init", value: "init", code: "npx shadcn@latest init", language: "bash" },
          { label: "Add", value: "add", code: "npx shadcn@latest add button card dialog", language: "bash" }
        ]
      },
      {
        name: "Shadcn Themes",
        description: "Quickly apply premium theme presets to your project.",
        tabs: [
          { label: "Blue", value: "blue", code: "npx shadcn@latest apply --preset b1ZOMFh0q", language: "bash" },
          { label: "Lime", value: "lime", code: "npx shadcn@latest apply --preset b3RXNligK", language: "bash" },
          { label: "Yellow", value: "yellow", code: "npx shadcn@latest apply --preset b6Fkv2lBY", language: "bash" }
        ]
      },
      {
        name: "Magic UI",
        description: "Add beautiful animated components from Magic UI.",
        code: "npx magicui-cli add marquee",
        language: "bash"
      }
    ]
  },
  {
    title: "Animations",
    icon: <Sparkles className="size-5 text-yellow-500" />,
    description: "Bring your interface to life with motion.",
    commands: [
      {
        name: "Motion (Framer)",
        description: "Install Framer Motion for React animations.",
        code: "npm install framer-motion",
        language: "bash"
      },
      {
        name: "GSAP",
        description: "Install GSAP and the official React wrapper.",
        code: "npm install gsap @gsap/react",
        language: "bash"
      }
    ]
  },
  {
    title: "Utilities",
    icon: <Zap className="size-5 text-orange-500" />,
    description: "Essential tools for every developer.",
    commands: [
      {
        name: "Lucide Icons",
        description: "The most popular icon library for React.",
        code: "npm install lucide-react",
        language: "bash"
      },
      {
        name: "Tailwind Merge",
        description: "Utility for merging tailwind classes without conflicts.",
        code: "npm install tailwind-merge clsx",
        language: "bash"
      }
    ]
  }
]

export default function CommandsPage() {
  return (
    <div className="flex flex-1 flex-col @container/main">
      <div className="flex flex-col gap-4 px-4 py-8 md:gap-8 md:px-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SquareTerminal className="size-6" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                CLI Commands
              </h1>
              <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                {commandGroups.length} Groups
              </Badge>
            </div>
          </div>
          <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
            Essential CLI snippets to speed up your development workflow.
          </p>
        </div>

        <Separator className="opacity-40" />

        <div className="grid gap-12">
          {commandGroups.map((group) => (
            <section key={group.title} className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 border border-border/40 shadow-sm">
                  {group.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{group.title}</h2>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.commands.map((cmd) => (
                  <div key={cmd.name} className="flex flex-col gap-3 group">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-foreground/80 group-hover:text-primary transition-colors">
                        {cmd.name}
                      </h3>
                      <p className="text-xs text-muted-foreground/70 leading-relaxed">
                        {cmd.description}
                      </p>
                    </div>
                    <CodeBlock
                      code={cmd.code}
                      tabs={cmd.tabs}
                      language={cmd.language}
                      className="shadow-sm border-border/30 group-hover:border-primary/20 transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="size-6 fill-current" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Need more?</h3>
            <p className="text-muted-foreground max-w-md">
              Check back later for more categorized commands. We're constantly updating this list.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
